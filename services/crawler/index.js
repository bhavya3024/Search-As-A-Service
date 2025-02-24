require('dotenv').config();
const express = require('express');
const mongooseDatabseConnection = require('./database');
const app = express();
const childProcessService = require('./services/child-process-service');

app.use(express.json());

const doc = {
    info: {
        title: 'Crawler API',
        description: 'Microservice for adding content sources and crawling data through APIs',
    },
    host: process.env.HOST || `localhost:${process.env.PORT || 3000}`,
}

// app.use('/api/v1/', router);
// swaggerAutoGen(outputFile, routes, doc).then(() => {
//    const swaggerAutoGenFile = require('./swagger-output.json');
//    app.use('/api/v1/docs', swaggerUIExpress.serve, swaggerUIExpress.setup(swaggerAutoGenFile));

// Connect routes
app.use('/api/v1', require('./routes'));

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongooseDatabseConnection();
    console.log('Connected to MongoDB');

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // Initialize child process service after server starts
      console.log('Starting crawler processes...');
      childProcessService.startProcessing().catch(err => {
        console.error('Error starting crawler processes:', err);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  // Add any cleanup code here
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  // Add any cleanup code here
  process.exit(0);
});

