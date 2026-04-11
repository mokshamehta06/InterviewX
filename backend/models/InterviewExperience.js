const mongoose = require('mongoose');

const interviewExperienceSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required'],
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  experience: {
    type: String,
    required: [true, 'Experience description is required'],
  },
  role: {
    type: String,
    default: 'Software Engineer',
  },
  location: {
    type: String,
    default: 'Unknown',
  },
  experienceLevel: {
    type: String,
    enum: ['Fresher', 'Experienced', 'Unknown'],
    default: 'Unknown',
  },
  jobType: {
    type: String,
    enum: ['Internship', 'Full-time', 'Unknown'],
    default: 'Unknown',
  },
  result: {
    type: String,
    enum: ['Selected', 'Rejected', 'Pending', 'Unknown'],
    default: 'Unknown',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  rounds: [{
    name: { type: String },
    questions: [{ type: String }],
    tips: { type: String },
    difficulty: { type: String },
  }],
  preparationTime: {
    type: String,
    default: '',
  },
  importantTopics: [{
    type: String,
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  aiSummary: {
    type: String,
    default: '',
  },
  source: {
    type: String,
    default: 'manual',
    enum: ['manual', 'scraped', 'ai-generated', 'user-contributed'],
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

interviewExperienceSchema.index({ company: 1, createdAt: -1 });
interviewExperienceSchema.index({ company: 1, result: 1 });

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
