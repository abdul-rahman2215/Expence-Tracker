/**
 * Formatter Utilities
 * Provides standard formatting for currency values, percentages, and display text.
 */

import { getCurrencySymbol } from './currency.js';

/**
 * Format numeric value as formatted currency string (e.g. ₹1,250.00).
 */
export function formatCurrency(amount, currencyCode = 'INR') {
  const numericAmount = Number(amount) || 0;
  const symbol = getCurrencySymbol(currencyCode);

  const formattedValue = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(numericAmount));

  if (numericAmount < 0) {
    return `-${symbol}${formattedValue}`;
  }
  return `${symbol}${formattedValue}`;
}

/**
 * Format ratio as percentage string (e.g. 82.5%).
 */
export function formatPercentage(value, decimals = 1) {
  const numericValue = Number(value) || 0;
  return `${numericValue.toFixed(decimals)}%`;
}

/**
 * Truncate long text strings safely.
 */
export function truncateText(text, maxLength = 30) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}
