/**
 * Transaction Modal Component
 * Manages modal HTML creation and lifecycle for "+ Add Expense", "+ Add Income", "Edit", and "Delete".
 */

import { categoryService } from '../services/category-service.js';
import { transactionService } from '../services/transaction-service.js';
import { toast } from './toast.js';
import { Modal } from './modal.js';
import { getTodayDateString, getCurrentTimeString } from '../utils/date-utils.js';

export class TransactionModal {
  constructor({ onSaveSuccess } = {}) {
    this.onSaveSuccess = onSaveSuccess;
    this.modalId = 'global-transaction-modal';
    this.deleteModalId = 'global-delete-modal';
    this._injectModalHTML();
    this.modalInstance = new Modal(this.modalId);
    this.deleteModalInstance = new Modal(this.deleteModalId);
    this.currentTransactionId = null;
    this.currentMode = 'expense'; // 'expense' | 'income' | 'edit'
  }

  _injectModalHTML() {
    if (!document.getElementById(this.modalId)) {
      const modalContainer = document.createElement('div');
      modalContainer.id = this.modalId;
      modalContainer.className = 'modal-backdrop';
      modalContainer.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3 id="modal-tx-title" class="modal-title">+ Add Expense</h3>
            <button class="modal-close" data-modal-close>&times;</button>
          </div>
          <form id="modal-tx-form">
            <div class="modal-body">
              <div id="modal-tx-alert" class="hidden" style="padding: 10px 14px; background: var(--color-expense-light); color: var(--color-danger); border-radius: 6px; font-size: 12px; margin-bottom: 16px;"></div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="tx-amount">Amount (₹) *</label>
                  <input type="number" id="tx-amount" class="form-control" placeholder="0.00" step="0.01" min="0.01" inputmode="decimal" autocomplete="off" required>
                </div>
                <div class="form-group">
                  <label for="tx-category">Category *</label>
                  <select id="tx-category" class="form-control" required>
                    <option value="">Select Category</option>
                  </select>
                </div>
                <div id="tx-custom-category-group" class="form-group hidden">
                  <label for="tx-custom-category">Type Custom Category Name *</label>
                  <input type="text" id="tx-custom-category" class="form-control" placeholder="e.g. Gaming, Subscriptions, Gym">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="tx-date">Date *</label>
                  <input type="date" id="tx-date" class="form-control" required>
                </div>
                <div class="form-group">
                  <label for="tx-time">Time (Optional)</label>
                  <input type="time" id="tx-time" class="form-control">
                </div>
              </div>

              <div class="form-group">
                <label for="tx-payment">Payment Method *</label>
                <select id="tx-payment" class="form-control" required>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label for="tx-description">Description (Optional)</label>
                <input type="text" id="tx-description" class="form-control" placeholder="e.g. Lunch at college canteen">
              </div>

              <div class="form-group">
                <label for="tx-notes">Notes (Optional)</label>
                <textarea id="tx-notes" class="form-control" rows="2" placeholder="Additional details..."></textarea>
              </div>

              <div class="form-group">
                <label for="tx-receipt">Receipt Image / Document (Optional, Max 5MB)</label>
                <input type="file" id="tx-receipt" class="form-control" accept="image/jpeg,image/png,application/pdf">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
              <button type="submit" id="btn-tx-save" class="btn btn-primary">Save Transaction</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modalContainer);

      // Form submission listener
      document.getElementById('modal-tx-form')?.addEventListener('submit', (e) => this._handleSubmit(e));

      // Category change listener for "Others" custom input toggle
      const catSelect = document.getElementById('tx-category');
      const customGroup = document.getElementById('tx-custom-category-group');
      const customInput = document.getElementById('tx-custom-category');

      catSelect?.addEventListener('change', () => {
        const selectedText = catSelect.options[catSelect.selectedIndex]?.text || '';
        if (selectedText.toLowerCase().includes('other')) {
          customGroup?.classList.remove('hidden');
          if (customInput) customInput.required = true;
        } else {
          customGroup?.classList.add('hidden');
          if (customInput) {
            customInput.required = false;
            customInput.value = '';
          }
        }
      });
    }

