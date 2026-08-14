/**
 * Category Service Module
 * Handles fetching system default categories and user custom categories.
 * Enforces safe deletion protection (prevents deletion if linked transactions exist).
 */

import { getSupabase } from '../config/supabase.js';

class CategoryService {
  /**
   * Fetch all categories accessible to the current user (System + Custom).
   * @param {string} type - 'income' or 'expense'
   */
  async getCategories(type = null) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      let query = client.from('categories').select('*').order('name', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, categories: data || [] };
    } catch (err) {
      console.error('Error fetching categories:', err);
      return { success: false, categories: [], error: 'Unable to load categories.' };
    }
  }

  /**
   * Create a custom user category.
   */
  async createCustomCategory({ name, type }) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) throw new Error('User unauthenticated.');

      const { data, error } = await client
        .from('categories')
        .insert({
          user_id: user.id,
          name: name.trim(),
          type,
          is_system: false
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, category: data };
    } catch (err) {
      console.error('Error creating custom category:', err);
      return { success: false, error: 'Unable to create custom category.' };
    }
  }

  /**
   * Safe Category Deletion:
   * Rejects deletion if linked transactions exist for this category.
   */
  async deleteCustomCategory(categoryId) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      // Check if transactions exist using this category
      const { count, error: countError } = await client
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', categoryId);

      if (countError) throw countError;

      if (count && count > 0) {
        return {
          success: false,
          error: `Cannot delete category because ${count} transaction(s) are assigned to it.`
        };
      }

      // Perform deletion
      const { error: deleteError } = await client
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('is_system', false); // Only custom categories can be deleted

      if (deleteError) throw deleteError;
      return { success: true };
    } catch (err) {
      console.error('Error deleting category:', err);
      return { success: false, error: 'Unable to delete category.' };
    }
  }
}

export const categoryService = new CategoryService();
