import type { DatabaseAdapter } from './types';
import { jsonAdapter } from './json-adapter';
import { supabaseAdapter } from './supabase-adapter';

const getAdapter = (): DatabaseAdapter => {
  // Use JSON adapter in development, Supabase in production
  return process.env.NODE_ENV === 'development' 
    ? jsonAdapter 
    : supabaseAdapter;
};

// Export the configured database adapter
export const db = getAdapter();

// Export types
export type { DatabaseAdapter, Student, Question, Task, User } from './types'; 