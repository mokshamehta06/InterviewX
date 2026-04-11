const Bookmark = require('../models/Bookmark');
const SavedQuestion = require('../models/SavedQuestion');

/**
 * Bookmark Controller
 * Handles saving/bookmarking questions, companies, experiences.
 */

// @desc    Get all bookmarks for user
// @route   GET /api/bookmarks
// @access  Private
exports.getBookmarks = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user.id };
    if (type) filter.type = type;

    const bookmarks = await Bookmark.find(filter)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bookmarks },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a bookmark
// @route   POST /api/bookmarks
// @access  Private
exports.addBookmark = async (req, res, next) => {
  try {
    const { type, referenceId, notes } = req.body;

    if (!type || !referenceId) {
      return res.status(400).json({
        success: false,
        message: 'Type and referenceId are required',
      });
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({
      user: req.user.id,
      type,
      referenceId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already bookmarked',
      });
    }

    const bookmark = await Bookmark.create({
      user: req.user.id,
      type,
      referenceId,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Bookmarked successfully',
      data: { bookmark },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
exports.removeBookmark = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found',
      });
    }

    res.json({
      success: true,
      message: 'Bookmark removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved questions
// @route   GET /api/bookmarks/saved-questions
// @access  Private
exports.getSavedQuestions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;

    const savedQuestions = await SavedQuestion.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: 'question',
        populate: { path: 'company', select: 'name slug' },
      });

    res.json({
      success: true,
      data: { savedQuestions },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a question
// @route   POST /api/bookmarks/saved-questions
// @access  Private
exports.saveQuestion = async (req, res, next) => {
  try {
    const { questionId, notes } = req.body;

    const existing = await SavedQuestion.findOne({
      user: req.user.id,
      question: questionId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Question already saved',
      });
    }

    const saved = await SavedQuestion.create({
      user: req.user.id,
      question: questionId,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Question saved',
      data: { savedQuestion: saved },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update saved question status
// @route   PUT /api/bookmarks/saved-questions/:id
// @access  Private
exports.updateSavedQuestion = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const saved = await SavedQuestion.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status, notes },
      { new: true }
    );

    if (!saved) {
      return res.status(404).json({
        success: false,
        message: 'Saved question not found',
      });
    }

    res.json({
      success: true,
      message: 'Updated successfully',
      data: { savedQuestion: saved },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a saved question
// @route   DELETE /api/bookmarks/saved-questions/:id
// @access  Private
exports.deleteSavedQuestion = async (req, res, next) => {
  try {
    const saved = await SavedQuestion.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!saved) {
      return res.status(404).json({
        success: false,
        message: 'Saved question not found',
      });
    }

    res.json({
      success: true,
      message: 'Saved question removed',
    });
  } catch (error) {
    next(error);
  }
};
