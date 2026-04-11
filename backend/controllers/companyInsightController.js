const CompanyInsight = require('../models/CompanyInsight');
const scrapingService = require('../services/scrapingService');
const aiService = require('../services/aiService');

/**
 * @desc    Get dynamic company interview insights (Scrape + AI + Cache)
 * @route   GET /api/company-insights/:company
 * @access  Public
 */
exports.getCompanyInsights = async (req, res, next) => {
  try {
    const { company } = req.params;
    const normalizedCompany = company.toLowerCase().trim();

    // 1. Check Cache in MongoDB
    let insight = await CompanyInsight.findOne({ company: normalizedCompany });

    // 2. Return cached data if valid and fresh (< 30 days old)
    if (insight && !insight.isStale()) {
      return res.status(200).json({
        success: true,
        cached: true,
        company: insight.company,
        summary: insight.summary,
        hiringRounds: insight.hiringRounds,
        experiences: insight.experiences,
      });
    }

    // 3. Otherwise, fetch fresh data via Scraping
    let messyText = '';
    try {
      messyText = await scrapingService.aggregateMessyText(company);
    } catch (scrapeErr) {
      if (insight) {
        // Fallback to stale cache if scrape totally fails
        return res.status(200).json({
          success: true,
          cached: true,
          company: insight.company,
          summary: insight.summary,
          hiringRounds: insight.hiringRounds,
          experiences: insight.experiences,
        });
      }
      return res.status(404).json({ success: false, message: 'Could not find any recent data for this company' });
    }

    // 4. Pass scraped dump to AI to parse into JSON
    let parsedData;
    try {
      parsedData = await aiService.parseScrapedInsights(messyText, company);
    } catch (parseErr) {
      // Fallback: If AI fails (e.g. missing API key), do a simple heuristic split of the Reddit data
      const fallbackExperiences = [];
      if (messyText.includes('--- REDDIT EXPERIENCES ---')) {
        const posts = messyText.split('Title: ').slice(1); // skip the first chunk before Title 1
        posts.forEach(post => {
          const parts = post.split('\nBody: ');
          if (parts.length === 2) {
            fallbackExperiences.push({
              role: parts[0].trim().substring(0, 50),
              year: new Date().getFullYear(),
              difficulty: "Unknown",
              questions: [parts[1].trim().substring(0, 500) + '...'],
              tips: [],
              source: "Reddit (Raw Format)"
            });
          }
        });
      }

      parsedData = {
        summary: { overallDifficulty: "Unknown (AI Parsing Offline)", mostAskedTopics: [], oaPattern: [] },
        hiringRounds: ["Online Assessment", "Technical Check", "HR"],
        experiences: fallbackExperiences.slice(0, 5)
      };
    }

    // 5. Update or Create cache in database
    insight = await CompanyInsight.findOneAndUpdate(
      { company: normalizedCompany },
      {
        company: normalizedCompany,
        summary: parsedData.summary || {},
        hiringRounds: parsedData.hiringRounds || [],
        experiences: parsedData.experiences || [],
        lastScrapedAt: Date.now()
      },
      { new: true, upsert: true }
    );

    // 6. Return response
    return res.status(200).json({
      success: true,
      cached: false,
      company: insight.company,
      summary: insight.summary,
      hiringRounds: insight.hiringRounds,
      experiences: insight.experiences,
    });

  } catch (error) {
    next(error);
  }
};
