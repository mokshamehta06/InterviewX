/**
 * profile.js - User Profile Page Logic
 */
document.addEventListener('DOMContentLoaded', loadProfile);

async function loadProfile() {
  try {
    const res = await API.get('/auth/me');
    if (res.success) {
      const u = res.data.user;
      document.getElementById('profile-avatar').textContent = u.name.substring(0, 2).toUpperCase();
      document.getElementById('profile-name').textContent = u.name;
      document.getElementById('profile-email').textContent = u.email;
      document.getElementById('profile-role').textContent = u.role;
      document.getElementById('edit-name').value = u.name;
    }
  } catch (e) { showToast('Error loading profile', 'error'); }

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/auth/profile', { name: document.getElementById('edit-name').value });
      if (res.success) {
        const user = Auth.getUser();
        user.name = res.data.user.name;
        localStorage.setItem('user', JSON.stringify(user));
        showToast('Profile updated!', 'success');
        document.getElementById('profile-name').textContent = user.name;
        document.getElementById('profile-avatar').textContent = user.name.substring(0, 2).toUpperCase();
      }
    } catch (e) { showToast(e.message || 'Update failed', 'error'); }
  });

  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/auth/change-password', {
        currentPassword: document.getElementById('current-password').value,
        newPassword: document.getElementById('new-password').value,
      });
      if (res.success) {
        showToast('Password changed!', 'success');
        localStorage.setItem('token', res.data.token);
        document.getElementById('password-form').reset();
      }
    } catch (e) { showToast(e.message || 'Password change failed', 'error'); }
  });
}
