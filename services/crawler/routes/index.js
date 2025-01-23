const router = require('express').Router();
const contentSourcesRoute = require('./content-sources');
router.use('/content-sources', contentSourcesRoute);
module.exports = router;