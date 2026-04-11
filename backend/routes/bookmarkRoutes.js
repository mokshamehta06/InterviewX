const express = require('express');
const router = express.Router();
const {
  getBookmarks, addBookmark, removeBookmark,
  getSavedQuestions, saveQuestion, updateSavedQuestion, deleteSavedQuestion,
} = require('../controllers/bookmarkController');
const auth = require('../middleware/auth');

router.get('/', auth, getBookmarks);
router.post('/', auth, addBookmark);
router.delete('/:id', auth, removeBookmark);

// Saved Questions sub-routes
router.get('/saved-questions', auth, getSavedQuestions);
router.post('/saved-questions', auth, saveQuestion);
router.put('/saved-questions/:id', auth, updateSavedQuestion);
router.delete('/saved-questions/:id', auth, deleteSavedQuestion);

module.exports = router;
