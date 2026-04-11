const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Service - Gemini API Integration
 * 
 * This service uses Google's Gemini AI model to:
 * 1. Generate comprehensive company interview analysis
 * 2. Summarize interview experiences
 * 3. Generate mock interview questions
 * 4. Create preparation roadmaps
 * 5. Extract key topics from questions
 * 6. Generate personalized checklists
 * 
 * HOW IT WORKS:
 * We send structured prompts to Gemini API and parse the JSON responses.
 * The AI generates realistic interview data based on its training knowledge
 * of actual company interview patterns.
 */

let genAI = null;
let model = null;

function initializeAI() {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️ Gemini API key not configured. AI features will use fallback data.');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Gemini AI initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
    return false;
  }
}

/**
 * Generate complete company interview analysis
 * This is the CORE AI feature - generates everything about a company's interview process
 */
async function generateCompanyAnalysis(companyName, scrapedData = '') {
  if (!model) {
    return getFallbackAnalysis(companyName);
  }

  const prompt = `You are an expert career counselor. Generate a comprehensive interview analysis for "${companyName}" in JSON format.

If provided, use this real scraped data to inform your analysis, especially for culture and reviews:
${scrapedData ? `"""\n${scrapedData.substring(0, 15000)}\n"""` : 'No scraped data available.'}

Include exactly this JSON structure:
{
  "companyOverview": "2-3 sentence overview of the company and its tech stack",
  "hiringProcess": {
    "totalRounds": number,
    "rounds": [{"name": "Round Name", "description": "What happens", "duration": "time", "tips": "preparation tips"}],
    "overallDifficulty": "Easy/Medium/Hard",
    "averageDuration": "total interview duration",
    "eligibilityCriteria": "CGPA, backlogs, etc."
  },
  "interviewPattern": "Description of the overall interview pattern",
  "mostAskedTopics": [{"topic": "Topic Name", "frequency": number_out_of_100, "category": "category"}],
  "difficultyBreakdown": {"easy": percentage, "medium": percentage, "hard": percentage},
  "preparationTime": "recommended preparation time",
  "salaryRange": {"min": number_in_lpa, "max": number_in_lpa},
  "topCodingTopics": ["Array", "String", "etc"],
  "topCSTopics": ["OS topic", "DBMS topic", "etc"],
  "tips": ["tip1", "tip2", "etc"],
  "commonMistakes": ["mistake1", "mistake2", "etc"],
  "reviewsAndCulture": {
    "workCulture": "3-4 sentence detailed summary of work culture based on real employee reviews",
    "salaryAndBenefits": "Summary of salary satisfaction and benefits",
    "growthOpportunities": "Summary of career growth prospects",
    "workLifeBalance": "Summary of typical work hours and work-life balance",
    "commonComplaints": ["complaint1", "complaint2"],
    "positivePoints": ["positive1", "positive2"],
    "sentimentAnalysis": {
      "overallScore": 85,
      "positive": 60,
      "neutral": 30,
      "negative": 10
    },
    "ratingBreakdown": {
      "overall": 4.2,
      "culture": 4.5,
      "salary": 3.8,
      "workLifeBalance": 4.1
    }
  }
}

Be specific and realistic for ${companyName}. Return ONLY valid JSON, no markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    return getFallbackAnalysis(companyName);
  }
}

/**
 * Generate mock interview questions using AI
 */
async function generateMockQuestions(companyName, category = 'Mixed', difficulty = 'Mixed', count = 10) {
  if (!model) {
    return getFallbackMockQuestions(companyName, category, count);
  }

  const prompt = `Generate ${count} interview questions for "${companyName}" company.
Category: ${category}
Difficulty: ${difficulty}

Return as JSON array:
[{
  "question": "question text",
  "category": "${category === 'Mixed' ? 'appropriate category' : category}",
  "difficulty": "${difficulty === 'Mixed' ? 'Easy/Medium/Hard' : difficulty}",
  "answer": "brief model answer or approach",
  "tags": ["relevant", "tags"]
}]

Categories: Aptitude, HR, Technical, Coding, DBMS, Operating System, Computer Networks, OOPs, System Design, JavaScript, SQL, Behavioral, Data Structures, Algorithms

Make questions realistic and specific to ${companyName}. Return ONLY valid JSON array.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('AI Mock Questions Error:', error.message);
    return getFallbackMockQuestions(companyName, category, count);
  }
}

