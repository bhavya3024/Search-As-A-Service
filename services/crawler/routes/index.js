const router = require('express').Router();
router.use('/crawlers', require('./crawlers'));


module.exports = router;