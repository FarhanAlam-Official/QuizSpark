import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

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

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
} 