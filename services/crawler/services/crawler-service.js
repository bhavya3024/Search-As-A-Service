const Crawler = require('../models/crawler');
const configurations = require('../configurations');
const encryptionService = require('./encryption-service');

const encryptSecureData = (data, config) => {
  const encryptedData = { ...data };
  
  // Encrypt headers if needed
  if (config.headers) {
    encryptedData.headers = { ...data.headers };
    Object.entries(config.headers).forEach(([key, headerConfig]) => {
      if (headerConfig.isSecure && encryptedData.headers[key]) {
        encryptedData.headers[key] = encryptionService.encrypt(encryptedData.headers[key]);
      }
    });
  }

  // Encrypt query params if needed
  if (config.queryParams) {
    encryptedData.queryParams = { ...data.queryParams };
    Object.entries(config.queryParams).forEach(([key, paramConfig]) => {
      if (paramConfig.isSecure && encryptedData.queryParams[key]) {
        encryptedData.queryParams[key] = encryptionService.encrypt(encryptedData.queryParams[key]);
      }
    });
  }

  return encryptedData;
};

const decryptSecureData = (data, config) => {
  const decryptedData = { ...data };

  // Decrypt headers if needed
  if (config.headers) {
    decryptedData.headers = { ...data.headers };
    Object.entries(config.headers).forEach(([key, headerConfig]) => {
      if (headerConfig.isSecure && decryptedData.headers[key]) {
        decryptedData.headers[key] = encryptionService.decrypt(decryptedData.headers[key]);
      }
    });
  }

  // Decrypt query params if needed
  if (config.queryParams) {
    decryptedData.queryParams = { ...data.queryParams };
    Object.entries(config.queryParams).forEach(([key, paramConfig]) => {
      if (paramConfig.isSecure && decryptedData.queryParams[key]) {
        decryptedData.queryParams[key] = encryptionService.decrypt(decryptedData.queryParams[key]);
      }
    });
  }

  return decryptedData;
};

exports.createCrawler = async (crawlerData) => {
  // Validate configuration first
  const validationResult = await validateCrawlerConfiguration(crawlerData);
  if (!validationResult.isValid) {
    throw new Error(validationResult.message);
  }

  // Get crawler configuration
  const config = configurations[crawlerData.crawlerName].apis[crawlerData.apiName];
  
  // Encrypt secure data before saving
  const encryptedData = encryptSecureData(crawlerData, config);
  
  const crawler = new Crawler(encryptedData);
  return await crawler.save();
};

exports.getCrawlers = async (userId) => {
  const crawlers = await Crawler.find({ userId });
  return crawlers.map(crawler => {
    const config = configurations[crawler.crawlerName].apis[crawler.apiName];
    return decryptSecureData(crawler.toObject(), config);
  });
};

exports.getCrawlerById = async (id, userId) => {
  const crawler = await Crawler.findOne({ _id: id, userId });
  if (!crawler) return null;
  
  const config = configurations[crawler.crawlerName].apis[crawler.apiName];
  return decryptSecureData(crawler.toObject(), config);
};

exports.updateCrawler = async (id, userId, updateData) => {
  // Validate configuration before update
  const validationResult = await validateCrawlerConfiguration(updateData);
  if (!validationResult.isValid) {
    throw new Error(validationResult.message);
  }

  const crawler = await Crawler.findOne({ _id: id, userId });
  if (!crawler) return null;

  const config = configurations[crawler.crawlerName].apis[crawler.apiName];
  
  // Encrypt secure data before saving
  const encryptedData = encryptSecureData(updateData, config);

  const updatedCrawler = await Crawler.findOneAndUpdate(
    { _id: id, userId },
    encryptedData,
    { new: true }
  );

  return decryptSecureData(updatedCrawler.toObject(), config);
};

exports.deleteCrawler = async (id, userId) => {
  return await Crawler.findOneAndDelete({ _id: id, userId });
};

// Configuration validation helper
const validateCrawlerConfiguration = async ({ crawlerName, apiName, headers = {}, queryParams = {} }) => {
  // Skip validation if not all required fields are present (for partial updates)
  if (!crawlerName || !apiName) {
    return { isValid: true };
  }

  // Check if crawler exists in configurations
  if (!configurations[crawlerName]) {
    return {
      isValid: false,
      message: 'Invalid crawler name - configuration not found'
    };
  }

  // Check if API exists for the crawler
  const crawlerConfig = configurations[crawlerName];
  if (!crawlerConfig.apis[apiName]) {
    return {
      isValid: false,
      message: 'Invalid API name for this crawler'
    };
  }

  const apiConfig = crawlerConfig.apis[apiName];

  // Validate headers
  if (apiConfig.headers) {
    for (const [key, config] of Object.entries(apiConfig.headers)) {
      if (config.required && !headers[key]) {
        return {
          isValid: false,
          message: `Required header "${key}" is missing`
        };
      }
    }
  }

  // Validate query parameters
  if (apiConfig.queryParams) {
    for (const [key, config] of Object.entries(apiConfig.queryParams)) {
      if (config.required && !config.isPaginated && !queryParams[key]) {
        return {
          isValid: false,
          message: `Required query parameter "${key}" is missing`
        };
      }
    }
  }

  return { isValid: true };
};

// Add validation service for external use
exports.validateCrawlerConfiguration = validateCrawlerConfiguration;

module.exports = {
  createCrawler: exports.createCrawler,
  getCrawlers: exports.getCrawlers,
  getCrawlerById: exports.getCrawlerById,
  updateCrawler: exports.updateCrawler,
  deleteCrawler: exports.deleteCrawler,
  validateCrawlerConfiguration: exports.validateCrawlerConfiguration,
  decryptSecureData
}; 