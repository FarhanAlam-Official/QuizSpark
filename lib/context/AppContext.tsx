"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Question, Student, Task } from "@/lib/supabase";
import { useAuth } from "@/lib/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface AppContextType {
  questions: Question[];
  students: Student[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addQuestion: (question: Omit<Question, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateQuestion: (id: string, question: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addStudent: (student: Omit<Student, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchData = async () => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [questionsRes, studentsRes, tasksRes] = await Promise.all([
        supabase.from("questions").select("*").eq("user_id", user.id),
        supabase.from("students").select("*").eq("user_id", user.id),
        supabase.from("tasks").select("*").eq("user_id", user.id),
      ]);

      if (questionsRes.error) throw questionsRes.error;
      if (studentsRes.error) throw studentsRes.error;
      if (tasksRes.error) throw tasksRes.error;

      setQuestions(questionsRes.data);
      setStudents(studentsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, supabase]);

  const addQuestion = async (question: Omit<Question, "id" | "created_at" | "updated_at">) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from("questions")
        .insert({ ...question, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setQuestions((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error adding question:", error);
      throw error;
    }
  };

  const updateQuestion = async (id: string, question: Partial<Question>) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from("questions")
        .update(question)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setQuestions((prev) => prev.map((q) => (q.id === id ? data : q)));
    } catch (error) {
      console.error("Error updating question:", error);
      throw error;
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!user || !supabase) return;

    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  };

  const addStudent = async (student: Omit<Student, "id" | "created_at" | "updated_at">) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from("students")
        .insert({ ...student, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setStudents((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error adding student:", error);
      throw error;
    }
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from("students")
        .update(student)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setStudents((prev) => prev.map((s) => (s.id === id ? data : s)));
    } catch (error) {
      console.error("Error updating student:", error);
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    if (!user || !supabase) return;

    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting student:", error);
      throw error;
    }
  };

  const addTask = async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...task, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .update(task)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    if (!user || !supabase) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        questions,
        students,
        tasks,
        loading,
        error,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addStudent,
        updateStudent,
        deleteStudent,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
} 