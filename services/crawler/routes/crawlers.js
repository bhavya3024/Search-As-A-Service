const router = require('express').Router();
const crawlerController = require('../controllers/crawler-controller');
const verifyToken = require('../middleware/auth-middleware');

// Create a new crawler
router.post('/', verifyToken, crawlerController.createCrawler);

// Get all crawlers for a user
router.get('/', verifyToken, crawlerController.getCrawlers);

// Get a specific crawler
router.get('/:id', verifyToken, crawlerController.getCrawlerById);

// Update a crawler
router.put('/:id', verifyToken, crawlerController.updateCrawler);

// Delete a crawler
router.delete('/:id', verifyToken, crawlerController.deleteCrawler);

module.exports = router;