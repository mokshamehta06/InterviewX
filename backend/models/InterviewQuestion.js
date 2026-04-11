const mongoose = require('mongoose');

const CATEGORIES = [
  'Aptitude', 'HR', 'Technical', 'Coding', 'DBMS',
  'Operating System', 'Computer Networks', 'OOPs',
  'System Design', 'JavaScript', 'React', 'Node.js',
  'SQL', 'Company Specific', 'Behavioral', 'Puzzle',
  'Data Structures', 'Algorithms',
];

const interviewQuestionSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required'],
    index: true,
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: CATEGORIES,
    required: [true, 'Category is required'],
    index: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  frequency: {
    type: Number,
    default: 1,
    min: 1,
  },
  answer: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  round: {
    type: String,
    default: '',
  },
  source: {
    type: String,
    default: 'manual',
    enum: ['manual', 'scraped', 'ai-generated', 'user-contributed', 'leetcode'],
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound indexes for efficient queries
interviewQuestionSchema.index({ company: 1, category: 1 });
interviewQuestionSchema.index({ company: 1, difficulty: 1 });
interviewQuestionSchema.index({ company: 1, frequency: -1 });

// Static method to get category distribution for a company
interviewQuestionSchema.statics.getCategoryStats = async function (companyId) {
  return this.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(companyId) } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgDifficulty: { $avg: { $switch: {
          branches: [
            { case: { $eq: ['$difficulty', 'Easy'] }, then: 1 },
            { case: { $eq: ['$difficulty', 'Medium'] }, then: 2 },
            { case: { $eq: ['$difficulty', 'Hard'] }, then: 3 },
          ],
          default: 2,
        }}},
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Static method to get difficulty distribution
interviewQuestionSchema.statics.getDifficultyStats = async function (companyId) {
  return this.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(companyId) } },
    {
      $group: {
        _id: '$difficulty',
        count: { $sum: 1 },
      },
    },
  ]);
};

// Static method to get most frequent questions
interviewQuestionSchema.statics.getMostFrequent = async function (companyId, limit = 10) {
  return this.find({ company: companyId })
    .sort({ frequency: -1 })
    .limit(limit);
};

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema);
module.exports.CATEGORIES = CATEGORIES;
