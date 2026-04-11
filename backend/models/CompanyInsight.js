const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  role: String,
  year: Number,
  difficulty: String,
  questions: [String],
  tips: [String],
  source: String,
});

const companyInsightSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
  },
  summary: {
    overallDifficulty: { type: String, default: "Medium" },
    mostAskedTopics: { type: [String], default: [] },
    oaPattern: { type: [String], default: [] }
  },
  hiringRounds: { type: [String], default: [] },
  experiences: { type: [experienceSchema], default: [] },
  lastScrapedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Check if data is older than 30 days
companyInsightSchema.methods.isStale = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.lastScrapedAt < thirtyDaysAgo;
};

module.exports = mongoose.model('CompanyInsight', companyInsightSchema);
