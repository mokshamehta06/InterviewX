/**
 * saved.js - Saved Questions & Bookmarks Page Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  loadSavedQuestions();
  loadBookmarks();
  document.getElementById('filter-status')?.addEventListener('change', loadSavedQuestions);
});

async function loadSavedQuestions() {
  const container = document.getElementById('saved-questions-list');
  const status = document.getElementById('filter-status')?.value;
  try {
    const endpoint = status ? `/bookmarks/saved-questions?status=${status}` : '/bookmarks/saved-questions';
    const res = await API.get(endpoint);
    if (res.success && res.data.savedQuestions.length > 0) {
      container.innerHTML = res.data.savedQuestions.map(sq => {
        const q = sq.question;
        if (!q) return '';
        return `<div class="question-card">
          <div class="question-header">
            <div class="question-text">${q.question}</div>
            <select class="form-select" style="width:auto;min-width:120px;font-size:0.8rem;" onchange="updateStatus('${sq._id}', this.value)">
              <option value="unsolved" ${sq.status==='unsolved'?'selected':''}>⬜ Unsolved</option>
              <option value="attempted" ${sq.status==='attempted'?'selected':''}>🟡 Attempted</option>
              <option value="solved" ${sq.status==='solved'?'selected':''}>✅ Solved</option>
            </select>
          </div>
          <div class="question-meta mt-8">
            ${getCategoryBadge(q.category)} ${getDifficultyBadge(q.difficulty)}
            ${q.company ? `<span class="badge badge-cyan">${q.company.name}</span>` : ''}
          </div>
          <div class="question-actions">
            <button class="btn btn-danger btn-sm" onclick="removeSaved('${sq._id}')">🗑️ Remove</button>
          </div>
        </div>`;
      }).join('');
    } else {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💾</div><h3>No saved questions</h3><p>Save questions from company analysis pages</p><a href="/pages/search.html" class="btn btn-primary btn-sm mt-16">Search Companies</a></div>';
    }
  } catch (e) { container.innerHTML = '<p class="text-muted">Could not load saved questions</p>'; }
}

async function updateStatus(id, status) {
  try {
    await API.put(`/bookmarks/saved-questions/${id}`, { status });
    showToast('Status updated!', 'success');
  } catch (e) { showToast('Failed to update', 'error'); }
}

async function removeSaved(id) {
  try {
    await API.delete(`/bookmarks/saved-questions/${id}`);
    showToast('Removed!', 'success');
    loadSavedQuestions();
  } catch (e) { showToast('Failed to remove', 'error'); }
}

async function loadBookmarks() {
  const container = document.getElementById('bookmarks-list');
  try {
    const res = await API.get('/bookmarks');
    if (res.success && res.data.bookmarks.length > 0) {
      container.innerHTML = res.data.bookmarks.map(b => `
        <div class="question-card">
          <div class="flex justify-between items-center">
            <div><span class="badge badge-primary">${b.type}</span> <span class="text-sm text-muted ml-8">${formatDate(b.createdAt)}</span></div>
            <button class="btn btn-danger btn-sm" onclick="removeBookmark('${b._id}')">🗑️</button>
          </div>
          ${b.notes ? `<p class="text-sm mt-8">${b.notes}</p>` : ''}
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔖</div><h3>No bookmarks</h3><p>Bookmark companies and questions</p></div>';
    }
  } catch (e) { container.innerHTML = '<p class="text-muted">Could not load bookmarks</p>'; }
}

async function removeBookmark(id) {
  try { await API.delete(`/bookmarks/${id}`); showToast('Bookmark removed', 'success'); loadBookmarks(); }
  catch (e) { showToast('Failed to remove', 'error'); }
}
