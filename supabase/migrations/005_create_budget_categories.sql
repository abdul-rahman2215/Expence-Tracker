-- 005_create_budget_categories.sql
-- Create public.budget_categories table linking monthly budgets to specific spending categories

CREATE TABLE IF NOT EXISTS public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_budget_category UNIQUE (budget_id, category_id)
);

-- Index for category budget lookup
CREATE INDEX IF NOT EXISTS idx_budget_categories_budget ON public.budget_categories(budget_id);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS update_budget_categories_updated_at ON public.budget_categories;
CREATE TRIGGER update_budget_categories_updated_at
  BEFORE UPDATE ON public.budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
