/**
 * Shared Sidebar Component
 * Renders left navigation menu and handles mobile backdrop overlay closing.
 */

export function renderSidebar(activeRoute = 'dashboard') {
  const sidebarEl = document.getElementById('app-sidebar');
  if (!sidebarEl) return;

  const routes = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '../dashboard/dashboard.html' },
    { id: 'transactions', label: 'Transactions', icon: '💳', path: '../transactions/transactions.html' },
    { id: 'budget', label: 'Budgets', icon: '🎯', path: '../budget/budget.html' },
    { id: 'analytics', label: 'Analytics', icon: '📈', path: '../analytics/analytics.html' },
    { id: 'reports', label: 'Reports', icon: '📑', path: '../reports/reports.html' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: '../notifications/notifications.html' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '../profile/profile.html' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '../settings/settings.html' }
  ];

  sidebarEl.className = 'sidebar';
  sidebarEl.innerHTML = `
    <div class="sidebar-header">
      <img src="../../assets/images/logo.png" onerror="this.onerror=null; this.src='/assets/images/logo.png';" alt="Smart Expense Logo" class="sidebar-logo-img">
      <span class="sidebar-brand">Smart Expense</span>
    </div>
    <nav class="sidebar-nav">
      ${routes.map(r => `
        <a href="${r.path}" class="nav-item ${activeRoute === r.id ? 'active' : ''}">
          <span>${r.icon}</span>
          <span>${r.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <button id="btn-sidebar-logout" class="c-button c-button--gooey" style="width: 100%; font-size: 13px; padding: 0.6em 1em;">
        🚪 Logout
        <div class="c-button__blobs">
          <div></div><div></div><div></div>
        </div>
      </button>
    </div>
  `;

  // Inject SVG Gooey filter into document if not existing
  if (!document.getElementById('svg-goo-filter')) {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.id = 'svg-goo-filter';
    svgEl.setAttribute('version', '1.1');
    svgEl.style.cssText = 'display: block; height: 0; width: 0; position: absolute;';
    svgEl.innerHTML = `
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    `;
    document.body.appendChild(svgEl);
  }

  // Inject or bind mobile backdrop overlay
  let backdrop = document.getElementById('sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'sidebar-backdrop';
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  backdrop.addEventListener('click', () => {
    sidebarEl.classList.remove('mobile-open');
    backdrop.classList.remove('active');
  });
}

export function closeMobileSidebar() {
  const sidebarEl = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebarEl) sidebarEl.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('active');
}
