'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Student, Question, Task, QuizHistory, studentsApi, questionsApi, tasksApi, quizHistoryApi } from '../api';

interface AppContextType {
  // Data
  students: Student[];
  questions: Question[];
  tasks: Task[];
  quizHistory: QuizHistory[];
  
  // Loading states
  loading: boolean;
  
  // Student operations
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: number, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
  
  // Question operations
  addQuestion: (question: Omit<Question, 'id'>) => Promise<void>;
  updateQuestion: (id: number, data: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: number) => Promise<void>;
  
  // Task operations
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: number, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  
  // Quiz History operations
  addQuizHistory: (history: Omit<QuizHistory, 'id'>) => Promise<void>;
  getStudentHistory: (studentId: number) => Promise<QuizHistory[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, questionsData, tasksData, historyData] = await Promise.all([
          studentsApi.getAll(),
          questionsApi.getAll(),
          tasksApi.getAll(),
          quizHistoryApi.getAll(),
        ]);

        setStudents(studentsData);
        setQuestions(questionsData);
        setTasks(tasksData);
        setQuizHistory(historyData);
      } catch (error) {
        toast.error('Failed to load data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Student operations
  const addStudent = async (student: Omit<Student, 'id'>) => {
    try {
      const newStudent = await studentsApi.create(student);
      setStudents(prev => [...prev, newStudent]);
      toast.success('Student added successfully');
    } catch (error) {
      toast.error('Failed to add student');
      throw error;
    }
  };

  const updateStudent = async (id: number, data: Partial<Student>) => {
    try {
      const updatedStudent = await studentsApi.update(id, data);
      setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
      toast.success('Student updated successfully');
    } catch (error) {
      toast.error('Failed to update student');
      throw error;
    }
  };

  const deleteStudent = async (id: number) => {
    try {
      await studentsApi.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success('Student deleted successfully');
    } catch (error) {
      toast.error('Failed to delete student');
      throw error;
    }
  };

  // Question operations
  const addQuestion = async (question: Omit<Question, 'id'>) => {
    try {
      const newQuestion = await questionsApi.create(question);
      setQuestions(prev => [...prev, newQuestion]);
      toast.success('Question added successfully');
    } catch (error) {
      toast.error('Failed to add question');
      throw error;
    }
  };

  const updateQuestion = async (id: number, data: Partial<Question>) => {
    try {
      const updatedQuestion = await questionsApi.update(id, data);
      setQuestions(prev => prev.map(q => q.id === id ? updatedQuestion : q));
      toast.success('Question updated successfully');
    } catch (error) {
      toast.error('Failed to update question');
      throw error;
    }
  };

  const deleteQuestion = async (id: number) => {
    try {
      await questionsApi.delete(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Question deleted successfully');
    } catch (error) {
      toast.error('Failed to delete question');
      throw error;
    }
  };

  // Task operations
  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      const newTask = await tasksApi.create(task);
      setTasks(prev => [...prev, newTask]);
      toast.success('Task added successfully');
    } catch (error) {
      toast.error('Failed to add task');
      throw error;
    }
  };

  const updateTask = async (id: number, data: Partial<Task>) => {
    try {
      const updatedTask = await tasksApi.update(id, data);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
      throw error;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await tasksApi.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
      throw error;
    }
  };

  // Quiz History operations
  const addQuizHistory = async (history: Omit<QuizHistory, 'id'>) => {
    try {
      const newHistory = await quizHistoryApi.create(history);
      setQuizHistory(prev => [...prev, newHistory]);
      toast.success('Quiz history saved successfully');
    } catch (error) {
      toast.error('Failed to save quiz history');
      throw error;
    }
  };

  const getStudentHistory = async (studentId: number) => {
    try {
      const history = await quizHistoryApi.getByStudent(studentId);
      return history;
    } catch (error) {
      toast.error('Failed to fetch student history');
      throw error;
    }
  };

  const value = {
    students,
    questions,
    tasks,
    quizHistory,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addTask,
    updateTask,
    deleteTask,
    addQuizHistory,
    getStudentHistory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 