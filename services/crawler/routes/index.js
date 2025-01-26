const router = require('express').Router();
const contentSourcesRoute = require('./content-sources');
const apiConfigurationsRoute = require('./api-configurations');
const crawlsService = require('../services/api-crawl-service');

router.use('/content-sources', contentSourcesRoute);
router.use('/api-configurations', apiConfigurationsRoute);

/* testing purposes */
router.get('/crawls', async (req, res) => {
    const result = await crawlsService.crawl();
    return res.json(result);
});


module.exports = router;