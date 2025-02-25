const express = require('express');
const { fork } = require('child_process');
const router = express.Router();

// Route to start the crawler
router.post('/start', (req, res) => {
  const task = req.body; // Assuming the task details are sent in the request body

  // Fork a new child process for the crawler
  const crawlerProcess = fork('./services/crawler/services/crawler-process.js');

  // Listen for messages from the child process
  crawlerProcess.on('message', (message) => {
    if (message.status === 'COMPLETED') {
      res.status(200).json({ message: 'Crawling completed', data: message });
    } else if (message.status === 'ERROR') {
      res.status(500).json({ message: 'Crawling error', error: message.error });
    }
  });

  // Send the task to the child process
  crawlerProcess.send(task);

  // Log the start of the crawling process
  console.log(`Started crawling for: ${task.crawlerName}.${task.apiName}`);

  // Respond to the client that the crawling has started
  res.status(202).json({ message: 'Crawling started', task });
});

module.exports = router;