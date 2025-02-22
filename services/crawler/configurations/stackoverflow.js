const { paginationType, requestParameter, security } = require('../constants');

module.exports = {
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
                    isPaginated: false,
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
            filterQueryParamsInElastic: (queryParams) => {
                Object.keys(queryParams).forEach((queryParam) => {
                    if (queryParam === 'key') {
                        delete queryParams[queryParam];
                    }
                });
                return queryParams;
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
                filterQueryParamsInElastic: (queryParams) => {
                    // Object.keys(queryParams).forEach((queryParam) => {
                    //     if (queryParam === 'key') {
                    //         delete queryParams[queryParam];
                    //     }
                    // });
                    return queryParams;
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
};