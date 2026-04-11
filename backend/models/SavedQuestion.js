const mongoose = require('mongoose');

const savedQuestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewQuestion',
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['unsolved', 'attempted', 'solved'],
    default: 'unsolved',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate saves
savedQuestionSchema.index({ user: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('SavedQuestion', savedQuestionSchema);
