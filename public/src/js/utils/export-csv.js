/**
 * CSV Export Utility
 * Safely converts transaction records into a formatted CSV spreadsheet file for download.
 */

export function exportTransactionsToCSV(transactions = [], filename = 'smart-expense-report.csv') {
  if (!transactions || transactions.length === 0) {
    alert('No transactions available to export.');
    return;
  }

  // Headers
  const headers = ['Date', 'Type', 'Category', 'Payment Method', 'Amount (INR)', 'Description', 'Notes'];

  // Helper to escape CSV field values
  const escapeField = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Convert rows
  const rows = transactions.map(t => [
    escapeField(t.transaction_date),
    escapeField(t.type),
    escapeField(t.categories?.name || 'Uncategorized'),
    escapeField(t.payment_method || ''),
    escapeField(t.amount),
    escapeField(t.description || ''),
    escapeField(t.notes || '')
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');

  // Trigger Browser Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
