/**
 * Budget Progress Card Component
 * Renders budget usage progress bar and warning thresholds.
 */

import { formatCurrency, formatPercentage } from '../utils/formatters.js';

export function renderBudgetCard(containerEl, { title = 'Monthly Budget', budgetAmount = 0, spentAmount = 0 } = {}) {
  if (!containerEl) return;

  const remaining = Math.max(0, budgetAmount - spentAmount);
  const usagePercentage = budgetAmount > 0 ? Math.min(100, (spentAmount / budgetAmount) * 100) : 0;
  
  let barColor = 'var(--color-primary)';
  if (usagePercentage >= 100) {
    barColor = 'var(--color-danger)';
  } else if (usagePercentage >= 80) {
    barColor = 'var(--color-warning)';
  }

  containerEl.className = 'card';
  containerEl.innerHTML = `
    <div class="card-header">
      <h3 class="card-title">${title}</h3>
      <span class="badge ${usagePercentage >= 100 ? 'badge-expense' : usagePercentage >= 80 ? 'badge-warning' : 'badge-income'}">
        ${formatPercentage(usagePercentage)} Used
      </span>
    </div>

    <div style="margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;">
        <span class="text-muted">Spent: <strong class="text-expense">${formatCurrency(spentAmount)}</strong></span>
        <span class="text-muted">Cap: <strong>${formatCurrency(budgetAmount)}</strong></span>
      </div>
      <div style="height: 10px; background: var(--color-surface-hover); border-radius: var(--radius-full); overflow: hidden;">
        <div style="height: 100%; width: ${usagePercentage}%; background-color: ${barColor}; transition: width 300ms ease;"></div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--color-text-muted);">
      <span>Remaining: <strong class="text-income">${formatCurrency(remaining)}</strong></span>
      ${usagePercentage >= 100 ? '<span class="text-danger font-bold"><i class="ti ti-alert-triangle"></i> Budget Exceeded</span>' : usagePercentage >= 80 ? '<span class="text-warning font-bold"><i class="ti ti-alert-triangle"></i> 80% Threshold Reached</span>' : '<span>On Track</span>'}
    </div>
  `;
}
