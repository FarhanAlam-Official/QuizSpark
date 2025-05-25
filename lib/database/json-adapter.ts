import axios from 'axios';
import type { DatabaseAdapter, Student, Question } from './types';

const API_BASE_URL = process.env.JSON_SERVER_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const jsonAdapter: DatabaseAdapter = {
  students: {
    getAll: async () => {
      const response = await api.get<Student[]>('/students');
      return response.data;
    },
    getById: async (id: string) => {
      const response = await api.get<Student>(`/students/${id}`);
      return response.data;
    },
    create: async (data: Omit<Student, 'id'>) => {
      const response = await api.post<Student>('/students', data);
      return response.data;
    },
    update: async (id: string, data: Partial<Student>) => {
      const response = await api.patch<Student>(`/students/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await api.delete(`/students/${id}`);
    },
  },
  questions: {
    getAll: async () => {
      const response = await api.get<Question[]>('/questions');
      return response.data;
    },
    getById: async (id: string) => {
      const response = await api.get<Question>(`/questions/${id}`);
      return response.data;
    },
    create: async (data: Omit<Question, 'id'>) => {
      const response = await api.post<Question>('/questions', data);
      return response.data;
    },
    update: async (id: string, data: Partial<Question>) => {
      const response = await api.patch<Question>(`/questions/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await api.delete(`/questions/${id}`);
    },
  },
}; 