import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

let client: SupabaseClient<Database> | null = null

export const createClient = () => {
  if (typeof window === 'undefined') {
    return null; // Return null for server-side rendering
  }

  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials are not configured');
    return null;
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'supabase.auth.token',
      storage: window.localStorage,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  });
  return client;
} 