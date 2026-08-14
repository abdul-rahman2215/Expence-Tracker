import { authService } from '../auth/auth.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { transactionService } from '../services/transaction-service.js';
import { formatCurrency, formatPercentage } from '../utils/formatters.js';
import { getTodayDateString, getCalendarMonthBounds, getPreviousMonthBounds } from '../utils/date-utils.js';
import { exportTransactionsToCSV } from '../utils/export-csv.js';
import { TransactionModal } from '../components/transaction-modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Route Guard: Require authentication
  const user = await authService.requireAuth();
  if (!user) return;

  // Initialize Layout Shell
  renderSidebar('reports');
  renderNavbar({
    title: 'Reports',
    onAddExpenseClick: () => modalEngine.openAddExpense(),
    onAddIncomeClick: () => modalEngine.openAddIncome()
  });

  // Logout listener
  document.getElementById('btn-sidebar-logout')?.addEventListener('click', () => authService.logout());

  // Initialize Modal Engine
  const modalEngine = new TransactionModal({
    onSaveSuccess: () => loadReportData()
  });

  // State: Filter Date Bounds
  let activeRange = getCalendarMonthBounds();
  let currentTransactions = [];

  // Period Preset Selector Listener
  const presetSelect = document.getElementById('report-period-preset');
  const customRangeInputs = document.getElementById('report-custom-range');

  presetSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    const today = getTodayDateString();

    if (val === 'today') {
      customRangeInputs?.classList.add('hidden');
      activeRange = { startDate: today, endDate: today };
      loadReportData();
    } else if (val === 'this_week') {
      customRangeInputs?.classList.add('hidden');
      const now = new Date();
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
      const startDate = firstDay.toISOString().split('T')[0];
      activeRange = { startDate, endDate: today };
      loadReportData();
    } else if (val === 'this_month') {
      customRangeInputs?.classList.add('hidden');
      activeRange = getCalendarMonthBounds();
      loadReportData();
    } else if (val === 'last_month') {
      customRangeInputs?.classList.add('hidden');
      activeRange = getPreviousMonthBounds();
      loadReportData();
    } else if (val === 'custom') {
      customRangeInputs?.classList.remove('hidden');
    }
  });

  document.getElementById('btn-apply-report-custom')?.addEventListener('click', () => {
    const startDate = document.getElementById('report-start-date')?.value;
    const endDate = document.getElementById('report-end-date')?.value;
    if (startDate && endDate) {
      activeRange = { startDate, endDate };
      loadReportData();
    }
  });

  // Export CSV Button Event Listener
  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    exportTransactionsToCSV(currentTransactions, `smart-expense-report-${activeRange.startDate}-to-${activeRange.endDate}.csv`);
  });

  // Load Report Data
  async function loadReportData() {
    const result = await transactionService.getTransactions({
      startDate: activeRange.startDate,
      endDate: activeRange.endDate,
      limit: 1000 // Large limit for full export payload
    });

    if (result.success) {
      currentTransactions = result.transactions;
      renderReportMetrics(currentTransactions);
    }
  }

  // Render Metric Cards & Category Breakdown Table
  function renderReportMetrics(transactions) {
    let totalIncome = 0;
    let totalExpenses = 0;
    const catMap = {};

    transactions.forEach(t => {
      const val = Number(t.amount) || 0;
      if (t.type === 'income') {
        totalIncome += val;
      } else if (t.type === 'expense') {
        totalExpenses += val;
        const catName = t.categories?.name || 'Uncategorized';
        catMap[catName] = (catMap[catName] || 0) + val;
      }
    });

    const netSavings = totalIncome - totalExpenses;

    const incEl = document.getElementById('rep-total-income');
    const expEl = document.getElementById('rep-total-expense');
    const savEl = document.getElementById('rep-net-savings');
    const topEl = document.getElementById('rep-top-category');

    if (incEl) incEl.textContent = `+${formatCurrency(totalIncome)}`;
    if (expEl) expEl.textContent = `-${formatCurrency(totalExpenses)}`;
    if (savEl) savEl.textContent = formatCurrency(netSavings);

    // Top Category Calculation
    const sortedCategories = Object.keys(catMap).map(name => ({
      name,
      amount: catMap[name]
    })).sort((a, b) => b.amount - a.amount);

    if (topEl) {
      topEl.textContent = sortedCategories.length > 0
        ? `${sortedCategories[0].name} (${formatCurrency(sortedCategories[0].amount)})`
        : 'None';
    }

    // Category Table Population
    const tbody = document.getElementById('rep-category-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (sortedCategories.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="4" style="text-align: center; padding: 24px; color: var(--color-text-muted);">
          No category expenses recorded for this report period.
        </td>
      `;
      tbody.appendChild(emptyRow);
      return;
    }

    sortedCategories.forEach(cat => {
      const tr = document.createElement('tr');

      const nameTd = document.createElement('td');
      nameTd.className = 'font-semibold';
      nameTd.textContent = cat.name;

      const typeTd = document.createElement('td');
      typeTd.textContent = 'Expense';

      const amountTd = document.createElement('td');
      amountTd.className = 'font-bold text-expense';
      amountTd.textContent = formatCurrency(cat.amount);

      const percentTd = document.createElement('td');
      const percent = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
      percentTd.textContent = formatPercentage(percent);

      tr.appendChild(nameTd);
      tr.appendChild(typeTd);
      tr.appendChild(amountTd);
      tr.appendChild(percentTd);

      tbody.appendChild(tr);
    });
  }

  // Initial Execution
  await loadReportData();
});
