/**
 * Transaction Table Component
 * Renders list of transactions safely into an HTML table using textContent / DOM nodes to prevent XSS.
 */

import { formatCurrency } from '../utils/formatters.js';
import { formatDateForDisplay } from '../utils/date-utils.js';

export function renderTransactionTable(transactions = [], { onEdit, onDelete } = {}) {
  const tableBody = document.getElementById('transaction-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (transactions.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="6" style="text-align: center; padding: 32px; color: var(--color-text-muted);">
        No transactions found. Click "+ Add Expense" or "+ Add Income" to get started.
      </td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }

  transactions.forEach(t => {
    const row = document.createElement('tr');

    // Date column
    const dateTd = document.createElement('td');
    dateTd.textContent = formatDateForDisplay(t.transaction_date);

    // Category column
    const categoryTd = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`;
    badge.textContent = t.categories?.name || (t.type === 'income' ? 'Income' : 'Expense');
    categoryTd.appendChild(badge);

    // Description column
    const descTd = document.createElement('td');
    descTd.textContent = t.description || '-';

    // Payment Method column
    const paymentTd = document.createElement('td');
    paymentTd.textContent = t.payment_method || 'Cash';

    // Amount column
    const amountTd = document.createElement('td');
    amountTd.className = `font-bold ${t.type === 'income' ? 'text-income' : 'text-expense'}`;
    amountTd.textContent = `${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}`;

    // Actions column
    const actionsTd = document.createElement('td');
    actionsTd.className = 'table-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-secondary btn-sm';
    editBtn.textContent = '✏️ Edit';
    editBtn.addEventListener('click', () => onEdit && onEdit(t));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.addEventListener('click', () => onDelete && onDelete(t));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);

    row.appendChild(dateTd);
    row.appendChild(categoryTd);
    row.appendChild(descTd);
    row.appendChild(paymentTd);
    row.appendChild(amountTd);
    row.appendChild(actionsTd);

    tableBody.appendChild(row);
  });
}
