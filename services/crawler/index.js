require('dotenv').config();
const express = require('express');
const mongooseDatabseConnection = require('./database');
const app = express();

app.use(express.json());

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
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

