const { query } = require('express');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true
  },
  crawlerName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  apiName: {
    type: String,
    required: true,
    default: {},
  },
  headers: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {},
  },
  queryParams: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {},
  }
});

const User = mongoose.model('Crawlers', userSchema);

module.exports = User;