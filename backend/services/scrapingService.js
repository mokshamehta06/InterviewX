const cheerio = require('cheerio');

/**
 * Searches Reddit for interview experiences using their native JSON endpoint
 * This avoids strictly blocked HTML scraping while returning high-quality user experiences.
 */
async function scrapeReddit(company) {
  try {
    const query = encodeURIComponent(`${company} interview experience`);
    const response = await fetch(`https://www.reddit.com/search.json?q=${query}&sort=relevance&t=year`);
    
    if (!response.ok) {
      console.warn(`Reddit search failed for ${company}: ${response.statusText}`);
      return '';
    }

    const data = await response.json();
    const posts = data?.data?.children || [];

    // Extract the text content from the top 5 relevant posts
    const texts = posts.slice(0, 5).map(post => {
      const p = post.data;
      return `Title: ${p.title}\nBody: ${p.selftext}`;
    });

    return `--- REDDIT EXPERIENCES ---\n${texts.join('\n\n')}`;
  } catch (error) {
    console.error('Scrape Reddit Error:', error.message);
    return '';
  }
}

/**
 * Searches GeeksForGeeks or other generic tech blogs using DuckDuckGo HTML 
 * and Cheerio to extract raw paragraphs.
 */
async function scrapeGeneralWeb(company) {
  try {
    // DuckDuckGo HTML search is often easier to scrape than Google
    const query = encodeURIComponent(`${company} interview experience geeksforgeeks`);
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    if (!response.ok) return '';

    const html = await response.text();
    const $ = cheerio.load(html);
    
    let messyResults = '';
    
    // Extract snippets from DDG search results
    $('.result__snippet').each((i, el) => {
      messyResults += $(el).text() + '\n';
    });

    return `--- WEB SEARCH EXPERIENCES ---\n${messyResults}`;
  } catch (error) {
    console.error('Scrape Web Error:', error.message);
    return '';
  }
}

/**
 * Aggregates text from multiple sources to be fed into the AI
 */
async function aggregateMessyText(company) {
  console.log(`[ScrapingService] Initiating scrape for ${company}`);
  
  // Run scrapers in parallel
  const [redditText, webText, cultureText] = await Promise.all([
    scrapeReddit(company),
    scrapeGeneralWeb(company),
    scrapeCultureAndReviews(company)
  ]);

  const combinedText = `${redditText}\n\n${webText}\n\n${cultureText}`;
  
  if (!combinedText.trim()) {
    throw new Error('No useful data scraped');
  }

  return combinedText;
}

/**
 * Searches explicitly for company culture, salary, and reviews.
 */
async function scrapeCultureAndReviews(company) {
  try {
    const query = encodeURIComponent(`${company} company work culture salary reviews pros cons`);
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    if (!response.ok) return '';

    const html = await response.text();
    const $ = cheerio.load(html);
    
    let messyResults = '';
    $('.result__snippet').each((i, el) => {
      messyResults += $(el).text() + '\n';
    });

    return `--- CULTURE AND REVIEWS ---\n${messyResults}`;
  } catch (error) {
    console.error('Scrape Culture Error:', error.message);
    return '';
  }
}

module.exports = {
  aggregateMessyText,
  scrapeCultureAndReviews
};
