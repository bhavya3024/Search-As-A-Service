const { sleep } = require('../utils');


const paginationType = {
    OFFSET: 'OFFSET',
    INCREMENT: 'INCREMENT',
}

const requestParameter = {
    BODY: 'body',
    HEADERS: 'headers'
}

const security = {
    PUBLIC: 'PUBLIC',
    SECURE: 'SECURE',
}


module.exports = {
    GITHUB: {
        name: 'GITHUB',
        url: 'https://github.com',
        apis: {
            repositories: {
                url: 'https://api.github.com/repositories',
                method: 'GET',
                elastic_index_prefix: 'github_repositories_',
                security: [security.PUBLIC],
                queryParams: {
                    since: {
                        type: 'number',
                        required: true,
                        isPaginated: true,
                        paginationType: paginationType.OFFSET,
                        nextPaginationKey: 'id',
                        requestParameter: requestParameter.BODY,
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
                    return response.headers['x-ratelimit-remaining'] > 0;
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
                    }
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
    },
    STACKOVERFLOW: {
        name: 'STACKOVERFLOW', // limitations, pages above 25 requires app key!
        url: 'https://stackoverflow.com',
        apis: {
            search: {
                url: 'https://api.stackexchange.com/2.3/search',
                method: 'GET',
                security: [security.SECURE],
                elastic_index_prefix: 'stackoverflow_questions_',
                queryParams: {
                    site: {
                        type: 'string',
                        required: true,
                        isPaginated: false
                    },
                    intitle: {
                        type: 'string',
                        required: true,
                        isPaginated: false
                    },
                    page: {
                        type: 'number',
                        required: true,
                        isPaginated: true,
                        paginationType: paginationType.INCREMENT,
                    }
                },
                handleTooManyReuests: async (response) => {
                    const seconds = parseInt(response.headers['retry-after']);
                    await new Promise((resolve) => {
                        setTimeout(() => resolve(), seconds * 1000);    
                    })
                },
                customSleep: async () => {
                    await sleep(5);
                },
                responseBodyHasItemsToCrawl: (response) => {
                    return response.data.items.length > 0;
                },
                checkIfTheQuotaExists: (response) => {
                    return response.data.quota_remaining > 0;
                },
                crawlFields: (response) => {
                    const fields = response.data.items.map((items) => {
                        const {
                            tags,
                            owner,
                            is_answered,
                            view_count,
                            answer_count,
                            score,
                            last_activity_date,
                            creation_date,
                            last_edit_date,
                            question_id,
                            content_license,
                            link,
                            title,
                        } = items;
                        return {
                            tags,
                            ...owner,
                            is_answered,
                            view_count,
                            answer_count,
                            score,
                            last_activity_date,
                            creation_date,
                            last_edit_date,
                            question_id,
                            content_license,
                            link,
                            title,
                        };
                    });
                    return fields;
                },
                childApis: [{
                    url: 'https://api.stackexchange.com/2.3/questions/:question_id/answers',
                    method: 'GET',
                    security: [security.SECURE],
                    extractFields: (fieldItem) => {
                        return {
                            question_id: fieldItem.question_id,
                        }
                    },
                    modifiedUrl: (url, fieldItem) => {
                        return url.replace(':question_id', fieldItem.question_id);
                    },
                    customSleep: async () => {
                        await sleep(5);
                    },
                    elastic_index_prefix: 'stackoverflow_answers_',
                    queryParams: {
                        page: {
                            type: 'number',
                            required: true,
                            isPaginated: true,
                            paginationType: paginationType.INCREMENT,
                        },
                        sort: {
                            type: 'string',
                            required: false,
                            isPaginated: false,
                        }
                    },
                    responseBodyHasItemsToCrawl: (response) => {
                        return response.data.items.length > 0;
                    },
                    checkIfTheQuotaExists: (response) => {
                        return response.data.quota_remaining > 0;
                    },
                    handleTooManyReuests: async (response) => {
                        const seconds = parseInt(response.headers['retry-after']);
                        await new Promise((resolve) => {
                            setTimeout(() => resolve(), seconds * 1000);    
                        });
                    },
                    crawlFields: (response) => {
                        const fields = response.data.items.map((item) => {
                            const {
                                owner,
                                is_accepted,
                                score,
                                last_activity_date,
                                creation_date,
                                answer_id,
                                question_id,
                                content_license
                            } = item;
                            return {
                                ...owner,
                                is_accepted,
                                score,
                                last_activity_date,
                                creation_date,
                                answer_id,
                                question_id,
                                content_license
                            };
                        });
                        return fields;
                    },
                }]

            },
        },
    },
    THE_DOG_API: {
        name: 'The Dog Api',
        url: 'https://thedogapi.com',
        apis: {
            breeds: {
                url: 'https://api.thedogapi.com/v1/breeds',
                method: 'GET',
                security: [security.PUBLIC],
                elastic_index_prefix: 'thedogapi_breeds_',
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
                crawlFields: (response) => {
                    const fields = response.data.map((breed) => {
                        const {
                            id,
                            name,
                            bred_for,
                            temperament,
                            origin,
                            life_span,
                            weight,
                            country_code,
                        } = breed;
                        return {
                            id,
                            name,
                            bred_for,
                            temperament,
                            origin,
                            life_span,
                            weightImerial: weight.imperial,
                            weightMetric: weight.metric,
                            country_code,
                        };
                    });
                    return fields;
                },
            },
        },
    },
    THE_CAT_API: {
        name: 'THE_CAT_API',
        url: 'https://thecatapi.com',
        apis: {
            breeds: {
                url: 'https://api.thecatapi.com/v1/breeds',
                method: 'GET',
                elastic_index_prefix: 'thecatapi_breeds_',
                security: [security.PUBLIC],
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
                crawlFields: (response) => {
                    const fields = response.data.map((breed) => {
                        const {
                            id,
                            name,
                            description,
                            temperament,
                            origin,
                            life_span,
                            weight,
                            wikipedia_url,
                            country_code,
                        } = breed;

                        return {
                            id,
                            name,
                            description,
                            temperament,
                            origin,
                            life_span,
                            weight,
                            wikipedia_url,
                            country_code,
                        };
                    });
                    return fields;
                },
            }
        }
    },
    NEWS_API: {
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
    }
}