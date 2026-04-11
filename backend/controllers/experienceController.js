const InterviewExperience = require('../models/InterviewExperience');
const aiService = require('../services/aiService');

/**
 * Experience Controller
 * Handles interview experiences CRUD and AI summarization.
 */

// @desc    Get experiences for a company
// @route   GET /api/experiences/company/:companyId
// @access  Private
exports.getExperiencesByCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { result, page = 1, limit = 10 } = req.query;

    const filter = { company: companyId };
    if (result) filter.result = result;

    const experiences = await InterviewExperience.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name')
      .populate('company', 'name slug');

    const total = await InterviewExperience.countDocuments(filter);

    res.json({
      success: true,
      data: {
        experiences,
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

// @desc    Get single experience
// @route   GET /api/experiences/:id
// @access  Private
exports.getExperience = async (req, res, next) => {
  try {
    const experience = await InterviewExperience.findById(req.params.id)
      .populate('user', 'name')
      .populate('company', 'name slug');

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found',
      });
    }

    res.json({
      success: true,
      data: { experience },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add an interview experience
// @route   POST /api/experiences
// @access  Private
exports.addExperience = async (req, res, next) => {
  try {
    const {
      companyId, title, experience, role, result,
      difficulty, rounds, preparationTime, importantTopics, rating,
    } = req.body;

    if (!companyId || !title || !experience) {
      return res.status(400).json({
        success: false,
        message: 'Company, title, and experience are required',
      });
    }

    // Generate AI summary
    let aiSummary = '';
    try {
      aiSummary = await aiService.summarizeExperience(experience);
    } catch (e) {
      console.warn('Failed to generate AI summary:', e.message);
    }

    const newExperience = await InterviewExperience.create({
      company: companyId,
      user: req.user.id,
      title,
      experience,
      role: role || 'Software Engineer',
      result: result || 'Unknown',
      difficulty: difficulty || 'Medium',
      rounds: rounds || [],
      preparationTime: preparationTime || '',
      importantTopics: importantTopics || [],
      rating: rating || 3,
      aiSummary,
      source: 'user-contributed',
    });

    res.status(201).json({
      success: true,
      message: 'Experience added successfully',
      data: { experience: newExperience },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI summary of an experience
// @route   GET /api/experiences/:id/summary
// @access  Private
exports.getExperienceSummary = async (req, res, next) => {
  try {
    const experience = await InterviewExperience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found',
      });
    }

    // If summary already exists, return it
    if (experience.aiSummary) {
      return res.json({
        success: true,
        data: { summary: experience.aiSummary },
      });
    }

    // Generate new summary
    const summary = await aiService.summarizeExperience(experience.experience);
    
    // Save it
    experience.aiSummary = summary;
    await experience.save();

    res.json({
      success: true,
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};
