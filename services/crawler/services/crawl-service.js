const { default: axios } = require('axios');
const configurations = require('../configurations');
const elasticService = require('./elasticsearch');


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
        validateQueryParams(queryParams, axiosQueryParams);

        const modififedUrlExists = await elasticService.checkChildUrlExists(childApi.elastic_index_prefix, modifiedUrl);
        if (modififedUrlExists) {
            console.log('URL Already Exists', modifiedUrl);
            continue;
        }
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

const incrementPagination = (apiConfigParams, queryParams, response) => {
    Object.keys(apiConfigParams).forEach((queryParam) => {
        if (apiConfigParams[queryParam].isPaginated) {
            if (apiConfigParams[queryParam].paginationType === 'OFFSET' && response) {
                queryParams[queryParam] = apiConfigParams[queryParam].nextPaginationIdFunction(response);
            } else if (apiConfigParams[queryParam].paginationType === 'INCREMENT') {
                queryParams[queryParam] += 1;
            }
        }
    });
};

const validateQueryParams = (queryParams, axiosQueryParams) => {
    Object.keys(queryParams).forEach((queryParam) => {
        if (!queryParams[queryParam].isPaginated) {
            if (queryParams[queryParam].required && !axiosQueryParams.hasOwnProperty(queryParam)) {
                if (queryParams[queryParam].default) {
                    axiosQueryParams[queryParam] = queryParams[queryParam].default;
                } else {
                    throw new Error(`Required Query Parameter ${queryParam} is missing`);
                }
            }
        } else if (queryParams[queryParam].isPaginated) {
            if (queryParams[queryParam].paginationType === 'INCREMENT') {
                axiosQueryParams[queryParam] = axiosQueryParams.hasOwnProperty(queryParam) ? axiosQueryParams[queryParam] : 1;
            }
        }
    });
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


        if (moduleConfig.checkIfTheQuotaExists && !moduleConfig.checkIfTheQuotaExists(response)) {
            console.log('Quota Exceeded');
            return;
        }

        const fields = moduleConfig.crawlFields(response);

        for (const field of fields) {
            // I don't want to store API keys in elastic. NO NO!!!
            const elasticQueryParams = moduleConfig.filterQueryParamsInElastic({
                ...queryParams
            });
            await elasticService.index(moduleConfig.elastic_index_prefix, {
                field,
                queryParams: elasticQueryParams,
                url,
            });
        }
        incrementPagination(apiConfigParams, queryParams, response);
        console.log('QUERY PARAMS --->>>>>', queryParams);

        if (moduleConfig.customSleep) {
            await moduleConfig.customSleep();
        }

        const childApis = moduleConfig?.childApis;



        if (childApis?.length) {
            for (const field of fields) {
                await childApis({
                    moduleConfig,
                    field,
                    axiosQueryParams: {},
                    headers,
                });
            }
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
        console.error(error);
        // console.error(error?.response);
        let retry = false;

        if (error.status === 429) {
            console.info('Too Many Requests, waiting for cooldown period');
            moduleConfig.handleTooManyReuests && await moduleConfig.handleTooManyReuests(error.response);
            retry = true
            console.info('Cooldown period over, resuming the requests');
        } else if (moduleConfig.handleApiError && typeof moduleConfig.handleApiError === 'function') {
            const skip = moduleConfig.handleApiError(error);
            if (skip) {
                retry = true;
                // incrementPagination(apiConfigParams, queryParams);
            }
        }

        if (retry) {
            await hitApi({
                url,
                method,
                headers,
                body,
                params: queryParams,
                apiConfigParams,
                moduleConfig,
            })
        } else {
            throw new Error('API Error', error);
        }
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

    const fetchLastIndexItem = await elasticService.fetchLastIndexItem(moduleConfig.elastic_index_prefix);
    if (fetchLastIndexItem) {
        const queryParams = fetchLastIndexItem._source.queryParams;
        console.log('QUERYPARMS -->>>', queryParams);
        Object.keys(queryParams).forEach(key => {
            axiosQueryParams[key] = queryParams[key];
        });
        console.log('AXIOS QUERY PARAMS --->>>>', axiosQueryParams);
    }

    validateQueryParams(queryParams, axiosQueryParams);

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


process.on('message',  async (message) => {
    console.log('MESSAGE ---->>>>', message);
    await this.crawlApi({
        moduleName: [message],
        apiName: 'breeds',
        axiosQueryParams: {
            page: 1,
            limit: 10,
        }
    });
    process.exit();
});