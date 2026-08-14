/**
 * Notification Service Module
 * Handles creating, fetching, and marking notifications as read.
 * Enforces precise idempotency rules for budget threshold warnings (80% and 100%).
 */

import { getSupabase } from '../config/supabase.js';

class NotificationService {
  /**
   * Fetch unread/read notifications for current user.
   */
  async getNotifications({ isRead = null, limit = 20 } = {}) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      let query = client
        .from('notifications')
        .select('*')
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
   * Uniqueness key: (user_id, type, month, year, category_id).
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
      if (!user) return;

      const type = `budget_${threshold}`;
      const title = threshold === 100 ? `⚠️ ${categoryName} Exceeded` : `⚠️ ${categoryName} 80% Reached`;
      const message = threshold === 100
        ? `You have exceeded your ${categoryName} budget. Total spent: ₹${spentAmount.toFixed(2)} (${usedPercent.toFixed(1)}%).`
        : `You have used ${usedPercent.toFixed(1)}% of your ${categoryName} budget. Total spent: ₹${spentAmount.toFixed(2)}.`;

      // Insert notification (Partial unique index handles idempotency automatically)
      const { error } = await client
        .from('notifications')
        .insert({
          user_id: user.id,
          budget_id: budgetId,
          category_id: categoryId,
          title,
          message,
          type,
          threshold,
          month,
          year,
          is_read: false
        });

      if (error && error.code !== '23505') { // Ignore unique constraint duplicate error (23505)
        console.error('Error creating notification:', error);
      }
    } catch (err) {
      console.error('Error triggering alert:', err);
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
