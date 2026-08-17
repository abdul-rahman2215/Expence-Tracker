/**
 * Notification Service Module
 * Handles creating, fetching, and marking notifications as read.
 * Enforces precise idempotency rules for budget threshold warnings (80% and 100%).
 */

import { getSupabase } from '../config/supabase.js';
import { getTodayDateString } from '../utils/date-utils.js';

class NotificationService {
  /**
   * Fetch unread/read notifications for current user.
   */
  async getNotifications({ isRead = null, limit = 50 } = {}) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) throw new Error('User unauthenticated.');

      let query = client
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (isRead !== null) {
        query = query.eq('is_read', isRead);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, notifications: data || [] };
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return { success: false, notifications: [], error: 'Unable to load notifications.' };
    }
  }

  /**
   * Check and trigger idempotent budget warning notification.
   * Schema: (id, user_id, budget_id, category_id, title, message, type, threshold, period, is_read, created_at, updated_at).
   */
  async checkAndTriggerBudgetAlert({
    budgetId = null,
    categoryId = null,
    categoryName = 'Monthly Budget',
    threshold, // 80 or 100
    month,
    year,
    usedPercent,
    spentAmount
  }) {
    try {
      const client = getSupabase();
      if (!client) return;

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) {
        console.warn('[DEBUG Notification] Skipping alert: User unauthenticated.');
        return;
      }

      // 1. Check user notification settings preference
      const { data: settings } = await client
        .from('user_settings')
        .select('notifications_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settings && settings.notifications_enabled === false) {
        console.log('[DEBUG Notification] Skipping alert: Notifications disabled in user_settings.');
        return; // Notifications disabled by user preference
      }

      const thresholdNum = Number(threshold);
      const monthNum = Number(month);
      const yearNum = Number(year);
      const periodStr = `${yearNum}-${String(monthNum).padStart(2, '0')}`;
      const typeStr = `budget_${thresholdNum}`;

      console.log(`[DEBUG Notification] Evaluating alert: user_id=${user.id}, budgetId=${budgetId}, threshold=${thresholdNum}, period=${periodStr}, usedPercent=${usedPercent.toFixed(1)}%`);

      // 2. Duplicate Prevention Check: Check if notification already exists for this user, type, and period
      const { data: existingAlerts, error: checkErr } = await client
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', typeStr)
        .eq('period', periodStr)
        .limit(1);

      if (checkErr) {
        console.error('[DEBUG Notification] Error checking existing alert:', checkErr);
      }

      if (existingAlerts && existingAlerts.length > 0) {
        console.log(`[DEBUG Notification] Skipping alert: Notification for type=${typeStr} and period=${periodStr} already exists.`);
        return; // Idempotent skip: Notification already triggered for this budget period
      }

      const title = thresholdNum === 100 ? `⚠️ ${categoryName} Exceeded` : `⚠️ ${categoryName} 80% Reached`;
      const message = thresholdNum === 100
        ? `You have exceeded your ${categoryName} budget. Total spent: ₹${Number(spentAmount).toFixed(2)} (${Number(usedPercent).toFixed(1)}%).`
        : `You have used ${Number(usedPercent).toFixed(1)}% of your ${categoryName} budget. Total spent: ₹${Number(spentAmount).toFixed(2)}.`;

      // 3. Insert notification matching exact public.notifications schema
      const insertPayload = {
        user_id: user.id,
        budget_id: budgetId || null,
        category_id: categoryId || null,
        title,
        message,
        type: typeStr,
        threshold: thresholdNum,
        period: periodStr,
        is_read: false
      };

      console.log('[DEBUG Notification] Attempting Supabase INSERT:', insertPayload);

      const { data: insertedData, error: insertError } = await client
        .from('notifications')
        .insert(insertPayload)
        .select();

      if (insertError) {
        console.error('[DEBUG Notification] Supabase INSERT ERROR:', insertError);
      } else {
        console.log('[DEBUG Notification] Supabase INSERT SUCCESS:', insertedData);
      }
    } catch (err) {
      console.error('[DEBUG Notification] Unexpected error triggering alert:', err);
    }
  }

  /**
   * Evaluate and trigger daily transaction reminder if user has no transactions today
   * and user settings has notifications_enabled = true.
   * Idempotent per user per calendar day.
   */
  async checkAndTriggerDailyReminder() {
    try {
      const client = getSupabase();
      if (!client) return;

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) return;

      // 1. Check user notification settings preference
      const { data: settings } = await client
        .from('user_settings')
        .select('notifications_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settings && settings.notifications_enabled === false) {
        return; // Notifications disabled by user preference
      }

      const todayStr = getTodayDateString();

      // 2. Check if a daily reminder already exists for today
      const startOfDayISO = `${todayStr}T00:00:00.000Z`;
      const { data: existingReminders, error: checkError } = await client
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'daily_reminder')
        .gte('created_at', startOfDayISO)
        .limit(1);

      if (checkError) throw checkError;

      if (existingReminders && existingReminders.length > 0) {
        return; // Daily reminder already created today
      }

      // 3. Check if user has added any transaction (expense or income) today
      const { data: todayTransactions, error: txError } = await client
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('transaction_date', todayStr)
        .limit(1);

      if (txError) throw txError;

      if (todayTransactions && todayTransactions.length > 0) {
        return; // User has already logged a transaction today
      }

      // 4. Create in-app daily reminder notification
      const { error: insertError } = await client
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Daily Reminder',
          message: "Don't forget to add today's expense or income.",
          type: 'daily_reminder',
          is_read: false
        });

      if (insertError) {
        console.error('Error creating daily reminder:', insertError);
      }
    } catch (err) {
      console.error('Error checking daily reminder:', err);
    }
  }

  /**
   * Mark a notification as read.
   */
  async markAsRead(id) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const { error } = await client
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return { success: false, error: 'Unable to update notification.' };
    }
  }
}

export const notificationService = new NotificationService();
