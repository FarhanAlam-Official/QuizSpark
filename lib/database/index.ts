import type { DatabaseAdapter } from './types';
import { jsonAdapter } from './json-adapter';
import { supabaseAdapter } from './supabase-adapter';

type DatabaseMode = 'json' | 'supabase';

const getAdapter = (mode: DatabaseMode = 'json'): DatabaseAdapter => {
  switch (mode) {
    case 'supabase':
      return supabaseAdapter;
    case 'json':
    default:
      return jsonAdapter;
  }
};

// Get the database mode from environment variables
const databaseMode = (process.env.DATABASE_MODE || 'json') as DatabaseMode;

// Export the configured database adapter
export const db = getAdapter(databaseMode);

// Export types
export type { DatabaseAdapter, Student, Question } from './types'; 