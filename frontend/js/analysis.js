/**
 * analysis.js - Company Analysis Page Logic
 * 
 * THE CORE PAGE OF THE APPLICATION
 * 
 * When a user navigates to /pages/analysis.html?company=amazon:
 * 1. Extract company slug from URL query params
 * 2. Fetch company data from API (GET /api/companies/:slug)
 * 3. If company doesn't exist in DB, backend auto-creates it with AI
 * 4. Render all tabs: Overview, Questions, Experiences, Roadmap, Analytics
 * 5. Load Chart.js visualizations
 * 6. Support PDF download and bookmarking
 */

let companyData = null;
let analysisData = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const companySlug = params.get('company');

  if (!companySlug) {
    window.location.href = '/pages/search.html';
    return;
  }

  loadCompanyData(companySlug);
  setupDownloadPDF();
  setupBookmark(companySlug);
});

async function loadCompanyData(slug) {
  try {
    // Fetch company data (this triggers AI generation if needed)
    const response = await API.get(`/companies/${slug}`);

    if (!response.success) {
      showToast('Company not found', 'error');
      return;
    }

    companyData = response.data;
    const { company, questions, experiences, stats, aiAnalysis } = companyData;

    // Update page title
    document.title = `${company.name} - InterviewIQ`;
    document.getElementById('page-title').textContent = company.name;

    // Hide loading, show content
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('company-header').style.display = 'flex';
    document.getElementById('analysis-tabs').style.display = 'flex';
    document.getElementById('tab-overview').style.display = 'block';

    // Render company header
    renderCompanyHeader(company);

    // Render tabs
    renderOverview(company, aiAnalysis);
    renderCulture(company.reviewsAndCulture || (aiAnalysis && aiAnalysis.reviewsAndCulture));
    renderQuestions(questions);
    renderExperiences(experiences);
    renderAnalytics(stats, company);

    // Load roadmap asynchronously
    loadRoadmap(slug);

  } catch (error) {
    console.error('Load error:', error);
    document.getElementById('loading-state').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <h3>Error loading company data</h3>
        <p>${error.message}</p>
        <a href="/pages/search.html" class="btn btn-primary btn-sm mt-16">Back to Search</a>
      </div>
    `;
  }
}

function renderCompanyHeader(company) {
  document.getElementById('company-logo').textContent = company.name.substring(0, 2).toUpperCase();
  document.getElementById('company-name').textContent = company.name;
  document.getElementById('company-description').textContent = company.description || 'A leading technology company.';
  document.getElementById('meta-industry').textContent = `🏢 ${company.industry || 'IT'}`;
  document.getElementById('meta-difficulty').textContent = `📊 ${company.hiringProcess?.overallDifficulty || 'Medium'}`;
  document.getElementById('meta-rounds').textContent = `🔄 ${company.hiringProcess?.totalRounds || '?'} Rounds`;
  
  if (company.salaryRange && company.salaryRange.min > 0) {
    document.getElementById('meta-salary').textContent = `💰 ${company.salaryRange.min}-${company.salaryRange.max} ${company.salaryRange.currency || 'LPA'}`;
  }
  document.getElementById('meta-prep-time').textContent = `⏱ ${company.preparationTime || '2-4 weeks'}`;
}

function renderOverview(company, aiAnalysis) {
  const analysis = aiAnalysis || {};
  
  // Hiring Rounds
  const roundsContainer = document.getElementById('rounds-container');
  const rounds = company.hiringProcess?.rounds || analysis.hiringProcess?.rounds || [];
  
  roundsContainer.innerHTML = rounds.map((r, i) => `
    <div class="round-card">
      <div class="round-number">Round ${i + 1}</div>
      <div class="round-name">${r.name}</div>
      <div class="round-description">${r.description}</div>
      ${r.duration ? `<div class="text-xs text-muted mt-8">⏱ Duration: ${r.duration}</div>` : ''}
      ${r.tips ? `<div class="round-tips mt-8">💡 ${r.tips}</div>` : ''}
    </div>
  `).join('') || '<p class="text-muted">No round information available</p>';

  // Tips
  const tipsContainer = document.getElementById('tips-container');
  const tips = analysis.tips || [];
  tipsContainer.innerHTML = tips.length > 0
    ? `<ul style="list-style:none; padding:0;">${tips.map(t => `<li style="padding: 6px 0; font-size: 0.85rem; color: var(--text-secondary);">💡 ${t}</li>`).join('')}</ul>`
    : '<p class="text-muted">Tips will be available after AI analysis</p>';

  // Common Mistakes
  const mistakesContainer = document.getElementById('mistakes-container');
  const mistakes = analysis.commonMistakes || [];
  mistakesContainer.innerHTML = mistakes.length > 0
    ? `<ul style="list-style:none; padding:0;">${mistakes.map(m => `<li style="padding: 6px 0; font-size: 0.85rem; color: var(--text-secondary);">⚠️ ${m}</li>`).join('')}</ul>`
    : '<p class="text-muted">Common mistakes will be shown after analysis</p>';

  // Interview Pattern  
  document.getElementById('pattern-container').innerHTML = `
    <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.7;">
      ${company.interviewPattern || analysis.interviewPattern || 'Interview pattern information will be generated by AI.'}
    </p>
  `;
}

function getRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  return '★'.repeat(fullStars) + (halfStar ? '⯪' : '') + '☆'.repeat(emptyStars) + ` (${rating.toFixed(1)})`;
}

function renderCulture(cultureData) {
  if (!cultureData) {
    document.getElementById('tab-culture').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏢</div>
        <h3>Culture Data Unavailable</h3>
        <p>We're still collecting culture and review metrics for this company.</p>
      </div>
    `;
    return;
  }

  // Sentiment Analysis
  const sent = cultureData.sentimentAnalysis || { overallScore: 0, positive: 0, neutral: 0, negative: 0 };
  document.getElementById('sentiment-score').textContent = sent.overallScore;
  document.getElementById('sentiment-positive').textContent = `${sent.positive}% Positive`;
  document.getElementById('sentiment-neutral').textContent = `${sent.neutral}% Neutral`;
  document.getElementById('sentiment-negative').textContent = `${sent.negative}% Negative`;
  
  document.getElementById('bar-positive').style.width = `${sent.positive}%`;
  document.getElementById('bar-neutral').style.width = `${sent.neutral}%`;
  document.getElementById('bar-negative').style.width = `${sent.negative}%`;

  // Ratings
  const ratings = cultureData.ratingBreakdown || { overall: 0, culture: 0, salary: 0, workLifeBalance: 0 };
  document.getElementById('rating-overall').textContent = getRatingStars(ratings.overall);
  document.getElementById('rating-culture').textContent = getRatingStars(ratings.culture);
  document.getElementById('rating-salary').textContent = getRatingStars(ratings.salary);
  document.getElementById('rating-wlb').textContent = getRatingStars(ratings.workLifeBalance);

  // Text Summaries
  document.getElementById('culture-work').textContent = cultureData.workCulture || "Not available.";
  document.getElementById('culture-growth').textContent = cultureData.growthOpportunities || "Not available.";
  document.getElementById('culture-balance').textContent = cultureData.workLifeBalance || "Not available.";
  document.getElementById('culture-salary').textContent = cultureData.salaryAndBenefits || "Not available.";

  // Lists
  const positive = cultureData.positivePoints || [];
  document.getElementById('culture-positive').innerHTML = positive.length > 0 
    ? positive.map(p => `<li>${p}</li>`).join('') 
    : "<li>No specific positive points collected.</li>";

  const complaints = cultureData.commonComplaints || [];
  document.getElementById('culture-complaints').innerHTML = complaints.length > 0 
    ? complaints.map(c => `<li>${c}</li>`).join('')
    : "<li>No significant complaints collected.</li>";
}

