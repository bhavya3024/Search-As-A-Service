const router = require('express').Router();
router.use('/search', require('./search'));
router.use('/crawlers', require('./crawlers'));


module.exports = router;