# Crawler Service

This service manages crawlers from MongoDB, using Node.js child processes to execute crawling tasks in parallel batches. Each crawler job is executed in its own process and terminates upon completion.

## Architecture

The system consists of two main components:

1. **Crawler Queue Manager**:
   - Connects to MongoDB to fetch crawler configurations
   - Creates and manages child processes for each crawler
   - Limits the number of concurrent processes
   - Maintains a queue of crawlers to process

2. **Crawler Processes**:
   - Each process runs a single crawler job
   - Executes the crawler using the `crawl-service.js` module
   - Communicates status back to the parent process
   - Terminates automatically when the job is complete

## Setup

### Prerequisites

- Node.js 22
- MongoDB running on the host machine (default: `localhost:27017`)
- Elasticsearch running on the host machine (default: `localhost:9200`)

### Installation

```bash
# Navigate to the crawler service directory
cd services/crawler

# Install dependencies
npm install
```

### Running the Service

```bash
# Start the crawler queue manager
node services/crawler-queue-manager.js

# With custom MAX_PROCESSES
MAX_PROCESSES=5 node services/crawler-queue-manager.js
```

## How It Works

1. The crawler queue manager connects to MongoDB and retrieves all crawler configurations
2. Each crawler is added to a processing queue
3. The manager spawns child processes to handle each crawler, respecting the max concurrent processes limit
4. Each child process executes its crawler job independently
5. Child processes communicate status back to the parent process
6. When all crawlers are processed, the queue manager exits

## Environment Variables

- `MONGODB_URI` - MongoDB connection string (default: `mongodb://localhost:27017/crawler`)
- `MAX_PROCESSES` - Maximum number of concurrent processes (default: `3`)
- `ELASTICSEARCH_URI` - Elasticsearch connection string (default: `http://localhost:9200`)

## MongoDB Schema

Crawler configurations are stored in MongoDB with the following schema:

```javascript
{
  crawlerName: String,  // Name of the crawler (e.g., "GITHUB", "STACKOVERFLOW")
  apiName: String,      // Name of the API endpoint to use
  headers: Object,      // HTTP headers for API requests
  queryParams: Object,  // Query parameters for API requests
}
```

## Adding New Crawlers

To add a new crawler:

1. Add a configuration file in the `configurations` directory
2. Insert a crawler document in the MongoDB collection
3. Restart the queue manager to process the new crawler

