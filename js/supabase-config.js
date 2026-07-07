// js/supabase-config.js

let supabaseClientInstance = null;

/**
 * Initializes and returns the Supabase client if credentials are configured.
 * Otherwise returns null, signaling that the app should run in Demo (localStorage) Mode.
 */
export function getSupabaseClient() {
  if (supabaseClientInstance) return supabaseClientInstance;

  let url = localStorage.getItem('gold_studio_supabase_url');
  const anonKey = localStorage.getItem('gold_studio_supabase_anon_key');

  if (url && anonKey) {
    let cleanUrl = url.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }

    try {
      if (window.supabase) {
        supabaseClientInstance = window.supabase.createClient(cleanUrl, anonKey);
        console.log("Supabase Client initialized successfully with cleaned URL.");
        return supabaseClientInstance;
      } else {
        console.warn("Supabase CDN script is not loaded yet.");
      }
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
    }
  }
  return null;
}

/**
 * Resets the current Supabase client instance.
 * Used when the admin modifies connection credentials.
 */
export function resetSupabaseClient() {
  supabaseClientInstance = null;
}

/**
 * Checks if Supabase client is active.
 */
export function isSupabaseConnected() {
  return getSupabaseClient() !== null;
}
