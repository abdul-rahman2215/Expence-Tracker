-- policies.sql
-- Row Level Security (RLS) Policies for Smart Expense Tracker

-- Enable RLS on all user-owned tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. PROFILES POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- 2. CATEGORIES POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view system or own custom categories" ON public.categories;
CREATE POLICY "Users can view system or own custom categories"
  ON public.categories FOR SELECT
  USING (is_system = TRUE OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own custom categories" ON public.categories;
CREATE POLICY "Users can insert own custom categories"
  ON public.categories FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_system = FALSE);

DROP POLICY IF EXISTS "Users can update own custom categories" ON public.categories;
CREATE POLICY "Users can update own custom categories"
  ON public.categories FOR UPDATE
  USING (user_id = auth.uid() AND is_system = FALSE)
  WITH CHECK (user_id = auth.uid() AND is_system = FALSE);

DROP POLICY IF EXISTS "Users can delete own custom categories" ON public.categories;
CREATE POLICY "Users can delete own custom categories"
  ON public.categories FOR DELETE
  USING (user_id = auth.uid() AND is_system = FALSE);

-- ============================================================================
-- 3. TRANSACTIONS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- 4. BUDGETS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- 5. BUDGET_CATEGORIES POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view budget categories via budget" ON public.budget_categories;
CREATE POLICY "Users can view budget categories via budget"
  ON public.budget_categories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.budgets
    WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert budget categories via budget" ON public.budget_categories;
CREATE POLICY "Users can insert budget categories via budget"
  ON public.budget_categories FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.budgets
    WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update budget categories via budget" ON public.budget_categories;
CREATE POLICY "Users can update budget categories via budget"
  ON public.budget_categories FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.budgets
    WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete budget categories via budget" ON public.budget_categories;
CREATE POLICY "Users can delete budget categories via budget"
  ON public.budget_categories FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.budgets
    WHERE budgets.id = budget_categories.budget_id AND budgets.user_id = auth.uid()
  ));

-- ============================================================================
-- 6. NOTIFICATIONS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- 7. USER_SETTINGS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own settings" ON public.user_settings;
CREATE POLICY "Users can delete own settings"
  ON public.user_settings FOR DELETE
  USING (user_id = auth.uid());
