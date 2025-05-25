import axios from 'axios';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { DatabaseAdapter, Student, Question, Task, User, AuthAdapter } from './types';
import Cookies from 'js-cookie';

const API_URL = process.env.JSON_SERVER_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
});

// Helper function to get current user from cookie
const getCurrentUser = (): User | null => {
  const auth = Cookies.get('auth');
  if (!auth) return null;
  try {
    return JSON.parse(auth);
  } catch {
    return null;
  }
};

// Helper function to add timestamps and user_id
const addMetadata = <T extends { user_id?: string; created_at?: string }>(data: T): T => {
  const user = getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  
  return {
    ...data,
    user_id: user.id,
    created_at: new Date().toISOString(),
  };
};

// Auth implementation for JSON DB
const authAdapter: AuthAdapter = {
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      id: uuidv4(),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      created_at: new Date().toISOString(),
      password: hashedPassword,
    };

    const response = await api.post('/users', newUser);
    const { password: _, ...userWithoutPassword } = response.data;
    return userWithoutPassword;
  },

  async getUserByEmail(email) {
    const response = await api.get<(User & { password: string })[]>('/users', {
      params: { email },
    });
    
    if (!response.data.length) return null;
    const { password: _, ...userWithoutPassword } = response.data[0];
    return userWithoutPassword;
  },

  async validateUser(email, password) {
    const response = await api.get<(User & { password: string })[]>('/users', {
      params: { email },
    });
    
    if (!response.data.length) return null;
    
    const user = response.data[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) return null;
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};

export const jsonAdapter: DatabaseAdapter = {
  auth: authAdapter,

  students: {
    getAll: async () => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await api.get<Student[]>('/students');
      return response.data.filter(student => student.user_id === user.id);
    },
    getById: async (id: string) => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await api.get<Student>(`/students/${id}`);
      const student = response.data;
      return student.user_id === user.id ? student : null;
    },
    create: async (data: Omit<Student, 'id'>) => {
      const newStudent = addMetadata({
        ...data,
        id: uuidv4(),
      });
      const response = await api.post('/students', newStudent);
      return response.data;
    },
    update: async (id: string, data: Partial<Student>) => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const current = await api.get<Student>(`/students/${id}`);
      if (current.data.user_id !== user.id) {
        throw new Error('Not authorized');
      }

      const response = await api.patch(`/students/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const current = await api.get<Student>(`/students/${id}`);
      if (current.data.user_id !== user.id) {
        throw new Error('Not authorized');
      }

      await api.delete(`/students/${id}`);
    },
  },

  questions: {
    getAll: async () => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await api.get<Question[]>('/questions');
      return response.data.filter(question => question.user_id === user.id);
    },
    getById: async (id: string) => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await api.get<Question>(`/questions/${id}`);
      const question = response.data;
      return question.user_id === user.id ? question : null;
    },
    create: async (data: Omit<Question, 'id'>) => {
      const newQuestion = addMetadata({
        ...data,
        id: uuidv4(),
      });
      const response = await api.post('/questions', newQuestion);
      return response.data;
    },
    update: async (id: string, data: Partial<Question>) => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const current = await api.get<Question>(`/questions/${id}`);
      if (current.data.user_id !== user.id) {
        throw new Error('Not authorized');
      }

      const response = await api.patch(`/questions/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const current = await api.get<Question>(`/questions/${id}`);
      if (current.data.user_id !== user.id) {
        throw new Error('Not authorized');
      }

      await api.delete(`/questions/${id}`);
    },
  },

  tasks: {
    getAll: async () => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await api.get<Task[]>('/tasks');
      return response.data.filter(task => task.user_id === user.id);
    },
    getById: async (id: string) => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await api.get<Task>(`/tasks/${id}`);
      const task = response.data;
      return task.user_id === user.id ? task : null;
    },
    create: async (data: Omit<Task, 'id'>) => {
      const newTask = addMetadata({
        ...data,
        id: uuidv4(),
      });
      const response = await api.post('/tasks', newTask);
      return response.data;
    },
    update: async (id: string, data: Partial<Task>) => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const current = await api.get<Task>(`/tasks/${id}`);
      if (current.data.user_id !== user.id) {
        throw new Error('Not authorized');
      }

      const response = await api.patch(`/tasks/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const current = await api.get<Task>(`/tasks/${id}`);
      if (current.data.user_id !== user.id) {
        throw new Error('Not authorized');
      }

      await api.delete(`/tasks/${id}`);
    },
  },
}; 