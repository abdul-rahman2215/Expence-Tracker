# Learning Notes & Architectural Journal

## Phase 1: Project Foundation & Design System
- **Concepts Learned**:
  - Modular Vanilla CSS organization using variables for light/dark theme tokens.
  - Clean separation of HTML view templates, service layers, and page controllers without relying on heavy frameworks.
  - Designing standard system architectures that scale gracefully.
- **Key Decisions**:
  - Kept frontend dependencies minimal (Chart.js and Lucide Icons via standard CDN / ES modules) to understand underlying browser fundamentals.
  - Created clear documentation standards (`PRD`, `TRD`, `ARCHITECTURE`, `DATABASE`, `SECURITY`) to guide production software practices.

---

## Phase 2: Supabase Database + Constraints + RLS
- **What Was Implemented**:
  - Created 7 PostgreSQL migration scripts (`001_create_profiles.sql` to `007_create_user_settings.sql`).
  - Added PostgreSQL constraints (`CHECK (amount > 0)`, `CHECK (type IN ('income', 'expense'))`).
  - Implemented automatic `updated_at` trigger function attached to all domain tables.
  - Implemented server-side `SECURITY DEFINER` function `handle_new_user()` on `auth.users` insertion to populate `public.profiles` and `public.user_settings`.
  - Created complete Row Level Security (`policies.sql`) covering SELECT, INSERT, UPDATE, DELETE for all tables.
  - Configured idempotent notification indexing on `(user_id, type, month, year, category_id)`.
- **Why It Was Implemented**:
  - Financial data integrity must be guaranteed at the database engine level, not just client-side JavaScript.
  - Server-side triggers eliminate race conditions during user signup.
  - RLS guarantees zero cross-tenant data access even if a client attempts direct raw API calls.
- **Security Considerations**:
  - `handle_new_user()` trigger runs as `SECURITY DEFINER` on the database server so client code cannot bypass profile creation.
  - Categories RLS permits system default categories (`is_system = true`, `user_id IS NULL`) while locking user custom categories to `user_id = auth.uid()`.
- **Important Files**:
  - `supabase/migrations/001_create_profiles.sql`
  - `supabase/migrations/003_create_transactions.sql`
  - `supabase/migrations/006_create_notifications.sql`
  - `supabase/policies.sql`

---

## Phase 3: Authentication + Session Management
- **What Was Implemented**:
  - Auth Service module (`src/js/auth/auth.js`) integrating Supabase Auth.
  - Client-side route guards (`requireAuth()`, `redirectIfAuthenticated()`).
  - Auth view templates (`login.html`, `register.html`, `forgot-password.html`) and page controllers (`login.js`, `register.js`, `password-reset.js`).
  - Error masking layer translating API errors into safe, readable notifications.
- **Why It Was Implemented**:
  - Secure identity verification prevents unauthorized database reads/writes.
  - Client route protection ensures users cannot accidentally access application views without an active session.
- **Security Considerations**:
  - XSS defense enforced using DOM `textContent` rendering for error messages.
  - Zero password handling in client JS; passwords delegated entirely to Supabase Auth API over HTTPS.
- **Important Files**:
  - `src/js/auth/auth.js`
  - `src/pages/auth/login.html`
  - `src/pages/auth/register.html`
  - `src/js/auth/login.js`

---

## Phase 4: Application Shell + Reusable Components
- **What Was Implemented**:
  - Utility framework (`formatters.js`, `currency.js`, `date-utils.js`, `validators.js`, `storage.js`).
  - Safe toast alert engine (`toast.js`) enforcing `textContent` rendering for XSS defense.
  - Reusable modal dialog controller (`modal.js`) with backdrop management and Escape key closing.
  - Shared sidebar layout renderer (`sidebar.js`) and top navbar bar (`navbar.js`) with theme switching support.
  - UI component renderers (`transaction-table.js`, `budget-card.js`, `loading.js`).
- **Why It Was Implemented**:
  - Reusable components maintain consistent design standards and eliminate duplicate DOM generation code across application pages.
  - Pure utility functions insulate date formatting and currency conversions from locale-dependent bugs.
- **Security Considerations**:
  - `toast.js` and `transaction-table.js` use explicit DOM node construction and `textContent` text injection to prevent XSS payloads in user transaction descriptions.
- **Important Files**:
  - `src/js/utils/date-utils.js`
  - `src/js/utils/validators.js`
  - `src/js/components/toast.js`
  - `src/js/components/transaction-table.js`

---

## Phase 5: Manual Income/Expense + Transaction CRUD
- **What Was Implemented**:
  - Category Service (`src/js/services/category-service.js`) for system and user custom category management.
  - Transaction Service (`src/js/services/transaction-service.js`) encapsulating paginated fetch, creation, update, delete, and real-time metric sum aggregations (`totalIncome`, `totalExpenses`, `balance`, `netSavings`).
  - Transaction Modal component (`src/js/components/transaction-modal.js`) powering fast `+ Add Expense` and `+ Add Income` popups with required/optional fields, edit pre-population, and delete confirmation dialogs.
