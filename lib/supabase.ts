import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Helper types for your database tables
export type UserRole = 'admin' | 'teacher' | 'student' | 'user'
export type AuthProvider = 'email' | 'google' | 'github' | 'microsoft'

export type User = {
  id: string
  email: string
  name: string | null
  role: UserRole
  avatar_url: string | null
  bio: string | null
  preferences: Record<string, any>
  last_login_at: string | null
  login_count: number
  is_email_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Student = {
  id: string
  user_id: string
  name: string
  email: string | null
  group_name: string | null
  score: number
  participation: number
  metadata: Record<string, any>
  last_active_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export type Question = {
  id: string
  user_id: string
  question: string
  options: Record<string, any>
  correct_option: number
  topic: string
  difficulty: string
  tags: string[]
  explanation: string | null
  time_limit: number | null
  points: number
  metadata: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  completed_at: string | null
  assigned_to: string | null
  metadata: Record<string, any>
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export type QuizAttempt = {
  id: string
  user_id: string
  question_id: string
  selected_option: number | null
  is_correct: boolean | null
  time_taken: number | null
  points_earned: number
  metadata: Record<string, any>
  created_at: string
}

// Database helper functions
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) throw error
  return data
}

export async function getStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('score', { ascending: false })
  
  if (error) throw error
  return data
}

export async function updateStudent(id: string, updates: Partial<Student>) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('is_active', true)
  
  if (error) throw error
  return data
}

export async function createQuestion(question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('questions')
    .insert(question)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getTasks(includeCompleted = false) {
  const query = supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
  
  if (!includeCompleted) {
    query.neq('status', 'completed')
  }

  const { data, error } = await query.order('due_date', { ascending: true })
  
  if (error) throw error
  return data
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function submitQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert(attempt)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getQuizAttempts(userId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
} 