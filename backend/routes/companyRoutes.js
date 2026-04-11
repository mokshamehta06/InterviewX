const express = require('express');
const router = express.Router();
const {
  getAllCompanies, searchCompanies, getPopularCompanies,
  getCompanyBySlug, getCompanyAnalysis,
  createCompany, updateCompany, deleteCompany,
} = require('../controllers/companyController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public routes
router.get('/', getAllCompanies);
router.get('/search', searchCompanies);
router.get('/popular', getPopularCompanies);

// Protected routes
router.get('/:slug', auth, getCompanyBySlug);
router.get('/:slug/analysis', auth, getCompanyAnalysis);

// Admin routes
router.post('/', auth, admin, createCompany);
router.put('/:id', auth, admin, updateCompany);
router.delete('/:id', auth, admin, deleteCompany);

module.exports = router;
