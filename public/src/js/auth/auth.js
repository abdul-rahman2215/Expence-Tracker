/**
 * Auth Service Module
 * Handles user signup, login, logout, password reset, session persistence,
 * and client-side page route protection guards.
 */

import { getSupabase } from '../config/supabase.js';

class AuthService {
  constructor() {
    this.supabase = getSupabase();
  }

  /**
   * Register a new user with Supabase Auth.
   * Trigger on auth.users handles public.profiles & public.user_settings creation.
   */
  async register({ email, password, name }) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Authentication service unavailable.');

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      console.error('Registration Error:', err);
      return { success: false, error: this._maskAuthError(err) };
    }
  }

  /**
   * Authenticate existing user with email and password.
   */
  async login({ email, password }) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Authentication service unavailable.');

      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (err) {
      console.error('Login Error:', err);
      return { success: false, error: this._maskAuthError(err) };
    }
  }

  /**
   * Authenticate user via Google OAuth provider.
   * Dynamically resolves redirect URL across LiveServer, local dev, and production.
   */
  async signInWithGoogle() {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Authentication service unavailable.');

      // Resolve relative path to dashboard on ANY environment (LiveServer 5500, local 3000, production)
      const redirectTo = new URL('../dashboard/dashboard.html', window.location.href).href;

      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
      return { success: true, data };
    } catch (err) {
      console.error('Google Auth Error:', err);
      return { success: false, error: this._maskAuthError(err) };
    }
  }

  /**
   * Log out current user and clear local session.
   */
  async logout() {
    try {
      const client = getSupabase();
      if (client) {
        await client.auth.signOut();
      }
      window.location.href = new URL('../auth/login.html', window.location.href).href;
    } catch (err) {
      console.error('Logout Error:', err);
      window.location.href = new URL('../auth/login.html', window.location.href).href;
    }
  }

  /**
   * Send password reset email link.
   */
  async requestPasswordReset(email) {
    try {
      const client = getSupabase();
      if (!client) throw new Error('Authentication service unavailable.');

      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/src/pages/auth/forgot-password.html`
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Password Reset Error:', err);
      return { success: false, error: this._maskAuthError(err) };
    }
  }

  /**
   * Get current authenticated user session.
   */
  async getSession() {
    const client = getSupabase();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  }

  /**
   * Get current authenticated user.
   */
  async getUser() {
    const client = getSupabase();
    if (!client) return null;
    const { data } = await client.auth.getUser();
    return data.user;
  }

  /**
   * Route Guard: Require authentication on protected app pages.
   * Handles OAuth hash parsing race condition seamlessly.
   */
  async requireAuth() {
    const client = getSupabase();
    if (!client) {
      window.location.href = new URL('../auth/login.html', window.location.href).href;
      return null;
    }

    // Handle OAuth Callback Hash Race Condition
    if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token'))) {
      for (let i = 0; i < 20; i++) {
        const { data } = await client.auth.getSession();
        if (data && data.session) {
          // Clean up hash from browser address bar
          history.replaceState(null, document.title, window.location.pathname + window.location.search);
          return data.session.user;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const { data } = await client.auth.getSession();
    if (!data || !data.session) {
      window.location.href = new URL('../auth/login.html', window.location.href).href;
      return null;
    }
    return data.session.user;
  }

  /**
   * Route Guard: Redirect authenticated users away from Auth pages (Login/Register).
   */
  async redirectIfAuthenticated() {
    const client = getSupabase();
    if (!client) return;

    if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token'))) {
      for (let i = 0; i < 20; i++) {
        const { data } = await client.auth.getSession();
        if (data && data.session) {
          window.location.href = new URL('../dashboard/dashboard.html', window.location.href).href;
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const { data } = await client.auth.getSession();
    if (data && data.session) {
      window.location.href = new URL('../dashboard/dashboard.html', window.location.href).href;
    }
  }

  /**
   * Mask raw database/API errors with user-friendly messages.
   */
  _maskAuthError(err) {
    const msg = err.message || '';
    
    // Detect placeholder / unconfigured Supabase credentials
    if (msg.includes('your-supabase-project-id') || msg.includes('Failed to fetch') || msg.includes('invalid claim')) {
      return 'Supabase URL or Key not configured yet. Please update SUPABASE_URL and SUPABASE_ANON_KEY in src/js/config/supabase.js with your Supabase project credentials.';
    }
    
    if (msg.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (msg.includes('User already registered') || msg.includes('already exists')) {
      return 'An account with this email already exists. Please login.';
    }
    if (msg.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (msg.includes('Email not confirmed')) {
      return 'Email not confirmed yet. Please check your email inbox for confirmation or disable Email Confirmation in Supabase Auth settings.';
    }
    
    return msg ? `Authentication error: ${msg}` : 'Authentication failed. Please check your credentials and try again.';
  }
}

export const authService = new AuthService();
