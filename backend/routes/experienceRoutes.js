const express = require('express');
const router = express.Router();
const {
  getExperiencesByCompany, getExperience,
  addExperience, getExperienceSummary,
} = require('../controllers/experienceController');
const auth = require('../middleware/auth');

router.get('/company/:companyId', auth, getExperiencesByCompany);
router.get('/:id', auth, getExperience);
router.get('/:id/summary', auth, getExperienceSummary);
router.post('/', auth, addExperience);

module.exports = router;
