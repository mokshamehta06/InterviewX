const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  searchQuery: {
    type: String,
    trim: true,
  },
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index: auto-delete after 90 days
searchHistorySchema.index({ searchedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
searchHistorySchema.index({ user: 1, searchedAt: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