/**
 * Summarize a long interview experience into key points
 */
async function summarizeExperience(experienceText) {
  if (!model) {
    return 'AI summary not available. Please configure your Gemini API key.';
  }

  const prompt = `Summarize this interview experience in 3-5 bullet points. Focus on:
- Key rounds and what was asked
- Difficulty level
- Important topics to prepare
- Result and tips

Experience: "${experienceText}"

Return as a plain text summary with bullet points.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('AI Summary Error:', error.message);
    return 'Unable to generate summary at this time.';
  }
}

/**
 * Generate a preparation roadmap for a company
 */
async function generatePreparationRoadmap(companyName) {
  if (!model) {
    return getFallbackRoadmap(companyName);
  }

  const prompt = `Create a detailed week-by-week preparation roadmap for "${companyName}" placement interview. Return as JSON:

{
  "totalWeeks": number,
  "roadmap": [
    {
      "week": 1,
      "title": "Week Title",
      "topics": ["Topic 1", "Topic 2"],
      "tasks": ["Task 1", "Task 2"],
      "resources": ["Resource 1", "Resource 2"],
      "practiceProblems": number
    }
  ],
  "dailySchedule": {
    "hours": number,
    "breakdown": [{"activity": "activity", "hours": number}]
  },
  "importantTopics": ["Topic 1", "Topic 2"],
  "lastWeekTips": ["tip1", "tip2"]
}

Be specific to ${companyName}'s interview pattern. Return ONLY valid JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('AI Roadmap Error:', error.message);
    return getFallbackRoadmap(companyName);
  }
}

/**
 * Generate a personalized interview checklist
 */
async function generateChecklist(companyName) {
  if (!model) {
    return getFallbackChecklist(companyName);
  }

  const prompt = `Create an interview preparation checklist for "${companyName}". Return as JSON:

{
  "checklist": [
    {
      "category": "Category Name",
      "items": [
        {"item": "Checklist item", "priority": "High/Medium/Low", "estimatedTime": "time"}
      ]
    }
  ]
}

Include categories: Technical Prep, Aptitude, HR Prep, Coding Practice, Company Research, Soft Skills.
Return ONLY valid JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('AI Checklist Error:', error.message);
    return getFallbackChecklist(companyName);
  }
}

/**
 * Parse messy, raw scraped text (from Reddit, GFG, etc.) into structured insights
 */
async function parseScrapedInsights(messyText, companyName) {
  if (!model) {
    throw new Error('AI missing');
  }

  const prompt = `You are an expert technical recruiter analyzing scraped raw text (such as Reddit JSON dumps or blog HTML text) regarding "${companyName}" interview experiences.
Your goal is to parse this noisy data and extract verified interview processes, online assessment patterns, and real candidate experiences.

Raw Data Dump:
"""
${messyText.substring(0, 30000)} // Limiting to ~30k chars to avoid token limits
"""

Analyze the dump and return ONLY a valid JSON object matching exactly this schema:
{
  "summary": {
    "overallDifficulty": "Easy/Medium/Hard (infer from data)",
    "mostAskedTopics": ["Array", "System Design", "etc"],
    "oaPattern": ["Description of round 1", "Round 2 details", "etc"]
  },
  "hiringRounds": ["Round 1 name", "Round 2 name", "etc"],
  "experiences": [
    {
      "role": "e.g. SDE Intern, Frontend Dev",
      "year": 2024,
      "difficulty": "Easy/Medium/Hard",
      "questions": ["Real question 1", "Real question 2"],
      "tips": ["Tip 1", "Tip 2"],
      "source": "E.g. Reddit or GeeksForGeeks",
      "location": "e.g. Bangalore, Remote, Unknown",
      "experienceLevel": "Fresher or Experienced or Unknown",
      "jobType": "Internship or Full-time or Unknown"
    }
  ]
}

Include up to 5 of the most detailed and distinct experiences found in the dump.
Do NOT include markdown block ticks like \`\`\`json. Return strictly the raw JSON object.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('AI Parse Scraped Insights Error:', error.message);
    throw new Error('Failed to parse scraped insights with AI');
  }
}

/**
 * Generate mock dummy experiences specifically designed for filtering (role, loc, etc.)
 */
async function generateMockExperiences(companyName, count = 5) {
  if (!model) {
    return [];
  }

  const prompt = `Generate ${count} realistic interview experiences for "${companyName}".
Return as ONLY a valid JSON array matching this schema:
[
  {
    "title": "Short title, e.g. Software Engineer Interview Experience",
    "experience": "Detailed 2-paragraph description of what happened in the interview.",
    "role": "Software Engineer / Frontend Developer / Data Analyst",
    "location": "City, Country or Remote",
    "experienceLevel": "Fresher" or "Experienced",
    "jobType": "Full-time" or "Internship",
    "result": "Selected", "Rejected", or "Pending",
    "difficulty": "Easy", "Medium", or "Hard",
    "importantTopics": ["Topic1", "Topic2"]
  }
]
No markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(text);
  } catch (e) {
    console.error('AI Mock Experiences Error:', e);
    return [];
  }
}

