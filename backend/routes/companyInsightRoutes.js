const express = require('express');
const { getCompanyInsights } = require('../controllers/companyInsightController');

const router = express.Router();

router.get('/:company', getCompanyInsights);

module.exports = router;
