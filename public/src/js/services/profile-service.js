/**
 * Profile & Settings Service Module
 * Handles loading and updating user profiles, application settings, and secure account deletion.
 */

import { getSupabase } from '../config/supabase.js';

class ProfileService {
  /**
   * Fetch current authenticated user profile record.
   */
  async getProfile() {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) throw new Error('User unauthenticated.');

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return { success: true, profile: data };
    } catch (err) {
      console.error('Error fetching profile:', err);
      return { success: false, profile: null, error: 'Unable to load profile.' };
    }
  }

  /**
   * Update profile information (Name, Currency).
   */
  async updateProfile({ name, currency }) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) throw new Error('User unauthenticated.');

      const { data, error } = await client
        .from('profiles')
        .update({
          name: name.trim(),
          currency: currency || 'INR'
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, profile: data };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, error: 'Unable to update profile.' };
    }
  }

  /**
   * Fetch user settings preferences.
   */
  async getUserSettings() {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) throw new Error('User unauthenticated.');

      const { data, error } = await client
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, settings: data };
    } catch (err) {
      console.error('Error fetching user settings:', err);
      return { success: false, settings: null, error: 'Unable to load settings.' };
    }
  }

  /**
   * Update application user settings preferences.
   */
  async updateUserSettings({ theme, currency, notifications_enabled }) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) throw new Error('User unauthenticated.');

      const { data, error } = await client
        .from('user_settings')
        .upsert(
          {
            user_id: user.id,
            theme: theme || 'light',
            currency: currency || 'INR',
            notifications_enabled: notifications_enabled ?? true
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return { success: true, settings: data };
    } catch (err) {
      console.error('Error updating settings:', err);
      return { success: false, error: 'Unable to update settings.' };
    }
  }

  /**
   * Secure Account Deletion.
   * Deletes profile and cascading user data.
   */
  async deleteAccount() {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) throw new Error('User unauthenticated.');

      // Delete user profile record (Cascades to all user tables)
      const { error } = await client
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      // Sign out from Supabase Auth
      await client.auth.signOut();
      window.location.href = '/src/pages/auth/register.html';
      return { success: true };
    } catch (err) {
      console.error('Account Deletion Error:', err);
      return { success: false, error: 'Unable to delete account. Please try again.' };
    }
  }
}

export const profileService = new ProfileService();
