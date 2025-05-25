import { createClient } from '@supabase/supabase-js';
import type { DatabaseAdapter, Student, Question, Task } from './types';

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

export const supabaseAdapter: DatabaseAdapter = {
  students: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('score', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    create: async (data: Omit<Student, 'id'>) => {
      const { data: newStudent, error } = await supabase
        .from('students')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return newStudent;
    },
    update: async (id: string, data: Partial<Student>) => {
      const { data: updatedStudent, error } = await supabase
        .from('students')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedStudent;
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },
  questions: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    create: async (data: Omit<Question, 'id'>) => {
      const { data: newQuestion, error } = await supabase
        .from('questions')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return newQuestion;
    },
    update: async (id: string, data: Partial<Question>) => {
      const { data: updatedQuestion, error } = await supabase
        .from('questions')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedQuestion;
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },
  tasks: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    create: async (data: Omit<Task, 'id'>) => {
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return newTask;
    },
    update: async (id: string, data: Partial<Task>) => {
      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedTask;
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
  },
}; 