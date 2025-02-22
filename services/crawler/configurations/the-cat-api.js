const { paginationType, requestParameter, security } = require('../constants');
const { sleep } = require('../utils');


module.exports = {
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
};