'use client';

import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

// Types
export interface Student {
  id: number;
  name: string;
  group: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctOption: number;
  topic: string;
  difficulty: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: number;
  completed: boolean;
}

export interface QuizHistory {
  id: number;
  studentId: number;
  date: string;
  score: number;
  totalQuestions: number;
  answers: Array<{
    questionId: number;
    selectedOption: number;
    correct: boolean;
  }>;
}

// API Client
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Students API
export const studentsApi = {
  getAll: () => api.get<Student[]>('/students').then(res => res.data),
  getById: (id: number) => api.get<Student>(`/students/${id}`).then(res => res.data),
  create: (data: Omit<Student, 'id'>) => api.post<Student>('/students', data).then(res => res.data),
  update: (id: number, data: Partial<Student>) => api.patch<Student>(`/students/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/students/${id}`).then(res => res.data),
};

// Questions API
export const questionsApi = {
  getAll: () => api.get<Question[]>('/questions').then(res => res.data),
  getById: (id: number) => api.get<Question>(`/questions/${id}`).then(res => res.data),
  create: (data: Omit<Question, 'id'>) => api.post<Question>('/questions', data).then(res => res.data),
  update: (id: number, data: Partial<Question>) => api.patch<Question>(`/questions/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/questions/${id}`).then(res => res.data),
};

// Tasks API
export const tasksApi = {
  getAll: () => api.get<Task[]>('/tasks').then(res => res.data),
  getById: (id: number) => api.get<Task>(`/tasks/${id}`).then(res => res.data),
  create: (data: Omit<Task, 'id'>) => api.post<Task>('/tasks', data).then(res => res.data),
  update: (id: number, data: Partial<Task>) => api.patch<Task>(`/tasks/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/tasks/${id}`).then(res => res.data),
};

// Quiz History API
export const quizHistoryApi = {
  getAll: () => api.get<QuizHistory[]>('/quizHistory').then(res => res.data),
  getByStudent: (studentId: number) => 
    api.get<QuizHistory[]>(`/quizHistory?studentId=${studentId}`).then(res => res.data),
  create: (data: Omit<QuizHistory, 'id'>) => 
    api.post<QuizHistory>('/quizHistory', data).then(res => res.data),
  update: (id: number, data: Partial<QuizHistory>) => 
    api.patch<QuizHistory>(`/quizHistory/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/quizHistory/${id}`).then(res => res.data),
}; 