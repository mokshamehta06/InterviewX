/**
 * mockInterview.js - Mock Interview Page Logic
 */
let mockState = { testId: null, questions: [], currentIndex: 0, answers: [], startTime: null, timerInterval: null };

document.addEventListener('DOMContentLoaded', () => {
  loadCompaniesForMock();
  loadTestHistory();
  document.getElementById('start-mock-btn').addEventListener('click', startMockTest);
  document.getElementById('next-q-btn').addEventListener('click', nextQuestion);
  document.getElementById('prev-q-btn').addEventListener('click', prevQuestion);
  document.getElementById('end-mock-btn').addEventListener('click', endMockTest);
});

async function loadCompaniesForMock() {
  try {
    const res = await API.get('/companies');
    if (res.success) {
      const select = document.getElementById('mock-company');
      res.data.companies.forEach(c => {
        select.innerHTML += `<option value="${c.slug}">${c.name}</option>`;
      });
    }
  } catch (e) { console.log('Could not load companies'); }
}

async function loadTestHistory() {
  try {
    const res = await API.get('/mock-tests/history');
    const container = document.getElementById('test-history');
    if (res.success && res.data.tests.length > 0) {
      container.innerHTML = `<div class="table-container"><table class="data-table">
        <thead><tr><th>Test</th><th>Score</th><th>Time</th><th>Date</th></tr></thead>
        <tbody>${res.data.tests.map(t => `<tr>
          <td>${t.title || 'Mock Test'}</td>
          <td><span class="badge ${t.percentage >= 70 ? 'badge-green' : t.percentage >= 40 ? 'badge-orange' : 'badge-red'}">${t.score}/${t.totalQuestions} (${t.percentage}%)</span></td>
          <td>${formatTime(t.timeTaken || 0)}</td>
          <td>${formatDate(t.createdAt)}</td>
        </tr>`).join('')}</tbody></table></div>`;
    } else {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><h3>No tests taken yet</h3><p>Start your first mock interview!</p></div>';
    }
  } catch (e) { document.getElementById('test-history').innerHTML = '<p class="text-muted">Could not load history</p>'; }
}

async function startMockTest() {
  const btn = document.getElementById('start-mock-btn');
  btn.disabled = true; btn.textContent = '⏳ Generating questions...';
  try {
    const res = await API.post('/mock-tests/generate', {
      companySlug: document.getElementById('mock-company').value,
      category: document.getElementById('mock-category').value,
      difficulty: document.getElementById('mock-difficulty').value,
      count: parseInt(document.getElementById('mock-count').value),
    });
    if (res.success) {
      mockState.testId = res.data.mockTest._id;
      mockState.questions = res.data.mockTest.questions;
      mockState.answers = new Array(mockState.questions.length).fill('');
      mockState.currentIndex = 0;
      mockState.startTime = Date.now();
      document.getElementById('mock-setup').style.display = 'none';
      document.getElementById('mock-active').style.display = 'block';
      document.getElementById('mock-info-badge').textContent = res.data.mockTest.title;
      renderProgress(); renderCurrentQuestion(); startTimer();
      showToast('Mock interview started!', 'success');
    }
  } catch (e) { showToast(e.message || 'Failed to generate test', 'error'); btn.disabled = false; btn.textContent = '🚀 Start Mock Interview'; }
}

function renderProgress() {
  const container = document.getElementById('mock-progress');
  container.innerHTML = mockState.questions.map((_, i) =>
    `<div class="mock-progress-dot ${i < mockState.currentIndex ? 'completed' : i === mockState.currentIndex ? 'current' : ''}"></div>`
  ).join('');
}

function renderCurrentQuestion() {
  const q = mockState.questions[mockState.currentIndex];
  document.getElementById('q-number').textContent = `Question ${mockState.currentIndex + 1} of ${mockState.questions.length}`;
  document.getElementById('q-text').textContent = q.questionText;
  document.getElementById('q-category').textContent = q.category || 'General';
  document.getElementById('q-category').className = 'badge badge-primary';
  document.getElementById('q-difficulty').innerHTML = getDifficultyBadge(q.difficulty || 'Medium').replace('<span', '<span').replace('</span>', '</span>');
  document.getElementById('mock-answer').value = mockState.answers[mockState.currentIndex] || '';
  document.getElementById('prev-q-btn').disabled = mockState.currentIndex === 0;
  document.getElementById('next-q-btn').textContent = mockState.currentIndex === mockState.questions.length - 1 ? 'Submit Test ✓' : 'Next →';
  renderProgress();
}

function nextQuestion() {
  mockState.answers[mockState.currentIndex] = document.getElementById('mock-answer').value;
  if (mockState.currentIndex === mockState.questions.length - 1) { endMockTest(); return; }
  mockState.currentIndex++;
  renderCurrentQuestion();
}

function prevQuestion() {
  mockState.answers[mockState.currentIndex] = document.getElementById('mock-answer').value;
  if (mockState.currentIndex > 0) { mockState.currentIndex--; renderCurrentQuestion(); }
}

function startTimer() {
  const timerEl = document.getElementById('mock-timer');
  mockState.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - mockState.startTime) / 1000);
    timerEl.textContent = formatTime(elapsed);
  }, 1000);
}

async function endMockTest() {
  mockState.answers[mockState.currentIndex] = document.getElementById('mock-answer').value;
  clearInterval(mockState.timerInterval);
  const timeTaken = Math.floor((Date.now() - mockState.startTime) / 1000);
  try {
    const res = await API.post(`/mock-tests/${mockState.testId}/submit`, { answers: mockState.answers, timeTaken });
    document.getElementById('mock-active').style.display = 'none';
    document.getElementById('mock-results').style.display = 'block';
    if (res.success) {
      const r = res.data.result;
      document.getElementById('result-score').textContent = `${r.score}/${r.total}`;
      document.getElementById('result-percentage').textContent = `${r.percentage}%`;
      document.getElementById('result-time').textContent = formatTime(r.timeTaken);
      renderReview(res.data.mockTest.questions);
    }
  } catch (e) { showToast('Error submitting test', 'error'); }
}

function renderReview(questions) {
  const container = document.getElementById('review-questions');
  container.innerHTML = questions.map((q, i) => `
    <div class="question-card">
      <div class="question-text">${i + 1}. ${q.questionText}</div>
      <div class="question-meta mt-8">${getCategoryBadge(q.category)} ${getDifficultyBadge(q.difficulty)}</div>
      <div style="margin-top: 8px; font-size: 0.85rem;"><strong>Your Answer:</strong> ${q.userAnswer || '<em class="text-muted">No answer</em>'}</div>
      ${q.correctAnswer ? `<div class="question-answer show" style="display:block;"><strong>Model Answer:</strong> ${q.correctAnswer}</div>` : ''}
    </div>
  `).join('');
}
