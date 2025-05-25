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
export type Student = {
  id: string
  name: string
  group: string
  score: number
}

export type Question = {
  id: string
  question: string
  options: string[]
  correctOption: number
  topic: string
  difficulty: string
}

export type Quiz = {
  id: string
  title: string
  questions: string[]
  status: string
}

// Database helper functions
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
  
  if (error) throw error
  return data
}

export async function getQuizzes() {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
  
  if (error) throw error
  return data
} 