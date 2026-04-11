/**
 * admin.js - Admin Dashboard Page Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isAdmin()) { window.location.href = '/pages/dashboard.html'; return; }
  loadAdminData();
  document.getElementById('add-company-form').addEventListener('submit', addCompany);
});

async function loadAdminData() {
  try {
    const res = await API.get('/admin/stats');
    if (res.success) {
      const s = res.data.stats;
      document.getElementById('admin-users').textContent = s.totalUsers;
      document.getElementById('admin-companies').textContent = s.totalCompanies;
      document.getElementById('admin-questions').textContent = s.totalQuestions;
      document.getElementById('admin-experiences').textContent = s.totalExperiences;

      // Users table
      renderUsers(res.data.recentUsers);
      
      // Popular companies
      const pc = document.getElementById('admin-popular-companies');
      pc.innerHTML = (res.data.popularCompanies || []).map(c =>
        `<div class="flex justify-between items-center" style="padding:8px 0;border-bottom:1px solid var(--border);">
          <span>${c.name}</span><span class="badge badge-cyan">${c.searchCount} searches</span>
        </div>`
      ).join('');

      // Search trend chart
      if (res.data.searchTrend?.length) createSearchTrendChart(res.data.searchTrend);
    }
  } catch (e) { showToast('Error loading admin data', 'error'); }
  loadAllUsers();
}

async function loadAllUsers() {
  try {
    const res = await API.get('/admin/users');
    if (res.success) renderUsers(res.data.users);
  } catch (e) { console.log('Could not load users'); }
}

function renderUsers(users) {
  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = users.map(u => `<tr>
    <td>${u.name}</td><td>${u.email}</td>
    <td><span class="badge ${u.role === 'admin' ? 'badge-primary' : 'badge-green'}">${u.role}</span></td>
    <td>${formatDate(u.createdAt)}</td>
    <td>
      <button class="btn btn-ghost btn-sm" onclick="toggleRole('${u._id}', '${u.role === 'admin' ? 'user' : 'admin'}')">
        ${u.role === 'admin' ? '⬇ Demote' : '⬆ Promote'}
      </button>
    </td>
  </tr>`).join('');
}

async function toggleRole(userId, newRole) {
  try {
    await API.put(`/admin/users/${userId}/role`, { role: newRole });
    showToast(`User role updated to ${newRole}`, 'success');
    loadAllUsers();
  } catch (e) { showToast('Failed to update role', 'error'); }
}

async function addCompany(e) {
  e.preventDefault();
  try {
    const res = await API.post('/admin/seed-company', {
      name: document.getElementById('new-company-name').value,
      industry: document.getElementById('new-company-industry').value,
      description: document.getElementById('new-company-desc').value,
    });
    if (res.success) { showToast('Company added!', 'success'); document.getElementById('add-company-form').reset(); loadAdminData(); }
  } catch (e) { showToast(e.message || 'Failed to add company', 'error'); }
}
