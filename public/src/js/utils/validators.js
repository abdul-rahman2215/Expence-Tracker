/**
 * Validator Utilities
 * Validates transaction, budget, and category inputs.
 */

export function validateExpenseInput({ amount, category_id, transaction_date, payment_method }) {
  const errors = [];

  const numAmount = Number(amount);
  if (amount === undefined || amount === null || amount === '' || isNaN(numAmount)) {
    errors.push('Please enter a valid numeric expense amount.');
  } else if (numAmount <= 0) {
    errors.push('Expense amount must be greater than zero.');
  } else if (numAmount > 100000000) {
    errors.push('Expense amount is unreasonably large.');
  }

  if (!category_id) {
    errors.push('Please select a valid expense category.');
  }

  if (!transaction_date) {
    errors.push('Please select a valid transaction date.');
  }

  if (!payment_method) {
    errors.push('Please select a payment method.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateIncomeInput({ amount, category_id, transaction_date, payment_method }) {
  const errors = [];

  const numAmount = Number(amount);
  if (amount === undefined || amount === null || amount === '' || isNaN(numAmount)) {
    errors.push('Please enter a valid numeric income amount.');
  } else if (numAmount <= 0) {
    errors.push('Income amount must be greater than zero.');
  }

  if (!category_id) {
    errors.push('Please select an income source / category.');
  }

  if (!transaction_date) {
    errors.push('Please select a valid transaction date.');
  }

  if (!payment_method) {
    errors.push('Please select a payment method.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateBudgetInput({ amount, month, year }) {
  const errors = [];

  const numAmount = Number(amount);
  if (amount === undefined || amount === null || amount === '' || isNaN(numAmount)) {
    errors.push('Please enter a valid budget amount.');
  } else if (numAmount < 0) {
    errors.push('Budget amount cannot be negative.');
  }

  const numMonth = Number(month);
  if (!numMonth || numMonth < 1 || numMonth > 12) {
    errors.push('Invalid budget month.');
  }

  const numYear = Number(year);
  if (!numYear || numYear < 2024) {
    errors.push('Invalid budget year.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
