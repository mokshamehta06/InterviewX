const InterviewQuestion = require('../models/InterviewQuestion');
const Company = require('../models/Company');

/**
 * Question Controller
 * Handles CRUD operations for interview questions.
 * Questions are categorized, tagged, and linked to companies.
 */

// @desc    Get questions for a company
// @route   GET /api/questions/company/:companyId
// @access  Private
exports.getQuestionsByCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { category, difficulty, page = 1, limit = 50, sort = '-frequency' } = req.query;

    const filter = { company: companyId };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await InterviewQuestion.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('company', 'name slug');

    const total = await InterviewQuestion.countDocuments(filter);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get questions by category for a company
// @route   GET /api/questions/company/:companyId/category/:category
// @access  Private
exports.getQuestionsByCategory = async (req, res, next) => {
  try {
    const { companyId, category } = req.params;

    const questions = await InterviewQuestion.find({
      company: companyId,
      category,
    }).sort({ frequency: -1 });

    res.json({
      success: true,
      data: { questions },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get question statistics for a company
// @route   GET /api/questions/company/:companyId/stats
// @access  Private
exports.getQuestionStats = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const categoryStats = await InterviewQuestion.getCategoryStats(companyId);
    const difficultyStats = await InterviewQuestion.getDifficultyStats(companyId);
    const mostFrequent = await InterviewQuestion.getMostFrequent(companyId, 10);
    const total = await InterviewQuestion.countDocuments({ company: companyId });

    res.json({
      success: true,
      data: {
        total,
        categoryStats,
        difficultyStats,
        mostFrequent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new question
// @route   POST /api/questions
// @access  Private
exports.addQuestion = async (req, res, next) => {
  try {
    const { companyId, question, category, difficulty, answer, tags, round } = req.body;

    if (!companyId || !question || !category) {
      return res.status(400).json({
        success: false,
        message: 'Company, question text, and category are required',
      });
    }

    const newQuestion = await InterviewQuestion.create({
      company: companyId,
      question,
      category,
      difficulty: difficulty || 'Medium',
      answer: answer || '',
      tags: tags || [],
      round: round || '',
      source: 'user-contributed',
      reportedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: { question: newQuestion },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a question (Admin)
// @route   PUT /api/questions/:id
// @access  Admin
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await InterviewQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: { question },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a question (Admin)
// @route   DELETE /api/questions/:id
// @access  Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await InterviewQuestion.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
