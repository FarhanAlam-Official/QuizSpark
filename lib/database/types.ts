export interface Student {
  id: string;
  name: string;
  group: string;
  score: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_option: number;
  topic: string;
  difficulty: string;
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
}

export interface DatabaseAdapter {
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