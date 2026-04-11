const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getRecentSearches, getPopularCompanies,
} = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/stats', auth, getDashboardStats);
router.get('/recent-searches', auth, getRecentSearches);
router.get('/popular-companies', getPopularCompanies);

module.exports = router;
