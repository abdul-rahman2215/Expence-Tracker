/**
 * Budget Service Module
 * Handles monthly budget allocation, category caps, spending usage calculations,
 * and triggers idempotent threshold warnings.
 */

import { getSupabase } from '../config/supabase.js';
import { notificationService } from './notification-service.js';
import { getCalendarMonthBounds } from '../utils/date-utils.js';

class BudgetService {
  /**
   * Get overall monthly budget and category allocations for a specific month/year.
   */
  async getBudgetForMonth(month, year) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) throw new Error('User unauthenticated.');

      const { data, error } = await client
        .from('budgets')
        .select('*, budget_categories(*, categories(id, name, type))')
        .eq('user_id', user.id)
        .eq('month', Number(month))
        .eq('year', Number(year))
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, budget: data || null };
    } catch (err) {
      console.error('Error fetching monthly budget:', err);
      return { success: false, budget: null, error: 'Unable to load budget.' };
    }
  }

  /**
   * Upsert monthly budget cap and category allocations.
   */
  async setMonthlyBudget({ month, year, amount, categoryBudgets = [] }) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) throw new Error('User unauthenticated.');

      // 1. Upsert main monthly budget record
      const { data: budgetData, error: budgetError } = await client
        .from('budgets')
        .upsert(
          {
            user_id: user.id,
            month: Number(month),
            year: Number(year),
            amount: Number(amount)
          },
          { onConflict: 'user_id,month,year' }
        )
        .select()
        .single();

      if (budgetError) throw budgetError;

      // 2. Upsert category budget allocations if provided
      if (categoryBudgets.length > 0) {
        const categoryRecords = categoryBudgets.map(cb => ({
          budget_id: budgetData.id,
          category_id: cb.category_id,
          amount: Number(cb.amount)
        }));

        const { error: catError } = await client
          .from('budget_categories')
          .upsert(categoryRecords, { onConflict: 'budget_id,category_id' });

        if (catError) throw catError;
      }

      return { success: true, budget: budgetData };
    } catch (err) {
      console.error('Error setting monthly budget:', err);
      return { success: false, error: 'Unable to save monthly budget.' };
    }
  }

  /**
   * Calculate budget usage vs actual expenses and evaluate idempotent notifications.
   */
  async getBudgetUsage(month, year) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      // 1. Fetch budget definition
      const budgetResult = await this.getBudgetForMonth(month, year);
      const budget = budgetResult.budget;
      const budgetAmount = budget ? Number(budget.amount) : 0;

      // 2. Fetch actual expenses in period
      const bounds = getCalendarMonthBounds(year, month);
      const { data: expenses, error: expError } = await client
        .from('transactions')
        .select('category_id, amount')
        .eq('type', 'expense')
        .gte('transaction_date', bounds.startDate)
        .lte('transaction_date', bounds.endDate);

      if (expError) throw expError;

      let totalSpent = 0;
      const categorySpentMap = {};

      (expenses || []).forEach(e => {
        const val = Number(e.amount) || 0;
        totalSpent += val;
        categorySpentMap[e.category_id] = (categorySpentMap[e.category_id] || 0) + val;
      });

      const remaining = Math.max(0, budgetAmount - totalSpent);
      const usagePercent = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

      // 3. Evaluate idempotent notifications for overall budget
      if (budgetAmount > 0) {
        if (usagePercent >= 100) {
          await notificationService.checkAndTriggerBudgetAlert({
            budgetId: budget?.id,
            categoryName: 'Monthly Budget',
            threshold: 100,
            month,
            year,
            usedPercent: usagePercent,
            spentAmount: totalSpent
          });
        } else if (usagePercent >= 80) {
          await notificationService.checkAndTriggerBudgetAlert({
            budgetId: budget?.id,
            categoryName: 'Monthly Budget',
            threshold: 80,
            month,
            year,
            usedPercent: usagePercent,
            spentAmount: totalSpent
          });
        }
      }

      return {
        success: true,
        usage: {
          budgetAmount,
          totalSpent,
          remaining,
          usagePercent,
          categorySpentMap
        }
      };
    } catch (err) {
      console.error('Error calculating budget usage:', err);
      return {
        success: false,
        usage: { budgetAmount: 0, totalSpent: 0, remaining: 0, usagePercent: 0, categorySpentMap: {} },
        error: 'Unable to calculate budget usage.'
      };
    }
  }
}

export const budgetService = new BudgetService();
