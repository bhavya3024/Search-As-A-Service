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