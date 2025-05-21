// Type definitions
export interface Student {
  id: string
  name: string
  score: number
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctIndex: number
  topic: string
  difficulty: "Easy" | "Normal" | "Hard"
}

export interface Task {
  id: string
  title: string
  type: "Verbal" | "Written" | "Numerical"
  assignedTo: string | null
  completed: boolean
}

export interface SessionHistory {
  id: string
  date: string
  studentScores: Array<{ studentId: string; score: number }>
}

// Storage keys
const STORAGE_KEYS = {
  STUDENTS: "classroom-app-students",
  QUESTIONS: "classroom-app-questions",
  TASKS: "classroom-app-tasks",
  SESSION_HISTORY: "classroom-app-session-history",
  PICKED_STUDENTS: "classroom-app-picked-students",
}

// Generic get function
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  const stored = localStorage.getItem(key)
  if (!stored) return defaultValue

  try {
    return JSON.parse(stored) as T
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Generic set function
export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// Students
export function getStudents(): Student[] {
  return getFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, [])
}

export function setStudents(students: Student[]): void {
  setToStorage(STORAGE_KEYS.STUDENTS, students)
}

export function addStudent(name: string): Student {
  const students = getStudents()
  const newStudent: Student = {
    id: crypto.randomUUID(),
    name,
    score: 0,
  }
  setStudents([...students, newStudent])
  return newStudent
}

export function updateStudent(updatedStudent: Student): void {
  const students = getStudents()
  const index = students.findIndex((s) => s.id === updatedStudent.id)
  if (index !== -1) {
    students[index] = updatedStudent
    setStudents(students)
  }
}

export function deleteStudent(id: string): void {
  const students = getStudents()
  setStudents(students.filter((s) => s.id !== id))
}

export function updateStudentScore(id: string, points: number): void {
  const students = getStudents()
  const index = students.findIndex((s) => s.id === id)
  if (index !== -1) {
    students[index].score += points
    setStudents(students)
  }
}

export function resetScores(): void {
  const students = getStudents()
  setStudents(students.map((s) => ({ ...s, score: 0 })))
}

// Questions
export function getQuestions(): Question[] {
  return getFromStorage<Question[]>(STORAGE_KEYS.QUESTIONS, [])
}

export function setQuestions(questions: Question[]): void {
  setToStorage(STORAGE_KEYS.QUESTIONS, questions)
}

export function addQuestion(question: Omit<Question, "id">): Question {
  const questions = getQuestions()
  const newQuestion: Question = {
    ...question,
    id: crypto.randomUUID(),
  }
  setQuestions([...questions, newQuestion])
  return newQuestion
}

export function updateQuestion(updatedQuestion: Question): void {
  const questions = getQuestions()
  const index = questions.findIndex((q) => q.id === updatedQuestion.id)
  if (index !== -1) {
    questions[index] = updatedQuestion
    setQuestions(questions)
  }
}

export function deleteQuestion(id: string): void {
  const questions = getQuestions()
  setQuestions(questions.filter((q) => q.id !== id))
}

// Tasks
export function getTasks(): Task[] {
  return getFromStorage<Task[]>(STORAGE_KEYS.TASKS, [])
}

export function setTasks(tasks: Task[]): void {
  setToStorage(STORAGE_KEYS.TASKS, tasks)
}

export function addTask(task: Omit<Task, "id">): Task {
  const tasks = getTasks()
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
  }
  setTasks([...tasks, newTask])
  return newTask
}

export function updateTask(updatedTask: Task): void {
  const tasks = getTasks()
  const index = tasks.findIndex((t) => t.id === updatedTask.id)
  if (index !== -1) {
    tasks[index] = updatedTask
    setTasks(tasks)
  }
}

export function deleteTask(id: string): void {
  const tasks = getTasks()
  setTasks(tasks.filter((t) => t.id !== id))
}

export function toggleTaskCompletion(id: string): void {
  const tasks = getTasks()
  const index = tasks.findIndex((t) => t.id === id)
  if (index !== -1) {
    tasks[index].completed = !tasks[index].completed
    setTasks(tasks)
  }
}

// Session History
export function getSessionHistory(): SessionHistory[] {
  return getFromStorage<SessionHistory[]>(STORAGE_KEYS.SESSION_HISTORY, [])
}

export function addSessionHistory(studentScores: Array<{ studentId: string; score: number }>): void {
  const history = getSessionHistory()
  const newSession: SessionHistory = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    studentScores,
  }
  setToStorage(STORAGE_KEYS.SESSION_HISTORY, [...history, newSession])
}

export function clearSessionHistory(): void {
  setToStorage(STORAGE_KEYS.SESSION_HISTORY, [])
}

// Student Picker
export function getPickedStudents(): string[] {
  return getFromStorage<string[]>(STORAGE_KEYS.PICKED_STUDENTS, [])
}

export function addPickedStudent(studentId: string): void {
  const pickedStudents = getPickedStudents()
  setToStorage(STORAGE_KEYS.PICKED_STUDENTS, [...pickedStudents, studentId])
}

export function resetPickedStudents(): void {
  setToStorage(STORAGE_KEYS.PICKED_STUDENTS, [])
}
