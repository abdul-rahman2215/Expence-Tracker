# Database Architecture & Schema Document

## 1. Relational Entity Diagram Summary

```
auth.users (Supabase Managed)
    │ 1:1 (DB Trigger)
    ▼
public.profiles (id PK, name, email, avatar_url, currency, created_at, updated_at)
    │
    ├─► 1:N public.categories (id PK, user_id FK nullable, name, type, is_system, created_at, updated_at)
    │        │
    │        └─► 1:N public.transactions (id PK, user_id FK, category_id FK, type, amount, payment_method, transaction_date, transaction_time, description, notes, receipt_url, created_at, updated_at)
    │
    ├─► 1:N public.budgets (id PK, user_id FK, month, year, amount, created_at, updated_at)
    │        │
    │        └─► 1:N public.budget_categories (id PK, budget_id FK, category_id FK, amount, created_at, updated_at)
    │
    ├─► 1:N public.notifications (id PK, user_id FK, budget_id FK nullable, category_id FK nullable, title, message, type, threshold, month, year, is_read, created_at, updated_at)
    │
    └─► 1:1 public.user_settings (id PK, user_id FK, theme, currency, notifications_enabled, created_at, updated_at)
```

## 2. Table Schemas & Constraints

### `profiles`
- `id` (UUID, Primary Key, References `auth.users(id)` ON DELETE CASCADE)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `avatar_url` (TEXT)
- `currency` (TEXT, DEFAULT 'INR')
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### `categories`
- `id` (UUID, Primary Key, DEFAULT gen_random_uuid())
- `user_id` (UUID, References `auth.users(id)` ON DELETE CASCADE, NULL for system categories)
- `name` (TEXT, NOT NULL)
- `type` (TEXT, CHECK (`type IN ('income', 'expense')`))
- `is_system` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### `transactions`
- `id` (UUID, Primary Key, DEFAULT gen_random_uuid())
- `user_id` (UUID, NOT NULL, References `auth.users(id)` ON DELETE CASCADE)
- `category_id` (UUID, NOT NULL, References `categories(id)`)
- `type` (TEXT, NOT NULL, CHECK (`type IN ('income', 'expense')`))
- `amount` (NUMERIC(12,2), NOT NULL, CHECK (`amount > 0`))
- `payment_method` (TEXT, NOT NULL)
- `transaction_date` (DATE, NOT NULL)
- `transaction_time` (TIME)
- `description` (TEXT)
- `notes` (TEXT)
- `receipt_url` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### `budgets`
- `id` (UUID, Primary Key, DEFAULT gen_random_uuid())
- `user_id` (UUID, NOT NULL, References `auth.users(id)` ON DELETE CASCADE)
- `amount` (NUMERIC(12,2), NOT NULL, CHECK (`amount >= 0`))
- `month` (INTEGER, NOT NULL, CHECK (`month BETWEEN 1 AND 12`))
- `year` (INTEGER, NOT NULL, CHECK (`year >= 2024`))
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### `budget_categories`
- `id` (UUID, Primary Key, DEFAULT gen_random_uuid())
- `budget_id` (UUID, NOT NULL, References `budgets(id)` ON DELETE CASCADE)
- `category_id` (UUID, NOT NULL, References `categories(id)`)
- `amount` (NUMERIC(12,2), NOT NULL, CHECK (`amount >= 0`))
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### `notifications`
- `id` (UUID, Primary Key, DEFAULT gen_random_uuid())
- `user_id` (UUID, NOT NULL, References `auth.users(id)` ON DELETE CASCADE)
- `budget_id` (UUID, References `budgets(id)` ON DELETE CASCADE)
- `category_id` (UUID, References `categories(id)` ON DELETE CASCADE)
- `title` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `type` (TEXT, NOT NULL)
- `threshold` (INTEGER)
- `month` (INTEGER)
- `year` (INTEGER)
- `is_read` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### `user_settings`
- `id` (UUID, Primary Key, DEFAULT gen_random_uuid())
- `user_id` (UUID, UNIQUE, NOT NULL, References `auth.users(id)` ON DELETE CASCADE)
- `theme` (TEXT, DEFAULT 'light')
- `currency` (TEXT, DEFAULT 'INR')
- `notifications_enabled` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

## 3. Database Functions & Triggers
1. `handle_new_user()`: Server-side `SECURITY DEFINER` function triggered on `AFTER INSERT ON auth.users` to automatically populate `public.profiles` and default `public.user_settings`.
2. `update_updated_at_column()`: Function triggered before update on any table to auto-update `updated_at = NOW()`.
