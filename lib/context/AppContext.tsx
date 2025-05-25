"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { db, type Student, type Question } from "@/lib/database";

interface AppContextType {
  students: Student[];
  questions: Question[];
  loading: boolean;
  addStudent: (data: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addQuestion: (data: Omit<Question, 'id'>) => Promise<void>;
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsData, questionsData] = await Promise.all([
        db.students.getAll(),
        db.questions.getAll()
      ]);
      
      setStudents(studentsData);
      setQuestions(questionsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const addStudent = async (data: Omit<Student, 'id'>) => {
    try {
      const newStudent = await db.students.create(data);
      setStudents(prev => [...prev, newStudent]);
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const updatedStudent = await db.students.update(id, updates);
      setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
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
      setQuestions(prev => [...prev, newQuestion]);
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  };

  const updateQuestion = async (id: string, updates: Partial<Question>) => {
    try {
      const updatedQuestion = await db.questions.update(id, updates);
      setQuestions(prev => prev.map(q => q.id === id ? updatedQuestion : q));
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

  return (
    <AppContext.Provider value={{
      students,
      questions,
      loading,
      addStudent,
      updateStudent,
      deleteStudent,
      addQuestion,
      updateQuestion,
      deleteQuestion
    }}>
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