// ========================
// Fallback Data (when API key not configured)
// ========================

function getFallbackAnalysis(companyName) {
  return {
    companyOverview: `${companyName} is a leading technology company known for its innovative solutions and strong engineering culture. They regularly hire from top engineering colleges across India.`,
    hiringProcess: {
      totalRounds: 4,
      rounds: [
        { name: 'Online Assessment', description: 'MCQs on aptitude, logical reasoning, and coding questions', duration: '90 minutes', tips: 'Practice aptitude on IndiaBix, coding on LeetCode' },
        { name: 'Technical Round 1', description: 'DSA problems, CS fundamentals (OS, DBMS, CN)', duration: '45-60 minutes', tips: 'Revise core CS subjects, practice medium-level DSA' },
        { name: 'Technical Round 2', description: 'System design, project discussion, advanced coding', duration: '45-60 minutes', tips: 'Know your projects well, practice system design basics' },
        { name: 'HR Round', description: 'Behavioral questions, salary discussion, company fit', duration: '20-30 minutes', tips: 'Prepare STAR method answers, research company values' },
      ],
      overallDifficulty: 'Medium',
      averageDuration: '3-4 hours',
      eligibilityCriteria: '60% throughout, no active backlogs',
    },
    interviewPattern: `${companyName} follows a standard campus hiring process with online test followed by technical and HR rounds. Strong focus on fundamentals and problem-solving ability.`,
    mostAskedTopics: [
      { topic: 'Arrays & Strings', frequency: 85, category: 'Coding' },
      { topic: 'SQL Queries', frequency: 78, category: 'DBMS' },
      { topic: 'OOPs Concepts', frequency: 75, category: 'OOPs' },
      { topic: 'OS Concepts', frequency: 65, category: 'Operating System' },
      { topic: 'Sorting & Searching', frequency: 60, category: 'Algorithms' },
      { topic: 'Linked Lists', frequency: 55, category: 'Data Structures' },
      { topic: 'Networking Basics', frequency: 50, category: 'Computer Networks' },
      { topic: 'Trees & Graphs', frequency: 45, category: 'Data Structures' },
    ],
    difficultyBreakdown: { easy: 30, medium: 50, hard: 20 },
    preparationTime: '3-4 weeks',
    salaryRange: { min: 3.5, max: 12 },
    topCodingTopics: ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Dynamic Programming', 'Sorting'],
    topCSTopics: ['Process Management', 'Normalization', 'TCP/IP', 'Polymorphism', 'Deadlocks'],
    tips: [
      'Focus on DSA fundamentals - arrays, strings, and trees are most asked',
      'Revise DBMS thoroughly - SQL queries are frequently asked',
      'Know your projects inside out - be ready to explain architecture',
      'Practice aptitude daily for at least 30 minutes',
      'Research the company culture and recent news',
    ],
    commonMistakes: [
      'Not practicing enough coding problems',
      'Ignoring aptitude preparation',
      'Not knowing project details',
      'Poor communication in HR round',
      'Not asking questions to the interviewer',
    ],
    reviewsAndCulture: {
      workCulture: "The company fosters a highly collaborative and fast-paced environment where employees are encouraged to take ownership.",
      salaryAndBenefits: "Salaries are competitive with industry standards, along with great health insurance and ESPP options.",
      growthOpportunities: "Excellent growth for top performers, though internal promotions can sometimes be slow.",
      workLifeBalance: "Work-life balance is generally good, but can get demanding during product release cycles.",
      commonComplaints: ["Bureaucracy in decision making", "Slow promotion cycles"],
      positivePoints: ["Great peer learning", "Free food and campus amenities", "Flexible hybrid work"],
      sentimentAnalysis: { overallScore: 78, positive: 65, neutral: 20, negative: 15 },
      ratingBreakdown: { overall: 4.1, culture: 4.3, salary: 4.0, workLifeBalance: 3.8 }
    }
  };
}

