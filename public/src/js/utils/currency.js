/**
 * Currency Utilities
 * Map currency codes to symbols. Baseline default is INR (₹).
 */

const CURRENCY_MAP = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export function getCurrencySymbol(code = 'INR') {
  return CURRENCY_MAP[code?.toUpperCase()] || '₹';
}

export function getSupportedCurrencies() {
  return [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ];
}
