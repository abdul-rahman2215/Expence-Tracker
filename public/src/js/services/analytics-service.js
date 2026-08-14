/**
 * Analytics & Smart Insights Service Module
 * Computes category breakdowns, monthly comparison metrics, and deterministic rule-based financial insights.
 */

import { getSupabase } from '../config/supabase.js';
import { getCalendarMonthBounds, getPreviousMonthBounds } from '../utils/date-utils.js';
import { formatCurrency } from '../utils/formatters.js';

class AnalyticsService {
  /**
   * Fetch category breakdown and daily spending trends for target period.
   */
  async getAnalyticsData(year, month) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const bounds = getCalendarMonthBounds(year, month);

      const { data: transactions, error } = await client
        .from('transactions')
        .select('*, categories(id, name, type)')
        .gte('transaction_date', bounds.startDate)
        .lte('transaction_date', bounds.endDate)
        .order('transaction_date', { ascending: true });

      if (error) throw error;

      // Category aggregation
      const categoryMap = {};
      let totalIncome = 0;
      let totalExpenses = 0;
      const dailyTrendMap = {};

      (transactions || []).forEach(t => {
        const val = Number(t.amount) || 0;
        if (t.type === 'income') {
          totalIncome += val;
        } else if (t.type === 'expense') {
          totalExpenses += val;
          const catName = t.categories?.name || 'Uncategorized';
          categoryMap[catName] = (categoryMap[catName] || 0) + val;

          dailyTrendMap[t.transaction_date] = (dailyTrendMap[t.transaction_date] || 0) + val;
        }
      });

      const categoryBreakdown = Object.keys(categoryMap).map(name => ({
        name,
        amount: categoryMap[name]
      })).sort((a, b) => b.amount - a.amount);

      const trendData = Object.keys(dailyTrendMap).map(date => ({
        date,
        amount: dailyTrendMap[date]
      }));

      return {
        success: true,
        data: {
          totalIncome,
          totalExpenses,
          categoryBreakdown,
          trendData,
          transactionCount: (transactions || []).length
        }
      };
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      return { success: false, data: null, error: 'Unable to load analytics data.' };
    }
  }

  /**
   * Deterministic Rule-Based Smart Insights Generator.
   * Compares current month vs previous month strictly using actual database records.
   */
  async generateSmartInsights(currentYear, currentMonth) {
    try {
      const insights = [];

      // 1. Fetch current month analytics
      const currentRes = await this.getAnalyticsData(currentYear, currentMonth);
      if (!currentRes.success || !currentRes.data) {
        return ['Add more transactions to see spending insights.'];
      }

      const curr = currentRes.data;

      if (curr.transactionCount < 2) {
        return ['Add more transactions to see spending insights.'];
      }

      // Insight 1: Highest spending category
      if (curr.categoryBreakdown.length > 0) {
        const topCat = curr.categoryBreakdown[0];
        insights.push(`💡 **${topCat.name}** is your highest spending category this month (${formatCurrency(topCat.amount)}).`);
      }

      // Insight 2: Net Savings statement
      const netSavings = curr.totalIncome - curr.totalExpenses;
      if (netSavings > 0) {
        insights.push(`🌱 You saved **${formatCurrency(netSavings)}** this month.`);
      } else if (netSavings < 0) {
        insights.push(`⚠️ Your expenses exceeded your income by **${formatCurrency(Math.abs(netSavings))}** this month.`);
      }

      // Insight 3: Month-over-month comparison
      const prevBounds = getPreviousMonthBounds();
      const prevRes = await this.getAnalyticsData(prevBounds.year, prevBounds.month);

      if (prevRes.success && prevRes.data && prevRes.data.transactionCount > 0) {
        const prevExpenses = prevRes.data.totalExpenses;
        const currExpenses = curr.totalExpenses;

        if (prevExpenses > 0) {
          const diff = currExpenses - prevExpenses;
          const percentChange = Math.abs((diff / prevExpenses) * 100).toFixed(1);

          if (diff > 0) {
            insights.push(`📈 You spent **${percentChange}% more** this month than last month.`);
          } else if (diff < 0) {
            insights.push(`📉 Your expenses decreased by **${percentChange}%** compared with last month.`);
          } else {
            insights.push(`⚖️ Your monthly spending is identical to last month.`);
          }
        }
      }

      return insights.length > 0 ? insights : ['Add more transactions to see spending insights.'];
    } catch (err) {
      console.error('Error generating smart insights:', err);
      return ['Add more transactions to see spending insights.'];
    }
  }
}

export const analyticsService = new AnalyticsService();
