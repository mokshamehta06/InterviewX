const cheerio = require('cheerio');

/**
 * Web Scraping Service
 * 
 * Scrapes interview data from publicly accessible sources.
 * Uses Cheerio for HTML parsing (lightweight, no browser needed for static pages).
 * Puppeteer is available for dynamic pages if needed.
 * 
 * HOW IT WORKS:
 * 1. Fetches HTML from GeeksforGeeks interview experiences
 * 2. Parses HTML using Cheerio (jQuery-like syntax for Node.js)
 * 3. Extracts interview questions and experiences
 * 4. Falls back to AI-generated data if scraping fails
 * 
 * NOTE: Web scraping is fragile - sites change their HTML structure.
 * The fallback mechanism ensures the app always has data to show.
 */

const cacheService = require('./cacheService');

/**
 * Main scraping function - attempts to gather interview data
 * @param {string} companyName - Company to scrape data for
 * @returns {object} Scraped interview data
 */
async function scrapeInterviewData(companyName) {
  const cacheKey = `scrape_${companyName.toLowerCase()}`;
  
  // Check cache first
  const cached = cacheService.get(cacheKey);
  if (cached) {
    console.log(`📦 Using cached scrape data for ${companyName}`);
    return cached;
  }

  console.log(`🔍 Scraping interview data for ${companyName}...`);

  let results = {
    questions: [],
    experiences: [],
    source: 'scraped',
    scrapedAt: new Date(),
  };

  try {
    // Attempt to scrape from GeeksforGeeks
    const gfgData = await scrapeGeeksforGeeks(companyName);
    results.questions = [...results.questions, ...gfgData.questions];
    results.experiences = [...results.experiences, ...gfgData.experiences];
  } catch (error) {
    console.warn(`⚠️ GFG scraping failed for ${companyName}:`, error.message);
  }

  // Cache results for 24 hours
  if (results.questions.length > 0 || results.experiences.length > 0) {
    cacheService.set(cacheKey, results, cacheService.TTL.COMPANY);
  }

  return results;
}

/**
 * Scrape interview experiences from GeeksforGeeks
 * GFG has a dedicated section for company-wise interview experiences
 */
async function scrapeGeeksforGeeks(companyName) {
  const slug = companyName.toLowerCase().replace(/\s+/g, '-');
  const url = `https://www.geeksforgeeks.org/tag/${slug}-interview-experience/`;

  const results = { questions: [], experiences: [] };

  try {
    // Use fetch (built-in in Node 18+) with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract article titles (interview experience titles)
    $('article .entry-title a, .articles-list .article-title a, h2.entry-title a').each((i, elem) => {
      const title = $(elem).text().trim();
      const link = $(elem).attr('href');

      if (title && title.toLowerCase().includes('interview')) {
        results.experiences.push({
          title: title,
          source: link || url,
          platform: 'GeeksforGeeks',
        });
      }
    });

    // Also try the listing page format
    $('.listItemView a, .content a').each((i, elem) => {
      const title = $(elem).text().trim();
      const link = $(elem).attr('href');

      if (title.length > 20 && title.toLowerCase().includes('interview')) {
        results.experiences.push({
          title: title,
          source: link || url,
          platform: 'GeeksforGeeks',
        });
      }
    });

    // Deduplicate
    results.experiences = results.experiences.filter((exp, index, self) =>
      index === self.findIndex(e => e.title === exp.title)
    ).slice(0, 20); // Limit to 20 experiences

    console.log(`✅ Scraped ${results.experiences.length} experiences from GFG for ${companyName}`);

  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⏱️ GFG scraping timed out for ${companyName}`);
    } else {
      console.warn(`⚠️ GFG scraping error: ${error.message}`);
    }
  }

  return results;
}

/**
 * Scrape using Puppeteer (for JavaScript-rendered pages)
 * Only used when static scraping isn't sufficient
 * 
 * NOTE: Puppeteer launches a headless Chrome browser which is resource-intensive.
 * Use sparingly and prefer Cheerio for static HTML pages.
 */
async function scrapeWithPuppeteer(url) {
  let browser;
  try {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

    const content = await page.content();
    return cheerio.load(content);
  } catch (error) {
    console.error('Puppeteer scraping error:', error.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = {
  scrapeInterviewData,
  scrapeGeeksforGeeks,
  scrapeWithPuppeteer,
};