- **Why It Was Implemented**:
  - Encapsulating transaction database operations in `transaction-service.js` keeps page controllers clean and avoids duplicate queries.
  - Real-time aggregation calculates exact mathematical sums from database records without fake or cached metrics.
- **Security Considerations**:
  - Input validation enforces `amount > 0` and strict numeric checking before sending payloads to Supabase.
  - Row Level Security (RLS) ensures transaction queries return data belonging exclusively to `auth.uid()`.
- **Important Files**:
  - `src/js/services/transaction-service.js`
  - `src/js/services/category-service.js`
  - `src/js/components/transaction-modal.js`

---

## Phase 6: Categories + Search + Filter + Pagination
- **What Was Implemented**:
  - Safe category deletion restriction in `category-service.js` preventing deletion if linked transactions exist.
  - Full Transactions view page (`src/pages/transactions/transactions.html`) and controller (`src/js/pages/transactions.js`).
  - Search keyword filtering with input debouncing.
  - Multi-filter controls for transaction type (Income/Expense), category, and payment method.
  - Server-side pagination engine (`limit` and `offset`) with page controls and item counts.
- **Why It Was Implemented**:
  - Protecting category deletion prevents orphaned foreign key references in the database.
  - Client debouncing prevents excessive database queries during user search typing.
- **Security Considerations**:
  - Search inputs are sanitized into `ilike` query parameters, preventing SQL injection.
- **Important Files**:
  - `src/js/services/category-service.js`
  - `src/pages/transactions/transactions.html`
  - `src/js/pages/transactions.js`

---

## Phase 7: Dashboard + Financial Calculations
- **What Was Implemented**:
  - Full financial dashboard view (`src/pages/dashboard/dashboard.html`) and controller (`src/js/pages/dashboard.js`).
  - Period filtering controls: `This Month` (default), `Last Month`, and `Custom Range`.
  - Real-time financial summary metric cards: `Total Balance`, `Total Income`, `Total Expenses`, and `Net Savings = Total Income - Total Expenses`.
  - Recent 5 transactions preview list with category badges.
  - Real-time recalculation triggered immediately whenever a transaction is created, updated, or deleted.
- **Why It Was Implemented**:
  - Instant dashboard recalculation provides immediate visual feedback after recording expenses or income.
  - Period filtering allows users to evaluate past spending performance without reloading the page.
- **Security & Financial Standards**:
  - `Net Savings` is calculated strictly using actual database records (`Total Income - Total Expenses`).
  - DOM elements are populated safely using `textContent`.
- **Important Files**:
  - `src/pages/dashboard/dashboard.html`
  - `src/js/pages/dashboard.js`

---

## Phase 8: Budget + Precise Budget Alerts
- **What Was Implemented**:
  - Notification Service (`src/js/services/notification-service.js`) with precise idempotent alert check logic evaluating `(user_id, type, month, year, category_id)` at 80% and 100% spending caps.
  - Budget Service (`src/js/services/budget-service.js`) for monthly cap upserts and actual expense ratio calculations.
  - Budget view page (`src/pages/budget/budget.html`) and controller (`src/js/pages/budget.js`).
  - Progress bar visualization using `renderBudgetCard()` displaying spent amount, remaining amount, and percentage cap.
- **Why It Was Implemented**:
  - Precise idempotency prevents notification spam on page reloads while allowing separate alerts for different months or categories.
- **Security Considerations**:
  - Budget caps are enforced per user via RLS and unique constraint indices (`user_id, month, year`).
- **Important Files**:
  - `src/js/services/budget-service.js`
  - `src/js/services/notification-service.js`
  - `src/pages/budget/budget.html`
  - `src/js/pages/budget.js`

---

## Phase 9: Analytics + Smart Insights
- **What Was Implemented**:
  - Analytics Service (`src/js/services/analytics-service.js`) with deterministic, rule-based Smart Insights engine.
  - Interactive Chart.js visualization components (`expense-chart.js`, `income-expense-chart.js`, `spending-trend-chart.js`).
  - Analytics View Page (`src/pages/analytics/analytics.html`) and controller (`src/js/pages/analytics.js`).
- **Why It Was Implemented**:
  - Deterministic calculations guarantee that insights are generated strictly from verified database records without fabricated AI numbers.
  - Responsive charts visually communicate category proportions and month-over-month trend directions.
- **Security Considerations**:
  - Smart Insights list items are sanitized via DOM `textContent` before rendering to prevent HTML/XSS injection.
- **Important Files**:
  - `src/js/services/analytics-service.js`
  - `src/js/charts/expense-chart.js`
  - `src/pages/analytics/analytics.html`
  - `src/js/pages/analytics.js`

---

## Phase 10: Reports + CSV Export
- **What Was Implemented**:
  - CSV Export utility (`src/js/utils/export-csv.js`) supporting sanitized Blob creation, quotes/comma escaping, and browser file download.
  - Reports View Page (`src/pages/reports/reports.html`) and controller (`src/js/pages/reports.js`).
  - Multi-period preset date range filters (Today, This Week, This Month, Last Month, Custom Range).
  - Summary metric calculations and category breakdown percentage tables.
