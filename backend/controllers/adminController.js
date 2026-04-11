const User = require('../models/User');
const Company = require('../models/Company');
const InterviewQuestion = require('../models/InterviewQuestion');
const InterviewExperience = require('../models/InterviewExperience');
const SearchHistory = require('../models/SearchHistory');
const MockTest = require('../models/MockTest');
const cacheService = require('../services/cacheService');

/**
 * Admin Controller
 * Handles admin-only operations: user management, analytics, data management.
 */

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
exports.getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCompanies,
      totalQuestions,
      totalExperiences,
      totalMockTests,
      recentUsers,
      popularCompanies,
      cacheStats,
    ] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      InterviewQuestion.countDocuments(),
      InterviewExperience.countDocuments(),
      MockTest.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Company.find().sort({ searchCount: -1 }).limit(5).select('name searchCount'),
      Promise.resolve(cacheService.getStats()),
    ]);

    // Get daily search trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const searchTrend = await SearchHistory.aggregate([
      { $match: { searchedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$searchedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalCompanies,
          totalQuestions,
          totalExperiences,
          totalMockTests,
        },
        recentUsers,
        popularCompanies,
        searchTrend,
        cacheStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all users
// @route   GET /api/admin/users
// @access  Admin
exports.listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('name email role createdAt');

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin".',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('name email role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed company data manually
// @route   POST /api/admin/seed-company
// @access  Admin
exports.seedCompany = async (req, res, next) => {
  try {
    const { name, description, industry, hiringProcess, questions } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required',
      });
    }

    let company = await Company.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (!company) {
      company = await Company.create({
        name,
        description: description || '',
        industry: industry || 'Information Technology',
        hiringProcess: hiringProcess || {},
      });
    }

    // Add questions if provided
    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        await InterviewQuestion.create({
          company: company._id,
          question: q.question,
          category: q.category || 'Technical',
          difficulty: q.difficulty || 'Medium',
          answer: q.answer || '',
          source: 'manual',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Company data seeded successfully',
      data: { company },
    });
  } catch (error) {
    next(error);
  }
};
