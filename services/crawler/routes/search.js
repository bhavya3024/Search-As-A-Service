const router = require('express').Router();
const controller = require('../controllers/search');
const verifyToken = require('../middleware/auth-middleware');


router.get('/', verifyToken, controller.search);

module.exports = router;