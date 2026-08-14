import { authService } from '../auth/auth.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { analyticsService } from '../services/analytics-service.js';
import { renderCategoryChart } from '../charts/expense-chart.js';
import { renderIncomeExpenseChart } from '../charts/income-expense-chart.js';
import { renderSpendingTrendChart } from '../charts/spending-trend-chart.js';
import { TransactionModal } from '../components/transaction-modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Route Guard: Require authentication
  const user = await authService.requireAuth();
  if (!user) return;

  // Initialize Layout Shell
  renderSidebar('analytics');
  renderNavbar({
    title: 'Analytics & Insights',
    onAddExpenseClick: () => modalEngine.openAddExpense(),
    onAddIncomeClick: () => modalEngine.openAddIncome()
  });

  // Logout listener
  document.getElementById('btn-sidebar-logout')?.addEventListener('click', () => authService.logout());

  // Initialize Modal Engine
  const modalEngine = new TransactionModal({
    onSaveSuccess: () => loadAnalyticsData()
  });

  // Month & Year Selectors
  const now = new Date();
  let selectedMonth = now.getMonth() + 1;
  let selectedYear = now.getFullYear();

  function initMonthYearSelectors() {
    const monthSelect = document.getElementById('analytics-month-select');
    const yearSelect = document.getElementById('analytics-year-select');

    if (!monthSelect || !yearSelect) return;

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    monthSelect.innerHTML = months.map((m, i) => `
      <option value="${i + 1}" ${i + 1 === selectedMonth ? 'selected' : ''}>${m}</option>
    `).join('');

    const currentYr = new Date().getFullYear();
    const years = [currentYr - 1, currentYr, currentYr + 1];
    yearSelect.innerHTML = years.map(y => `
      <option value="${y}" ${y === selectedYear ? 'selected' : ''}>${y}</option>
    `).join('');

    monthSelect.addEventListener('change', (e) => {
      selectedMonth = Number(e.target.value);
      loadAnalyticsData();
    });

    yearSelect.addEventListener('change', (e) => {
      selectedYear = Number(e.target.value);
      loadAnalyticsData();
    });
  }

  // Load Analytics Data & Render Charts
  async function loadAnalyticsData() {
    const result = await analyticsService.getAnalyticsData(selectedYear, selectedMonth);

    if (result.success && result.data) {
      const { totalIncome, totalExpenses, categoryBreakdown, trendData } = result.data;

      // 1. Render Category Doughnut Chart
      renderCategoryChart('chart-expense-category', categoryBreakdown);

      // 2. Render Income vs Expense Bar Chart
      renderIncomeExpenseChart('chart-income-expense', { totalIncome, totalExpenses });

      // 3. Render Daily Spending Trend Line Chart
      renderSpendingTrendChart('chart-spending-trend', trendData);
    }

    // 4. Render Smart Insights
    await loadSmartInsights();
  }

  // Render Smart Insights List safely using DOM nodes
  async function loadSmartInsights() {
    const insightsContainer = document.getElementById('smart-insights-list');
    if (!insightsContainer) return;

    insightsContainer.innerHTML = '';

    const insights = await analyticsService.generateSmartInsights(selectedYear, selectedMonth);

    insights.forEach(text => {
      const item = document.createElement('div');
      item.style.padding = '8px 12px';
      item.style.background = 'var(--color-surface)';
      item.style.border = '1px solid var(--color-border)';
      item.style.borderRadius = '8px';
      item.style.color = 'var(--color-text)';
      item.textContent = text.replace(/\*\*/g, ''); // Clear markdown formatting for safe textContent
      insightsContainer.appendChild(item);
    });
  }

  // Initial Execution
  initMonthYearSelectors();
  await loadAnalyticsData();
});
