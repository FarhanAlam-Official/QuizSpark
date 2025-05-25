import type { DatabaseAdapter } from './types';
import { jsonAdapter } from './json-adapter';
import { supabaseAdapter } from './supabase-adapter';

type DatabaseMode = 'json' | 'supabase';

const getAdapter = (): DatabaseAdapter => {
  // Always use Supabase in production
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    return supabaseAdapter;
  }

  // In development, use the mode from env or default to json
  const mode = (process.env.DATABASE_MODE || 'json') as DatabaseMode;
  switch (mode) {
    case 'supabase':
      return supabaseAdapter;
    case 'json':
    default:
      return jsonAdapter;
  }
};

// Export the configured database adapter
export const db = getAdapter();

// Export types
export type { DatabaseAdapter, Student, Question } from './types'; 