function getFallbackMockQuestions(companyName, category, count) {
  const questions = [
    { question: 'What is the difference between an array and a linked list?', category: 'Data Structures', difficulty: 'Easy', answer: 'Arrays store elements in contiguous memory with O(1) access. Linked lists use nodes with pointers, O(1) insertion/deletion.', tags: ['array', 'linked list', 'basics'] },
    { question: 'Explain the concept of normalization in DBMS.', category: 'DBMS', difficulty: 'Medium', answer: 'Normalization organizes database to reduce redundancy. 1NF (atomic values), 2NF (no partial dependency), 3NF (no transitive dependency), BCNF.', tags: ['normalization', 'database', 'sql'] },
    { question: 'What is polymorphism in OOPs?', category: 'OOPs', difficulty: 'Easy', answer: 'Polymorphism means many forms. Compile-time (method overloading) and runtime (method overriding). Allows same interface for different data types.', tags: ['oops', 'polymorphism'] },
    { question: 'Write a function to reverse a linked list.', category: 'Coding', difficulty: 'Medium', answer: 'Use three pointers: prev, current, next. Iterate through list, reversing each pointer. Time: O(n), Space: O(1).', tags: ['linked list', 'coding'] },
    { question: 'What are the differences between TCP and UDP?', category: 'Computer Networks', difficulty: 'Easy', answer: 'TCP is connection-oriented, reliable, ordered. UDP is connectionless, faster, no guarantee of delivery. TCP for web, UDP for streaming.', tags: ['networking', 'tcp', 'udp'] },
    { question: 'Explain deadlock and its prevention methods.', category: 'Operating System', difficulty: 'Medium', answer: 'Deadlock: circular wait for resources. Prevention: break one of 4 conditions (mutual exclusion, hold&wait, no preemption, circular wait).', tags: ['os', 'deadlock'] },
    { question: 'What is your greatest strength and weakness?', category: 'HR', difficulty: 'Easy', answer: 'Use STAR method. Strength: relevant skill with example. Weakness: genuine but show improvement steps.', tags: ['hr', 'behavioral'] },
    { question: 'Design a URL shortener system.', category: 'System Design', difficulty: 'Hard', answer: 'Hash URL to short code, store in DB. Consider: collision handling, analytics, caching, load balancing, database sharding.', tags: ['system design', 'scalability'] },
    { question: 'A train 120m long passes a pole in 12 seconds. What is its speed?', category: 'Aptitude', difficulty: 'Easy', answer: 'Speed = Distance/Time = 120/12 = 10 m/s = 36 km/h', tags: ['aptitude', 'speed'] },
    { question: 'Implement a binary search algorithm.', category: 'Algorithms', difficulty: 'Easy', answer: 'Compare middle element. If target < mid, search left half. If target > mid, search right half. Time: O(log n).', tags: ['binary search', 'algorithms'] },
    { question: 'What is the virtual DOM in React?', category: 'JavaScript', difficulty: 'Medium', answer: 'Virtual DOM is a lightweight copy of real DOM. React compares virtual DOM changes (diffing) and updates only changed parts (reconciliation).', tags: ['react', 'virtual dom'] },
    { question: 'Explain indexing in databases.', category: 'SQL', difficulty: 'Medium', answer: 'Indexes are data structures (B-tree) that speed up data retrieval. Types: primary, unique, composite, full-text. Trade-off: faster reads, slower writes.', tags: ['sql', 'indexing'] },
    { question: 'Where do you see yourself in 5 years?', category: 'Behavioral', difficulty: 'Easy', answer: 'Show ambition aligned with company growth. Mention skill development, taking on more responsibilities, and contributing to team/company goals.', tags: ['behavioral', 'hr'] },
    { question: 'Find the longest palindromic substring.', category: 'Coding', difficulty: 'Hard', answer: 'Expand around center approach: for each index, expand outwards checking palindrome. Time: O(n²), Space: O(1). Or use Manacher\'s O(n).', tags: ['string', 'palindrome', 'dp'] },
    { question: `Why do you want to join ${companyName}?`, category: 'Company Specific', difficulty: 'Easy', answer: `Research ${companyName}'s values, recent projects, and culture. Connect your skills and career goals with what the company offers.`, tags: ['company specific', 'hr'] },
  ];

  return questions.slice(0, count);
}

