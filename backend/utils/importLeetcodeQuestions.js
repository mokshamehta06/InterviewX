const mongoose = require('mongoose');
const dotenv = require('dotenv');
const https = require('https');
const csv = require('csv-parser');
const path = require('path');
const Company = require('../models/Company');
const InterviewQuestion = require('../models/InterviewQuestion');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Target Companies & mapping to GitHub CSV prefixes
const TARGET_COMPANIES = [
  { slug: 'amazon', csvName: 'amazon', displayName: 'Amazon' },
  { slug: 'google', csvName: 'google', displayName: 'Google' },
  { slug: 'meta', csvName: 'facebook', displayName: 'Meta' },
  { slug: 'microsoft', csvName: 'microsoft', displayName: 'Microsoft' },
  { slug: 'apple', csvName: 'apple', displayName: 'Apple' },
  { slug: 'adobe', csvName: 'adobe', displayName: 'Adobe' },
  { slug: 'bloomberg', csvName: 'bloomberg', displayName: 'Bloomberg' },
  { slug: 'cisco', csvName: 'cisco', displayName: 'Cisco' },
  { slug: 'atlassian', csvName: 'atlassian', displayName: 'Atlassian' },
  { slug: 'uber', csvName: 'uber', displayName: 'Uber' }
];

const BASE_URL = 'https://raw.githubusercontent.com/darkflowio/Leetcode-Company-Wise-Questions-Website/master/data/LeetCode-Questions-CompanyWise';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const fetchCSV = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
      }
      
      const results = [];
      res.pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
};

const importData = async () => {
  try {
    await connectDB();
    
    for (const target of TARGET_COMPANIES) {
      console.log(`\nImporting Leetcode questions for ${target.displayName}...`);
      
      // 1. Ensure company exists or create skeleton
      let company = await Company.findOne({ slug: target.slug });
      if (!company) {
        console.log(`  -> Creating skeleton company record for ${target.displayName}`);
        company = await Company.create({
          name: target.displayName,
          slug: target.slug,
          searchCount: 50 // Give it some initial popularity
        });
      } else {
        console.log(`  -> Found existing company record for ${target.displayName} (${company._id})`);
      }
      
      // 2. Fetch CSV
      const csvUrl = `${BASE_URL}/${target.csvName}_alltime.csv`;
      let questionsData = [];
      try {
        questionsData = await fetchCSV(csvUrl);
      } catch (err) {
        console.error(`  -> ERROR fetching CSV: ${err.message}`);
        continue;
      }
      
      console.log(`  -> Fetched ${questionsData.length} records. Preserving top 50 to optimize load.`);
      
      // Sort by Frequency descending and take top 50 (or max you prefer)
      // We take top 50 to avoid massive DB bloat, but since they are real, it's very useful.
      questionsData.sort((a, b) => parseFloat(b.Frequency || 0) - parseFloat(a.Frequency || 0));
      const topQuestions = questionsData.slice(0, 50);
      
      const toInsert = [];
      for (const row of topQuestions) {
        if (!row.Title) continue;
        
        // Map LeetCode difficulty
        let difficulty = 'Medium';
        if (row.Difficulty) {
           if (row.Difficulty.includes('Hard')) difficulty = 'Hard';
           if (row.Difficulty.includes('Easy')) difficulty = 'Easy';
        }

        toInsert.push({
          company: company._id,
          question: row.Title,
          answer: row['Leetcode Question Link'] || '',
          category: 'Coding', // Tagged as coding problem
          difficulty: difficulty,
          source: 'leetcode',
          frequency: Math.max(1, parseFloat(row.Frequency) || 1), // frequency must be >= 1
          // Our schema has tags, role, source.
        });
      }
      
      // Remove old leetcode questions for this company to prevent duplicates
      const deleteResult = await InterviewQuestion.deleteMany({ company: company._id, source: 'leetcode' });
      console.log(`  -> Cleared ${deleteResult.deletedCount} old leetcode questions.`);
      
      const insertResult = await InterviewQuestion.insertMany(toInsert);
      console.log(`  -> Success! Inserted ${insertResult.length} questions for ${target.displayName}.`);
    }

    console.log('\n✅ All targeted Leetcode questions imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error during import: ${error.message}`);
    process.exit(1);
  }
};

importData();