function renderQuestions(questions) {
  const container = document.getElementById('questions-list');
  const categoryFilter = document.getElementById('filter-category');
  const difficultyFilter = document.getElementById('filter-difficulty');

  // Populate category filter
  const categories = [...new Set(questions.map(q => q.category))].sort();
  categoryFilter.innerHTML = '<option value="">All Categories</option>' + 
    categories.map(c => `<option value="${c}">${c}</option>`).join('');

  function renderFilteredQuestions() {
    const cat = categoryFilter.value;
    const diff = difficultyFilter.value;
    
    let filtered = questions;
    if (cat) filtered = filtered.filter(q => q.category === cat);
    if (diff) filtered = filtered.filter(q => q.difficulty === diff);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h3>No questions found</h3>
          <p>Try adjusting the filters</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((q, i) => `
      <div class="question-card">
        <div class="question-header">
          <div class="question-text">${i + 1}. ${q.question}</div>
        </div>
        <div class="question-meta">
          ${getCategoryBadge(q.category)}
          ${getDifficultyBadge(q.difficulty)}
          ${q.frequency > 1 ? `<span class="badge badge-cyan">🔥 Asked ${q.frequency}x</span>` : ''}
        </div>
        ${q.source === 'leetcode' ? `
          <div class="question-actions">
            <a href="${q.answer}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Solve on Leetcode ↗</a>
            <button class="btn btn-ghost btn-sm" onclick="saveQuestion('${q._id}')">💾 Save</button>
          </div>
        ` : q.answer ? `
          <div class="question-actions">
            <button class="btn btn-ghost btn-sm" onclick="toggleAnswer(this)">Show Answer ▼</button>
            <button class="btn btn-ghost btn-sm" onclick="saveQuestion('${q._id}')">💾 Save</button>
          </div>
          <div class="question-answer">${q.answer}</div>
        ` : `
          <div class="question-actions">
            <button class="btn btn-ghost btn-sm" onclick="saveQuestion('${q._id}')">💾 Save</button>
          </div>
        `}
      </div>
    `).join('');
  }

  categoryFilter.addEventListener('change', renderFilteredQuestions);
  difficultyFilter.addEventListener('change', renderFilteredQuestions);
  renderFilteredQuestions();
}

