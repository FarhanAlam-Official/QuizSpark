"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BarChart3, BookOpen, CheckSquare, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/lib/context/AppContext"

export default function DashboardPage() {
  const { students, questions, tasks, loading } = useApp()
  const [stats, setStats] = useState({
    students: 0,
    questions: 0,
    tasks: 0,
    completedTasks: 0,
  })

  useEffect(() => {
    if (!loading) {
      const completedTasks = tasks.filter((task) => task.completed).length

      setStats({
        students: students.length,
        questions: questions.length,
        tasks: tasks.length,
        completedTasks,
      })
    }
  }, [loading, students, questions, tasks])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Classroom Quiz & Task App</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/students" className="text-primary hover:underline">
                Manage students
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.questions}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/questions" className="text-primary hover:underline">
                Manage questions
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasks - stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/tasks" className="text-primary hover:underline">
                Manage tasks
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">View</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/leaderboard" className="text-primary hover:underline">
                See student scores
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start a new activity</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/quiz">
              <Card className="cursor-pointer hover:bg-muted">
                <CardContent className="flex items-center gap-4 p-4">
                  <CheckSquare className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Start Quiz Session</p>
                    <p className="text-sm text-muted-foreground">Begin a new quiz with students</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/students">
              <Card className="cursor-pointer hover:bg-muted">
                <CardContent className="flex items-center gap-4 p-4">
                  <Users className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Pick Random Student</p>
                    <p className="text-sm text-muted-foreground">Randomly select a student</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/tasks">
              <Card className="cursor-pointer hover:bg-muted">
                <CardContent className="flex items-center gap-4 p-4">
                  <CheckSquare className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Assign New Task</p>
                    <p className="text-sm text-muted-foreground">Create and assign a new task</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>App Information</CardTitle>
            <CardDescription>About this application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This Classroom Quiz & Task App is designed for in-class use during student presentations. It helps
              teachers randomly select students, conduct quizzes, track performance, and assign tasks.
            </p>
            <p>All data is stored in a JSON Server backend for persistence across sessions.</p>
            <p className="text-sm text-muted-foreground">Version 2.0.0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
