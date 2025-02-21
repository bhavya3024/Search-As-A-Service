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
                responseBody: {
                    type: 'array',
                    fieldsToCrawl: {
                        id: ['id'],
                        node_id: ['node_id'],
                        name: ['name'],
                        full_name: ['full_name'],
                        type: ['owner', 'type'],
                        description: ['description'],
                    }
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
                            type:  owner.type,
                        };
                    });
                    return fields;
                },
                childApis: [{
                    parentResponseFields: {
                        owner: ['owner', 'login'], // from parent response,
                        repo: ['name'],
                    },
                    issues: {
                        url: 'https://api.github.com/repos/:owner/:repo/issues',
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
                        fieldsToCrawl: {
                            url: ['url'],
                            repository_url: ['repository_url'],
                            number: ['number'],
                            title: ['title'],
                            type: ['owner', 'type'],
                            description: ['description'],
                            body: ['body'],
                            user: ['user', 'login'],
                            userUrl: ['user', 'url'],
                            created_at: ['created_at'],
                            updated_at: ['updated_at'],
                        }
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
                security: [security.PUBLIC],
                elastic_index_prefix: 'stackoverflow_search_',
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
            },
            fieldsToCrawl: {
                items: [{
                    tags: ['tags'],
                    ownerName: ['owner', 'display_name'],
                    isAnswered: ['is_answered'],
                    title: ['title'],
                    link: ['link'],
                }]
            }
        },
        rateLimit: {
            in: requestParameter.BODY,
            limit: {
                type: 'number',
                key: 'quota_max',
            },
            remaining: {
                type: 'number',
                key: 'quota_remaining',
            }
        }
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