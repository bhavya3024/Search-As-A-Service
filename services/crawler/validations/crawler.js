const Joi = require('joi');

exports.createCrawler = Joi.object({
  crawlerName: Joi.string().required(),
  apiName: Joi.string().required(),
  headers: Joi.object().required(),
  queryParams: Joi.object().required()
});

exports.updateCrawler = Joi.object({
  crawlerName: Joi.string().optional(),
  apiName: Joi.string().optional(),
  headers: Joi.object().optional(),
  queryParams: Joi.object().optional()
}); 