function getFallbackRoadmap(companyName) {
  return {
    totalWeeks: 4,
    roadmap: [
      {
        week: 1,
        title: 'Foundations & Aptitude',
        topics: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Basic Data Structures'],
        tasks: ['Complete aptitude basics', 'Practice 20 reasoning puzzles', 'Revise array and string operations', 'Start LeetCode Easy problems'],
        resources: ['IndiaBix.com', 'GeeksforGeeks Aptitude', 'LeetCode', 'HackerRank'],
        practiceProblems: 30,
      },
      {
        week: 2,
        title: 'Core CS Subjects',
        topics: ['DBMS & SQL', 'Operating Systems', 'Computer Networks', 'OOPs'],
        tasks: ['Complete DBMS normalization & SQL queries', 'Revise OS concepts (scheduling, memory, deadlocks)', 'Study CN basics (OSI, TCP/IP)', 'Practice OOPs with examples'],
        resources: ['Gate Smashers YouTube', 'JavaTPoint', 'GeeksforGeeks', 'Tutorialspoint'],
        practiceProblems: 50,
      },
      {
        week: 3,
        title: 'DSA & Coding',
        topics: ['Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting & Searching'],
        tasks: ['Solve 50 LeetCode Medium problems', 'Practice tree and graph traversals', 'Learn DP patterns', 'Implement common sorting algorithms'],
        resources: ['LeetCode', 'Striver SDE Sheet', 'NeetCode', 'InterviewBit'],
        practiceProblems: 70,
      },
      {
        week: 4,
        title: 'Mock Interviews & HR Prep',
        topics: ['System Design Basics', 'HR Questions', 'Company Research', 'Mock Tests'],
        tasks: [`Research ${companyName} thoroughly`, 'Practice 5 mock interviews', 'Prepare STAR method answers', 'Review all weak topics', 'Take full-length mock tests'],
        resources: ['Pramp.com', 'InterviewIQ Mock Tests', 'Glassdoor Reviews', `${companyName} careers page`],
        practiceProblems: 40,
      },
    ],
    dailySchedule: {
      hours: 6,
      breakdown: [
        { activity: 'Coding Practice', hours: 2 },
        { activity: 'CS Fundamentals', hours: 1.5 },
        { activity: 'Aptitude', hours: 1 },
        { activity: 'HR & Soft Skills', hours: 0.5 },
        { activity: 'Company Research', hours: 0.5 },
        { activity: 'Revision', hours: 0.5 },
      ],
    },
    importantTopics: ['Arrays', 'Strings', 'SQL', 'OOPs', 'OS Basics', 'Trees', 'Dynamic Programming'],
    lastWeekTips: [
      'Focus on revision, not new topics',
      'Take at least 2 full mock interviews',
      'Sleep well the night before',
      'Keep your resume points fresh in mind',
      'Prepare questions to ask the interviewer',
    ],
  };
}

