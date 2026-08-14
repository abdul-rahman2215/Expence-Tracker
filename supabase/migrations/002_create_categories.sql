-- 002_create_categories.sql
-- Create public.categories table for system defaults and user-defined categories

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for category lookup by user and type
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON public.categories(user_id, type);
CREATE INDEX IF NOT EXISTS idx_categories_system ON public.categories(is_system);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Default System Expense Categories
INSERT INTO public.categories (user_id, name, type, is_system) VALUES
  (NULL, 'Food', 'expense', TRUE),
  (NULL, 'Transport', 'expense', TRUE),
  (NULL, 'Shopping', 'expense', TRUE),
  (NULL, 'Rent', 'expense', TRUE),
  (NULL, 'Bills', 'expense', TRUE),
  (NULL, 'Education', 'expense', TRUE),
  (NULL, 'Health', 'expense', TRUE),
  (NULL, 'Entertainment', 'expense', TRUE),
  (NULL, 'Travel', 'expense', TRUE),
  (NULL, 'Others', 'expense', TRUE)
ON CONFLICT DO NOTHING;

-- Insert Default System Income Categories
INSERT INTO public.categories (user_id, name, type, is_system) VALUES
  (NULL, 'Salary', 'income', TRUE),
  (NULL, 'Freelance', 'income', TRUE),
  (NULL, 'Investment', 'income', TRUE),
  (NULL, 'Business', 'income', TRUE),
  (NULL, 'Allowance', 'income', TRUE),
  (NULL, 'Gift', 'income', TRUE),
  (NULL, 'Other Income', 'income', TRUE)
ON CONFLICT DO NOTHING;
