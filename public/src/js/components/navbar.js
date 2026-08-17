/**
 * Top Navbar Component
 * Renders header bar with user profile, theme toggle, fast "+ Add Expense" button,
 * and mobile Floating Action Button (FAB) for touch screens.
 */

import { storageUtil } from '../utils/storage.js';
import { showMobileSplash } from './splash.js';

export function renderNavbar({ title = 'Dashboard', onAddExpenseClick, onAddIncomeClick } = {}) {
  const navbarEl = document.getElementById('app-navbar');
  if (!navbarEl) return;

  const currentTheme = storageUtil.getTheme();

  // Mobile Launch Splash Screen (Mobile Viewport Only, once per browser session)
  showMobileSplash();

  navbarEl.className = 'top-navbar';
  navbarEl.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <button id="btn-mobile-sidebar-toggle" class="btn btn-secondary btn-sm" aria-label="Toggle Navigation Menu">
        <i class="ti ti-menu-2"></i>
      </button>
      <h2 style="font-size: 1.25rem; font-weight: 700;">${title}</h2>
    </div>
    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <a href="../notifications/notifications.html" id="btn-nav-notifications" class="btn btn-secondary btn-sm" title="Notification Center" aria-label="Notifications" style="display: inline-flex; align-items: center; justify-content: center; padding: 8px 12px; font-size: 1.1rem; text-decoration: none;">
        <i class="ti ti-bell"></i>
      </a>
      <button id="btn-theme-toggle" class="btn btn-secondary btn-sm" title="Toggle Light/Dark Theme">
        ${currentTheme === 'dark' ? '<i class="ti ti-sun"></i> Light' : '<i class="ti ti-moon"></i> Dark'}
      </button>
      <button id="nav-btn-add-income" class="btn-bubble btn-bubble-income">
        <i class="ti ti-trending-up"></i> Add Income
      </button>
      <button id="nav-btn-add-expense" class="btn-bubble">
        <i class="ti ti-trending-down"></i> Add Expense
      </button>
    </div>
  `;

  // Render Mobile Floating Action Button (FAB) for fast single-thumb entry on touchscreens
  let fabBtn = document.getElementById('mobile-fab-add-expense');
  if (!fabBtn) {
    fabBtn = document.createElement('button');
    fabBtn.id = 'mobile-fab-add-expense';
    fabBtn.className = 'mobile-fab-add';
    fabBtn.setAttribute('aria-label', 'Quick Add');
    fabBtn.innerHTML = '<i class="ti ti-plus"></i>';
    document.body.appendChild(fabBtn);
  }

  // Render Mobile Floating Action Speed-Dial Menu
  let fabMenu = document.getElementById('mobile-fab-menu');
  if (!fabMenu) {
    fabMenu = document.createElement('div');
    fabMenu.id = 'mobile-fab-menu';
    fabMenu.className = 'mobile-fab-menu hidden';
    fabMenu.innerHTML = `
      <button id="fab-option-income" class="mobile-fab-option fab-option-income">
        <i class="ti ti-trending-up"></i>
        <span>Add Income</span>
      </button>
      <button id="fab-option-expense" class="mobile-fab-option fab-option-expense">
        <i class="ti ti-trending-down"></i>
        <span>Add Expense</span>
      </button>
    `;
    document.body.appendChild(fabMenu);

    document.getElementById('fab-option-expense')?.addEventListener('click', (e) => {
      e.stopPropagation();
      fabMenu.classList.add('hidden');
      fabBtn.classList.remove('active');
      if (typeof onAddExpenseClick === 'function') onAddExpenseClick();
    });

    document.getElementById('fab-option-income')?.addEventListener('click', (e) => {
      e.stopPropagation();
      fabMenu.classList.add('hidden');
      fabBtn.classList.remove('active');
      if (typeof onAddIncomeClick === 'function') onAddIncomeClick();
    });

    // Close menu when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (!fabBtn.contains(e.target) && !fabMenu.contains(e.target)) {
        fabMenu.classList.add('hidden');
        fabBtn.classList.remove('active');
      }
    });
  }

  fabBtn.onclick = (e) => {
    e.stopPropagation();
    const isHidden = fabMenu.classList.contains('hidden');
    if (isHidden) {
      fabMenu.classList.remove('hidden');
      fabBtn.classList.add('active');
    } else {
      fabMenu.classList.add('hidden');
      fabBtn.classList.remove('active');
    }
  };

  // Render Mobile Bottom App Navigation Bar
  let bottomNav = document.getElementById('app-mobile-bottom-nav');
  if (!bottomNav) {
    bottomNav = document.createElement('nav');
    bottomNav.id = 'app-mobile-bottom-nav';
    bottomNav.className = 'mobile-bottom-nav';
    document.body.appendChild(bottomNav);
  }

  const pathname = window.location.pathname;
  const isDash = pathname.includes('dashboard');
  const isTx = pathname.includes('transactions');
  const isReports = pathname.includes('reports');
  const isBudget = pathname.includes('budget');
  const isSettings = pathname.includes('settings');

  bottomNav.innerHTML = `
    <a href="../dashboard/dashboard.html" class="mobile-nav-item ${isDash ? 'active' : ''}">
      <span><i class="ti ti-home"></i></span>
      <span>Home</span>
    </a>
    <a href="../transactions/transactions.html" class="mobile-nav-item ${isTx ? 'active' : ''}">
      <span><i class="ti ti-history"></i></span>
      <span>History</span>
    </a>
    <a href="../reports/reports.html" class="mobile-nav-item ${isReports ? 'active' : ''}">
      <span><i class="ti ti-file-analytics"></i></span>
      <span>Reports</span>
    </a>
    <a href="../budget/budget.html" class="mobile-nav-item ${isBudget ? 'active' : ''}">
      <span><i class="ti ti-wallet"></i></span>
      <span>Budgets</span>
    </a>
    <a href="../settings/settings.html" class="mobile-nav-item ${isSettings ? 'active' : ''}">
      <span><i class="ti ti-settings"></i></span>
      <span>Settings</span>
    </a>
  `;

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
