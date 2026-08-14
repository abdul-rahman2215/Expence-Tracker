# User Flow & Journey Specifications

## 1. Onboarding & Authentication Flow
```
Visitor → Landing Page (index.html)
   │
   ├─► Click "Get Started" / "Register" → register.html
   │      │
   │      └─► Enter Email, Password, Name → Supabase Auth signup
   │             │
   │             └─► DB Trigger auto-creates Profile & User Settings
   │                    │
   │                    └─► Redirect to Dashboard (dashboard.html)
   │
   └─► Click "Login" → login.html → Authenticate → Redirect to Dashboard
```

## 2. Fast Expense Entry Flow
```
Dashboard / Transactions Page
   │
   └─► Click "+ Add Expense" button
          │
          ├─► Modal opens
          ├─► Enter Amount (Required, e.g., 450)
          ├─► Select Category (Required, e.g., Food)
          ├─► Select Date (Required, default Today YYYY-MM-DD)
          ├─► Select Payment Method (Required, e.g., UPI)
          ├─► Optional: Time, Description ("College Lunch"), Notes, Receipt
          │
          └─► Click "Save Expense"
                 │
                 ├─► Validate input (Amount > 0)
                 ├─► Insert into `transactions` table (type: 'expense')
                 ├─► Evaluate idempotent budget warnings (80% / 100%)
                 ├─► Close Modal & display Toast Notification ("Expense saved!")
                 └─► Instantly update Dashboard metrics (Balance, Expenses, Net Savings, Budget Bar)
```

## 3. Transaction Management Flow
```
Transactions Page (transactions.html)
   │
   ├─► View paginated list of transactions
   ├─► Filter by Date Range, Type (Income/Expense), Category, Payment Method
   ├─► Search by description/notes
   ├─► Click "Edit" → Open Edit Modal → Save → Recalculate dependent metrics
   └─► Click "Delete" → Open Confirmation Modal → Confirm → Delete → Recalculate metrics
```
