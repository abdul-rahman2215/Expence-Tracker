# Smart Expense Tracker

Smart Expense Tracker is a production-quality, portfolio-ready personal finance web application built using Vanilla HTML5, CSS3, JavaScript, Supabase (Auth, Postgres, Row Level Security, Storage), Chart.js, and Lucide Icons.

---

## Features

- **Manual Expense & Income Entry**: Fast entry for daily expenses and income streams with required (Amount, Category, Date, Payment Method) and optional details.
- **Real-Time Financial Dashboard**: Instant metric updates for Total Income, Total Expenses, Net Savings, and Monthly Budget Usage.
- **Budgeting & Idempotent Alerts**: Monthly budget manager with automated 80% and 100% threshold notifications.
- **Analytics & Visualizations**: Interactive Chart.js breakdown by category, income vs. expense comparison, and spending trends.
- **Smart Insights**: Deterministic, rule-based financial advice generated directly from actual spending data.
- **Reports & Exporting**: Custom date-range financial summaries with one-click CSV exporting.
- **Bank-Grade Security**: Supabase Authentication combined with database-level Row Level Security (RLS) enforcing strict cross-tenant data isolation.

---

## Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System with CSS Variables), Vanilla JavaScript (ES6+ Modules)
- **Backend / Database**: Supabase (Auth, PostgreSQL, Row Level Security, Storage)
- **Charts**: Chart.js
- **Icons**: Lucide Icons
- **Deployment**: Vercel / Firebase Hosting ready

---

## Project Structure

```
smart-expense-tracker/
├── index.html
├── README.md
├── .gitignore
├── .env.example
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── USER-FLOW.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   └── LEARNING-NOTES.md
├── public/
│   └── assets/
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── budget/
│   │   ├── analytics/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── profile/
│   │   └── settings/
│   ├── css/
│   └── js/
│       ├── config/
│       ├── auth/
│       ├── pages/
│       ├── services/
│       ├── components/
│       ├── charts/
│       └── utils/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── policies.sql
└── tests/
```

---

## Getting Started

1. Clone repository.
2. Set up your Supabase project and execute the migration scripts in `supabase/migrations/`.
3. Configure `src/js/config/supabase.js` with your Supabase URL and anon public key.
4. Serve `index.html` using any local web server (e.g. Live Server or `npx serve`).

---

## Documentation

Detailed architectural specs, ER diagrams, security policies, and learning notes are maintained in the [`docs/`](file:///c:/Users/acer/Desktop/PROJECTS/Expence%20Tracker%20NEW/docs) directory.
