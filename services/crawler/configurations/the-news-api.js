const { paginationType, requestParameter, security } = require('../constants');


module.exports = {
    name: 'News Api',
    url: 'https://newsapi.org',
    apis: {
        everything: {
            url: 'https://newsapi.org/v2/everything',
            method: 'GET',
            security: [security.SECURE],
            queryParams: {
                q: {
                    type: 'string',
                    required: true,
                    isPaginated: false
                },
                page: {
                    type: 'number',
                    required: true,
                    isPaginated: true,
                    paginationType: paginationType.INCREMENT,
                },
                apikey: {
                    type: 'string',
                    required: true,
                    isSecure: true,
                }
            },
            filterQueryParamsInElastic: (queryParams) => {
                // Object.keys(queryParams).forEach((queryParam) => {
                //     if (queryParams[queryParam].isPaginated) {
                //         delete queryParams[queryParam];
                //     }
                // });
                return queryParams;
            },
            handleTooManyReuests: async (response) => {
                // const seconds = parseInt(response.headers['retry-after']);
                // await new Promise((resolve) => {
                //     setTimeout(() => resolve(), seconds * 1000);
                // })
            },
            fieldsToCrawl: {
                articles: [{
                    source: ['source', 'name'],
                    author: ['author'],
                    title: ['title'],
                    description: ['description'],
                    url: ['url'],
                    urlImage: ['urlToImage'],
                    content: ['content'],
                    publishedAt: ['publishedAt'],
                }]
            }
        }
    }
};