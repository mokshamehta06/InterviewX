const express = require('express');
const router = express.Router();
const {
  getQuestionsByCompany, getQuestionsByCategory, getQuestionStats,
  addQuestion, updateQuestion, deleteQuestion,
} = require('../controllers/questionController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Protected routes
router.get('/company/:companyId', auth, getQuestionsByCompany);
router.get('/company/:companyId/category/:category', auth, getQuestionsByCategory);
router.get('/company/:companyId/stats', auth, getQuestionStats);
router.post('/', auth, addQuestion);

// Admin routes
router.put('/:id', auth, admin, updateQuestion);
router.delete('/:id', auth, admin, deleteQuestion);

module.exports = router;
