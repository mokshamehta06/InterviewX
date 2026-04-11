/**
 * auth.js - Authentication Logic
 * 
 * Handles login and register form submissions.
 * Uses the API service from utils.js
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to dashboard
  if (Auth.isLoggedIn()) {
    window.location.href = '/pages/dashboard.html';
    return;
  }

  setupLoginForm();
  setupRegisterForm();
  setupThemeToggle();

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
});

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    toggle.textContent = next === 'light' ? '☀️' : '🌙';
  });
}

function setupLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    if (!email || !password) {
      showError(errorDiv, 'Please fill in all fields');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Logging in...';

    try {
      const response = await API.post('/auth/login', { email, password });
      
      if (response.success) {
        Auth.login(response.data.token, response.data.user);
        showToast('Login successful! Welcome back.', 'success');
        setTimeout(() => {
          window.location.href = '/pages/dashboard.html';
        }, 500);
      }
    } catch (error) {
      showError(errorDiv, error.message || 'Invalid email or password');
      btn.disabled = false;
      btn.textContent = 'Login';
    }
  });
}

function setupRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const errorDiv = document.getElementById('register-error');
    const btn = document.getElementById('register-btn');

    if (!name || !email || !password || !confirm) {
      showError(errorDiv, 'Please fill in all fields');
      return;
    }

    if (password !== confirm) {
      showError(errorDiv, 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showError(errorDiv, 'Password must be at least 6 characters');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creating Account...';

    try {
      const response = await API.post('/auth/register', { name, email, password });
      
      if (response.success) {
        Auth.login(response.data.token, response.data.user);
        showToast('Account created! Welcome to InterviewIQ.', 'success');
        setTimeout(() => {
          window.location.href = '/pages/dashboard.html';
        }, 500);
      }
    } catch (error) {
      showError(errorDiv, error.message || 'Registration failed');
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
}

function showError(element, message) {
  if (!element) return;
  element.textContent = message;
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}

// Demo credential filler (called from login.html buttons)
function fillDemo(type) {
  if (type === 'admin') {
    document.getElementById('login-email').value = 'admin@interviewiq.com';
    document.getElementById('login-password').value = 'admin123';
  } else {
    document.getElementById('login-email').value = 'student@interviewiq.com';
    document.getElementById('login-password').value = 'student123';
  }
}
