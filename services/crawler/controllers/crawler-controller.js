const crawlerService = require('../services/crawler-service');

exports.createCrawler = async (req, res) => {
  try {
    const { userId } = req.user;
    const crawler = await crawlerService.createCrawler({ ...req.body, userId });
    res.status(201).json({ result: crawler });
  } catch (error) {
    if (error.message.includes('configuration')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getCrawlers = async (req, res) => {
  try {
    const { userId } = req.user;
    const crawlers = await crawlerService.getCrawlers(userId);
    res.status(200).json({ result: crawlers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCrawlerById = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const crawler = await crawlerService.getCrawlerById(id, userId);
    if (!crawler) {
      return res.status(404).json({ message: 'Crawler not found' });
    }
    res.status(200).json({ result: crawler });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCrawler = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const crawler = await crawlerService.updateCrawler(id, userId, req.body);
    if (!crawler) {
      return res.status(404).json({ message: 'Crawler not found' });
    }
    res.status(200).json({ result: crawler });
  } catch (error) {
    if (error.message.includes('configuration')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCrawler = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const crawler = await crawlerService.deleteCrawler(id, userId);
    if (!crawler) {
      return res.status(404).json({ message: 'Crawler not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
