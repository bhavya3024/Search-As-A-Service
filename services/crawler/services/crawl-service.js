const { default: axios } = require('axios');
const configurations = require('../configurations');


const hitApi = async ({
    url,
    method,
    headers,
    body,
    params: queryParams,
    apiConfigParams,
    moduleConfig,
}) => {

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
    console.log('Crawling Data:', response.data);


    Object.keys(apiConfigParams).forEach((queryParam) => {
        if (apiConfigParams[queryParam].isPaginated) {
            if (apiConfigParams[queryParam].paginationType === 'OFFSET') {
                queryParams[queryParam] = apiConfigParams[queryParam].nextPaginationIdFunction(response);
            } else if (apiConfigParams[queryParam].paginationType === 'INCREMENT') {
                queryParams[queryParam] += 1;
            }
        }
    });
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


exports.crawlApi = async ({
    moduleName,
    apiName,
    axiosQueryParams
}) => {

    const moduleConfig = configurations[moduleName].apis[apiName];
    if (!moduleConfig) {
        throw new Error('Invalid Module Name');
    }

    const { url, method, queryParams, headers, body } = moduleConfig;

    Object.keys(queryParams).forEach((queryParam) => {
        if (!queryParams[queryParam].isPaginated) {
            if (queryParams[queryParam].required && !axiosQueryParams[queryParam]) {
                console.log(`Required Query Parameter ${queryParam} is missing`);
                throw new Error(`Required Query Parameter ${queryParam} is missing`);
            }
        } else if (queryParams[queryParam].isPaginated) {
            if (queryParams[queryParam].paginationType === 'INCREMENT') {
                axiosQueryParams[queryParam] = 1;
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