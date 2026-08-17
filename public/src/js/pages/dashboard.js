import { authService } from '../auth/auth.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { profileService } from '../services/profile-service.js';
import { transactionService } from '../services/transaction-service.js';
import { budgetService } from '../services/budget-service.js';
import { notificationService } from '../services/notification-service.js';
import { formatCurrency } from '../utils/formatters.js';
import { formatDateForDisplay, getCalendarMonthBounds, getPreviousMonthBounds } from '../utils/date-utils.js';
import { TransactionModal } from '../components/transaction-modal.js';
import { renderBudgetCard } from '../components/budget-card.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Route Guard: Require authentication
  const user = await authService.requireAuth();
  if (!user) return;

  // Dynamic User Greeting (reading from profileService for 100% Profile synchronization)
  let userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const profileRes = await profileService.getProfile();
  if (profileRes.success && profileRes.profile?.name) {
    userName = profileRes.profile.name;
  }

  const pageTitleEl = document.querySelector('.page-title-group h1');
  const pageSubEl = document.querySelector('.page-title-group p');
  if (pageTitleEl) pageTitleEl.textContent = `Welcome back, ${userName}`;
  if (pageSubEl) pageSubEl.textContent = "Here's your financial overview.";

  // Initialize Layout Shell
  renderSidebar('dashboard');
  renderNavbar({
    title: 'Dashboard',
    onAddExpenseClick: () => modalEngine.openAddExpense(),
    onAddIncomeClick: () => modalEngine.openAddIncome()
  });

  // Logout listener
  document.getElementById('btn-sidebar-logout')?.addEventListener('click', () => authService.logout());

  // Page Add Expense / Income buttons
  document.getElementById('btn-dash-add-expense')?.addEventListener('click', () => modalEngine.openAddExpense());
  document.getElementById('btn-dash-add-income')?.addEventListener('click', () => modalEngine.openAddIncome());

  // Initialize Transaction Modal Engine with real-time recalculation callback
  const modalEngine = new TransactionModal({
    onSaveSuccess: () => loadDashboardData()
  });

  // State: Current Date Filter Range
  let activeRange = getCalendarMonthBounds(); // Default: This Month

  // Period Selector Change Listener
  const periodSelect = document.getElementById('dash-period-select');
  const customInputs = document.getElementById('custom-range-inputs');

  periodSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'this_month') {
      customInputs?.classList.add('hidden');
      activeRange = getCalendarMonthBounds();
      loadDashboardData();
    } else if (val === 'last_month') {
      customInputs?.classList.add('hidden');
      activeRange = getPreviousMonthBounds();
      loadDashboardData();
    } else if (val === 'custom') {
      customInputs?.classList.remove('hidden');
    }
  });

  document.getElementById('btn-apply-custom-range')?.addEventListener('click', () => {
    const startDate = document.getElementById('custom-start-date')?.value;
    const endDate = document.getElementById('custom-end-date')?.value;
    if (startDate && endDate) {
      activeRange = { startDate, endDate };
      loadDashboardData();
    }
  });

  // Load Dashboard Financial Metrics and Data
  async function loadDashboardData() {
    // 1. Fetch Summary Metrics
    const metricsResult = await transactionService.getSummaryMetrics({
      startDate: activeRange.startDate,
      endDate: activeRange.endDate
    });

    if (metricsResult.success) {
      const { totalIncome, totalExpenses, balance, netSavings } = metricsResult.metrics;
      
      const balanceEl = document.getElementById('val-total-balance');
      const incomeEl = document.getElementById('val-total-income');
      const expenseEl = document.getElementById('val-total-expense');
      const savingsEl = document.getElementById('val-net-savings');

      if (balanceEl) balanceEl.textContent = formatCurrency(balance);
      if (incomeEl) incomeEl.textContent = `+${formatCurrency(totalIncome)}`;
      if (expenseEl) expenseEl.textContent = `-${formatCurrency(totalExpenses)}`;
      if (savingsEl) savingsEl.textContent = formatCurrency(netSavings);

      // Render Budget Card preview using exact budgetService calculations for 100% parity
      const budgetContainer = document.getElementById('dash-budget-card-container');
      const now = new Date();
      const targetMonth = activeRange.month || (now.getMonth() + 1);
      const targetYear = activeRange.year || now.getFullYear();
      
      const budgetResult = await budgetService.getBudgetUsage(targetMonth, targetYear);
      if (budgetResult.success) {
        const { budgetAmount, totalSpent } = budgetResult.usage;
        renderBudgetCard(budgetContainer, {
          title: 'Monthly Budget Status',
          budgetAmount: budgetAmount,
          spentAmount: totalSpent
        });
      }
    }

    // 2. Fetch Recent 5 Transactions
    const txResult = await transactionService.getTransactions({
      startDate: activeRange.startDate,
      endDate: activeRange.endDate,
      limit: 5
    });

    if (txResult.success) {
      renderRecentTransactions(txResult.transactions);
    }

    // 3. Evaluate daily transaction reminder asynchronously
    notificationService.checkAndTriggerDailyReminder();
  }

  // Render Recent Transactions Table Body
  function renderRecentTransactions(transactions) {
    const tbody = document.getElementById('dash-recent-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (transactions.length === 0) {
      const emptyTr = document.createElement('tr');
      emptyTr.innerHTML = `
        <td colspan="4" style="text-align: center; padding: 24px; color: var(--color-text-muted);">
          No transactions recorded in this period.
        </td>
      `;
      tbody.appendChild(emptyTr);
      return;
    }

    transactions.forEach(t => {
      const tr = document.createElement('tr');

      const dateTd = document.createElement('td');
      dateTd.textContent = formatDateForDisplay(t.transaction_date);

      const categoryTd = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = `badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`;
      badge.textContent = t.categories?.name || (t.type === 'income' ? 'Income' : 'Expense');
      categoryTd.appendChild(badge);

      const descTd = document.createElement('td');
      descTd.textContent = t.description || '-';

      const amountTd = document.createElement('td');
      amountTd.className = `font-bold ${t.type === 'income' ? 'text-income' : 'text-expense'}`;
      amountTd.textContent = `${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}`;

      tr.appendChild(dateTd);
      tr.appendChild(categoryTd);
      tr.appendChild(amountTd);
      tr.appendChild(descTd);

      tbody.appendChild(tr);
    });
  }

  // Initial Execution
  await loadDashboardData();
});
