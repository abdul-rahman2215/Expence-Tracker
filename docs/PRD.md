# Product Requirements Document (PRD)

## 1. Product Overview
Smart Expense Tracker is a personal finance web application designed to help university students, freelancers, and young professionals track daily spending manually, manage monthly budgets, monitor net savings, and analyze financial behavior through deterministic insights.

## 2. Core Problem Statement
Existing personal finance software is often overly complex, tied to automated banking aggregators, or overloaded with unnecessary tools. Beginners need a simple, fast manual logging tool where recording an expense takes under 10 seconds.

## 3. Product Vision & Principles
- **Record → Organize → Monitor → Analyze → Improve**
- **Simplicity First**: Clear terminology ("Add Expense" instead of "Create Financial Transaction Record").
- **Accuracy & Transparency**: Real data calculations without fabricated numbers.
- **Privacy & Security**: Zero cross-user data leakage.

## 4. Key Functional Features
1. **Manual Expense Entry**: Fast entry with required (Amount, Category, Date, Payment Method) and optional details.
2. **Manual Income Entry**: Income tracking with source and payment method.
3. **Financial Dashboard**: Metrics for Total Income, Total Expenses, Net Savings, and Monthly Budget status.
4. **Transactions Management**: Full CRUD with search, category/payment/date filter, sort, and pagination.
5. **Category Management**: System default categories + user custom categories with deletion protection.
6. **Monthly Budgeting**: Budget allocation per category with 80% and 100% idempotent threshold warnings.
7. **Analytics & Visualizations**: Category doughnut, income vs. expense bar, and spending trend line charts.
8. **Smart Insights Engine**: Deterministic rule-based observations computed directly from user transaction history.
9. **Financial Reports & Export**: Multi-period summary views with CSV download capability.
10. **Profile & Settings**: Light/Dark theme toggle, INR (₹) baseline currency indicator, and secure account deletion.

## 5. Non-Functional Requirements
- **Performance**: Page loads under 1.5 seconds on standard connections.
- **Responsive UI**: Seamless operation across Desktop, Tablet, and Mobile screens.
- **Accessibility**: Semantic HTML, high contrast ratio, and ARIA labels.
- **Security**: Supabase Auth, client-side XSS protection via `textContent`, and database-enforced Row Level Security (RLS).
