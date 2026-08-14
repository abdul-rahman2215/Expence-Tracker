# Deployment Guide

## 1. Deployment Platforms
- **Primary Hosting**: Vercel (Static Site Deployment)
- **Alternative Hosting**: Firebase Hosting
- **Backend Infrastructure**: Supabase Cloud Project

## 2. Pre-Deployment Checklist
- [ ] Execute all SQL migrations in `supabase/migrations/` on Supabase Production environment.
- [ ] Confirm RLS is enabled on all tables in Supabase SQL editor.
- [ ] Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are configured in `src/js/config/supabase.js` or deployment environment variables.
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is NOT present in any client files.
- [ ] Verify responsive layouts on target devices (Mobile 375px, Tablet 768px, Desktop 1280px+).

## 3. Vercel Deployment Steps
1. Push codebase to GitHub repository.
2. Log into Vercel Dashboard → New Project → Select Repository.
3. Root Directory: `./` (Static Site).
4. Set Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Click **Deploy**.

## 4. Supabase Authentication Domain Authorization
1. Go to Supabase Dashboard → Authentication → URL Configuration.
2. Add production domain (e.g. `https://smart-expense-tracker.vercel.app`) to Site URL and Redirect URLs.
