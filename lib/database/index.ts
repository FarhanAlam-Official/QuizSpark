import type { DatabaseAdapter } from './types';
import { supabaseAdapter } from './supabase-adapter';

// Export the Supabase adapter directly
export const db = supabaseAdapter;

// Export types
export type { DatabaseAdapter, Student, Question, Task, User } from './types'; 