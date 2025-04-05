import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    autoRefreshToken: true,
    storageKey: 'habit-lens-auth',
  },
  global: {
    headers: {
      'X-Client-Info': 'habit-lens@0.0.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Add error handling for network issues
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear any cached data
    localStorage.removeItem('habit-lens-auth');
  }
});