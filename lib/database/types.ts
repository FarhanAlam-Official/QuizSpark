export interface Student {
  id: string;
  user_id: string;
  name: string;
  group_name?: string;
  score: number;
  participation: number;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: string;
  user_id: string;
  question: string;
  options: string[];
  correct_option: number;
  topic: string;
  difficulty: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at?: string;
}

export interface AuthAdapter {
  createUser: (userData: { email: string; password: string; name?: string; role: string }) => Promise<User>;
  getUserByEmail: (email: string) => Promise<User | null>;
  validateUser: (email: string, password: string) => Promise<User | null>;
}

export interface DatabaseAdapter {
  // Auth methods
  auth: AuthAdapter;
  
  // Data methods
  students: {
    getAll: () => Promise<Student[]>;
    getById: (id: string) => Promise<Student | null>;
    create: (data: Omit<Student, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Student>;
    update: (id: string, data: Partial<Omit<Student, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<Student>;
    delete: (id: string) => Promise<void>;
  };
  questions: {
    getAll: () => Promise<Question[]>;
    getById: (id: string) => Promise<Question | null>;
    create: (data: Omit<Question, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Question>;
    update: (id: string, data: Partial<Omit<Question, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<Question>;
    delete: (id: string) => Promise<void>;
  };
  tasks: {
    getAll: () => Promise<Task[]>;
    getById: (id: string) => Promise<Task | null>;
    create: (data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Task>;
    update: (id: string, data: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<Task>;
    delete: (id: string) => Promise<void>;
  };
} 