const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  title: {
    type: String,
    default: 'Mock Interview',
  },
  questions: [{
    questionText: { type: String },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewQuestion' },
    category: { type: String },
    difficulty: { type: String },
    userAnswer: { type: String, default: '' },
    correctAnswer: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
  }],
  category: {
    type: String,
    default: 'Mixed',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
    default: 'Mixed',
  },
  totalQuestions: {
    type: Number,
    default: 10,
  },
  score: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0,
  },
  timeLimit: {
    type: Number, // in seconds
    default: 1800, // 30 minutes
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress',
  },
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

mockTestSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('MockTest', mockTestSchema);
