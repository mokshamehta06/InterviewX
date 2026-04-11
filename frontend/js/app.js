/**
 * app.js - Main Application Logic
 * 
 * Handles:
 * - Sidebar navigation rendering
 * - Theme toggle (dark/light mode)
 * - Menu toggle for mobile
 * - Tab switching
 * - Authentication checks on protected pages
 * 
 * This file is loaded on every protected page to set up the app shell.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check auth on protected pages (not landing, login, or register)
  const publicPages = ['index.html', 'login.html', 'register.html'];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (!publicPages.includes(currentPage)) {
    if (!Auth.requireAuth()) return;
  }

  renderSidebar();
  setupThemeToggle();
  setupMenuToggle();
  setupTabs();
});

/**
 * Render the sidebar navigation
 * Highlights the current page's nav link
 */
function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const user = Auth.getUser();
  const currentPath = window.location.pathname;

  const navItems = [
    { href: '/pages/dashboard.html', icon: '📊', label: 'Dashboard', section: 'main' },
    { href: '/pages/search.html', icon: '🔍', label: 'Search Companies', section: 'main' },
    { href: '/pages/mock-interview.html', icon: '📝', label: 'Mock Interview', section: 'practice' },
    { href: '/pages/saved.html', icon: '💾', label: 'Saved Questions', section: 'practice' },
    { href: '/pages/profile.html', icon: '👤', label: 'Profile', section: 'account' },
  ];

  // Add admin link if user is admin
  if (user && user.role === 'admin') {
    navItems.push({ href: '/pages/admin.html', icon: '⚙️', label: 'Admin Panel', section: 'admin' });
  }

  // Group items by section
  const sections = {
    main: 'Navigation',
    practice: 'Practice',
    account: 'Account',
    admin: 'Administration',
  };

  let navHTML = '';
  let currentSection = '';

  navItems.forEach(item => {
    if (item.section !== currentSection) {
      currentSection = item.section;
      navHTML += `<div class="nav-section"><div class="nav-section-title">${sections[item.section]}</div>`;
    }
    const isActive = currentPath.includes(item.href.split('/').pop());
    navHTML += `
      <a href="${item.href}" class="nav-link ${isActive ? 'active' : ''}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `;
  });
  navHTML += '</div>';

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">IQ</div>
      <span class="sidebar-brand">InterviewIQ</span>
    </div>
    <nav class="sidebar-nav">${navHTML}</nav>
    <div class="sidebar-footer">
      <div class="user-profile-mini" onclick="Auth.logout()">
        <div class="user-avatar">${user ? user.name.substring(0, 2).toUpperCase() : '??'}</div>
        <div class="user-info">
          <div class="user-name">${user ? user.name : 'Guest'}</div>
          <div class="user-role">${user ? user.role : '--'} · Logout</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Setup dark/light theme toggle
 * Saves preference to localStorage
 */
function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    toggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';
  }

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    toggle.textContent = next === 'light' ? '☀️' : '🌙';
  });
}

/**
 * Setup mobile menu toggle
 * Shows/hides sidebar on mobile screens
 */
function setupMenuToggle() {
  const toggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && e.target !== toggle) {
        sidebar.classList.remove('open');
      }
    }
  });
}

/**
 * Setup tab switching
 * Used on analysis, saved, admin pages
 */
function setupTabs() {
  document.querySelectorAll('.tabs').forEach(tabContainer => {
    const tabs = tabContainer.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show corresponding content
        const tabId = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
          content.style.display = 'none';
        });

        const targetContent = document.getElementById(`tab-${tabId}`);
        if (targetContent) {
          targetContent.classList.add('active');
          targetContent.style.display = 'block';
        }
      });
    });
  });
}
