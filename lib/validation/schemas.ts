import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['admin', 'teacher', 'student', 'user']),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().max(500, 'Bio too long').optional().nullable(),
});

export const createUserSchema = userSchema.omit({ id: true });
export const updateUserSchema = userSchema.partial().omit({ id: true });

// Student schemas
export const studentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1, 'Student name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').optional().nullable(),
  group_name: z.string().max(50, 'Group name too long').optional().nullable(),
  score: z.number().int().min(0, 'Score cannot be negative'),
  participation: z.number().int().min(0, 'Participation cannot be negative'),
  metadata: z.record(z.any()).default({}),
});

export const createStudentSchema = studentSchema.omit({ 
  id: true, 
  user_id: true,
  created_at: true,
  updated_at: true 
});

export const updateStudentSchema = studentSchema.partial().omit({ 
  id: true, 
  user_id: true 
});

// Question schemas
export const questionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  question: z.string().min(1, 'Question is required').max(1000, 'Question too long'),
  options: z.record(z.string()).refine(
    (options) => Object.keys(options).length >= 2,
    'At least 2 options are required'
  ),
  correct_option: z.number().int().min(0, 'Invalid correct option'),
  topic: z.string().min(1, 'Topic is required').max(100, 'Topic too long'),
  difficulty: z.enum(['easy', 'normal', 'hard']),
  tags: z.array(z.string()).default([]),
  explanation: z.string().max(1000, 'Explanation too long').optional().nullable(),
  time_limit: z.number().int().min(10).max(300).optional().nullable(),
  points: z.number().int().min(1).max(10).default(1),
  metadata: z.record(z.any()).default({}),
  is_active: z.boolean().default(true),
});

export const createQuestionSchema = questionSchema.omit({ 
  id: true, 
  user_id: true,
  created_at: true,
  updated_at: true 
});

export const updateQuestionSchema = questionSchema.partial().omit({ 
  id: true, 
  user_id: true 
});

// Task schemas
export const taskSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, 'Task title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  metadata: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
});

export const createTaskSchema = taskSchema.omit({ 
  id: true, 
  user_id: true,
  created_at: true,
  updated_at: true 
});

export const updateTaskSchema = taskSchema.partial().omit({ 
  id: true, 
  user_id: true 
});

// Quiz attempt schemas
export const quizAttemptSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  question_id: z.string().uuid(),
  selected_option: z.number().int().min(0).optional().nullable(),
  is_correct: z.boolean().optional().nullable(),
  time_taken: z.number().int().min(0).optional().nullable(),
  points_earned: z.number().int().min(0).default(0),
  metadata: z.record(z.any()).default({}),
});

export const createQuizAttemptSchema = quizAttemptSchema.omit({ 
  id: true,
  created_at: true 
});

// Bulk import schemas
export const bulkImportStudentsSchema = z.array(
  z.object({
    name: z.string().min(1, 'Student name is required'),
    email: z.string().email().optional(),
    group: z.string().optional(),
  })
);

export const bulkImportQuestionsSchema = z.array(
  z.object({
    question: z.string().min(1, 'Question is required'),
    options: z.array(z.string()).min(2, 'At least 2 options required'),
    correctOption: z.number().int().min(0),
    topic: z.string().min(1, 'Topic is required'),
    difficulty: z.enum(['easy', 'normal', 'hard']),
    explanation: z.string().optional(),
    timeLimit: z.number().int().min(10).max(300).optional(),
    points: z.number().int().min(1).max(10).optional(),
    tags: z.array(z.string()).optional(),
  })
);

// Validation helper functions
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function validateDataSafe<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}