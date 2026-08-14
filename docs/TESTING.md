# Testing Strategy & Test Matrix

## 1. Security & Cross-Tenant Isolation Matrix
| Test Case | Actor | Target Resource | Action | Expected Result |
|-----------|-------|-----------------|--------|-----------------|
| RLS-01 | User A | User A Transaction | SELECT / UPDATE / DELETE | Allowed (200 OK) |
| RLS-02 | User B | User A Transaction | SELECT | Denied (Empty / 0 rows) |
| RLS-03 | User B | User A Transaction | UPDATE | Denied (0 rows modified) |
| RLS-04 | User B | User A Transaction | DELETE | Denied (0 rows deleted) |
| RLS-05 | User B | User A Budget | SELECT / UPDATE / DELETE | Denied |
| RLS-06 | User B | User A Custom Category | SELECT | Denied |
| RLS-07 | Any Auth User | System Categories | SELECT | Allowed |

## 2. Calculation Validation Matrix
- **Income Only**: Income = ₹30,000, Expense = ₹0 → Balance = ₹30,000, Net Savings = ₹30,000.
- **Expense Only**: Income = ₹0, Expense = ₹5,000 → Balance = -₹5,000, Net Savings = -₹5,000.
- **Mixed**: Income = ₹50,000, Expense = ₹20,000 → Balance = ₹30,000, Net Savings = ₹30,000.
- **Budget Warning**: Budget = ₹10,000, Expense = ₹8,200 → 82% used → 80% Alert Triggered (Idempotent: 1 notification record created).

## 3. Input Validation Matrix
- Amount <= 0 → Validation error ("Amount must be greater than zero").
- Amount = "abc" → Validation error ("Please enter a valid numeric amount").
- Date = empty → Validation error ("Please select a valid date").
- Category = empty → Validation error ("Please select a valid category").
