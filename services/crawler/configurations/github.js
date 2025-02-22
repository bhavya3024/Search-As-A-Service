const { paginationType, requestParameter, security } = require('../constants');
const { sleep } = require('../utils');

module.exports = {
    name: 'GITHUB',
    url: 'https://github.com',
    apis: {
        repositories: {
            url: 'https://api.github.com/repositories',
            method: 'GET',
            elastic_index_prefix: 'github_repositories_',
            security: [security],
            queryParams: {
                since: {
                    type: 'number',
                    required: true,
                    isPaginated: true,
                    paginationType: paginationType.OFFSET,
                    nextPaginationIdFunction: (response) => { //axios response
                        const data = response.data;
                        return data[data.length - 1].id;
                    }
                }
            },
            responseBodyHasItemsToCrawl: (response) => {
                return response.data.length > 0;
            },
            checkIfTheQuotaExists: (response) => {
                return response.headers['x-ratelimit-remaining'] >= 1;
            },
            filterQueryParamsInElastic: (queryParams) => {
                return queryParams;
            },
            handleTooManyReuests: async (response) => {
                const seconds = parseInt(response.headers['retry-after']);
                await new Promise((resolve) => {
                    setTimeout(() => resolve(), seconds * 1000);
                })
            },
            handleApiError: async (error) => {
                if (error.status === 403) {
                    if (error.response?.data?.message === 'Repository access blocked') {
                        return true;
                    }
                }
                return false;

            },
            crawlFields: (response) => {
                const fields = response.data.map((repository) => {
                    const {
                        id,
                        node_id,
                        name,
                        full_name,
                        description,
                        owner
                    } = repository;
                    return {
                        id,
                        node_id,
                        name,
                        full_name,
                        description,
                        ...owner,
                    };
                });
                return fields;
            },
            childApis: [{
                extractFields: (fieldItem) => {
                    return {
                        owner: fieldItem.login,
                        repo: fieldItem.name,
                    }
                },
                url: 'https://api.github.com/repos/:owner/:repo/issues',
                modifiedUrl: (url, fieldItem) => {
                    return url.replace(':owner', fieldItem.owner).replace(':repo', fieldItem.repo);
                },
                method: 'GET',
                security: security.PUBLIC,
                elastic_index_prefix: 'github_issues_',
                pathParams: {
                    owner: {
                        type: 'string',
                        required: true,
                        isPaginated: false
                    },
                    repo: {
                        type: 'string',
                        required: true,
                        isPaginated: false
                    },
                },
                queryParams: {
                    page: {
                        type: 'number',
                        required: true,
                        isPaginated: true,
                        paginationType: paginationType.INCREMENT,
                    }
                },
                responseBodyHasItemsToCrawl: (response) => {
                    return response.data.length > 0;
                },
                filterQueryParamsInElastic: (queryParams) => {
                    return queryParams;
                },
                crawlFields: (response) => {
                    const fields = response.data.map((issue) => {
                        const {
                            url,
                            repository_url,
                            number,
                            title,
                            type,
                            description,
                            body,
                            user,
                            created_at,
                            updated_at,
                        } = issue;
                        return {
                            url,
                            repository_url,
                            number,
                            title,
                            type,
                            description,
                            body,
                            user: user.login,
                            url: user.url,
                            created_at,
                            updated_at,
                        };
                    });
                    return fields;
                },
                checkIfTheQuotaExists: (response) => {
                    console.log('QUOTA REMAINING  ---->>>', response.headers['x-ratelimit-remaining']);
                    return response.headers['x-ratelimit-remaining'] > 0;
                },
                handleApiError: async (error) => {
                    if (error.status === 403) {
                        if (error.response?.data?.message === 'Repository access blocked') {
                            return true;
                        }
                    }
                    return false;
    
                },
            }]
        },
    },
    rateLimit: {
        in: requestParameter.HEADERS,
        limit: {
            type: 'number',
            key: 'x-ratelimit-limit',
        },
        remaining: {
            type: 'number',
            key: 'x-ratelimit-remaining',
        },
        reset: {
            type: 'timestamp',
            key: 'x-ratelimit-reset',
        },
        used: {
            type: 'number',
            key: 'x-ratelimit-used',
        }
    }
};