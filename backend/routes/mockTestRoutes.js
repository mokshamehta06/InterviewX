const express = require('express');
const router = express.Router();
const {
  generateMockTest, submitMockTest, getTestHistory, getTestById,
} = require('../controllers/mockTestController');
const auth = require('../middleware/auth');

router.post('/generate', auth, generateMockTest);
router.post('/:id/submit', auth, submitMockTest);
router.get('/history', auth, getTestHistory);
router.get('/:id', auth, getTestById);

module.exports = router;
