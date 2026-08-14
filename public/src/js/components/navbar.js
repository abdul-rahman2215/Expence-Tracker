/**
 * Top Navbar Component
 * Renders header bar with user profile, theme toggle, fast "+ Add Expense" button,
 * and mobile Floating Action Button (FAB) for touch screens.
 */

import { storageUtil } from '../utils/storage.js';

export function renderNavbar({ title = 'Dashboard', onAddExpenseClick, onAddIncomeClick } = {}) {
  const navbarEl = document.getElementById('app-navbar');
  if (!navbarEl) return;

  const currentTheme = storageUtil.getTheme();

  navbarEl.className = 'top-navbar';
  navbarEl.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <button id="btn-mobile-sidebar-toggle" class="btn btn-secondary btn-sm" aria-label="Toggle Navigation Menu">
        ☰
      </button>
      <h2 style="font-size: 1.25rem; font-weight: 700;">${title}</h2>
    </div>
    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <button id="btn-theme-toggle" class="btn btn-secondary btn-sm" title="Toggle Light/Dark Theme">
        ${currentTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>
      <button id="nav-btn-add-income" class="btn-bubble btn-bubble-income">
        + Add Income
      </button>
      <button id="nav-btn-add-expense" class="btn-bubble">
        + Add Expense
      </button>
    </div>
  `;

  // Render Mobile Floating Action Button (FAB) for fast single-thumb entry on touchscreens
  let fabBtn = document.getElementById('mobile-fab-add-expense');
  if (!fabBtn) {
    fabBtn = document.createElement('button');
    fabBtn.id = 'mobile-fab-add-expense';
    fabBtn.className = 'mobile-fab-add';
    fabBtn.setAttribute('aria-label', 'Add Expense');
    fabBtn.innerHTML = '+';
    document.body.appendChild(fabBtn);
  }

  fabBtn.onclick = () => {
    if (typeof onAddExpenseClick === 'function') {
      onAddExpenseClick();
    }
  };

  // Render Mobile Bottom App Navigation Bar
  let bottomNav = document.getElementById('app-mobile-bottom-nav');
  if (!bottomNav) {
    bottomNav = document.createElement('nav');
    bottomNav.id = 'app-mobile-bottom-nav';
    bottomNav.className = 'mobile-bottom-nav';
    
    const pathname = window.location.pathname;
    const isDash = pathname.includes('dashboard');
    const isTx = pathname.includes('transactions');
    const isBudget = pathname.includes('budget');
    const isSettings = pathname.includes('settings');

    bottomNav.innerHTML = `
      <a href="../dashboard/dashboard.html" class="mobile-nav-item ${isDash ? 'active' : ''}">
        <span>📊</span>
        <span>Home</span>
      </a>
      <a href="../transactions/transactions.html" class="mobile-nav-item ${isTx ? 'active' : ''}">
        <span>💳</span>
        <span>History</span>
      </a>
      <button type="button" id="mobile-bottom-add" class="mobile-nav-item" style="background: none; border: none; cursor: pointer;">
        <span style="font-size: 22px; color: #EC4899;">➕</span>
        <span>Add</span>
      </button>
      <a href="../budget/budget.html" class="mobile-nav-item ${isBudget ? 'active' : ''}">
        <span>🎯</span>
        <span>Budgets</span>
      </a>
      <a href="../settings/settings.html" class="mobile-nav-item ${isSettings ? 'active' : ''}">
        <span>⚙️</span>
        <span>Settings</span>
      </a>
    `;
    document.body.appendChild(bottomNav);

    document.getElementById('mobile-bottom-add')?.addEventListener('click', () => {
      if (typeof onAddExpenseClick === 'function') {
        onAddExpenseClick();
      }
    });
  }

  // Bind theme toggle event
  const themeBtn = document.getElementById('btn-theme-toggle');
  themeBtn?.addEventListener('click', () => {
    const newTheme = storageUtil.getTheme() === 'dark' ? 'light' : 'dark';
    storageUtil.setTheme(newTheme);
    renderNavbar({ title, onAddExpenseClick, onAddIncomeClick });
  });

  // Mobile sidebar toggle handler with backdrop
  const toggleBtn = document.getElementById('btn-mobile-sidebar-toggle');
  toggleBtn?.addEventListener('click', () => {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (backdrop) backdrop.classList.toggle('active');
  });

  // Bind add expense button click
  const addExpenseBtn = document.getElementById('nav-btn-add-expense');
  addExpenseBtn?.addEventListener('click', () => {
    if (typeof onAddExpenseClick === 'function') {
      onAddExpenseClick();
    }
  });

  // Bind add income button click
  const addIncomeBtn = document.getElementById('nav-btn-add-income');
  addIncomeBtn?.addEventListener('click', () => {
    if (typeof onAddIncomeClick === 'function') {
      onAddIncomeClick();
    }
  });

  // Bind click animation trigger for particle bubbles
  document.querySelectorAll('.btn-bubble').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.add('animate');
      setTimeout(() => btn.classList.remove('animate'), 600);
    });
  });
}
