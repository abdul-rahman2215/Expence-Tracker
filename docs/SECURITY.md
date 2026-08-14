# Security Policy & Audit Specifications

## 1. Authentication & Session Security
- Supabase Auth handles user registration, password hashing (Bcrypt/Argon2 via Postgres), and JWT token management.
- Passwords are NEVER stored, processed, or logged manually in custom frontend code.
- Client applications store session tokens securely using browser storage and handle refresh tokens via official Supabase JS SDK.

## 2. API & Database Security (Row Level Security)
- Row Level Security (RLS) enabled on all user-owned tables (`profiles`, `categories`, `transactions`, `budgets`, `budget_categories`, `notifications`, `user_settings`).
- Service-role keys (`SUPABASE_SERVICE_ROLE_KEY`) are NEVER included in client code. Only browser-safe anon public key (`SUPABASE_ANON_KEY`) is exposed.
- RLS Policies enforce:
  - `SELECT`: `user_id = auth.uid()` (or `user_id IS NULL` for system categories).
  - `INSERT`: `user_id = auth.uid()`.
  - `UPDATE`: `user_id = auth.uid()`.
  - `DELETE`: `user_id = auth.uid()`.

## 3. Client-Side Defense (XSS Prevention)
- All user-supplied values (descriptions, notes, names, custom categories) MUST be injected into DOM elements using element `textContent` or text node insertion.
- Unsafe `innerHTML` assignment of raw user strings is strictly banned.

## 4. Error Masking
- Raw database error messages (e.g. Postgres constraint failure details or table names) are intercepted by service modules and sanitized to friendly error messages (e.g. "Unable to save transaction. Please check your inputs.").
