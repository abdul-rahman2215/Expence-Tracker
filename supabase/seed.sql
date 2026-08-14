-- seed.sql
-- Seed script for default system categories and optional initial testing defaults

-- Re-verify system expense categories
INSERT INTO public.categories (id, user_id, name, type, is_system) VALUES
  ('10000000-0000-0000-0000-000000000001', NULL, 'Food', 'expense', TRUE),
  ('10000000-0000-0000-0000-000000000002', NULL, 'Transport', 'expense', TRUE),
  ('10000000-0000-0000-0000-000000000003', NULL, 'Shopping', 'expense', TRUE),
  ('10000000-0000-0000-0000-000000000004', NULL, 'Rent', 'expense', TRUE),
  ('10000000-0000-0000-0000-000000000005', NULL, 'Bills', 'expense', TRUE),
  ('10000000-0000-0000-0000-000000000006', NULL, 'Education', 'expense', TRUE),
  ('10000000-0000-0000-0000-000000000007', NULL, 'Health', 'expense', TRUE),
  ('10000000-0000-0000-0000-000000000008', NULL, 'Entertainment', 'expense', TRUE),
  ('10000000-0000-0000-0000-000000000009', NULL, 'Travel', 'expense', TRUE),
  ('10000000-0000-0000-0000-000000000100', NULL, 'Others', 'expense', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Re-verify system income categories
INSERT INTO public.categories (id, user_id, name, type, is_system) VALUES
  ('20000000-0000-0000-0000-000000000001', NULL, 'Salary', 'income', TRUE),
  ('20000000-0000-0000-0000-000000000002', NULL, 'Freelance', 'income', TRUE),
  ('20000000-0000-0000-0000-000000000003', NULL, 'Investment', 'income', TRUE),
  ('20000000-0000-0000-0000-000000000004', NULL, 'Business', 'income', TRUE),
  ('20000000-0000-0000-0000-000000000005', NULL, 'Allowance', 'income', TRUE),
  ('20000000-0000-0000-0000-000000000006', NULL, 'Gift', 'income', TRUE),
  ('20000000-0000-0000-0000-000000000100', NULL, 'Other Income', 'income', TRUE)
ON CONFLICT (id) DO NOTHING;
