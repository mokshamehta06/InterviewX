const User = require('../models/User');
const Company = require('../models/Company');
const SearchHistory = require('../models/SearchHistory');
const SavedQuestion = require('../models/SavedQuestion');
const MockTest = require('../models/MockTest');
const Bookmark = require('../models/Bookmark');
const InterviewQuestion = require('../models/InterviewQuestion');

/**
 * Dashboard Controller
 * Provides aggregated data for the user dashboard.
 */

// @desc    Get user dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get counts in parallel for performance
    const [
      totalSearches,
      savedQuestionsCount,
      mockTestsCount,
      bookmarksCount,
      recentSearches,
      savedQuestions,
      mockTests,
    ] = await Promise.all([
      SearchHistory.countDocuments({ user: userId }),
      SavedQuestion.countDocuments({ user: userId }),
      MockTest.countDocuments({ user: userId }),
      Bookmark.countDocuments({ user: userId }),
      SearchHistory.find({ user: userId })
        .sort({ searchedAt: -1 })
        .limit(5)
        .populate('company', 'name slug logo'),
      SavedQuestion.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: 'question',
          select: 'question category difficulty',
          populate: { path: 'company', select: 'name' },
        }),
      MockTest.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('company', 'name slug'),
    ]);

    // Calculate progress
    const solvedCount = await SavedQuestion.countDocuments({ user: userId, status: 'solved' });
    const attemptedCount = await SavedQuestion.countDocuments({ user: userId, status: 'attempted' });

    // Get unique companies searched
    const uniqueCompanies = await SearchHistory.distinct('company', { user: userId });

    res.json({
      success: true,
      data: {
        stats: {
          totalSearches,
          uniqueCompanies: uniqueCompanies.length,
          savedQuestions: savedQuestionsCount,
          mockTestsTaken: mockTestsCount,
          bookmarks: bookmarksCount,
          solvedQuestions: solvedCount,
          attemptedQuestions: attemptedCount,
        },
        recentSearches,
        recentSavedQuestions: savedQuestions,
        recentMockTests: mockTests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent searches
// @route   GET /api/dashboard/recent-searches
// @access  Private
exports.getRecentSearches = async (req, res, next) => {
  try {
    const searches = await SearchHistory.find({ user: req.user.id })
      .sort({ searchedAt: -1 })
      .limit(20)
      .populate('company', 'name slug logo industry');

    // Deduplicate by company
    const seen = new Set();
    const uniqueSearches = searches.filter(s => {
      if (!s.company) return false;
      const id = s.company._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice(0, 10);

    res.json({
      success: true,
      data: { searches: uniqueSearches },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get most popular companies (global)
// @route   GET /api/dashboard/popular-companies
// @access  Public
exports.getPopularCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find()
      .sort({ searchCount: -1 })
      .limit(10)
      .select('name slug logo searchCount industry');

    res.json({
      success: true,
      data: { companies },
    });
  } catch (error) {
    next(error);
  }
};
