# Search As a Service
A microservices-based application that handles authenticated user based  API crawling functionalities and provdies a user combined search interface

## Services

### User Service
Handles user authentication and management with features including:
- User registration with OTP verification
- Login with JWT authentication
- Password reset functionality
- User profile management
- Email notifications using Resend API

# Crawler Service

This service manages crawlers from MongoDB, using Node.js child processes to execute crawling tasks in parallel batches. Each crawler job is executed in its own process and terminates upon completion.

## Architecture

   - When user hits /api/crawlers/start API, it creates a child processs runs a single crawler job based on any one of 
     any third party api.
   - Executes the crawler using the `crawl-service.js` module and dumps data into ElasticSearch.
   - Communicates status back to the parent process
   - Terminates automatically when the job is done.
   - Authenticated user can search through multiple crawled indexes in one go!

## Setup

### Prerequisites

- Node.js 22
- MongoDB running on the host machine (default: `localhost:27017`)
- Elasticsearch running on the host machine (default: `localhost:9200`)

### Installation

```bash
npm i -g lerna # if lerna not installed

npm i --workspaces # it will install in all the microservices

lerna run start # it will start all the services
```


### Running the Service


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



## Adding New Crawlers

To add a new crawler:

1. Add a configuration file in the `configurations` directory
2. Insert a crawler document in the MongoDB collection
3. Create a new crawler for the same new configuration and hit the /api/v1/crawlers/start API

## Technical Stack

- Node.js
- Express.js
- MongoDB
- Elasticsearch
- JWT Authentication
- Resend Email Service

## Environment Setup

### User Service
```properties
MONGODB_URI=mongodb://127.0.0.1:27017/users
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
RESEND_EMAIL=your_sender_email
```

### Crawler Service
```
MONGODB_URI=mongodb://127.0.0.1:27017/users
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=3242c5a6854c4b133865c6ab5946265c884290f654775c469acdc86725f46118
```