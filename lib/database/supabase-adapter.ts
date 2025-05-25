import { createClient } from '@supabase/supabase-js';
import type { DatabaseAdapter, Student, Question, Task, User, AuthAdapter } from './types';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Auth implementation for Supabase
const authAdapter: AuthAdapter = {
  async createUser(userData) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to create user');

    return {
      id: data.user.id,
      email: data.user.email!,
      name: userData.name,
      role: userData.role,
      created_at: data.user.created_at,
    };
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return data;
  },

  async validateUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) return null;

    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata.name,
      role: data.user.user_metadata.role,
      created_at: data.user.created_at,
    };
  },
};

export const supabaseAdapter: DatabaseAdapter = {
  // Add auth methods
  auth: authAdapter,

  // Existing methods
  students: {
    getAll: async () => {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .order('score', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    getById: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    create: async (data: Omit<Student, 'id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newStudent, error } = await supabase
        .from('students')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return newStudent;
    },
    update: async (id: string, data: Partial<Student>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: updatedStudent, error } = await supabase
        .from('students')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedStudent;
    },
    delete: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
  },
  questions: {
    getAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    getById: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    create: async (data: Omit<Question, 'id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newQuestion, error } = await supabase
        .from('questions')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return newQuestion;
    },
    update: async (id: string, data: Partial<Question>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: updatedQuestion, error } = await supabase
        .from('questions')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedQuestion;
    },
    delete: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
  },
  tasks: {
    getAll: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    getById: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    create: async (data: Omit<Task, 'id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return newTask;
    },
    update: async (id: string, data: Partial<Task>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedTask;
    },
    delete: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
  },
}; 