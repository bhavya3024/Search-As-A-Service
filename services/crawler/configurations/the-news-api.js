const { paginationType, requestParameter, security } = require('../constants');
const { addDays, format } = require('date-fns');
const { sleep } = require('../utils');

module.exports = {
    name: 'World News Api',
    url: 'https://worldnewsapi.com',
    apis: {
        searchNews: {
            url: 'https://api.worldnewsapi.com/search-news',
            method: 'GET',
            security: [security.SECURE],
            elastic_index_prefix: 'worldnewsapi_',
            queryParams: {
                text: {
                    type: 'string',
                    required: true,
                    isPaginated: false
                },
                offset: {
                    type: 'date',
                    required: false,
                    isPaginated: true,
                    paginationType: paginationType.OFFSET,
                    nextPaginationIdFunction: (response) => { //axios response
                        const data = response.data;
                        return data.offset + data.number;
                    }
                },
                ['api-key']: {
                    type: 'string',
                    required: true,
                    isSecure: true,
                }
            },
            filterQueryParamsInElastic: (queryParams) => {
                Object.keys(queryParams).forEach((queryParam) => {
                    if (queryParam === 'api-key') {
                        delete queryParams[queryParam];
                    }
                });
                return queryParams;
            },
            handleTooManyReuests: async (response) => {
                // const seconds = parseInt(response.headers['retry-after']);
                // await new Promise((resolve) => {
                //     setTimeout(() => resolve(), seconds * 1000);
                // })
            },
            responseBodyHasItemsToCrawl: (response) => {
                return response.data.news?.length > 0;
            },
            checkIfTheQuotaExists: (response) => {
                return response.headers['x-api-quota-left'] >= 1;
            },
            customSleep: async () => {
                await sleep(5);
            },
            crawlFields: (response) => {
                const fields = response.data.news.map((article) => {
                    const {
                        id,
                        title,
                        text,
                        summary,
                        url,
                        image,
                        video,
                        author,
                        authors,
                        language,
                        source_country,
                        sentiment,
                    } = article;

                    return {
                        id,
                        title,
                        text,
                        summary,
                        url,
                        image,
                        video,
                        author,
                        authors,
                        language,
                        source_country,
                        sentiment,
                    };
                });
                return fields;
            }
        }
    }
};