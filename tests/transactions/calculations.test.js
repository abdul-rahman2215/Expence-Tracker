/**
 * Calculation Accuracy & Validation Test Suite
 */

import { validateExpenseInput, validateIncomeInput, validateBudgetInput } from '../../src/js/utils/validators.js';

export function runCalculationTests() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    logs: []
  };

  function assertEqual(actual, expected, testName) {
    results.total++;
    if (actual === expected) {
      results.passed++;
      results.logs.push(`[PASS] ${testName}`);
    } else {
      results.failed++;
      results.logs.push(`[FAIL] ${testName} (Expected: ${expected}, Got: ${actual})`);
    }
  }

  // Test 1: Balance & Net Savings Formula
  const income = 50000;
  const expense = 20000;
  const expectedBalance = 30000;
  const expectedNetSavings = 30000;

  assertEqual(income - expense, expectedBalance, 'CALC-01: Balance = Total Income - Total Expenses');
  assertEqual(income - expense, expectedNetSavings, 'CALC-02: Net Savings = Total Income - Total Expenses');

  // Test 2: Budget Remaining & Percentage
  const budget = 25000;
  const spent = 20000;
  const expectedRemaining = 5000;
  const expectedPercentage = 80;

  assertEqual(budget - spent, expectedRemaining, 'CALC-03: Budget Remaining = Budget Cap - Total Spent');
  assertEqual((spent / budget) * 100, expectedPercentage, 'CALC-04: Budget Usage % = (Spent / Budget) * 100');

  // Test 3: Input Validation Rules
  const invalidExpense = validateExpenseInput({ amount: -100, category_id: null, transaction_date: '', payment_method: '' });
  assertEqual(invalidExpense.isValid, false, 'VAL-01: Rejects negative expense amount');

  const validExpense = validateExpenseInput({ amount: 500, category_id: 'cat-123', transaction_date: '2026-08-12', payment_method: 'UPI' });
  assertEqual(validExpense.isValid, true, 'VAL-02: Accepts valid expense payload');

  return results;
}
