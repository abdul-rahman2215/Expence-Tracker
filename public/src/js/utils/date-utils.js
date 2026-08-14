/**
 * Date Utilities
 * Ensures local date parsing without UTC conversion shifts.
 */

/**
 * Get today's local date string formatted as YYYY-MM-DD.
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current time string formatted as HH:MM.
 */
export function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Safely parse YYYY-MM-DD string as local Date object without UTC shift.
 */
export function parseLocalDate(dateString) {
  if (!dateString) return new Date();
  const parts = dateString.split('-');
  if (parts.length !== 3) return new Date(dateString);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Format YYYY-MM-DD date string for user display (e.g. 12 Aug 2026).
 */
export function formatDateForDisplay(dateString) {
  if (!dateString) return '';
  const dateObj = parseLocalDate(dateString);
  return dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Get calendar month boundary date strings for current month, last month, or custom period.
 */
export function getCalendarMonthBounds(year, month) {
  const targetYear = year || new Date().getFullYear();
  const targetMonth = month || (new Date().getMonth() + 1);

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
  
  // Last day of month
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate, year: targetYear, month: targetMonth };
}

/**
 * Get previous calendar month bounds.
 */
export function getPreviousMonthBounds() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed for previous month

  if (month === 0) {
    month = 12;
    year -= 1;
  }

  return getCalendarMonthBounds(year, month);
}
