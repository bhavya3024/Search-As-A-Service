require('dotenv').config();
const express = require('express');
const mongooseDatabseConnection = require('./database');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', require('./routes'));

app.listen(process.env.PORT || 3001, async () => { 
  await mongooseDatabseConnection();
});