function getFallbackChecklist(companyName) {
  return {
    checklist: [
      {
        category: 'Technical Preparation',
        items: [
          { item: 'Solve 100+ DSA problems on LeetCode', priority: 'High', estimatedTime: '2 weeks' },
          { item: 'Revise OOPs concepts with examples', priority: 'High', estimatedTime: '2 days' },
          { item: 'Practice SQL queries (joins, subqueries, aggregations)', priority: 'High', estimatedTime: '3 days' },
          { item: 'Revise OS (processes, threads, scheduling, memory management)', priority: 'Medium', estimatedTime: '2 days' },
          { item: 'Study Computer Networks (OSI model, TCP/IP, HTTP)', priority: 'Medium', estimatedTime: '2 days' },
        ],
      },
      {
        category: 'Aptitude Preparation',
        items: [
          { item: 'Complete quantitative aptitude basics', priority: 'High', estimatedTime: '1 week' },
          { item: 'Practice logical reasoning puzzles', priority: 'Medium', estimatedTime: '5 days' },
          { item: 'Improve verbal ability', priority: 'Low', estimatedTime: '3 days' },
        ],
      },
      {
        category: 'HR Preparation',
        items: [
          { item: 'Prepare "Tell me about yourself" answer', priority: 'High', estimatedTime: '1 hour' },
          { item: 'Prepare STAR method answers for behavioral questions', priority: 'High', estimatedTime: '3 hours' },
          { item: `Research ${companyName} company values and culture`, priority: 'High', estimatedTime: '2 hours' },
          { item: 'Prepare questions to ask the interviewer', priority: 'Medium', estimatedTime: '1 hour' },
        ],
      },
      {
        category: 'Coding Practice',
        items: [
          { item: 'Arrays & Strings - 20 problems', priority: 'High', estimatedTime: '3 days' },
          { item: 'Trees & Graphs - 15 problems', priority: 'High', estimatedTime: '4 days' },
          { item: 'Dynamic Programming - 15 problems', priority: 'Medium', estimatedTime: '5 days' },
          { item: 'Linked List operations - 10 problems', priority: 'Medium', estimatedTime: '2 days' },
        ],
      },
      {
        category: 'Company Research',
        items: [
          { item: `Visit ${companyName} careers page`, priority: 'High', estimatedTime: '30 min' },
          { item: 'Read recent interview experiences on GeeksforGeeks', priority: 'High', estimatedTime: '2 hours' },
          { item: 'Check Glassdoor reviews and interview questions', priority: 'Medium', estimatedTime: '1 hour' },
          { item: 'Understand company products and tech stack', priority: 'Medium', estimatedTime: '1 hour' },
        ],
      },
      {
        category: 'Soft Skills',
        items: [
          { item: 'Practice communication skills', priority: 'Medium', estimatedTime: 'Ongoing' },
          { item: 'Prepare project explanations', priority: 'High', estimatedTime: '2 hours' },
          { item: 'Practice mock interviews with friends', priority: 'High', estimatedTime: '1 week' },
        ],
      },
    ],
  };
}

module.exports = {
  initializeAI,
  generateCompanyAnalysis,
  generateMockQuestions,
  generatePreparationRoadmap,
  generateChecklist,
  parseScrapedInsights,
  generateMockExperiences,
};
