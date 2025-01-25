const router = require('express').Router();
const contentSourcesRoute = require('./content-sources');
const apiConfigurationsRoute = require('./api-configurations');
router.use('/content-sources', contentSourcesRoute);
router.use('/api-configurations', apiConfigurationsRoute);
module.exports = router;