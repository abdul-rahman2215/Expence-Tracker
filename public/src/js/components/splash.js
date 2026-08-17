/**
 * Mobile App Launch Splash Screen Component
 * Triggers native-feeling splash animation on mobile startup before auth/login.
 */

export function showMobileSplash() {
  return new Promise((resolve) => {
    // Only run on mobile viewports (<= 768px) and once per browser session
    if (window.innerWidth > 768 || sessionStorage.getItem('mobile_splash_shown')) {
      resolve();
      return;
    }

    let splashEl = document.getElementById('mobile-app-splash');
    if (splashEl) {
      resolve();
      return;
    }

    splashEl = document.createElement('div');
    splashEl.id = 'mobile-app-splash';
    splashEl.className = 'mobile-splash-container';

    // Resolve relative path to logo based on directory depth
    const isDeepPage = window.location.pathname.includes('/pages/');
    const logoSrc = isDeepPage ? '../../../assets/images/logo.png' : 'assets/images/logo.png';

    splashEl.innerHTML = `
      <div class="mobile-splash-content">
        <div class="mobile-splash-logo-wrapper">
          <img src="${logoSrc}" onerror="this.onerror=null; this.src='/assets/images/logo.png';" alt="Smart Expense Tracker" class="mobile-splash-logo">
        </div>
        <h1 class="mobile-splash-title">Smart Expense Tracker</h1>
      </div>
    `;

    document.body.appendChild(splashEl);
    sessionStorage.setItem('mobile_splash_shown', 'true');

    // Dismiss splash screen smoothly after 1.8 seconds and resolve promise after fade-out
    setTimeout(() => {
      splashEl.classList.add('fade-out');
      setTimeout(() => {
        splashEl.remove();
        resolve();
      }, 400);
    }, 1800);
  });
}