function toggleAnswer(btn) {
  const answer = btn.parentElement.nextElementSibling;
  if (answer.classList.contains('show')) {
    answer.classList.remove('show');
    btn.textContent = 'Show Answer ▼';
  } else {
    answer.classList.add('show');
    btn.textContent = 'Hide Answer ▲';
  }
}

async function saveQuestion(questionId) {
  try {
    await API.post('/bookmarks/saved-questions', { questionId });
    showToast('Question saved!', 'success');
  } catch (error) {
    showToast(error.message || 'Could not save question', 'error');
  }
}

function renderExperiences(experiences) {
  const container = document.getElementById('experiences-list');
  const roleFilter = document.getElementById('filter-exp-role');
  const locFilter = document.getElementById('filter-exp-location');
  const levelFilter = document.getElementById('filter-exp-level');
  const typeFilter = document.getElementById('filter-exp-type');

  if (!experiences || experiences.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📖</div>
        <h3>No experiences yet</h3>
        <p>Interview experiences will appear here</p>
      </div>
    `;
    return;
  }

  // Populate dynamic filters (Role and Location)
  const roles = [...new Set(experiences.map(e => e.role).filter(Boolean))].sort();
  const locations = [...new Set(experiences.map(e => e.location).filter(l => l && l !== 'Unknown'))].sort();

  roleFilter.innerHTML = '<option value="">All Roles</option>' + roles.map(r => `<option value="${r}">${r}</option>`).join('');
  locFilter.innerHTML = '<option value="">All Locations</option>' + locations.map(l => `<option value="${l}">${l}</option>`).join('');

  function renderFilteredExperiences() {
    const rFilter = roleFilter.value;
    const lFilter = locFilter.value;
    const levFilter = levelFilter.value;
    const tFilter = typeFilter.value;

    let filtered = experiences;
    if (rFilter) filtered = filtered.filter(e => e.role === rFilter);
    if (lFilter) filtered = filtered.filter(e => e.location === lFilter);
    if (levFilter) filtered = filtered.filter(e => e.experienceLevel === levFilter);
    if (tFilter) filtered = filtered.filter(e => e.jobType === tFilter);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📖</div>
          <h3>No experiences found</h3>
          <p>Try adjusting the filters</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(exp => `
      <div class="card mb-16">
        <div class="flex justify-between items-center mb-8">
          <h3 style="font-size: 1rem;">${exp.title}</h3>
          <div class="flex gap-8">
            ${getDifficultyBadge(exp.difficulty)}
            <span class="badge ${exp.result === 'Selected' ? 'badge-green' : exp.result === 'Rejected' ? 'badge-red' : 'badge-orange'}">${exp.result}</span>
          </div>
        </div>
        <p class="text-sm text-muted mb-8">
          ${exp.role || 'Software Engineer'} · ${exp.location && exp.location !== 'Unknown' ? exp.location + ' · ' : ''}
          ${exp.experienceLevel && exp.experienceLevel !== 'Unknown' ? exp.experienceLevel + ' · ' : ''}
          ${exp.jobType && exp.jobType !== 'Unknown' ? exp.jobType + ' · ' : ''}
          ${exp.year || '--'}
        </p>
        
        ${exp.aiSummary ? `
          <div class="card" style="background: var(--bg-glass); padding: 16px; margin-bottom: 12px;">
            <div class="text-xs font-bold mb-8" style="color: var(--accent-secondary);">🤖 AI Summary</div>
            <div style="font-size: 0.85rem; white-space: pre-line; color: var(--text-secondary);">${exp.aiSummary}</div>
          </div>
        ` : ''}
        
        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.7;">
          ${exp.experience.length > 300 ? exp.experience.substring(0, 300) + '...' : exp.experience}
        </div>

        ${exp.rounds && exp.rounds.length > 0 ? `
          <div class="mt-16">
            <div class="text-sm font-bold mb-8">Rounds:</div>
            ${exp.rounds.map((r, i) => `
              <div class="round-card" style="margin-bottom: 8px;">
                <div class="round-number">Round ${i + 1}: ${r.name}</div>
                ${r.questions ? `<div style="font-size: 0.8rem; color: var(--text-secondary);">${r.questions.join(' | ')}</div>` : ''}
                ${r.tips ? `<div class="round-tips mt-8">💡 ${r.tips}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${exp.importantTopics && exp.importantTopics.length > 0 ? `
          <div class="mt-8">
            ${exp.importantTopics.map(t => `<span class="badge badge-primary" style="margin: 2px;">${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  roleFilter.addEventListener('change', renderFilteredExperiences);
  locFilter.addEventListener('change', renderFilteredExperiences);
  levelFilter.addEventListener('change', renderFilteredExperiences);
  typeFilter.addEventListener('change', renderFilteredExperiences);
  
  renderFilteredExperiences();
}

async function loadRoadmap(slug) {
  try {
    const response = await API.get(`/companies/${slug}/analysis`);
    
    if (response.success && response.data.roadmap) {
      renderRoadmap(response.data.roadmap);
    }
  } catch (error) {
    document.getElementById('roadmap-container').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🗺️</div>
        <h3>Roadmap unavailable</h3>
        <p>Could not generate preparation roadmap</p>
      </div>
    `;
  }
}

function renderRoadmap(roadmap) {
  const container = document.getElementById('roadmap-container');

  if (!roadmap || !roadmap.roadmap) {
    container.innerHTML = '<p class="text-muted">Roadmap not available</p>';
    return;
  }

  let html = `<h3 class="mb-16">📅 ${roadmap.totalWeeks || 4} Week Preparation Plan</h3>`;

  html += roadmap.roadmap.map(week => `
    <div class="roadmap-week">
      <div class="roadmap-week-header">
        <div class="roadmap-week-number">${week.week}</div>
        <div class="roadmap-week-title">${week.title}</div>
      </div>
      <div class="roadmap-topics">
        ${(week.topics || []).map(t => `<span class="badge badge-primary">${t}</span>`).join('')}
      </div>
      <ul class="roadmap-tasks">
        ${(week.tasks || []).map(t => `<li>${t}</li>`).join('')}
      </ul>
      ${week.practiceProblems ? `<div class="text-xs text-muted mt-8">📝 Practice: ${week.practiceProblems} problems</div>` : ''}
    </div>
  `).join('');

  // Daily schedule
  if (roadmap.dailySchedule) {
    html += `
      <div class="card mt-24">
        <div class="card-title mb-16">📆 Recommended Daily Schedule (${roadmap.dailySchedule.hours || 6} hours)</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${(roadmap.dailySchedule.breakdown || []).map(b => `
            <div class="stat-card" style="flex: 1; min-width: 150px;">
              <div class="stat-content">
                <div class="stat-value" style="font-size: 1.2rem;">${b.hours}h</div>
                <div class="stat-label">${b.activity}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function renderAnalytics(stats, company) {
  if (!stats) return;

  // Category distribution chart
  if (stats.categoryStats && stats.categoryStats.length > 0) {
    createCategoryChart(stats.categoryStats);
  }

  // Difficulty distribution chart
  if (stats.difficultyStats && stats.difficultyStats.length > 0) {
    createDifficultyChart(stats.difficultyStats);
  }

  // Topic frequency chart  
  if (company.topicsFrequency && company.topicsFrequency.length > 0) {
    createTopicsChart(company.topicsFrequency);
    createFrequencyChart(company.topicsFrequency);
  }
}

function setupDownloadPDF() {
  const btn = document.getElementById('download-pdf-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const company = companyData?.company?.name || 'Company';
      downloadAsPDF(`${company} - Interview Analysis - InterviewIQ`);
    });
  }
}

function setupBookmark(slug) {
  const btn = document.getElementById('bookmark-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      try {
        if (companyData?.company?._id) {
          await API.post('/bookmarks', {
            type: 'company',
            referenceId: companyData.company._id,
          });
          showToast('Company bookmarked!', 'success');
          btn.textContent = '✅ Bookmarked';
        }
      } catch (error) {
        showToast(error.message || 'Could not bookmark', 'error');
      }
    });
  }
}
