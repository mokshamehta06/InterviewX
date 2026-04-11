const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  logo: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  industry: {
    type: String,
    default: 'Information Technology',
  },
  headquarters: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  employeeCount: {
    type: String,
    default: '',
  },
  hiringProcess: {
    totalRounds: { type: Number, default: 3 },
    rounds: [{
      name: { type: String },
      description: { type: String },
      duration: { type: String },
      tips: { type: String },
    }],
    overallDifficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    averageDuration: { type: String, default: '2-3 hours' },
    eligibilityCriteria: { type: String, default: '' },
  },
  interviewPattern: {
    type: String,
    default: '',
  },
  topicsFrequency: [{
    topic: { type: String },
    frequency: { type: Number, default: 0 },
    category: { type: String },
  }],
  preparationTime: {
    type: String,
    default: '2-4 weeks',
  },
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
  },
  searchCount: {
    type: Number,
    default: 0,
  },
  aiAnalysis: {
    type: String,
    default: '',
  },
  reviewsAndCulture: {
    workCulture: { type: String, default: '' },
    salaryAndBenefits: { type: String, default: '' },
    growthOpportunities: { type: String, default: '' },
    workLifeBalance: { type: String, default: '' },
    commonComplaints: [{ type: String }],
    positivePoints: [{ type: String }],
    sentimentAnalysis: {
      overallScore: { type: Number, default: 0 }, // Out of 100
      positive: { type: Number, default: 0 }, // percentage
      neutral: { type: Number, default: 0 }, // percentage
      negative: { type: Number, default: 0 }, // percentage
    },
    ratingBreakdown: {
      overall: { type: Number, default: 0 }, // Out of 5
      culture: { type: Number, default: 0 }, 
      salary: { type: Number, default: 0 },
      workLifeBalance: { type: Number, default: 0 },
    }
  },
  preparationRoadmap: {
    type: String,
    default: '',
  },
  lastScrapedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create text index for search
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ searchCount: -1 });

// Generate slug from name before saving
companySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  this.updatedAt = Date.now();
  next();
});

// Virtual for questions count
companySchema.virtual('questionsCount', {
  ref: 'InterviewQuestion',
  localField: '_id',
  foreignField: 'company',
  count: true,
});

companySchema.virtual('experiencesCount', {
  ref: 'InterviewExperience',
  localField: '_id',
  foreignField: 'company',
  count: true,
});

companySchema.set('toJSON', { virtuals: true });
companySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Company', companySchema);
