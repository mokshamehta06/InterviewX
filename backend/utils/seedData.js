/**
 * Seed Data Script
 * 
 * Populates the database with realistic dummy data for testing and demo.
 * Run with: node utils/seedData.js
 * 
 * Creates:
 * - 2 users (1 admin, 1 regular)
 * - 10 companies with full hiring process data
 * - 200+ interview questions across all categories
 * - 20+ interview experiences
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Company = require('../models/Company');
const InterviewQuestion = require('../models/InterviewQuestion');
const InterviewExperience = require('../models/InterviewExperience');

async function seedDatabase() {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await InterviewQuestion.deleteMany({});
    await InterviewExperience.deleteMany({});
    // Drop indexes to avoid stale unique index issues
    try { await mongoose.connection.collection('companies').dropIndexes(); } catch(e) {}
    try { await mongoose.connection.collection('users').dropIndexes(); } catch(e) {}
    console.log('🧹 Cleared existing data');

    // =====================
    // 1. Create Users
    // =====================
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@interviewiq.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Test Student',
        email: 'student@interviewiq.com',
        password: 'student123',
        role: 'user',
      },
    ]);
    console.log(`✅ Created ${users.length} users`);
    console.log('   📧 Admin: admin@interviewiq.com / admin123');
    console.log('   📧 Student: student@interviewiq.com / student123');

    // =====================
    // 2. Create Companies
    // =====================
    const companiesData = [
      {
        name: 'TCS',
        slug: 'tcs',
        description: 'Tata Consultancy Services is an Indian multinational IT services and consulting company. Part of the Tata Group, TCS is the largest Indian company by market capitalization and one of the most valuable IT services brands worldwide.',
        industry: 'IT Services & Consulting',
        headquarters: 'Mumbai, India',
        website: 'https://www.tcs.com',
        employeeCount: '600,000+',
        hiringProcess: {
          totalRounds: 3,
          rounds: [
            { name: 'TCS NQT (National Qualifier Test)', description: 'Online test with aptitude, reasoning, programming logic, and coding sections', duration: '180 minutes', tips: 'Focus on quantitative aptitude and basic programming concepts' },
            { name: 'Technical Interview', description: 'Questions on programming, OOPs, DBMS, and project discussion', duration: '30-45 minutes', tips: 'Know C/Java basics, SQL queries, and your projects well' },
            { name: 'HR Interview', description: 'General HR questions, salary discussion, joining date', duration: '15-20 minutes', tips: 'Be confident and research TCS values' },
          ],
          overallDifficulty: 'Easy',
          averageDuration: '3-4 hours',
          eligibilityCriteria: '60% in 10th, 12th, and graduation. No active backlogs.',
        },
        interviewPattern: 'TCS follows NQT-based hiring. The test has 4 sections: Numerical Ability, Verbal Ability, Reasoning Ability, and Programming Logic. Coding section has 1-2 easy problems.',
        topicsFrequency: [
          { topic: 'Aptitude', frequency: 95, category: 'Aptitude' },
          { topic: 'OOPs Concepts', frequency: 85, category: 'OOPs' },
          { topic: 'SQL Queries', frequency: 80, category: 'DBMS' },
          { topic: 'Arrays', frequency: 70, category: 'Coding' },
          { topic: 'Strings', frequency: 65, category: 'Coding' },
        ],
        preparationTime: '2-3 weeks',
        salaryRange: { min: 3.36, max: 7, currency: 'LPA' },
        searchCount: 150,
      },
      {
        name: 'Infosys',
        slug: 'infosys',
        description: 'Infosys Limited is an Indian multinational IT company providing business consulting, information technology, and outsourcing services. Known for InfyTQ platform and strong training program.',
        industry: 'IT Services & Consulting',
        headquarters: 'Bangalore, India',
        website: 'https://www.infosys.com',
        employeeCount: '300,000+',
        hiringProcess: {
          totalRounds: 3,
          rounds: [
            { name: 'Online Assessment', description: 'Quantitative aptitude, logical reasoning, verbal, and coding (HackerRank platform)', duration: '150 minutes', tips: 'Practice on HackerRank and IndiaBix' },
            { name: 'Technical Interview', description: 'CS fundamentals, coding on paper, project discussion', duration: '45 minutes', tips: 'Strong OOPs and DBMS knowledge is must' },
            { name: 'HR Interview', description: 'Behavioral questions and company fit assessment', duration: '20 minutes', tips: 'Know about Infosys foundation and Narayana Murthy' },
          ],
          overallDifficulty: 'Easy',
          averageDuration: '3 hours',
          eligibilityCriteria: '60% throughout, no standing arrears',
        },
        interviewPattern: 'Infosys has a structured campus hiring process. The online test is conducted on HackerRank with MCQs and 2-3 coding problems. InfyTQ certified students get direct interview.',
        topicsFrequency: [
          { topic: 'Quantitative Aptitude', frequency: 90, category: 'Aptitude' },
          { topic: 'OOPs', frequency: 85, category: 'OOPs' },
          { topic: 'DBMS', frequency: 80, category: 'DBMS' },
          { topic: 'Puzzles', frequency: 70, category: 'Puzzle' },
          { topic: 'Pattern Programs', frequency: 65, category: 'Coding' },
        ],
        preparationTime: '2-3 weeks',
        salaryRange: { min: 3.6, max: 8, currency: 'LPA' },
        searchCount: 130,
      },
      {
        name: 'Wipro',
        slug: 'wipro',
        description: 'Wipro Limited is an Indian multinational IT, consulting, and business process services company. Known for strong project-based training and diverse client base.',
        industry: 'IT Services',
        headquarters: 'Bangalore, India',
        website: 'https://www.wipro.com',
        employeeCount: '250,000+',
        hiringProcess: {
          totalRounds: 3,
          rounds: [
            { name: 'Online Test (AMCAT/Wipro)', description: 'Aptitude, logical reasoning, English, and coding (2 problems)', duration: '120 minutes', tips: 'Practice AMCAT-style questions and basic coding' },
            { name: 'Technical Interview', description: 'Core CS subjects, coding, and project discussion', duration: '30-40 minutes', tips: 'Focus on DBMS, OS basics, and simple coding' },
            { name: 'HR Interview', description: 'Standard HR questions and location preferences', duration: '15 minutes', tips: 'Be flexible about location and shifts' },
          ],
          overallDifficulty: 'Easy',
          averageDuration: '2-3 hours',
          eligibilityCriteria: '60% in 10th, 12th, graduation. No active backlogs.',
        },
        interviewPattern: 'Wipro conducts AMCAT-based or proprietary online test. The coding section is relatively easy with 2 problems. Focus on aptitude for qualifying.',
        topicsFrequency: [
          { topic: 'Aptitude', frequency: 90, category: 'Aptitude' },
          { topic: 'DBMS', frequency: 75, category: 'DBMS' },
          { topic: 'Java/C++', frequency: 70, category: 'Technical' },
          { topic: 'Sorting', frequency: 60, category: 'Coding' },
          { topic: 'OS Basics', frequency: 55, category: 'Operating System' },
        ],
        preparationTime: '2 weeks',
        salaryRange: { min: 3.5, max: 6.5, currency: 'LPA' },
        searchCount: 100,
      },
      {
        name: 'Amazon',
        slug: 'amazon',
        description: 'Amazon is a global technology company focused on e-commerce, cloud computing (AWS), AI, and digital streaming. Known for its leadership principles-based interview process.',
        industry: 'E-Commerce & Cloud Computing',
        headquarters: 'Seattle, USA',
        website: 'https://www.amazon.com',
        employeeCount: '1,500,000+',
        hiringProcess: {
          totalRounds: 5,
          rounds: [
            { name: 'Online Assessment', description: '2 coding problems on Amazon\'s platform + work simulation', duration: '120 minutes', tips: 'Practice medium-hard LeetCode problems. Focus on arrays, strings, trees.' },
            { name: 'Phone Screen', description: '1-2 coding problems with an interviewer on shared editor', duration: '60 minutes', tips: 'Think aloud, discuss approach before coding' },
            { name: 'Onsite Round 1 - DSA', description: 'Complex DSA problem with optimal solution expected', duration: '60 minutes', tips: 'Master trees, graphs, dynamic programming' },
            { name: 'Onsite Round 2 - System Design', description: 'Design a scalable system (for SDE-2+)', duration: '60 minutes', tips: 'Study system design fundamentals - load balancing, caching, databases' },
            { name: 'Bar Raiser Round', description: 'Leadership principles + coding/system design', duration: '60 minutes', tips: 'Prepare STAR stories for all 16 leadership principles' },
          ],
          overallDifficulty: 'Hard',
          averageDuration: '5-6 hours',
          eligibilityCriteria: 'Strong DSA skills. 7+ CGPA preferred.',
        },
        interviewPattern: 'Amazon\'s interview is heavily focused on Leadership Principles and DSA. Every answer should relate back to leadership principles. Coding problems are LeetCode medium-hard level.',
        topicsFrequency: [
          { topic: 'Trees & Graphs', frequency: 90, category: 'Data Structures' },
          { topic: 'Dynamic Programming', frequency: 85, category: 'Algorithms' },
          { topic: 'System Design', frequency: 80, category: 'System Design' },
          { topic: 'Arrays & Strings', frequency: 78, category: 'Coding' },
          { topic: 'Leadership Principles', frequency: 95, category: 'Behavioral' },
        ],
        preparationTime: '6-8 weeks',
        salaryRange: { min: 15, max: 45, currency: 'LPA' },
        searchCount: 200,
      },
      {
        name: 'Google',
        slug: 'google',
        description: 'Google is an American multinational technology company focusing on search engine, cloud computing, AI, and software. Known for having one of the most rigorous interview processes.',
        industry: 'Technology',
        headquarters: 'Mountain View, California, USA',
        website: 'https://www.google.com',
        employeeCount: '180,000+',
        hiringProcess: {
          totalRounds: 5,
          rounds: [
            { name: 'Online Assessment', description: '2 coding problems on Google\'s platform', duration: '90 minutes', tips: 'Focus on optimal time and space complexity' },
            { name: 'Phone Interview', description: '1-2 coding problems on Google Doc', duration: '45 minutes', tips: 'Write clean, compilable code. Discuss edge cases.' },
            { name: 'Onsite - Coding 1', description: 'Algorithm design and implementation', duration: '45 minutes', tips: 'Think data structures first. BFS/DFS, DP are common.' },
            { name: 'Onsite - Coding 2', description: 'Another algorithm problem, possibly harder', duration: '45 minutes', tips: 'Practice graph algorithms and advanced DP' },
            { name: 'Onsite - Googleyness', description: 'Behavioral + leadership + culture fit', duration: '45 minutes', tips: 'Show humility, collaboration, and intellectual curiosity' },
          ],
          overallDifficulty: 'Hard',
          averageDuration: '5 hours',
          eligibilityCriteria: 'Exceptional DSA skills, strong CS fundamentals',
        },
        interviewPattern: 'Google emphasizes algorithmic thinking over language-specific knowledge. Problems are unique and rarely repeated. Focus on approach and optimization.',
        topicsFrequency: [
          { topic: 'Graphs', frequency: 90, category: 'Data Structures' },
          { topic: 'Dynamic Programming', frequency: 88, category: 'Algorithms' },
          { topic: 'Trees', frequency: 85, category: 'Data Structures' },
          { topic: 'Strings', frequency: 75, category: 'Coding' },
          { topic: 'System Design', frequency: 70, category: 'System Design' },
        ],
        preparationTime: '8-12 weeks',
        salaryRange: { min: 25, max: 60, currency: 'LPA' },
        searchCount: 180,
      },
      {
        name: 'Microsoft',
        slug: 'microsoft',
        description: 'Microsoft is a global technology company known for Windows, Azure, Office 365, and LinkedIn. Their interview process tests problem-solving, coding, and system design skills.',
        industry: 'Technology',
        headquarters: 'Redmond, Washington, USA',
        website: 'https://www.microsoft.com',
        employeeCount: '220,000+',
        hiringProcess: {
          totalRounds: 4,
          rounds: [
            { name: 'Online Coding Test', description: '3 coding problems of varying difficulty', duration: '90 minutes', tips: 'Focus on clean code and edge cases' },
            { name: 'Technical Round 1', description: 'DSA coding + CS fundamentals', duration: '60 minutes', tips: 'Practice linked lists, trees, and sorting algorithms' },
            { name: 'Technical Round 2', description: 'System design + advanced DSA', duration: '60 minutes', tips: 'Know design patterns and scalable architecture' },
            { name: 'AA Round (As Appropriate)', description: 'Senior manager interview - behavioral + technical mix', duration: '45 minutes', tips: 'Show passion for technology and Microsoft products' },
          ],
          overallDifficulty: 'Hard',
          averageDuration: '4-5 hours',
          eligibilityCriteria: '7+ CGPA, strong programming skills',
        },
        interviewPattern: 'Microsoft looks for strong coders who can write compilable code on whiteboard. Questions are algorithmic with focus on correctness and edge cases.',
        topicsFrequency: [
          { topic: 'Arrays & Strings', frequency: 85, category: 'Coding' },
          { topic: 'Linked Lists', frequency: 80, category: 'Data Structures' },
          { topic: 'Trees', frequency: 78, category: 'Data Structures' },
          { topic: 'Design Patterns', frequency: 65, category: 'System Design' },
          { topic: 'OS Concepts', frequency: 60, category: 'Operating System' },
        ],
        preparationTime: '6-8 weeks',
        salaryRange: { min: 18, max: 50, currency: 'LPA' },
        searchCount: 160,
      },
      {
        name: 'Accenture',
        slug: 'accenture',
        description: 'Accenture is a global professional services company specializing in IT, consulting, and outsourcing. Known for mass recruitment from engineering colleges.',
        industry: 'IT Consulting',
        headquarters: 'Dublin, Ireland',
        website: 'https://www.accenture.com',
        employeeCount: '700,000+',
        hiringProcess: {
          totalRounds: 3,
          rounds: [
            { name: 'Cognitive & Technical Assessment', description: 'English, analytical, logical reasoning, and coding MCQs', duration: '90 minutes', tips: 'Practice English comprehension and basic aptitude' },
            { name: 'Coding Assessment', description: '2 coding problems (easy level)', duration: '45 minutes', tips: 'Know basic patterns, sorting, and string manipulation' },
            { name: 'Communication Assessment', description: 'Video-based communication test', duration: '20 minutes', tips: 'Speak clearly and confidently, practice common topics' },
          ],
          overallDifficulty: 'Easy',
          averageDuration: '2-3 hours',
          eligibilityCriteria: '60% throughout, no backlogs',
        },
        interviewPattern: 'Accenture focuses on communication skills and aptitude. The coding section is relatively easy. No traditional face-to-face interview in most campus drives.',
        topicsFrequency: [
          { topic: 'English & Verbal', frequency: 90, category: 'Aptitude' },
          { topic: 'Analytical Reasoning', frequency: 85, category: 'Aptitude' },
          { topic: 'Basic Coding', frequency: 70, category: 'Coding' },
          { topic: 'Communication', frequency: 95, category: 'HR' },
          { topic: 'Pattern Programs', frequency: 60, category: 'Coding' },
        ],
        preparationTime: '1-2 weeks',
        salaryRange: { min: 4.5, max: 6.5, currency: 'LPA' },
        searchCount: 120,
      },
      {
        name: 'Cognizant',
        slug: 'cognizant',
        description: 'Cognizant Technology Solutions is an American multinational IT services and consulting company. Regular campus recruiter with GenC and GenC Next programs.',
        industry: 'IT Services',
        headquarters: 'Teaneck, New Jersey, USA',
        website: 'https://www.cognizant.com',
        employeeCount: '350,000+',
        hiringProcess: {
          totalRounds: 3,
          rounds: [
            { name: 'Online Assessment (GenC)', description: 'Aptitude, logical reasoning, and coding on AMCAT/Automata Fix', duration: '120 minutes', tips: 'Focus on Automata Fix - debug given code and fix errors' },
            { name: 'Technical Interview', description: 'Basic CS questions, SQL, and coding', duration: '30 minutes', tips: 'Know SQL joins, basic OOPs, and simple programs' },
            { name: 'HR Interview', description: 'Standard behavioral questions', duration: '15 minutes', tips: 'Be clear about why you want to join Cognizant' },
          ],
          overallDifficulty: 'Easy',
          averageDuration: '2-3 hours',
          eligibilityCriteria: '60% throughout',
        },
        interviewPattern: 'Cognizant has two tracks: GenC (standard) and GenC Next (premium). GenC Next has harder coding problems and higher salary. Automata Fix is unique to Cognizant.',
        topicsFrequency: [
          { topic: 'Aptitude', frequency: 85, category: 'Aptitude' },
          { topic: 'Automata Fix (Debugging)', frequency: 80, category: 'Coding' },
          { topic: 'SQL', frequency: 75, category: 'SQL' },
          { topic: 'OOPs', frequency: 70, category: 'OOPs' },
          { topic: 'Java Basics', frequency: 65, category: 'Technical' },
        ],
        preparationTime: '2 weeks',
        salaryRange: { min: 4, max: 7.5, currency: 'LPA' },
        searchCount: 110,
      },
      {
        name: 'Capgemini',
        slug: 'capgemini',
        description: 'Capgemini is a French multinational IT consulting company. Offers multiple roles including Analyst, Associate Consultant, and Senior Analyst through campus drives.',
        industry: 'IT Consulting',
        headquarters: 'Paris, France',
        website: 'https://www.capgemini.com',
        employeeCount: '350,000+',
        hiringProcess: {
          totalRounds: 4,
          rounds: [
            { name: 'Game-Based Assessment', description: 'Behavioral and cognitive games-based testing', duration: '30 minutes', tips: 'Be consistent in your choices, think logically' },
            { name: 'Online Technical Test', description: 'MCQs on programming, pseudo code, and English', duration: '60 minutes', tips: 'Practice pseudo code and basic programming MCQs' },
            { name: 'Coding Round', description: '2 coding problems', duration: '60 minutes', tips: 'Focus on string manipulation and basic algorithms' },
            { name: 'Interview', description: 'Technical + HR combined interview', duration: '30 minutes', tips: 'Know your resume thoroughly' },
          ],
          overallDifficulty: 'Medium',
          averageDuration: '3 hours',
          eligibilityCriteria: '60% throughout, no backlogs',
        },
        interviewPattern: 'Capgemini has a unique game-based assessment followed by technical test. The coding section is moderate difficulty. Pseudo code questions are frequently asked.',
        topicsFrequency: [
          { topic: 'Pseudo Code', frequency: 85, category: 'Technical' },
          { topic: 'Aptitude', frequency: 80, category: 'Aptitude' },
          { topic: 'English', frequency: 75, category: 'Aptitude' },
          { topic: 'Coding', frequency: 70, category: 'Coding' },
          { topic: 'DBMS', frequency: 60, category: 'DBMS' },
        ],
        preparationTime: '2-3 weeks',
        salaryRange: { min: 4, max: 7.5, currency: 'LPA' },
        searchCount: 95,
      },
      {
        name: 'HCL Technologies',
        slug: 'hcl-technologies',
        description: 'HCL Technologies is an Indian multinational IT services and consulting company. Known for its strong engineering culture and diverse technology practices.',
        industry: 'IT Services',
        headquarters: 'Noida, India',
        website: 'https://www.hcltech.com',
        employeeCount: '225,000+',
        hiringProcess: {
          totalRounds: 3,
          rounds: [
            { name: 'Online Test', description: 'Aptitude, verbal, logical, and technical MCQs', duration: '90 minutes', tips: 'Practice general aptitude and basic CS MCQs' },
            { name: 'Technical Interview', description: 'Programming, DBMS, OS, and project discussion', duration: '30-40 minutes', tips: 'Know C/C++ or Java, SQL queries, and OS basics' },
            { name: 'HR Interview', description: 'Behavioral and situational questions', duration: '15-20 minutes', tips: 'Show enthusiasm and willingness to learn' },
          ],
          overallDifficulty: 'Easy',
          averageDuration: '3 hours',
          eligibilityCriteria: '60% throughout, no active backlogs',
        },
        interviewPattern: 'HCL conducts a standard campus drive with online test followed by interviews. Technical rounds are moderate with focus on CS fundamentals.',
        topicsFrequency: [
          { topic: 'C/C++ Basics', frequency: 80, category: 'Technical' },
          { topic: 'Aptitude', frequency: 85, category: 'Aptitude' },
          { topic: 'DBMS', frequency: 70, category: 'DBMS' },
          { topic: 'OS', frequency: 65, category: 'Operating System' },
          { topic: 'Networking', frequency: 55, category: 'Computer Networks' },
        ],
        preparationTime: '2 weeks',
        salaryRange: { min: 3.5, max: 6, currency: 'LPA' },
        searchCount: 80,
      },
    ];

    const companies = await Company.insertMany(companiesData);
    console.log(`✅ Created ${companies.length} companies`);

    // =====================
    // 3. Create Interview Questions
    // =====================
    const questionsData = [];

    // Helper to create questions for a company
    function addQuestions(companyIndex, questions) {
      questions.forEach(q => {
        questionsData.push({
          company: companies[companyIndex]._id,
          ...q,
          source: 'manual',
        });
      });
    }

    // TCS Questions
    addQuestions(0, [
      { question: 'What is the difference between abstract class and interface?', category: 'OOPs', difficulty: 'Easy', frequency: 15, answer: 'Abstract class can have both abstract and concrete methods, interfaces only abstract (before Java 8). Abstract class uses "extends", interface uses "implements". A class can implement multiple interfaces but extend only one class.', tags: ['java', 'oops', 'inheritance'] },
      { question: 'Explain normalization forms (1NF, 2NF, 3NF) with examples.', category: 'DBMS', difficulty: 'Medium', frequency: 12, answer: '1NF: Atomic values, no repeating groups. 2NF: 1NF + no partial dependencies. 3NF: 2NF + no transitive dependencies. BCNF: Every determinant is a candidate key.', tags: ['dbms', 'normalization'] },
      { question: 'Write a program to check if a string is a palindrome.', category: 'Coding', difficulty: 'Easy', frequency: 18, answer: 'Compare string with its reverse. Use two pointers from both ends moving inward. Time: O(n), Space: O(1).', tags: ['string', 'palindrome'] },
      { question: 'What is the difference between process and thread?', category: 'Operating System', difficulty: 'Easy', frequency: 10, answer: 'Process is an independent execution unit with own memory space. Thread is a lightweight process sharing memory with other threads in same process. Context switching is faster for threads.', tags: ['os', 'process', 'thread'] },
      { question: 'What is TCP/IP model? Explain its layers.', category: 'Computer Networks', difficulty: 'Easy', frequency: 8, answer: '4 layers: Application (HTTP, FTP), Transport (TCP, UDP), Internet (IP), Network Access (Ethernet). Simplified version of OSI model.', tags: ['networking', 'tcp-ip'] },
      { question: 'A man travels 40 km at 8 km/h and 30 km at 6 km/h. Find average speed.', category: 'Aptitude', difficulty: 'Easy', frequency: 20, answer: 'Total distance = 70 km. Total time = 40/8 + 30/6 = 5 + 5 = 10 hours. Average speed = 70/10 = 7 km/h.', tags: ['speed', 'time', 'distance'] },
      { question: 'What is the difference between stack and queue?', category: 'Data Structures', difficulty: 'Easy', frequency: 14, answer: 'Stack: LIFO (Last In First Out), push/pop at top. Queue: FIFO (First In First Out), enqueue at rear, dequeue at front.', tags: ['stack', 'queue', 'data structures'] },
      { question: 'Write a SQL query to find the second highest salary from Employees table.', category: 'SQL', difficulty: 'Medium', frequency: 16, answer: 'SELECT MAX(salary) FROM Employees WHERE salary < (SELECT MAX(salary) FROM Employees); Or use DENSE_RANK() window function.', tags: ['sql', 'queries'] },
      { question: 'What are your strengths and weaknesses?', category: 'HR', difficulty: 'Easy', frequency: 25, answer: 'Use STAR method. Strength: mention a relevant technical skill with example. Weakness: genuine but show steps you take to improve.', tags: ['hr', 'behavioral'] },
      { question: 'What is method overloading vs method overriding?', category: 'OOPs', difficulty: 'Easy', frequency: 13, answer: 'Overloading: same method name, different parameters, compile-time polymorphism. Overriding: child class redefines parent method, same signature, runtime polymorphism.', tags: ['oops', 'polymorphism'] },
      { question: 'Explain ACID properties in DBMS.', category: 'DBMS', difficulty: 'Medium', frequency: 11, answer: 'Atomicity: all or nothing. Consistency: valid state transitions. Isolation: concurrent transactions don\'t interfere. Durability: committed data persists even after crash.', tags: ['dbms', 'transactions'] },
      { question: 'Find the output: printf("%d", 5 + 3 * 2)', category: 'Technical', difficulty: 'Easy', frequency: 8, answer: 'Output: 11. Multiplication has higher precedence than addition. 3*2=6, 5+6=11.', tags: ['c', 'operators', 'precedence'] },
      { question: 'Write a program to find factorial of a number using recursion.', category: 'Coding', difficulty: 'Easy', frequency: 15, answer: 'Base case: if n<=1 return 1. Recursive case: return n * factorial(n-1). Time: O(n), Space: O(n) stack.', tags: ['recursion', 'factorial'] },
      { question: 'What is the difference between primary key and unique key?', category: 'DBMS', difficulty: 'Easy', frequency: 9, answer: 'Primary Key: unique + not null, only one per table, creates clustered index. Unique Key: unique but allows one null, multiple per table, creates non-clustered index.', tags: ['dbms', 'keys'] },
      { question: 'If 6 men can complete a work in 12 days, how many days will 9 men take?', category: 'Aptitude', difficulty: 'Easy', frequency: 17, answer: 'Men × Days = constant. 6 × 12 = 9 × D. D = 72/9 = 8 days.', tags: ['aptitude', 'work', 'time'] },
      { question: 'What is virtual function in C++?', category: 'OOPs', difficulty: 'Medium', frequency: 7, answer: 'Member function declared with "virtual" keyword in base class. Allows runtime polymorphism through vTable. Pure virtual function makes class abstract.', tags: ['c++', 'virtual', 'polymorphism'] },
      { question: 'Explain different types of joins in SQL.', category: 'SQL', difficulty: 'Medium', frequency: 14, answer: 'INNER JOIN: matching rows. LEFT JOIN: all left + matching right. RIGHT JOIN: all right + matching left. FULL JOIN: all rows. CROSS JOIN: cartesian product.', tags: ['sql', 'joins'] },
      { question: 'Tell me about yourself.', category: 'HR', difficulty: 'Easy', frequency: 30, answer: 'Structure: Present (current education/role), Past (relevant experience), Future (career goals aligned with company). Keep it 1-2 minutes. Be enthusiastic.', tags: ['hr', 'introduction'] },
      { question: 'What is deadlock? How to prevent it?', category: 'Operating System', difficulty: 'Medium', frequency: 9, answer: 'Deadlock: circular wait where processes hold resources and wait for others. 4 conditions: mutual exclusion, hold & wait, no preemption, circular wait. Prevention: break any one condition.', tags: ['os', 'deadlock'] },
      { question: 'Write a program to reverse a number.', category: 'Coding', difficulty: 'Easy', frequency: 12, answer: 'Extract last digit using modulo, build reversed number by multiplying by 10 and adding digit. Loop until number becomes 0.', tags: ['number', 'reverse', 'basic'] },
    ]);

    // Infosys Questions
    addQuestions(1, [
      { question: 'What is encapsulation? Give a real-world example.', category: 'OOPs', difficulty: 'Easy', frequency: 14, answer: 'Encapsulation: bundling data and methods together, hiding internal state. Example: ATM machine - you interact with buttons (interface) without knowing internal circuitry (implementation). In code: private fields + public getters/setters.', tags: ['oops', 'encapsulation'] },
      { question: 'Write a SQL query to find duplicate records in a table.', category: 'SQL', difficulty: 'Medium', frequency: 12, answer: 'SELECT column, COUNT(*) FROM table GROUP BY column HAVING COUNT(*) > 1;', tags: ['sql', 'duplicates'] },
      { question: 'Implement bubble sort algorithm.', category: 'Algorithms', difficulty: 'Easy', frequency: 10, answer: 'Compare adjacent elements, swap if out of order. Repeat n-1 passes. Time: O(n²), Space: O(1). Optimized: stop if no swaps in a pass.', tags: ['sorting', 'bubble sort'] },
      { question: 'What is the difference between HTTP and HTTPS?', category: 'Computer Networks', difficulty: 'Easy', frequency: 8, answer: 'HTTP: unencrypted, port 80. HTTPS: encrypted with SSL/TLS, port 443. HTTPS prevents man-in-middle attacks and ensures data integrity.', tags: ['networking', 'http', 'security'] },
      { question: 'Explain page replacement algorithms in OS.', category: 'Operating System', difficulty: 'Medium', frequency: 7, answer: 'FIFO: replace oldest page. LRU: replace least recently used. Optimal: replace page not needed for longest time (theoretical). LRU is most practical.', tags: ['os', 'paging', 'memory'] },
      { question: 'A boat goes 24 km upstream in 6 hours and 24 km downstream in 4 hours. Find speed of boat and stream.', category: 'Aptitude', difficulty: 'Medium', frequency: 15, answer: 'Upstream speed = 24/6 = 4 km/h. Downstream speed = 24/4 = 6 km/h. Boat speed = (4+6)/2 = 5 km/h. Stream speed = (6-4)/2 = 1 km/h.', tags: ['boats', 'streams', 'aptitude'] },
      { question: 'What is constructor? Types of constructors.', category: 'OOPs', difficulty: 'Easy', frequency: 11, answer: 'Constructor: special method called during object creation. Types: Default (no args), Parameterized (with args), Copy (creates object from another object). Cannot be virtual, no return type.', tags: ['oops', 'constructor'] },
      { question: 'Write a program to find the largest element in an array.', category: 'Coding', difficulty: 'Easy', frequency: 16, answer: 'Initialize max = arr[0]. Loop through array, update max if current element > max. Time: O(n), Space: O(1).', tags: ['array', 'max'] },
      { question: 'What is the difference between DELETE, TRUNCATE, and DROP?', category: 'DBMS', difficulty: 'Medium', frequency: 10, answer: 'DELETE: DML, removes rows one by one, can use WHERE, can rollback. TRUNCATE: DDL, removes all rows, faster, cannot rollback. DROP: DDL, removes entire table structure.', tags: ['sql', 'ddl', 'dml'] },
      { question: 'Why should we hire you?', category: 'HR', difficulty: 'Easy', frequency: 20, answer: 'Connect your skills to job requirements. Mention specific technical skills, eagerness to learn, and how you can contribute to the team. Give concrete examples.', tags: ['hr', 'behavioral'] },
      { question: 'Print the Fibonacci series up to N terms.', category: 'Coding', difficulty: 'Easy', frequency: 14, answer: 'Start with 0, 1. Each next = sum of previous two. Can use iteration (O(n)) or recursion (O(2^n) without memoization).', tags: ['fibonacci', 'series', 'recursion'] },
      { question: 'What are the types of inheritance?', category: 'OOPs', difficulty: 'Easy', frequency: 12, answer: 'Single, Multiple (C++), Multilevel, Hierarchical, Hybrid. Java doesn\'t support multiple inheritance with classes (uses interfaces instead) to avoid diamond problem.', tags: ['oops', 'inheritance'] },
    ]);

    // Amazon Questions
    addQuestions(3, [
      { question: 'Given an array of integers, find two numbers that add up to a specific target. (Two Sum)', category: 'Coding', difficulty: 'Easy', frequency: 20, answer: 'Use HashMap. For each number, check if (target - number) exists in map. If yes, return both. If no, add current number to map. Time: O(n), Space: O(n).', tags: ['array', 'hashmap', 'two-sum'] },
      { question: 'Design a LRU (Least Recently Used) Cache.', category: 'System Design', difficulty: 'Hard', frequency: 15, answer: 'Use HashMap + Doubly Linked List. HashMap for O(1) lookup, DLL for O(1) insert/delete. On get: move to front. On put: add to front, if full remove from back.', tags: ['cache', 'design', 'lru'] },
      { question: 'Find the lowest common ancestor of two nodes in a binary tree.', category: 'Data Structures', difficulty: 'Medium', frequency: 12, answer: 'Recursive approach: if root is null or matches either node, return root. Recurse left and right. If both return non-null, root is LCA. If one returns null, return the non-null one.', tags: ['tree', 'bst', 'lca'] },
      { question: 'Tell me about a time you had to deal with a difficult customer or stakeholder. (Customer Obsession)', category: 'Behavioral', difficulty: 'Medium', frequency: 18, answer: 'Use STAR method (Situation, Task, Action, Result). Focus on understanding customer needs, going above and beyond, and the positive outcome.', tags: ['leadership principles', 'behavioral'] },
      { question: 'Find the number of islands in a 2D grid. (Number of Islands)', category: 'Coding', difficulty: 'Medium', frequency: 14, answer: 'BFS/DFS approach. Traverse grid, when finding "1", increment count and use DFS/BFS to mark all connected "1"s as visited. Time: O(M×N).', tags: ['graph', 'bfs', 'dfs', 'matrix'] },
      { question: 'Design a URL shortening service like bit.ly.', category: 'System Design', difficulty: 'Hard', frequency: 13, answer: 'Base62 encoding of auto-increment ID. Components: Load Balancer → App Servers → Cache (Redis) → DB. Consider: collision handling, analytics, custom URLs, expiration.', tags: ['system design', 'url shortener'] },
      { question: 'Merge K sorted linked lists.', category: 'Data Structures', difficulty: 'Hard', frequency: 10, answer: 'Use Min-Heap (Priority Queue). Add head of each list to heap. Pop min, add to result, push next node of popped element. Time: O(N log K).', tags: ['linked list', 'heap', 'merge'] },
      { question: 'Implement a function to serialize and deserialize a binary tree.', category: 'Coding', difficulty: 'Hard', frequency: 8, answer: 'Serialize: Pre-order traversal with "null" markers. Deserialize: Rebuild using queue of values, recursively construct left and right subtrees.', tags: ['tree', 'serialization'] },
      { question: 'What is the difference between SQL and NoSQL databases?', category: 'DBMS', difficulty: 'Medium', frequency: 11, answer: 'SQL: structured, relational, ACID, vertical scaling (PostgreSQL, MySQL). NoSQL: flexible schema, horizontal scaling, eventual consistency (MongoDB, DynamoDB). Choose based on data structure and scaling needs.', tags: ['database', 'sql', 'nosql'] },
      { question: 'Describe a time when you had to make a decision without all the information. (Bias for Action)', category: 'Behavioral', difficulty: 'Medium', frequency: 16, answer: 'Emphasize calculated risk-taking, gathering available data, making decision, and course-correcting. Show bias for action over analysis paralysis.', tags: ['leadership principles', 'behavioral'] },
      { question: 'Find the maximum profit from buying and selling stock. (Best Time to Buy and Sell Stock)', category: 'Coding', difficulty: 'Easy', frequency: 17, answer: 'Track minimum price so far and maximum profit. For each price: update min price, calculate current profit, update max profit. One pass, O(n) time, O(1) space.', tags: ['array', 'greedy'] },
      { question: 'Implement a Trie (Prefix Tree) with insert, search, and startsWith.', category: 'Data Structures', difficulty: 'Medium', frequency: 9, answer: 'TrieNode with children map and isEnd flag. Insert: traverse/create nodes for each char. Search: traverse and check isEnd. StartsWith: traverse and return true if path exists.', tags: ['trie', 'prefix tree'] },
    ]);

    // Google Questions
    addQuestions(4, [
      { question: 'Given a string, find the length of the longest substring without repeating characters.', category: 'Coding', difficulty: 'Medium', frequency: 16, answer: 'Sliding window approach with HashSet. Expand right, if duplicate found, shrink left. Track maxLength. Time: O(n), Space: O(min(m,n)).', tags: ['string', 'sliding window'] },
      { question: 'Design Google Search autocomplete system.', category: 'System Design', difficulty: 'Hard', frequency: 12, answer: 'Trie with frequency counts. Top-K suggestions using min-heap at each node. Precompute suggestions for popular prefixes. Cache frequently accessed prefixes.', tags: ['trie', 'system design'] },
      { question: 'Find the median of two sorted arrays in O(log(m+n)) time.', category: 'Algorithms', difficulty: 'Hard', frequency: 10, answer: 'Binary search on smaller array. Partition both arrays such that left elements ≤ right elements. Find correct partition using binary search on the shorter array.', tags: ['binary search', 'arrays'] },
      { question: 'Given a matrix, find the number of paths from top-left to bottom-right (can only move right or down).', category: 'Coding', difficulty: 'Medium', frequency: 14, answer: 'DP approach: dp[i][j] = dp[i-1][j] + dp[i][j-1]. Base case: dp[0][j] = dp[i][0] = 1. Time: O(m×n), Space: O(m×n) or O(n) with optimization.', tags: ['dp', 'matrix', 'paths'] },
      { question: 'Detect a cycle in a directed graph.', category: 'Data Structures', difficulty: 'Medium', frequency: 11, answer: 'DFS with 3 colors: white (unvisited), gray (in-progress), black (completed). If we visit a gray node, cycle exists. Or use Kahn\'s algorithm (BFS topological sort).', tags: ['graph', 'cycle detection', 'dfs'] },
      { question: 'Word Break: Given a string and a dictionary, can the string be segmented into dictionary words?', category: 'Coding', difficulty: 'Medium', frequency: 13, answer: 'DP: dp[i] = true if s[0..i] can be broken into dict words. For each i, check all j < i where dp[j] is true and s[j..i] is in dictionary. Time: O(n²).', tags: ['dp', 'string'] },
    ]);

    // Add questions for other companies (Accenture, Cognizant, etc.)
    addQuestions(6, [ // Accenture
      { question: 'Choose the correctly spelled word: (a) Entrepreneurship (b) Enterpreneurship (c) Entrepeneurship', category: 'Aptitude', difficulty: 'Easy', frequency: 20, answer: '(a) Entrepreneurship is the correct spelling.', tags: ['verbal', 'spelling'] },
      { question: 'If the day before yesterday was Wednesday, what day will it be the day after tomorrow?', category: 'Aptitude', difficulty: 'Easy', frequency: 18, answer: 'Day before yesterday = Wednesday, so today = Friday. Day after tomorrow = Sunday.', tags: ['logical reasoning', 'days'] },
      { question: 'Write a program to print the following pattern for N=4:\n1\n1 2\n1 2 3\n1 2 3 4', category: 'Coding', difficulty: 'Easy', frequency: 15, answer: 'Two nested loops: outer for rows (1 to N), inner for columns (1 to i). Print j in inner loop, newline after outer loop.', tags: ['pattern', 'loops'] },
      { question: 'Describe a situation where you worked as part of a team.', category: 'Behavioral', difficulty: 'Easy', frequency: 22, answer: 'Use STAR method. Describe a college project or hackathon. Focus on your specific contribution, how you collaborated, resolved conflicts, and achieved the goal.', tags: ['teamwork', 'behavioral'] },
      { question: 'What is the output of: int a=5, b=10; printf("%d", a+++b);', category: 'Technical', difficulty: 'Medium', frequency: 10, answer: '15. The expression is parsed as (a++) + b = 5 + 10 = 15. After this, a becomes 6.', tags: ['c', 'operators'] },
    ]);

    addQuestions(7, [ // Cognizant
      { question: 'What is the difference between HashMap and HashTable in Java?', category: 'Technical', difficulty: 'Medium', frequency: 10, answer: 'HashMap: unsynchronized, allows null key/value, faster. HashTable: synchronized (thread-safe), no null key/value, slower. Use ConcurrentHashMap for thread-safe operations.', tags: ['java', 'collections'] },
      { question: 'Find and fix the error:\nint arr[5] = {1,2,3,4,5};\nfor(int i=0; i<=5; i++)\n  printf("%d",arr[i]);', category: 'Coding', difficulty: 'Easy', frequency: 14, answer: 'Bug: i<=5 should be i<5. Array index goes from 0 to 4. Accessing arr[5] is array out of bounds. Fix: change i<=5 to i<5.', tags: ['debugging', 'automata fix', 'array'] },
      { question: 'Write a query to find employees who earn more than their manager.', category: 'SQL', difficulty: 'Medium', frequency: 12, answer: 'SELECT e.name FROM Employee e JOIN Employee m ON e.managerID = m.id WHERE e.salary > m.salary;', tags: ['sql', 'self join'] },
      { question: 'What are the pillars of Object-Oriented Programming?', category: 'OOPs', difficulty: 'Easy', frequency: 16, answer: '4 pillars: Encapsulation (data hiding), Abstraction (hiding complexity), Inheritance (code reuse), Polymorphism (many forms). Remember: A PIE.', tags: ['oops', 'fundamentals'] },
      { question: 'What is your expected salary?', category: 'HR', difficulty: 'Easy', frequency: 20, answer: 'Research the package offered. Say you are flexible and trust the company\'s compensation structure. Don\'t quote a specific number in campus placement.', tags: ['hr', 'salary'] },
    ]);

    // Microsoft Questions
    addQuestions(5, [
      { question: 'Reverse a linked list iteratively and recursively.', category: 'Data Structures', difficulty: 'Medium', frequency: 15, answer: 'Iterative: Use 3 pointers (prev, curr, next). Update links while traversing. Recursive: reverse(head->next), then head->next->next = head, head->next = null. Both O(n) time.', tags: ['linked list', 'reverse'] },
      { question: 'Implement a stack using two queues.', category: 'Data Structures', difficulty: 'Medium', frequency: 10, answer: 'Push: enqueue to q1. Pop: dequeue all from q1 to q2 except last, return last. Then swap q1 and q2. Push: O(1), Pop: O(n).', tags: ['stack', 'queue'] },
      { question: 'Find if a binary tree is a valid BST.', category: 'Data Structures', difficulty: 'Medium', frequency: 12, answer: 'In-order traversal should give sorted sequence. Or recursive approach with min/max bounds: left child must be < current, right must be > current.', tags: ['tree', 'bst', 'validation'] },
      { question: 'Design an elevator system for a building.', category: 'System Design', difficulty: 'Hard', frequency: 8, answer: 'Classes: Elevator, ElevatorController, Request, Button. State patterns for elevator (IDLE, MOVING_UP, MOVING_DOWN). Scheduling algorithms: FCFS, SSTF, SCAN.', tags: ['oop design', 'elevator'] },
      { question: 'What is mutex vs semaphore?', category: 'Operating System', difficulty: 'Medium', frequency: 9, answer: 'Mutex: binary lock, owned by one thread, used for mutual exclusion. Semaphore: counting mechanism, can allow N threads, used for resource counting. Mutex is a special case of semaphore with count=1.', tags: ['os', 'synchronization'] },
    ]);

    await InterviewQuestion.insertMany(questionsData);
    console.log(`✅ Created ${questionsData.length} interview questions`);

    // =====================
    // 4. Create Interview Experiences
    // =====================
    const experiencesData = [
      {
        company: companies[0]._id, // TCS
        user: users[1]._id,
        title: 'TCS NQT Interview Experience - Selected!',
        experience: 'I appeared for TCS NQT in September 2024. The online test had 4 sections. Aptitude was moderate - time management is key. The coding section had 1 easy and 1 medium problem. I solved both. In the technical interview, they asked about OOPs (polymorphism, inheritance), SQL queries (joins, group by), and my project. The HR round was simple - tell me about yourself, why TCS, relocation willingness. Overall a smooth process.',
        role: 'System Engineer',
        result: 'Selected',
        difficulty: 'Easy',
        rounds: [
          { name: 'NQT Online Test', questions: ['Aptitude MCQs', 'Verbal MCQs', 'Programming Logic MCQs', 'Coding - Palindrome Check', 'Coding - Array Sum'], tips: 'Practice IndiaBix and basic coding' },
          { name: 'Technical Interview', questions: ['What is polymorphism?', 'Write a SQL join query', 'Explain your final year project', 'Difference between stack and queue'], tips: 'Know OOPs and SQL thoroughly' },
          { name: 'HR Interview', questions: ['Tell me about yourself', 'Why TCS?', 'Are you willing to relocate?', 'Bond agreement of 2 years - are you okay?'], tips: 'Be polite and show willingness' },
        ],
        preparationTime: '3 weeks',
        importantTopics: ['Aptitude', 'OOPs', 'SQL', 'Basic Coding'],
        rating: 4,
        aiSummary: '• NQT test with 4 sections - focus on aptitude and coding\n• Technical: OOPs + SQL + Project discussion\n• HR: Standard questions about background and willingness\n• Overall difficulty: Easy. Prepare aptitude first.\n• Result: Selected for System Engineer role',
      },
      {
        company: companies[3]._id, // Amazon
        user: users[1]._id,
        title: 'Amazon SDE-1 Interview Experience - Tough but Rewarding',
        experience: 'Amazon\'s interview process was intense. The online assessment had 2 medium-hard coding problems + work simulation. Phone screen asked me to implement LRU Cache. The onsite had 4 rounds - 2 coding (Trees, DP), 1 system design (Design notification service), 1 bar raiser (Leadership Principles heavy). Every behavioral question mapped to their 16 LPs. Prepare STAR stories!',
        role: 'SDE-1',
        result: 'Selected',
        difficulty: 'Hard',
        rounds: [
          { name: 'Online Assessment', questions: ['Find all anagrams in a string', 'Minimum cost to connect ropes', 'Work simulation - prioritization'], tips: 'Practice LeetCode medium-hard. Time management crucial.' },
          { name: 'Phone Screen', questions: ['Design and implement LRU Cache', 'Time and space complexity analysis'], tips: 'Know HashMap + Doubly Linked List implementation cold' },
          { name: 'Onsite - Coding', questions: ['Lowest Common Ancestor in Binary Tree', 'Longest Increasing Subsequence', 'Number of Islands'], tips: 'Think aloud, discuss approach before coding' },
          { name: 'Bar Raiser', questions: ['Tell me about a time you disagreed with a decision (Have Backbone)', 'How do you prioritize when you have competing deadlines (Deliver Results)', 'Describe a time you took on something outside your area of expertise (Learn and Be Curious)'], tips: 'Prepare 2-3 STAR stories for each Leadership Principle' },
        ],
        preparationTime: '8 weeks',
        importantTopics: ['Trees', 'Graphs', 'Dynamic Programming', 'System Design', 'Leadership Principles'],
        rating: 4,
        aiSummary: '• Online Assessment: 2 coding problems + work simulation\n• Phone Screen: LRU Cache design and implementation\n• Onsite: Tree/Graph problems + System Design + Bar Raiser\n• LP (Leadership Principles) questions in EVERY round\n• Difficulty: Hard. Need 6-8 weeks preparation\n• Result: Selected',
      },
      {
        company: companies[1]._id, // Infosys
        user: users[1]._id,
        title: 'Infosys Power Programmer Interview Experience',
        experience: 'Infosys has two tracks - Specialist Programmer (SP) and Power Programmer (PP). I went for PP which has harder coding. Online test on HackerRank with 3 coding problems - medium difficulty. Technical interview covered DSA, DBMS, and OOPs in depth. They asked me to write a binary search on whiteboard. HR was straightforward.',
        role: 'Power Programmer',
        result: 'Selected',
        difficulty: 'Medium',
        rounds: [
          { name: 'Online Test (HackerRank)', questions: ['Find missing number in array', 'String compression', 'Matrix rotation'], tips: 'Practice HackerRank contests' },
          { name: 'Technical Interview', questions: ['Implement binary search', 'Explain normalization with example', 'What is garbage collection in Java?', 'Explain your projects'], tips: 'Strong on DSA and Java fundamentals' },
          { name: 'HR Interview', questions: ['Tell about yourself', 'Why Infosys?', 'Preferred location?'], tips: 'Quick and confident answers' },
        ],
        preparationTime: '3 weeks',
        importantTopics: ['DSA', 'Java', 'DBMS', 'OOPs'],
        rating: 4,
        aiSummary: '• Two tracks: SP and PP (Power Programmer)\n• Coding test on HackerRank - 3 medium problems\n• Technical: DSA + DBMS + OOPs + whiteboard coding\n• HR: Standard questions\n• Difficulty: Medium. Good DSA is important for PP.',
      },
      {
        company: companies[4]._id, // Google
        user: users[1]._id,
        title: 'Google SWE Interview Experience - Learning Experience',
        experience: 'Google\'s process was the toughest I\'ve experienced. Phone screen with a graph problem I\'d never seen before. Onsite had 4 technical rounds + 1 Googleyness. They care about approach more than perfect solution. The interviewers were supportive and gave hints when I was stuck. I didn\'t make it but learned a lot about algorithm design.',
        role: 'Software Engineer L3',
        result: 'Rejected',
        difficulty: 'Hard',
        rounds: [
          { name: 'Phone Screen', questions: ['Find shortest path in a weighted graph with constraints'], tips: 'Modified Dijkstra, think about edge cases' },
          { name: 'Onsite Coding 1', questions: ['Design a data structure for autocomplete suggestions with rankings'], tips: 'Think Trie + Priority Queue' },
          { name: 'Onsite Coding 2', questions: ['Given intervals, find minimum meeting rooms required'], tips: 'Sort + Min Heap approach' },
          { name: 'Googleyness', questions: ['Tell about a time you helped a teammate', 'How do you handle ambiguity?', 'Disagreement with a approach?'], tips: 'Show humility and team collaboration' },
        ],
        preparationTime: '12 weeks',
        importantTopics: ['Graphs', 'Trees', 'Dynamic Programming', 'System Design', 'Algorithm Optimization'],
        rating: 5,
        aiSummary: '• Extremely challenging - unique problems, not standard LeetCode\n• Phone Screen: Graph algorithm with constraints\n• Onsite: Trie design, interval scheduling, algorithm optimization\n• Googleyness round: cultural fit and collaboration\n• Difficulty: Very Hard. Minimum 3 months preparation needed.',
      },
    ];

    const experiences = await InterviewExperience.insertMany(experiencesData);
    console.log(`✅ Created ${experiences.length} interview experiences`);

    // =====================
    // Summary
    // =====================
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary:`);
    console.log(`   Users:        ${users.length}`);
    console.log(`   Companies:    ${companies.length}`);
    console.log(`   Questions:    ${questionsData.length}`);
    console.log(`   Experiences:  ${experiences.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📧 Login Credentials:');
    console.log('   Admin:   admin@interviewiq.com / admin123');
    console.log('   Student: student@interviewiq.com / student123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedDatabase();
