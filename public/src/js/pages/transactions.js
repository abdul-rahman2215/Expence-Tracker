import { authService } from '../auth/auth.js';
import { renderSidebar } from '../components/sidebar.js';
import { renderNavbar } from '../components/navbar.js';
import { renderTransactionTable } from '../components/transaction-table.js';
import { transactionService } from '../services/transaction-service.js';
import { categoryService } from '../services/category-service.js';
import { TransactionModal } from '../components/transaction-modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Route Guard: Require login
  const user = await authService.requireAuth();
  if (!user) return;

  // Initialize Layout Shell
  renderSidebar('transactions');
  renderNavbar({
    title: 'Transactions',
    onAddExpenseClick: () => modalEngine.openAddExpense(),
    onAddIncomeClick: () => modalEngine.openAddIncome()
  });

  // Logout listener
  document.getElementById('btn-sidebar-logout')?.addEventListener('click', () => authService.logout());

  // Page Add Expense / Income buttons
  document.getElementById('btn-page-add-expense')?.addEventListener('click', () => modalEngine.openAddExpense());
  document.getElementById('btn-page-add-income')?.addEventListener('click', () => modalEngine.openAddIncome());

  // Initialize Modal Engine
  const modalEngine = new TransactionModal({
    onSaveSuccess: () => loadTransactions()
  });

  // State Management
  let currentPage = 1;
  const pageSize = 15;
  let currentFilters = {
    search: '',
    type: '',
    categoryId: '',
    paymentMethod: ''
  };

  // Populate Filter Dropdowns
  async function loadFilterCategories() {
    const categorySelect = document.getElementById('filter-category');
    if (!categorySelect) return;

    const result = await categoryService.getCategories();
    if (result.success) {
      categorySelect.innerHTML = '<option value="">All Categories</option>';
      result.categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        categorySelect.appendChild(opt);
      });
    }
  }

  // Load Transactions from Database
  async function loadTransactions() {
    const offset = (currentPage - 1) * pageSize;

    const result = await transactionService.getTransactions({
      search: currentFilters.search,
      type: currentFilters.type,
      categoryId: currentFilters.categoryId,
      paymentMethod: currentFilters.paymentMethod,
      limit: pageSize,
      offset
    });

    if (result.success) {
      renderTransactionTable(result.transactions, {
        onEdit: (tx) => modalEngine.openEdit(tx),
        onDelete: (tx) => modalEngine.openDelete(tx.id, () => loadTransactions())
      });

      updatePagination(result.totalCount);
    }
  }

  // Pagination UI Update
  function updatePagination(totalCount) {
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    const infoEl = document.getElementById('pagination-info');
    if (infoEl) {
      infoEl.textContent = `Showing ${startItem}-${endItem} of ${totalCount} transactions`;
    }

    const prevBtn = document.getElementById('btn-prev-page');
    const nextBtn = document.getElementById('btn-next-page');

    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  }

  // Event Listeners for Filters
  let searchTimeout = null;
  document.getElementById('filter-search')?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = e.target.value.trim();
      currentPage = 1;
      loadTransactions();
    }, 300);
  });

  document.getElementById('filter-type')?.addEventListener('change', (e) => {
    currentFilters.type = e.target.value;
    currentPage = 1;
    loadTransactions();
  });

  document.getElementById('filter-category')?.addEventListener('change', (e) => {
    currentFilters.categoryId = e.target.value;
    currentPage = 1;
    loadTransactions();
  });

  document.getElementById('filter-payment')?.addEventListener('change', (e) => {
    currentFilters.paymentMethod = e.target.value;
    currentPage = 1;
    loadTransactions();
  });

  document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
    currentFilters = { search: '', type: '', categoryId: '', paymentMethod: '' };
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-payment').value = '';
    currentPage = 1;
    loadTransactions();
  });

  // Pagination Button Listeners
  document.getElementById('btn-prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadTransactions();
    }
  });

  document.getElementById('btn-next-page')?.addEventListener('click', () => {
    currentPage++;
    loadTransactions();
  });

  // Initial Execution
  await loadFilterCategories();
  await loadTransactions();
});
