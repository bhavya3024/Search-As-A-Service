const { paginationType, requestParameter, security } = require('../constants');


module.exports = {
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
            filterQueryParamsInElastic: (queryParams) => {
                return queryParams;
            },
            handleTooManyReuests: async (response) => {
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
};