export interface Student {
  id: string;
  name: string;
  group: string;
  score: number;
  user_id: string;
  created_at?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_option: number;
  topic: string;
  difficulty: string;
  user_id: string;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: "Verbal" | "Written" | "Numerical";
  assignedTo: string | null;
  assignedGroup: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  completed: boolean;
  user_id: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
}

export interface AuthAdapter {
  createUser: (userData: { email: string; password: string; name: string; role: User['role'] }) => Promise<User>;
  getUserByEmail: (email: string) => Promise<User | null>;
  validateUser: (email: string, password: string) => Promise<User | null>;
}

export interface DatabaseAdapter {
  // Auth methods
  auth: AuthAdapter;
  
  // Existing methods
  students: {
    getAll: () => Promise<Student[]>;
    getById: (id: string) => Promise<Student | null>;
    create: (data: Omit<Student, 'id'>) => Promise<Student>;
    update: (id: string, data: Partial<Student>) => Promise<Student>;
    delete: (id: string) => Promise<void>;
  };
  questions: {
    getAll: () => Promise<Question[]>;
    getById: (id: string) => Promise<Question | null>;
    create: (data: Omit<Question, 'id'>) => Promise<Question>;
    update: (id: string, data: Partial<Question>) => Promise<Question>;
    delete: (id: string) => Promise<void>;
  };
  tasks: {
    getAll: () => Promise<Task[]>;
    getById: (id: string) => Promise<Task | null>;
    create: (data: Omit<Task, 'id'>) => Promise<Task>;
    update: (id: string, data: Partial<Task>) => Promise<Task>;
    delete: (id: string) => Promise<void>;
  };
} 