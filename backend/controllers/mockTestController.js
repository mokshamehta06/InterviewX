const MockTest = require('../models/MockTest');
const InterviewQuestion = require('../models/InterviewQuestion');
const Company = require('../models/Company');
const aiService = require('../services/aiService');

/**
 * Mock Test Controller
 * Generates and manages mock interview tests.
 * 
 * HOW MOCK TESTS WORK:
 * 1. User selects company, category, difficulty, and number of questions
 * 2. System pulls questions from DB or generates via AI
 * 3. Questions are presented one at a time with a timer
 * 4. User submits answers -> scores are calculated
 * 5. Results are saved for progress tracking
 */

// @desc    Generate a new mock test
// @route   POST /api/mock-tests/generate
// @access  Private
exports.generateMockTest = async (req, res, next) => {
  try {
    const { companySlug, category = 'Mixed', difficulty = 'Mixed', count = 10 } = req.body;

    let company = null;
    let companyName = 'General';

    if (companySlug) {
      company = await Company.findOne({ slug: companySlug });
      if (company) companyName = company.name;
    }

    // Try to get questions from DB first
    let questions = [];
    if (company) {
      const filter = { company: company._id };
      if (category !== 'Mixed') filter.category = category;
      if (difficulty !== 'Mixed') filter.difficulty = difficulty;

      questions = await InterviewQuestion.aggregate([
        { $match: filter },
        { $sample: { size: parseInt(count) } },
      ]);
    }

    // If not enough questions in DB, generate with AI
    if (questions.length < count) {
      const aiQuestions = await aiService.generateMockQuestions(
        companyName, category, difficulty, count - questions.length
      );
      
      const formattedAI = aiQuestions.map(q => ({
        questionText: q.question,
        category: q.category,
        difficulty: q.difficulty,
        correctAnswer: q.answer || '',
      }));

      const formattedDB = questions.map(q => ({
        questionText: q.question,
        questionId: q._id,
        category: q.category,
        difficulty: q.difficulty,
        correctAnswer: q.answer || '',
      }));

      questions = [...formattedDB, ...formattedAI];
    } else {
      questions = questions.map(q => ({
        questionText: q.question,
        questionId: q._id,
        category: q.category,
        difficulty: q.difficulty,
        correctAnswer: q.answer || '',
      }));
    }

    // Create mock test record
    const mockTest = await MockTest.create({
      user: req.user.id,
      company: company ? company._id : undefined,
      title: `${companyName} - ${category} Mock Interview`,
      questions,
      category,
      difficulty,
      totalQuestions: questions.length,
      timeLimit: questions.length * 180, // 3 minutes per question
    });

    // Don't send correct answers to client during the test
    const testForClient = {
      ...mockTest.toObject(),
      questions: mockTest.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty,
      })),
    };

    res.status(201).json({
      success: true,
      message: 'Mock test generated successfully',
      data: { mockTest: testForClient },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit mock test answers
// @route   POST /api/mock-tests/:id/submit
// @access  Private
exports.submitMockTest = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body;
    
    const mockTest = await MockTest.findById(req.params.id);
    
    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found',
      });
    }

    if (mockTest.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Update answers and calculate score
    let score = 0;
    if (answers && Array.isArray(answers)) {
      mockTest.questions.forEach((q, index) => {
        if (answers[index]) {
          q.userAnswer = answers[index];
          // Simple scoring: if answer is provided, give partial credit
          q.isCorrect = answers[index].trim().length > 10;
          if (q.isCorrect) score++;
        }
      });
    }

    mockTest.score = score;
    mockTest.percentage = Math.round((score / mockTest.totalQuestions) * 100);
    mockTest.timeTaken = timeTaken || 0;
    mockTest.status = 'completed';
    mockTest.completedAt = new Date();

    await mockTest.save();

    res.json({
      success: true,
      message: 'Mock test submitted successfully',
      data: {
        mockTest,
        result: {
          score,
          total: mockTest.totalQuestions,
          percentage: mockTest.percentage,
          timeTaken: mockTest.timeTaken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mock test history
// @route   GET /api/mock-tests/history
// @access  Private
exports.getTestHistory = async (req, res, next) => {
  try {
    const tests = await MockTest.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('company', 'name slug')
      .select('-questions.correctAnswer');

    res.json({
      success: true,
      data: { tests },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific mock test with results
// @route   GET /api/mock-tests/:id
// @access  Private
exports.getTestById = async (req, res, next) => {
  try {
    const test = await MockTest.findById(req.params.id)
      .populate('company', 'name slug');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found',
      });
    }

    if (test.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.json({
      success: true,
      data: { test },
    });
  } catch (error) {
    next(error);
  }
};
