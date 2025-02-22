const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200',
});
(async () => {
    // checking if the elastic connection is successful
    await client.nodes.info();
})();

const handleElasticSearchErrors = (error) => {
    if (error?.meta?.body?.error?.type === 'index_not_found_exception') { // first time indexing, so this error needs to be ignored
        return null;
    }
    throw error;
}


exports.index = async (index, {
    field,
    queryParams,
    url,
}) => {
    try {
        const { body: response } = await client.index({
            index,
            body: {
                data: field,
                queryParams,
                url,
                createdAt: new Date().valueOf(),
                updatedAt: new Date().valueOf(),
            }
        });
        return response;
    } catch (error) {
        return handleElasticSearchErrors(error);

    }
};


exports.fetchLastIndexItem = async (index) => {
    try {
        const { hits: { hits = [] } } = await client.search({
            index,
            body: {
                size: 1,
                sort: [{
                    createdAt: {
                        order: 'desc'
                    }
                }]
            }
        });
        const [lastIndexedItem = null] = hits;
        return lastIndexedItem;
    } catch (error) {
        return handleElasticSearchErrors(error);
    }
}




exports.checkChildUrlExists = async (index, url) => {
    try {
        const response = await client.count({
            index,
            body: {
                query: {
                    term: {
                        url
                    }
                }
            }
        });
        console.log('RESPONSE COUNT --->>>>>', response);
        return response.count > 0;
    } catch (error) {
        return handleElasticSearchErrors(error);
    }
} 