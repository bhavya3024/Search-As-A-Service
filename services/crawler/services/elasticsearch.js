const { Client } = require('@elastic/elasticsearch');

const client = new Client({ 
    node: 'https://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USER,
        password: process.env.ELASTIC_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});
(async () => {
  const info =   await client.nodes.info();
})();


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
            }
        });
        return response;
    } catch (error) {
        console.error('An Error Occured while indexing data:', error);
        throw error;
    }
};