// js/supabase-config.js
// ============================================================
// ✏️  PERMANENT CONNECTION — Edit the two lines below once,
//     then redeploy to Vercel. Credentials will work globally
//     on every browser and device automatically.
// ============================================================
const DEFAULT_SUPABASE_URL     = 'https://fegtyzdzzcxixvmpnmrf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZ3R5emR6emN4aXh2bXBubXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjYxNDcsImV4cCI6MjA5OTAwMjE0N30.RVGrsZfSu_FsJWm3II3LiexgbGZSsntvbbF6JyMMOw8';
// ============================================================
// (No further changes needed below this line)
// ============================================================

let supabaseClientInstance = null;

/**
 * Returns the active Supabase URL.
 * Priority: localStorage override → hardcoded default.
 */
function resolveCredentials() {
  // Allow admin-panel overrides stored in localStorage
  const lsUrl  = localStorage.getItem('gold_studio_supabase_url');
  const lsKey  = localStorage.getItem('gold_studio_supabase_anon_key');

  const url    = (lsUrl  && lsUrl.trim())  || DEFAULT_SUPABASE_URL;
  const key    = (lsKey  && lsKey.trim())  || DEFAULT_SUPABASE_ANON_KEY;

  return { url, key };
}

/**
 * Initializes and returns the Supabase client.
 * Falls back to Demo (localStorage) Mode if credentials are not set.
 */
export function getSupabaseClient() {
  if (supabaseClientInstance) return supabaseClientInstance;

  const { url, key } = resolveCredentials();

  // Guard: still contains placeholder text
  if (!url || url === 'YOUR_SUPABASE_URL_HERE' || !key || key === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    return null; // Demo Mode
  }

  let cleanUrl = url.trim();
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }

  try {
    if (window.supabase) {
      supabaseClientInstance = window.supabase.createClient(cleanUrl, key);
      console.log('✅ Supabase connected permanently using hardcoded credentials.');
      return supabaseClientInstance;
    } else {
      console.warn('⚠️ Supabase CDN script not loaded yet.');
    }
  } catch (e) {
    console.error('❌ Failed to initialize Supabase client:', e);
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
