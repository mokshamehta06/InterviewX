/**
 * search.js - Company Search Page Logic
 * 
 * Handles:
 * - Search input with debounced autocomplete
 * - Search dropdown rendering
 * - Recent searches
 * - Popular companies grid
 * - All companies listing
 * - Navigation to analysis page
 */

document.addEventListener('DOMContentLoaded', () => {
  setupSearch();
  loadRecentSearches();
  loadPopularCompanies();
  loadAllCompanies();
});

function setupSearch() {
  const input = document.getElementById('company-search');
  const dropdown = document.getElementById('search-dropdown');
  if (!input || !dropdown) return;

  // Debounced search
  const doSearch = debounce(async (query) => {
    if (query.length < 1) {
      dropdown.classList.remove('active');
      return;
    }

    try {
      const response = await API.get(`/companies/search?q=${encodeURIComponent(query)}`);
      
      if (response.success && response.data.companies.length > 0) {
        dropdown.innerHTML = response.data.companies.map(c => `
          <div class="search-item" onclick="goToCompany('${c.slug}')">
            <div class="search-item-icon">${c.name.substring(0, 2).toUpperCase()}</div>
            <div class="search-item-info">
              <div class="search-item-name">${c.name}</div>
              <div class="search-item-meta">${c.industry || 'IT Services'}</div>
            </div>
          </div>
        `).join('');
        dropdown.classList.add('active');
      } else {
        // Show option to search via AI
        dropdown.innerHTML = `
          <div class="search-item" onclick="goToCompany('${query.toLowerCase().replace(/\\s+/g, '-')}')">
            <div class="search-item-icon">🤖</div>
            <div class="search-item-info">
              <div class="search-item-name">Search "${query}" with AI</div>
              <div class="search-item-meta">Generate analysis using AI</div>
            </div>
          </div>
        `;
        dropdown.classList.add('active');
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, 300);

  input.addEventListener('input', (e) => doSearch(e.target.value.trim()));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = input.value.trim();
      if (query) {
        goToCompany(query.toLowerCase().replace(/\s+/g, '-'));
      }
    }
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      dropdown.classList.remove('active');
    }
  });
}

function goToCompany(slug) {
  window.location.href = `/pages/analysis.html?company=${slug}`;
}

async function loadRecentSearches() {
  try {
    const response = await API.get('/dashboard/recent-searches');
    const container = document.getElementById('recent-searches');
    
    if (response.success && response.data.searches.length > 0) {
      container.innerHTML = response.data.searches.map(s => {
        if (!s.company) return '';
        return `
          <button class="btn btn-secondary btn-sm" onclick="goToCompany('${s.company.slug}')">
            ${s.company.name}
          </button>
        `;
      }).join('');
    } else {
      document.getElementById('recent-section').style.display = 'none';
    }
  } catch (error) {
    document.getElementById('recent-section').style.display = 'none';
  }
}

async function loadPopularCompanies() {
  try {
    const response = await API.get('/companies/popular');
    const grid = document.getElementById('popular-grid');
    
    if (response.success && response.data.companies) {
      grid.innerHTML = response.data.companies.slice(0, 8).map(c => `
        <div class="company-card" onclick="goToCompany('${c.slug}')">
          <div class="company-logo">${c.name.substring(0, 2).toUpperCase()}</div>
          <div class="company-name">${c.name}</div>
          <div class="company-industry">${c.industry || 'IT Services'}</div>
          ${c.hiringProcess?.overallDifficulty ? 
            `<span class="company-difficulty difficulty-${c.hiringProcess.overallDifficulty.toLowerCase()}">${c.hiringProcess.overallDifficulty}</span>` : ''}
        </div>
      `).join('');
    }
  } catch (error) {
    document.getElementById('popular-grid').innerHTML = '<p class="text-muted">Could not load</p>';
  }
}

async function loadAllCompanies() {
  try {
    const response = await API.get('/companies');
    const grid = document.getElementById('all-companies-grid');
    
    if (response.success && response.data.companies) {
      grid.innerHTML = response.data.companies.map(c => `
        <div class="company-card" onclick="goToCompany('${c.slug}')">
          <div class="company-logo">${c.name.substring(0, 2).toUpperCase()}</div>
          <div class="company-name">${c.name}</div>
          <div class="company-industry">${c.industry || 'IT Services'}</div>
          ${c.hiringProcess?.overallDifficulty ? 
            `<span class="company-difficulty difficulty-${c.hiringProcess.overallDifficulty.toLowerCase()}">${c.hiringProcess.overallDifficulty}</span>` : ''}
        </div>
      `).join('');
    }
  } catch (error) {
    document.getElementById('all-companies-grid').innerHTML = '<p class="text-muted">Could not load companies</p>';
  }
}
