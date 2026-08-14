/**
 * Supabase Client Initialization Module
 * 
 * IMPORTANT SECURITY NOTICE:
 * This module uses ONLY the browser-safe public URL and anonymous (anon) key.
 * NEVER paste or import the SUPABASE_SERVICE_ROLE_KEY or database passwords into frontend JavaScript files!
 */

// Default fallback configuration for development
const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://wedlgwispzlycabyveun.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'sb_publishable_4o5wOCznuw82n82zVXGD8w_9QKQDmW7';

let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  // Check if placeholder credentials are still present
  if (SUPABASE_URL.includes('your-supabase-project-id')) {
    console.warn('⚡ SUPABASE NOTICE: Please update SUPABASE_URL and SUPABASE_ANON_KEY in src/js/config/supabase.js with your Supabase credentials.');
  }

  // Check if Supabase SDK is available via CDN window global
  if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabaseClient;
  }

  console.warn('Supabase SDK not yet loaded from CDN. Ensure https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2 script is included in HTML.');
  return null;
}
