-- 006_create_notifications.sql
-- Create public.notifications table for budget alerts and system messages with idempotent key support

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g. 'budget_80', 'budget_100'
  threshold INTEGER CHECK (threshold IN (80, 100)),
  month INTEGER CHECK (month BETWEEN 1 AND 12),
  year INTEGER CHECK (year >= 2024),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotency partial/unique index preventing duplicate budget alerts per user, category, threshold level, and period
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_idempotent 
  ON public.notifications(user_id, type, month, year, COALESCE(category_id, '00000000-0000-0000-0000-000000000000'::UUID));

-- Index for fetching user notifications by read state
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
