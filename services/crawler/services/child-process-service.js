const { fork } = require('child_process');
const path = require('path');
const Crawler = require('../models/crawler');
const configurations = require('../configurations');
const encryptionService = require('./encryption-service');
const { decryptSecureData } = require('./crawler-service');

class ChildProcessService {
  constructor() {
    this.activeProcesses = new Map();
    this.BATCH_SIZE = 3;
    this.isRunning = false;
  }

  async startProcessing() {
    if (this.isRunning) {
      console.log('Crawler processing is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting crawler processing...');

    try {
      // Process crawlers continuously
      while (this.isRunning) {
        await this.processBatch();
        
        // Wait for 1 minute before processing next batch
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
    } catch (error) {
      console.error('Error in crawler processing:', error);
      this.isRunning = false;
      // Restart processing after error
      setTimeout(() => this.startProcessing(), 60000);
    }
  }

  async processBatch() {
    try {
      // Get crawlers that aren't currently being processed
      const crawlers = await Crawler.find({
        _id: { $nin: Array.from(this.activeProcesses.keys()) }
      }).limit(this.BATCH_SIZE);

      if (!crawlers.length) {
        console.log('No new crawlers to process');
        return;
      }

      // Process each crawler in the batch
      for (const crawler of crawlers) {
        await this.spawnCrawlerProcess(crawler);
      }

    } catch (error) {
      console.error('Error in processBatch:', error);
      throw error;
    }
  }

  async spawnCrawlerProcess(crawler) {
    try {
      // Create child process
      const childProcess = fork(path.join(__dirname, 'crawler-worker.js'));
      
      // Store process reference
      this.activeProcesses.set(crawler._id.toString(), childProcess);

      // Get configuration
      const config = configurations[crawler.crawlerName.toUpperCase()].apis[crawler.apiName];
      
      // Decrypt secure data before sending to worker
      const decryptedData = decryptSecureData(crawler.toObject(), config);

      // Send crawler configuration to child process
      childProcess.send({
        type: 'START_CRAWLING',
        data: {
          crawlerId: crawler._id.toString(),
          crawlerName: decryptedData.crawlerName,
          apiName: decryptedData.apiName,
          headers: decryptedData.headers,
          queryParams: decryptedData.queryParams
        }
      });

      // Handle messages from child process
      childProcess.on('message', (message) => {
        this.handleChildMessage(message, crawler._id.toString());
      });

      // Handle child process exit
      childProcess.on('exit', (code) => {
        console.log(`Child process for crawler ${crawler._id} exited with code ${code}`);
        this.activeProcesses.delete(crawler._id.toString());
      });

      // Handle child process errors
      childProcess.on('error', (error) => {
        console.error(`Error in child process for crawler ${crawler._id}:`, error);
        this.activeProcesses.delete(crawler._id.toString());
      });

    } catch (error) {
      console.error(`Error spawning process for crawler ${crawler._id}:`, error);
      this.activeProcesses.delete(crawler._id.toString());
    }
  }

  handleChildMessage(message, crawlerId) {
    switch (message.type) {
      case 'CRAWL_PROGRESS':
        console.log(`Crawler ${crawlerId} progress:`, message.data);
        break;
      
      case 'CRAWL_ERROR':
        console.error(`Crawler ${crawlerId} error:`, message.data);
        break;
      
      case 'CRAWL_COMPLETE':
        console.log(`Crawler ${crawlerId} completed`);
        break;
      
      default:
        console.log(`Unknown message from crawler ${crawlerId}:`, message);
    }
  }
}

module.exports = new ChildProcessService(); 