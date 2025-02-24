const crawlService = require('./crawl-service');
const configurations = require('../configurations');
const Crawler = require('../models/crawler');
const mongooseConnection = require('../database');

// Connect to MongoDB when worker starts
const connectDB = async () => {
  try {
    await mongooseConnection();
    console.log('Worker connected to MongoDB');
  } catch (error) {
    console.error('Worker failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

process.on('message', async (message) => {
  if (message.type === 'START_CRAWLING') {
    try {
      const { crawlerId, crawlerName, apiName, headers, queryParams } = message.data;
      
      // Get crawler to access its elastic index
      const crawler = await Crawler.findById(crawlerId);
      if (!crawler) {
        throw new Error(`Crawler ${crawlerId} not found`);
      }

      // Get configuration for this crawler
      const crawlerConfig = configurations[crawlerName.toUpperCase()];
      if (!crawlerConfig) {
        throw new Error(`Configuration not found for crawler ${crawlerName}`);
      }

      const apiConfig = crawlerConfig.apis[apiName];
      if (!apiConfig) {
        throw new Error(`API configuration not found for ${crawlerName}.${apiName}`);
      }

      // Send progress update
      process.send({
        type: 'CRAWL_PROGRESS',
        data: { status: 'STARTED', crawlerId }
      });

      // Start crawling using crawlApi
      const config = {
        moduleName: crawlerName.toUpperCase(),
        apiName,
        axiosQueryParams: queryParams,
        headers,
        elasticIndex: `${apiConfig.elastic_index_prefix}${crawler.elasticUUID}`.toLowerCase()
      };

      await crawlService.crawlApi(config);

      // Update lastCrawledAt
      await Crawler.findByIdAndUpdate(crawlerId, {
        lastCrawledAt: new Date(),
        status: 'ACTIVE',
        errorMessage: null
      });

      // Send completion message
      process.send({
        type: 'CRAWL_COMPLETE',
        data: { crawlerId }
      });

    } catch (error) {
      // Update crawler status on error
      if (message.data?.crawlerId) {
        await Crawler.findByIdAndUpdate(message.data.crawlerId, {
          status: 'ERROR',
          errorMessage: error.message
        });
      }

      // Send error message
      process.send({
        type: 'CRAWL_ERROR',
        data: {
          message: error.message,
          stack: error.stack
        }
      });
    } finally {
      // Exit process
      process.exit(0);
    }
  }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  process.send({
    type: 'CRAWL_ERROR',
    data: {
      message: error.message,
      stack: error.stack
    }
  });
  process.exit(1);
}); 