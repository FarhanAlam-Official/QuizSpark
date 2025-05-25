"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { db, type Student, type Question, type Task } from "@/lib/database";

interface AppContextType {
  students: Student[];
  questions: Question[];
  tasks: Task[];
  loading: boolean;
  addStudent: (data: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addQuestion: (data: Omit<Question, 'id'>) => Promise<void>;
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addTask: (data: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, questionsData, tasksData] = await Promise.all([
        db.students.getAll(),
        db.questions.getAll(),
        db.tasks.getAll()
      ]);
      
      // Ensure we always have arrays, even if empty
      setStudents(studentsData || []);
      setQuestions(questionsData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays on error to prevent undefined
      setStudents([]);
      setQuestions([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (data: Omit<Student, 'id'>) => {
    try {
      const newStudent = await db.students.create(data);
      if (newStudent) {
        setStudents(prev => [...prev, newStudent]);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const updatedStudent = await db.students.update(id, updates);
      if (updatedStudent) {
        setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
      }
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await db.students.delete(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  };

  const addQuestion = async (data: Omit<Question, 'id'>) => {
    try {
      const newQuestion = await db.questions.create(data);
      if (newQuestion) {
        setQuestions(prev => [...prev, newQuestion]);
      }
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  };

  const updateQuestion = async (id: string, updates: Partial<Question>) => {
    try {
      const updatedQuestion = await db.questions.update(id, updates);
      if (updatedQuestion) {
        setQuestions(prev => prev.map(q => q.id === id ? updatedQuestion : q));
      }
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      await db.questions.delete(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  };

  const addTask = async (data: Omit<Task, 'id'>) => {
    try {
      const newTask = await db.tasks.create(data);
      if (newTask) {
        setTasks(prev => [...prev, newTask]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await db.tasks.update(id, updates);
      if (updatedTask) {
        setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await db.tasks.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const value = {
    students,
    questions,
    tasks,
    loading,
    addStudent,
    updateStudent,
    deleteStudent,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addTask,
    updateTask,
    deleteTask
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 