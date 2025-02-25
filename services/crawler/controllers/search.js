const configurations = require('../configurations');
const elasticService = require('../services/elasticsearch');
const Crawler = require('../models/crawler');


exports.search = async (req, res) => {
  try {
     const { limit, page, query } = req.query;
     const { userId } = req.user;
     console.log('USER ID --->>', userId);
     const crawlers = (await Crawler.find({ userId }).lean()).map(crawler => {  
         return {
           apiName: crawler.apiName,
           crawlerName: crawler.crawlerName,
           elasticUUID: crawler.elasticUUID,
         }
     });

     const indexes = [];

     for (const crawler of crawlers) {
        const api = configurations[crawler.crawlerName.toUpperCase()].apis[crawler.apiName];
        indexes.push(api.elastic_index_prefix + crawler.elasticUUID);
        if (api.childApis) {
           for (const childApi of api.childApis) {
              indexes.push(childApi.elastic_index_prefix + crawler.elasticUUID);
           }
        }
     }

     const result = await elasticService.search({
        indexes,
         query,
         limit,
         page,
     });

     return res.status(200).json({ result });
  } catch (error) {
     return res.status(500).json({ message: 'Internal Server Error' });
  }
}