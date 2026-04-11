/**
 * dashboard.js - Dashboard Page Logic
 * Fetches and displays user statistics, recent searches, and popular companies.
 */

document.addEventListener('DOMContentLoaded', loadDashboard);

async function loadDashboard() {
  try {
    // Fetch dashboard stats
    const response = await API.get('/dashboard/stats');
    
    if (response.success) {
      const { stats, recentSearches, recentMockTests } = response.data;

      // Update stat cards
      document.getElementById('stat-searches').textContent = stats.uniqueCompanies || 0;
      document.getElementById('stat-saved').textContent = stats.savedQuestions || 0;
      document.getElementById('stat-mocks').textContent = stats.mockTestsTaken || 0;
      document.getElementById('stat-solved').textContent = stats.solvedQuestions || 0;

      // Render recent searches
      renderRecentSearches(recentSearches);
    }
  } catch (error) {
    console.error('Dashboard load error:', error);
    document.getElementById('recent-searches-list').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No searches yet</h3>
        <p>Start by searching for a company</p>
        <a href="/pages/search.html" class="btn btn-primary btn-sm">Search Companies</a>
      </div>
    `;
  }

  // Load popular companies
  loadPopularCompanies();
}

function renderRecentSearches(searches) {
  const container = document.getElementById('recent-searches-list');
  
  if (!searches || searches.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No recent searches</h3>
        <p>Search for a company to get started</p>
      </div>
    `;
    return;
  }

  container.innerHTML = searches.map(s => {
    if (!s.company) return '';
    return `
      <a href="/pages/analysis.html?company=${s.company.slug}" 
         class="search-item" style="text-decoration: none;">
        <div class="search-item-icon">${s.company.name.substring(0, 2).toUpperCase()}</div>
        <div class="search-item-info">
          <div class="search-item-name">${s.company.name}</div>
          <div class="search-item-meta">${formatRelativeTime(s.searchedAt)}</div>
        </div>
      </a>
    `;
  }).join('');
}

async function loadPopularCompanies() {
  try {
    const response = await API.get('/companies/popular');
    
    if (response.success && response.data.companies) {
      const grid = document.getElementById('popular-companies-grid');
      grid.innerHTML = response.data.companies.map(c => `
        <div class="company-card" onclick="window.location.href='/pages/analysis.html?company=${c.slug}'">
          <div class="company-logo">${c.name.substring(0, 2).toUpperCase()}</div>
          <div class="company-name">${c.name}</div>
          <div class="company-industry">${c.industry || 'IT Services'}</div>
          ${c.hiringProcess?.overallDifficulty ? 
            `<span class="company-difficulty difficulty-${c.hiringProcess.overallDifficulty.toLowerCase()}">${c.hiringProcess.overallDifficulty}</span>` : ''}
        </div>
      `).join('');
    }
  } catch (error) {
    const grid = document.getElementById('popular-companies-grid');
    grid.innerHTML = '<p class="text-muted text-center">Could not load companies</p>';
  }
}
