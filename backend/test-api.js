require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const aiService = require('./services/aiService');

aiService.initializeAI(); // Important for setting up Gemini

const companyInsightController = require('./controllers/companyInsightController');

const req = { params: { company: 'Netflix' } };
const res = { 
  status: (code) => {
    return { 
      json: (data) => {
        console.log(`[Status: ${code}] Response Data:`);
        console.log(JSON.stringify(data, null, 2));
      } 
    };
  }
};
const next = (err) => console.error(err);

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Testing endpoint fetching live Netflix insights...');
    await companyInsightController.getCompanyInsights(req, res, next);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();