- **Why It Was Implemented**:
  - Exporting CSV spreadsheets allows users to back up their financial history or analyze data in Excel/Google Sheets.
- **Security Considerations**:
  - CSV field escaping prevents formula injection vulnerabilities in downloaded files.
- **Important Files**:
  - `src/js/utils/export-csv.js`
  - `src/pages/reports/reports.html`
  - `src/js/pages/reports.js`

---

## Phase 11: Notifications + Profile + Settings
- **What Was Implemented**:
  - Profile & Settings Service (`src/js/services/profile-service.js`) for user profile updates, preference persistence, and cascading account deletion.
  - Notification Center view (`src/pages/notifications/notifications.html` & `src/js/pages/notifications.js`) with mark-as-read controls.
  - User Profile view (`src/pages/profile/profile.html` & `src/js/pages/profile.js`) for name and default currency configuration.
  - Application Settings view (`src/pages/settings/settings.html` & `src/js/pages/settings.js`) featuring Light/Dark theme switching, notification toggles, and account deletion modal with "DELETE" confirmation string.
- **Why It Was Implemented**:
  - Account settings give users control over their application theme and notification preferences.
  - Requiring an explicit "DELETE" confirmation string prevents accidental account destruction.
- **Security Considerations**:
  - Account deletion is protected by RLS and cascades database records safely using foreign key `ON DELETE CASCADE`.
- **Important Files**:
  - `src/js/services/profile-service.js`
  - `src/pages/notifications/notifications.html`
  - `src/pages/profile/profile.html`
  - `src/pages/settings/settings.html`

---

## Phase 12: Optional Receipt Storage
- **What Was Implemented**:
  - Receipt Storage Service (`src/js/services/receipt-service.js`) with client-side file size checking (Max 5MB) and type validation (`image/jpeg`, `image/png`, `application/pdf`).
  - Updated Transaction Modal (`src/js/components/transaction-modal.js`) adding optional receipt attachment support.
- **Why It Was Implemented**:
  - Optional receipt uploads enhance transaction record-keeping without impeding fast manual entry.
- **Security Considerations**:
  - File size and MIME type restrictions protect against arbitrary file uploads and storage exhaustion.
- **Important Files**:
  - `src/js/services/receipt-service.js`
  - `src/js/components/transaction-modal.js`

---

## Phase 13: Testing + Security Audit
- **What Was Implemented**:
  - Security RLS Test Suite (`tests/security/rls_isolation.test.js`) verifying cross-tenant database isolation between distinct authenticated users.
  - Financial Calculation Test Suite (`tests/transactions/calculations.test.js`) verifying mathematical precision for Balance, Net Savings, Budget Usage percentages, and validator boundary rules.
- **Why It Was Implemented**:
  - Verification ensures financial calculations and security policies conform strictly to product specifications before deployment.
- **Security Audit Summary**:
  - Zero cross-user data exposure: RLS policies enforce `auth.uid() = user_id` across all 7 user-owned tables.
  - Zero XSS exposure: DOM text nodes and `textContent` sanitize all user input rendering.
  - Zero secret exposure: Only browser-safe anon public key used in client code.
- **Important Files**:
  - `tests/security/rls_isolation.test.js`
  - `tests/transactions/calculations.test.js`

---

## Phase 14: Performance + Accessibility + Responsive Polish
- **What Was Implemented**:
  - CSS responsive polish (`src/css/responsive.css`) adding 44px minimum touch targets and 16px font sizes on mobile to prevent automatic iOS zoom.
  - Mobile navigation drawer toggle (`#btn-mobile-sidebar-toggle`) in `navbar.js` supporting small viewports (375px - 768px).
  - Accessible keyboard focus rings (`:focus-visible`) and ARIA labels.
- **Why It Was Implemented**:
  - Touch-target sizing and mobile drawer navigation ensure that the expense tracker operates smoothly on mobile smartphones and tablets.
- **Accessibility Audit**:
  - Keyboard navigation allows full tab cycling through inputs, buttons, and modal dialogs.
- **Important Files**:
  - `src/css/responsive.css`
  - `src/js/components/navbar.js`

---

## Phase 15: Deployment + Documentation
- **What Was Implemented**:
  - Final static file audit and directory verification.
  - Complete documentation suite (`PRD`, `TRD`, `ARCHITECTURE`, `DATABASE`, `USER-FLOW`, `SECURITY`, `TESTING`, `DEPLOYMENT`, `README`, `LEARNING-NOTES`).
  - Production-ready static deployment setup for Vercel / Firebase Hosting with Supabase backend.
- **Why It Was Implemented**:
  - Thorough documentation and pre-flight deployment checklists ensure portfolio-grade software quality and easy handover.
- **Final Summary**:
  - Smart Expense Tracker is fully built, tested, secured with Supabase RLS, and ready for deployment.














