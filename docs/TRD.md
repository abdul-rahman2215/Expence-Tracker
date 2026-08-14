# Technical Requirements Document (TRD)

## 1. Technical Stack Specifications
- **HTML Framework**: HTML5 with semantic markup (`<main>`, `<nav>`, `<aside>`, `<header>`, `<section>`, `<article>`).
- **CSS Architecture**: Vanilla CSS3 using custom CSS variable tokens, Flexbox, Grid layout, and micro-animations.
- **JavaScript Engine**: Vanilla ES6+ modules (`import`/`export`), no build step required for core runtime.
- **Backend Services**: Supabase (PostgreSQL 15+, Supabase Auth, Row Level Security, Supabase Storage).
- **Visualization Library**: Chart.js (v4 via CDN / JS module).
- **Icons**: Lucide Icons.

## 2. Frontend Component & Layering Rules
- **Page Controllers**: Manage page lifecycle, event handlers, and UI state (`src/js/pages/*.js`).
- **Services**: Encapsulate pure database/API calls (`src/js/services/*.js`).
- **Components**: Reusable UI generators (`src/js/components/*.js`).
- **Utils**: Pure helper functions for formatting, validation, and dates (`src/js/utils/*.js`).

## 3. Financial Calculation Standards
- **Balance**: `Total Income - Total Expenses`
- **Net Savings**: `Total Income - Total Expenses`
- **Budget Remaining**: `Budget Amount - Category Expenses`
- **Budget Usage %**: `(Expenses / Budget Amount) * 100`

## 4. Date & Time Handling Standards
- `transaction_date` stored strictly as PostgreSQL `DATE` (`YYYY-MM-DD`).
- `transaction_time` stored strictly as PostgreSQL `TIME` (`HH:MM:SS`).
- Calendar month logic parses local year and month without timezone offset shifts.
