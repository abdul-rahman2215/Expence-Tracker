/**
 * Transaction Service Module
 * Encapsulates all CRUD database operations and summary metric calculations for income and expenses.
 */

import { getSupabase } from '../config/supabase.js';
import { validateExpenseInput, validateIncomeInput } from '../utils/validators.js';

class TransactionService {
  /**
   * Fetch paginated transactions with optional filters.
   */
  async getTransactions({
    startDate = null,
    endDate = null,
    categoryId = null,
    type = null,
    paymentMethod = null,
    search = null,
    limit = 50,
    offset = 0
  } = {}) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      let query = client
        .from('transactions')
        .select('*, categories(id, name, type, is_system)', { count: 'exact' })
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (startDate) query = query.gte('transaction_date', startDate);
      if (endDate) query = query.lte('transaction_date', endDate);
      if (categoryId) query = query.eq('category_id', categoryId);
      if (type) query = query.eq('type', type);
      if (paymentMethod) query = query.eq('payment_method', paymentMethod);
      if (search) {
        query = query.or(`description.ilike.%${search}%,notes.ilike.%${search}%`);
      }

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      return {
        success: true,
        transactions: data || [],
        totalCount: count || 0
      };
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return { success: false, transactions: [], totalCount: 0, error: 'Unable to load transactions.' };
    }
  }

  /**
   * Create a new transaction (Income or Expense).
   */
  async createTransaction(transactionData) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) throw new Error('User unauthenticated.');

      // Validation
      const validator = transactionData.type === 'income' ? validateIncomeInput : validateExpenseInput;
      const validation = validator(transactionData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(' ') };
      }

      const record = {
        user_id: user.id,
        category_id: transactionData.category_id,
        type: transactionData.type,
        amount: Number(transactionData.amount),
        payment_method: transactionData.payment_method,
        transaction_date: transactionData.transaction_date,
        transaction_time: transactionData.transaction_time || null,
        description: transactionData.description ? transactionData.description.trim() : null,
        notes: transactionData.notes ? transactionData.notes.trim() : null,
        receipt_url: transactionData.receipt_url || null
      };

      const { data, error } = await client
        .from('transactions')
        .insert(record)
        .select('*, categories(id, name, type)')
        .single();

      if (error) throw error;
      return { success: true, transaction: data };
    } catch (err) {
      console.error('Error creating transaction:', err);
      return { success: false, error: 'Unable to save transaction. Please check your entries.' };
    }
  }

  /**
   * Update an existing transaction.
   */
  async updateTransaction(id, transactionData) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const validator = transactionData.type === 'income' ? validateIncomeInput : validateExpenseInput;
      const validation = validator(transactionData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(' ') };
      }

      const updates = {
        category_id: transactionData.category_id,
        type: transactionData.type,
        amount: Number(transactionData.amount),
        payment_method: transactionData.payment_method,
        transaction_date: transactionData.transaction_date,
        transaction_time: transactionData.transaction_time || null,
        description: transactionData.description ? transactionData.description.trim() : null,
        notes: transactionData.notes ? transactionData.notes.trim() : null,
        receipt_url: transactionData.receipt_url || null
      };

      const { data, error } = await client
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select('*, categories(id, name, type)')
        .single();

      if (error) throw error;
      return { success: true, transaction: data };
    } catch (err) {
      console.error('Error updating transaction:', err);
      return { success: false, error: 'Unable to update transaction.' };
    }
  }

  /**
   * Delete a transaction.
   */
  async deleteTransaction(id) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const { error } = await client
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error deleting transaction:', err);
      return { success: false, error: 'Unable to delete transaction.' };
    }
  }

  /**
   * Calculate summary metrics (Total Income, Total Expense, Balance, Net Savings).
   */
  async getSummaryMetrics({ startDate = null, endDate = null } = {}) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      let query = client.from('transactions').select('type, amount');
      if (startDate) query = query.gte('transaction_date', startDate);
      if (endDate) query = query.lte('transaction_date', endDate);

      const { data, error } = await query;
      if (error) throw error;

      let totalIncome = 0;
      let totalExpenses = 0;

      (data || []).forEach(row => {
        const val = Number(row.amount) || 0;
        if (row.type === 'income') {
          totalIncome += val;
        } else if (row.type === 'expense') {
          totalExpenses += val;
        }
      });

      const balance = totalIncome - totalExpenses;
      const netSavings = totalIncome - totalExpenses;

      return {
        success: true,
        metrics: {
          totalIncome,
          totalExpenses,
          balance,
          netSavings
        }
      };
    } catch (err) {
      console.error('Error calculating summary metrics:', err);
      return {
        success: false,
        metrics: { totalIncome: 0, totalExpenses: 0, balance: 0, netSavings: 0 },
        error: 'Unable to calculate summary metrics.'
      };
    }
  }
}

export const transactionService = new TransactionService();
