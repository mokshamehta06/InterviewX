/**
 * utils.js - Core Utilities for InterviewIQ Frontend
 * 
 * Contains:
 * - API service (handles all HTTP requests to backend)
 * - Auth helpers (token management)
 * - Toast notifications
 * - PDF export
 * - Date formatting
 * 
 * HOW THE API SERVICE WORKS:
 * 1. All requests go through the API object
 * 2. JWT token is automatically attached to every request
 * 3. If a 401 error occurs, user is redirected to login
 * 4. All responses are parsed as JSON
 */

const API_BASE = '/api';

const API = {
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint (e.g., '/companies/popular')
   * @returns {Promise<object>} Response data
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: this._getHeaders(),
      });
      return await this._handleResponse(response);
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  /**
   * Make a POST request  
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @returns {Promise<object>} Response data
   */
  async post(endpoint, data = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: this._getHeaders(),
        body: JSON.stringify(data),
      });
      return await this._handleResponse(response);
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  /**
   * Make a PUT request
   */
  async put(endpoint, data = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: this._getHeaders(),
        body: JSON.stringify(data),
      });
      return await this._handleResponse(response);
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  /**
   * Make a DELETE request
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: this._getHeaders(),
      });
      return await this._handleResponse(response);
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },

  /**
   * Get request headers with JWT token
   */
  _getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  /**
   * Handle API response
   * - Parse JSON
   * - Check for errors
   * - Redirect to login on 401
   */
  async _handleResponse(response) {
    const data = await response.json();
    
    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
        window.location.href = '/pages/login.html';
      }
      throw new Error(data.message || 'Authentication required');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  },
};

// ========================
// Auth Helpers
// ========================
const Auth = {
  /** Save token and user data after login/register */
  login(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /** Remove token and user data */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/login.html';
  },

  /** Get the current user from localStorage */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  },

  /** Check if user is logged in */
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  /** Check if user is admin */
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  /** Require authentication - redirect to login if not logged in */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/pages/login.html';
      return false;
    }
    return true;
  },

  /** Require admin role */
  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = '/pages/dashboard.html';
      return false;
    }
    return true;
  },
};

// ========================
// Toast Notifications
// ========================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ========================
// Date Formatting
// ========================
function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '--';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

// ========================
// PDF Export (using print)
// ========================
function downloadAsPDF(title) {
  // Simple print-to-PDF approach
  const originalTitle = document.title;
  document.title = title || 'InterviewIQ Report';
  window.print();
  document.title = originalTitle;
}

// ========================
// Difficulty Badge HTML
// ========================
function getDifficultyBadge(difficulty) {
  const classes = {
    'Easy': 'badge-green',
    'Medium': 'badge-orange',
    'Hard': 'badge-red',
  };
  return `<span class="badge ${classes[difficulty] || 'badge-primary'}">${difficulty || '--'}</span>`;
}

function getCategoryBadge(category) {
  return `<span class="badge badge-primary">${category}</span>`;
}

// ========================
// Debounce Helper
// ========================
function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ========================
// Format seconds to MM:SS
// ========================
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
