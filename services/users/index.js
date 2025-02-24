require('dotenv').config();
const express = require('express');
const mongooseDatabseConnection = require('./database');
const app = express();
require('./routes');
app.use(express.json());


app.listen(process.env.PORT || 3001, async () => { 
  await mongooseDatabseConnection();
});