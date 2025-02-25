const router = require('express').Router();
const crawlerController = require('../controllers/crawler-controller');
const verifyToken = require('../middleware/auth-middleware');
const { fork } = require('child_process');
const Crawler = require('../models/crawler');


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



// Route to start the crawler
router.post('/start', async (req, res) => {
  const { id } = req.body; // Assuming the task details are sent in the request body


  const crawler = await Crawler.findById(id);

  if (!crawler) {
    return res.status(404).send({
        message: 'Crawler not found'
    })
  }

  const { 
    userId,
    elasticUUID,
    apiName,
    crawlerName,
    queryParams,
    headers,
  } = crawler;

  // Fork a new child process for the crawler
  const crawlerProcess = fork('./services/crawl-service');


  crawlerProcess.send({
     userId,
     elasticUUID,
     apiName,
     crawlerName,
     queryParams,
     headers
  });


  crawlerProcess.on('error', console.error);


  // Respond to the client that the crawling has started
  res.status(202).json({ message: 'Crawling started' });
});







module.exports = router;

