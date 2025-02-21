const { default: axios } = require('axios');
const configurations = require('../configurations');


const childApis = async ({
    moduleConfig,
    field,
    axiosQueryParams = {},
    headers,
}) => {
    const childApis = moduleConfig.childApis;
    if (!childApis?.length) {   
        return;

    }

    for (const childApi of childApis) {
        const extractFields = childApi.extractFields(field);
        const { url, method, queryParams, body } = childApi;
        let modifiedUrl = url;
        if (childApi.modifiedUrl) { 
            modifiedUrl = childApi.modifiedUrl(url, extractFields);
        } 
        Object.keys(queryParams).forEach((queryParam) => {
            if (!queryParams[queryParam].isPaginated) {
                if (queryParams[queryParam].required && !axiosQueryParams.hasOwnProperty(queryParam)) {
                    console.log(`Required Query Parameter ${queryParam} is missing`);
                    throw new Error(`Required Query Parameter ${queryParam} is missing`);
                }
            } else if (queryParams[queryParam].isPaginated) {
                if (queryParams[queryParam].paginationType === 'INCREMENT') {
                    axiosQueryParams[queryParam] = axiosQueryParams.hasOwnProperty(queryParam) ? axiosQueryParams[queryParam] : 1;
                }
            }
        });
        console.log('MODIFIED URL --->>>>', modifiedUrl);
        await hitApi({
            url: modifiedUrl,
            method,
            headers,
            body,
            params: axiosQueryParams,
            apiConfigParams: queryParams,
            moduleConfig: childApi,
        });
    }
}




const hitApi = async ({
    url,
    method,
    headers,
    body,
    params: queryParams,
    apiConfigParams,
    moduleConfig,
}) => {
    try {

    let response = await axios({
        url,
        method,
        headers,
        body,
        params: queryParams,
    });

    if (!moduleConfig.responseBodyHasItemsToCrawl(response)) { // check if the response body has the items to crawl.
        return;
    }
    const fields = moduleConfig.crawlFields(response);

    Object.keys(apiConfigParams).forEach((queryParam) => {
        if (apiConfigParams[queryParam].isPaginated) {
            if (apiConfigParams[queryParam].paginationType === 'OFFSET') {
                queryParams[queryParam] = apiConfigParams[queryParam].nextPaginationIdFunction(response);
            } else if (apiConfigParams[queryParam].paginationType === 'INCREMENT') {
                queryParams[queryParam] += 1;
            }
        }
    });

    if (moduleConfig.checkIfTheQuotaExists && !moduleConfig.checkIfTheQuotaExists(response)) {
        console.log('Quota Exceeded');
        return;
    }
    if (moduleConfig.customSleep) {
        await moduleConfig.customSleep();
    }
    for (const field of fields) {
        await childApis({
            moduleConfig,
            field,
            axiosQueryParams: {},
            headers,
        });
    }

    await hitApi({
        url,
        method,
        headers,
        body,
        params: queryParams,
        apiConfigParams,
        moduleConfig,
    })

  } catch (error) {
    console.error(error.status);
    console.error(error.response.data);

    if (error.status === 429) {
        console.info('Too Many Requests, waiting for cooldown period');
        moduleConfig.handleTooManyReuests &&  await moduleConfig.handleTooManyReuests(error.response);
        console.info('Cooldown period over, resuming the requests');
    }

    if (moduleConfig.customSleep) {
        await moduleConfig.customSleep();
    }

    await hitApi({
        url,
        method,
        headers,
        body,
        params: queryParams,
        apiConfigParams,
        moduleConfig,
    })
  }

}


exports.crawlApi = async ({
    moduleName,
    apiName,
    axiosQueryParams,
    headers,
}) => {

    const moduleConfig = configurations[moduleName].apis[apiName];
    if (!moduleConfig) {
        throw new Error('Invalid Module Name');
    }

    const { url, method, queryParams, body } = moduleConfig;

    Object.keys(queryParams).forEach((queryParam) => {
        if (!queryParams[queryParam].isPaginated) {
            if (queryParams[queryParam].required && !axiosQueryParams.hasOwnProperty(queryParam)) {
                console.log(`Required Query Parameter ${queryParam} is missing`);
                throw new Error(`Required Query Parameter ${queryParam} is missing`);
            }
        } else if (queryParams[queryParam].isPaginated) {
            if (queryParams[queryParam].paginationType === 'INCREMENT') {
                axiosQueryParams[queryParam] = axiosQueryParams.hasOwnProperty(queryParam) ? axiosQueryParams[queryParam] : 1;
            }
        }
    });
    await hitApi({
        url,
        method,
        headers,
        body,
        params: axiosQueryParams,
        apiConfigParams: queryParams,
        moduleConfig,
    });


}