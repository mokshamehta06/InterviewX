const Company = require('../models/Company');
const InterviewQuestion = require('../models/InterviewQuestion');
const InterviewExperience = require('../models/InterviewExperience');
const SearchHistory = require('../models/SearchHistory');
const cacheService = require('../services/cacheService');
const aiService = require('../services/aiService');
const scraperService = require('../services/scraperService');
const scrapingService = require('../services/scrapingService');

/**
 * Company Controller
 * Handles company search, listing, and detailed analysis.
 * 
 * KEY FLOW (when user searches for a company):
 * 1. User types company name -> autocomplete suggestions from DB
 * 2. User selects company -> check if exists in DB
 * 3. If exists: return data from DB + cached analysis
 * 4. If NOT exists: Generate via AI, save to DB, return data
 * 5. Log search in SearchHistory for the user
 */

// @desc    List all companies
// @route   GET /api/companies
// @access  Public
exports.getAllCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = '-searchCount' } = req.query;
    
    const companies = await Company.find()
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('name slug logo industry searchCount hiringProcess.overallDifficulty');

    const total = await Company.countDocuments();

    res.json({
      success: true,
      data: {
        companies,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search companies (autocomplete)
// @route   GET /api/companies/search?q=amazon
// @access  Public
exports.searchCompanies = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 1) {
      return res.json({ success: true, data: { companies: [] } });
    }

    // Check cache
    const cacheKey = `search_${q.toLowerCase()}`;
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: { companies: cached } });
    }

    // Search by name (case-insensitive regex)
    const companies = await Company.find({
      name: { $regex: q, $options: 'i' },
    })
      .limit(10)
      .select('name slug logo industry');

    // Cache for 30 minutes
    cacheService.set(cacheKey, companies, cacheService.TTL.POPULAR);

    res.json({
      success: true,
      data: { companies },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular companies
// @route   GET /api/companies/popular
// @access  Public
exports.getPopularCompanies = async (req, res, next) => {
  try {
    const cacheKey = 'popular_companies';
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: { companies: cached } });
    }

    const companies = await Company.find()
      .sort({ searchCount: -1 })
      .limit(12)
      .select('name slug logo industry searchCount hiringProcess.overallDifficulty');

    cacheService.set(cacheKey, companies, cacheService.TTL.POPULAR);

    res.json({
      success: true,
      data: { companies },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company details by slug
// @route   GET /api/companies/:slug
// @access  Private
exports.getCompanyBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    let company = await Company.findOne({ slug });

    if (!company || !company.description) {
      // Company not in DB or is a skeleton - create/update it with AI-generated data
      const companyName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      
      // Scrape combined culture data before parsing with AI to ensure realistic reviews
      let scrapedContext = '';
      try {
        scrapedContext = await scrapingService.aggregateMessyText(companyName).catch(() => '');
      } catch (e) {
        // use empty string if it fails
      }
      
      // Generate analysis using AI, passing in scrapedContext
      const analysis = await aiService.generateCompanyAnalysis(companyName, scrapedContext);
      
      const updateData = {
        name: companyName,
        slug,
        description: analysis.companyOverview,
        hiringProcess: analysis.hiringProcess,
        interviewPattern: analysis.interviewPattern,
        topicsFrequency: analysis.mostAskedTopics,
        preparationTime: analysis.preparationTime,
        salaryRange: analysis.salaryRange ? {
          min: analysis.salaryRange.min,
          max: analysis.salaryRange.max,
          currency: 'LPA',
        } : undefined,
        reviewsAndCulture: analysis.reviewsAndCulture,
        aiAnalysis: JSON.stringify(analysis),
      };

      if (!company) {
        // Create company in database
        company = await Company.create(updateData);
      } else {
        // Update existing skeleton
        company = await Company.findByIdAndUpdate(company._id, updateData, { new: true });
      }

      // Generate Mock Questions
      const mockQuestions = await aiService.generateMockQuestions(companyName, 'Mixed', 'Mixed', 15);
      for (const q of mockQuestions) {
        await InterviewQuestion.create({
          company: company._id,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          answer: q.answer,
          tags: q.tags || [],
          source: 'ai-generated',
        });
      }

      // Generate Mock Experiences for filtering
      const mockExperiences = await aiService.generateMockExperiences(companyName, 8);
      for (const exp of mockExperiences) {
        await InterviewExperience.create({
          company: company._id,
          title: exp.title,
          experience: exp.experience,
          role: exp.role || 'Software Engineer',
          location: exp.location || 'Unknown',
          experienceLevel: exp.experienceLevel || 'Unknown',
          jobType: exp.jobType || 'Unknown',
          result: exp.result || 'Unknown',
          difficulty: exp.difficulty || 'Medium',
          importantTopics: exp.importantTopics || [],
          source: 'ai-generated',
        });
      }
    }

    // Increment search count
    company.searchCount += 1;
    await company.save();

    // Log search history if user is authenticated
    if (req.user) {
      await SearchHistory.create({
        user: req.user.id,
        company: company._id,
        searchQuery: slug,
      });
    }

    // Get questions and experiences for this company
    const questions = await InterviewQuestion.find({ company: company._id })
      .sort({ frequency: -1 });
    const experiences = await InterviewExperience.find({ company: company._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get statistics
    const categoryStats = await InterviewQuestion.getCategoryStats(company._id);
    const difficultyStats = await InterviewQuestion.getDifficultyStats(company._id);

    // Parse AI analysis if available
    let aiAnalysis = null;
    try {
      aiAnalysis = company.aiAnalysis ? JSON.parse(company.aiAnalysis) : null;
    } catch (e) {
      aiAnalysis = null;
    }

    res.json({
      success: true,
      data: {
        company,
        questions,
        experiences,
        stats: {
          categoryStats,
          difficultyStats,
          totalQuestions: questions.length,
          totalExperiences: experiences.length,
        },
        aiAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI analysis for company
// @route   GET /api/companies/:slug/analysis
// @access  Private
exports.getCompanyAnalysis = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const company = await Company.findOne({ slug });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const cacheKey = `analysis_${slug}`;
    let analysis = cacheService.get(cacheKey);

    if (!analysis) {
      analysis = await aiService.generateCompanyAnalysis(company.name);
      cacheService.set(cacheKey, analysis, cacheService.TTL.AI_CONTENT);

      // Store in DB
      company.aiAnalysis = JSON.stringify(analysis);
      await company.save();
    }

    // Get roadmap
    const roadmap = await aiService.generatePreparationRoadmap(company.name);

    // Get checklist
    const checklist = await aiService.generateChecklist(company.name);

    res.json({
      success: true,
      data: {
        analysis,
        roadmap,
        checklist,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a company (Admin)
// @route   POST /api/companies
// @access  Admin
exports.createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: { company },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a company (Admin)
// @route   PUT /api/companies/:id
// @access  Admin
exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Clear related caches
    cacheService.delete(`analysis_${company.slug}`);
    cacheService.delete('popular_companies');

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: { company },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a company (Admin)
// @route   DELETE /api/companies/:id
// @access  Admin
exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Delete associated questions and experiences
    await InterviewQuestion.deleteMany({ company: req.params.id });
    await InterviewExperience.deleteMany({ company: req.params.id });

    res.json({
      success: true,
      message: 'Company and associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
