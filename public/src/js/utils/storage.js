/**
 * Local Storage Preference Utility
 */

const STORAGE_KEYS = {
  THEME: 'ste_theme',
  CURRENCY: 'ste_currency'
};

export const storageUtil = {
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },

  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  },

  getCurrency() {
    return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'INR';
  },

  setCurrency(currency) {
    if (currency) {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    }
  }
};
