import { authService } from '../auth/auth.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { budgetService } from '../services/budget-service.js';
import { renderBudgetCard } from '../components/budget-card.js';
import { Modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { TransactionModal } from '../components/transaction-modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Route Guard: Require authentication
  const user = await authService.requireAuth();
  if (!user) return;

  // Initialize Layout Shell
  renderSidebar('budget');
  renderNavbar({
    title: 'Budgets',
    onAddExpenseClick: () => modalEngine.openAddExpense(),
    onAddIncomeClick: () => modalEngine.openAddIncome()
  });

  // Logout listener
  document.getElementById('btn-sidebar-logout')?.addEventListener('click', () => authService.logout());

  // Initialize Modal Engine
  const modalEngine = new TransactionModal({
    onSaveSuccess: () => loadBudgetData()
  });

  const setBudgetModal = new Modal('modal-set-budget-backdrop');

  // Month & Year Selector Initialization
  const now = new Date();
  let selectedMonth = now.getMonth() + 1;
  let selectedYear = now.getFullYear();

  function initMonthYearSelectors() {
    const monthSelect = document.getElementById('budget-month-select');
    const yearSelect = document.getElementById('budget-year-select');

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
      loadBudgetData();
    });

    yearSelect.addEventListener('change', (e) => {
      selectedYear = Number(e.target.value);
      loadBudgetData();
    });
  }

  // Load Budget Data from Database
  async function loadBudgetData() {
    const container = document.getElementById('budget-overview-card-container');
    if (!container) return;

    const result = await budgetService.getBudgetUsage(selectedMonth, selectedYear);

    if (result.success) {
      const { budgetAmount, totalSpent } = result.usage;

      renderBudgetCard(container, {
        title: `Monthly Budget (${document.getElementById('budget-month-select')?.selectedOptions[0]?.text || ''} ${selectedYear})`,
        budgetAmount,
        spentAmount: totalSpent
      });

      // Pre-fill modal input
      const totalInput = document.getElementById('budget-total-amount');
      if (totalInput) totalInput.value = budgetAmount || '';
    }
  }

  // Set Budget Modal Events
  document.getElementById('btn-open-set-budget')?.addEventListener('click', () => {
    setBudgetModal.open();
  });

  document.getElementById('form-set-budget')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = document.getElementById('budget-total-amount')?.value;
    const saveBtn = document.getElementById('btn-save-budget');
    const alertEl = document.getElementById('budget-alert');

    if (amount === undefined || amount < 0) {
      if (alertEl) {
        alertEl.textContent = 'Please enter a valid budget amount.';
        alertEl.classList.remove('hidden');
      }
      return;
    }

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    const result = await budgetService.setMonthlyBudget({
      month: selectedMonth,
      year: selectedYear,
      amount
    });

    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Budget';
    }

    if (result.success) {
      setBudgetModal.close();
      toast.success('Monthly budget updated!');
      await loadBudgetData();
    } else {
      if (alertEl) {
        alertEl.textContent = result.error;
        alertEl.classList.remove('hidden');
      }
    }
  });

  // Initial Execution
  initMonthYearSelectors();
  await loadBudgetData();
});
