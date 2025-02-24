const { default: axios } = require('axios');
const configurations = require('../configurations');
const elasticService = require('./elasticsearch');
const { v4: uuidv4 } = require('uuid');


const executeChildApis = async ({
    moduleConfig,
    field,
    axiosQueryParams = {},
    headers,
}) => {
    const childApis = moduleConfig.childApis;
    if (!childApis?.length) {
        return;
    }

    // Extract UUID from parent's elastic index
    const parentUUID = moduleConfig.elastic_index.split('_').pop();

    for (const childApi of childApis) {
        const extractFields = childApi.extractFields(field);
        const { url, method, queryParams, body } = childApi;
        let modifiedUrl = url;
        if (childApi.modifiedUrl) {
            modifiedUrl = childApi.modifiedUrl(url, extractFields);
        }
        validateQueryParams(queryParams, axiosQueryParams);

        // Use parent's UUID with child's prefix
        const childElasticIndex = `${childApi.elastic_index_prefix}${parentUUID}`.toLowerCase();

        const modififedUrlExists = await elasticService.checkChildUrlExists(childElasticIndex, modifiedUrl);
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
            moduleConfig: {
                ...childApi,
                elastic_index: childElasticIndex
            },
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

        if (!moduleConfig.responseBodyHasItemsToCrawl(response)) {
            return;
        }

        if (moduleConfig.checkIfTheQuotaExists && !moduleConfig.checkIfTheQuotaExists(response)) {
            console.log('Quota Exceeded');
            return;
        }

        const fields = moduleConfig.crawlFields(response);

        for (const field of fields) {
            // Filter out secure params before storing in elastic
            const elasticQueryParams = moduleConfig.filterQueryParamsInElastic({
                ...queryParams
            });
            
            // Use the elastic_index directly instead of as a prefix
            await elasticService.index(moduleConfig.elastic_index, {
                field,
                queryParams: elasticQueryParams,
                url,
            });
        }

        // Handle pagination
        incrementPagination(apiConfigParams, queryParams, response);
        console.log('Updated query params after pagination:', queryParams);

        if (moduleConfig.customSleep) {
            await moduleConfig.customSleep();
        }

        // Handle child APIs if any
        const childApis = moduleConfig?.childApis;
        if (childApis?.length) {
            for (const field of fields) {
                await executeChildApis({
                    moduleConfig,
                    field,
                    axiosQueryParams: {},
                    headers,
                });
            }
        }

        // Recursively call hitApi with updated pagination
        if (moduleConfig.responseBodyHasItemsToCrawl(response)) {
            await hitApi({
                url,
                method,
                headers,
                body,
                params: queryParams,
                apiConfigParams,
                moduleConfig,
            });
        }

    } catch (error) {
        console.error('Error in hitApi:', error);
        throw error;
    }
};


exports.crawlApi = async ({
    moduleName,
    apiName,
    axiosQueryParams,
    headers,
    elasticIndex
}) => {
    console.log('ATTACHING HERE --->>>>>>');
    const moduleConfig = configurations[moduleName].apis[apiName];
    if (!moduleConfig) {
        throw new Error('Invalid Module Name');
    }

    const { url, method, queryParams, body } = moduleConfig;

    // Get the UUID from the elasticIndex
    // const uuid = elasticIndex.split('_').pop();

    const fetchLastIndexItem = await elasticService.fetchLastIndexItem(elasticIndex);
    if (fetchLastIndexItem) {
        const queryParams = fetchLastIndexItem._source.queryParams;
        Object.keys(queryParams).forEach(key => {
            axiosQueryParams[key] = queryParams[key];
        });
    }

    validateQueryParams(queryParams, axiosQueryParams);

    await hitApi({
        url,
        method,
        headers,
        body,
        params: axiosQueryParams,
        apiConfigParams: queryParams,
        moduleConfig: {
            ...moduleConfig,
            elastic_index: elasticIndex,
            elastic_index_prefix: moduleConfig.elastic_index_prefix,
            crawlerName: moduleName
        },
    });
}
