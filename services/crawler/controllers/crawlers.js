const configurations = require('../configurations');

exports.validateCrawler = (req, res) => {
  try {
    const { crawlerName, apiName, headers, queryParams } = req.body;
    if (!crawlerName || !apiName || !queryParams) {
      return res.status(400).json({ message: 'Invalid Request' });
    }

    if (!configurations[crawlerName]) {
      return res.status(400).json({ message: 'Invalid Crawler Name' });
    }

    if (!configurations[crawlerName].apis[apiName]) {
      return res.status(400).json({ message: 'Invalid API Name' });
    }

    const configurationHeaders = configurations[crawlerName].apis[apiName].headers;

    const secureVariables = {
      queryParams: [],
      headers: []
    };

    if (configurationHeaders) {
      if (!headers) {
        return res.status(400).json({ message: 'Headers are required' });
      } else {
        Object.keys(configurationHeaders).forEach((key) => {
          if (!headers[key] && configurationHeaders[key].required) {
            return res.status(400).json({ message: `Header ${key} is required` });
          }
          if (headers[key] && configurationHeaders[key].isSecure) {
            secureVariables.headers.push(key);
          }
        });
      }
    }

    const configurationQueryParams = configurations[crawlerName].apis[apiName].queryParams;

    if (configurationQueryParams) {
      if (!queryParams) {
        return res.status(400).json({ message: 'Query Params are required' });
      } else {
        Object.keys(configurationQueryParams).forEach((key) => {
          if (!queryParams[key] && configurationQueryParams[key].required) {
            return res.status(400).json({ message: `Query param ${key} is required` });
          }
          if (queryParams[key] && configurationQueryParams[key].isSecure) {
            secureVariables.queryParams.push(key);
          }
        });
      }
    }

    return res.status(200).json({ secureVariables });
  } catch (error) {
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};