    // Inject Delete Confirmation Modal if not existing
    if (!document.getElementById(this.deleteModalId)) {
      const deleteContainer = document.createElement('div');
      deleteContainer.id = this.deleteModalId;
      deleteContainer.className = 'modal-backdrop';
      deleteContainer.innerHTML = `
        <div class="modal" style="max-width: 400px;">
          <div class="modal-header">
            <h3 class="modal-title">Delete Transaction</h3>
            <button class="modal-close" data-modal-close>&times;</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-modal-close>Cancel</button>
            <button type="button" id="btn-confirm-delete" class="btn btn-danger">Delete</button>
          </div>
        </div>
      `;
      document.body.appendChild(deleteContainer);
    }
  }

  async openAddExpense() {
    this.currentMode = 'expense';
    this.currentTransactionId = null;
    document.getElementById('modal-tx-title').textContent = '+ Add Expense';
    await this._loadCategories('expense');
    this._resetForm();
    this.modalInstance.open();
  }

  async openAddIncome() {
    this.currentMode = 'income';
    this.currentTransactionId = null;
    document.getElementById('modal-tx-title').textContent = '+ Add Income';
    await this._loadCategories('income');
    this._resetForm();
    this.modalInstance.open();
  }

  async openEdit(transaction) {
    this.currentMode = transaction.type;
    this.currentTransactionId = transaction.id;
    document.getElementById('modal-tx-title').textContent = `Edit ${transaction.type === 'income' ? 'Income' : 'Expense'}`;
    await this._loadCategories(transaction.type);
    
    document.getElementById('tx-amount').value = transaction.amount;
    document.getElementById('tx-category').value = transaction.category_id;
    document.getElementById('tx-date').value = transaction.transaction_date;
    document.getElementById('tx-time').value = transaction.transaction_time || '';
    document.getElementById('tx-payment').value = transaction.payment_method || 'UPI';
    document.getElementById('tx-description').value = transaction.description || '';
    document.getElementById('tx-notes').value = transaction.notes || '';

    this.modalInstance.open();
  }

  openDelete(transactionId, onDeleteConfirmed) {
    this.deleteModalInstance.open();
    const confirmBtn = document.getElementById('btn-confirm-delete');
    
    const handler = async () => {
      confirmBtn.removeEventListener('click', handler);
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Deleting...';

      const result = await transactionService.deleteTransaction(transactionId);
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Delete';
      this.deleteModalInstance.close();

      if (result.success) {
        toast.success('Transaction deleted.');
        if (typeof onDeleteConfirmed === 'function') onDeleteConfirmed();
        if (typeof this.onSaveSuccess === 'function') this.onSaveSuccess();
      } else {
        toast.error(result.error);
      }
    };

    confirmBtn.addEventListener('click', handler);
  }

  async _loadCategories(type) {
    const categorySelect = document.getElementById('tx-category');
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="">Loading categories...</option>';
    const result = await categoryService.getCategories(type);

    categorySelect.innerHTML = '<option value="">Select Category</option>';
    if (result.success) {
      result.categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        categorySelect.appendChild(opt);
      });
    }
  }

  _resetForm() {
    document.getElementById('modal-tx-form')?.reset();
    document.getElementById('tx-date').value = getTodayDateString();
    document.getElementById('tx-time').value = getCurrentTimeString();
    
    const customGroup = document.getElementById('tx-custom-category-group');
    const customInput = document.getElementById('tx-custom-category');
    if (customGroup) customGroup.classList.add('hidden');
    if (customInput) {
      customInput.required = false;
      customInput.value = '';
    }

    this._hideAlert();
  }

  async _handleSubmit(e) {
    e.preventDefault();

    let amount = document.getElementById('tx-amount')?.value;
    let category_id = document.getElementById('tx-category')?.value;
    const catSelect = document.getElementById('tx-category');
    const selectedText = catSelect?.options[catSelect.selectedIndex]?.text || '';
    const customCategoryName = document.getElementById('tx-custom-category')?.value.trim();

    const transaction_date = document.getElementById('tx-date')?.value;
    const transaction_time = document.getElementById('tx-time')?.value;
    const payment_method = document.getElementById('tx-payment')?.value;
    const description = document.getElementById('tx-description')?.value;
    const notes = document.getElementById('tx-notes')?.value;

    const saveBtn = document.getElementById('btn-tx-save');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    this._hideAlert();

    // Check if custom category name was typed for "Others"
    if (selectedText.toLowerCase().includes('other') && customCategoryName) {
      const catResult = await categoryService.createCustomCategory({
        name: customCategoryName,
        type: this.currentMode
      });

      if (catResult.success && catResult.category) {
        category_id = catResult.category.id;
      } else {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Transaction';
        this._showAlert(catResult.error || 'Failed to create custom category.');
        return;
      }
    }

    const payload = {
      type: this.currentMode,
      amount,
      category_id,
      transaction_date,
      transaction_time,
      payment_method,
      description,
      notes
    };

    let result;
    if (this.currentTransactionId) {
      result = await transactionService.updateTransaction(this.currentTransactionId, payload);
    } else {
      result = await transactionService.createTransaction(payload);
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Transaction';

    if (result.success) {
      this.modalInstance.close();
      toast.success(`${this.currentMode === 'income' ? 'Income' : 'Expense'} saved successfully!`);
      if (typeof this.onSaveSuccess === 'function') {
        this.onSaveSuccess(result.transaction);
      }
    } else {
      this._showAlert(result.error);
    }
  }

  _showAlert(msg) {
    const alertEl = document.getElementById('modal-tx-alert');
    if (!alertEl) return;
    alertEl.textContent = msg;
    alertEl.classList.remove('hidden');
  }

  _hideAlert() {
    document.getElementById('modal-tx-alert')?.classList.add('hidden');
  }
}
