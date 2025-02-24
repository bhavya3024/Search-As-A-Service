const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const crawlerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true
  },
  crawlerName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  apiName: {
    type: String,
    required: true,
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
  },
  elasticUUID: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4
  },
  lastCrawledAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'PAUSED', 'ERROR'],
    default: 'ACTIVE'
  },
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Create compound index for userId and crawlerName
crawlerSchema.index({ userId: 1, crawlerName: 1 }, { unique: true });

const Crawler = mongoose.model('Crawler', crawlerSchema);

module.exports = Crawler; 