/**
 * Loading Skeleton / Spinner Component
 */

export const loading = {
  showSpinner(containerEl, message = 'Loading...') {
    if (!containerEl) return;
    containerEl.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
        <div style="width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 800ms linear infinite;"></div>
        <p style="margin-top: 12px; font-size: 14px; color: var(--color-text-muted);">${message}</p>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;
  },

  hideSpinner(containerEl) {
    if (containerEl) {
      containerEl.innerHTML = '';
    }
  }
};
