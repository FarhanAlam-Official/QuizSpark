"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Star, Target, Brain } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

interface StudentPoints {
  id: string
  student_id: string
  points: number
  quiz_count: number
  correct_answers: number
  total_attempts: number
  rank: number
  student: {
    name: string
    email: string
    metadata: Record<string, any>
  }
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<StudentPoints[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadLeaderboard()
    }
  }, [user])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      console.log('Loading leaderboard...')
      const { data, error } = await supabase
        .from('student_points')
        .select(`
          *,
          student:students(
            name,
            email,
            metadata
          )
        `)
        .order('rank', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Leaderboard data:', data)
      setStudents(data as StudentPoints[])
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <Target className="h-6 w-6 text-muted-foreground" />
    }
  }

  const getAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0
    return Math.round((correct / total) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the leaderboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">Student rankings based on quiz performance</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {students.slice(0, 3).map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`overflow-hidden ${index === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/10 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  {getRankIcon(student.rank)}
                  <div>
                    <CardTitle className="text-lg">{student.student.name}</CardTitle>
                    <CardDescription>Rank #{student.rank}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Points</p>
                    <p className="text-2xl font-bold">{student.points}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="text-2xl font-bold">
                      {getAccuracy(student.correct_answers, student.total_attempts)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>Complete ranking of all students</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Quizzes</TableHead>
                <TableHead>Correct Answers</TableHead>
                <TableHead>Accuracy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(student.rank)}
                      <span>#{student.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.student.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {student.points}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Brain className="h-4 w-4 text-blue-500" />
                      {student.quiz_count}
                    </div>
                  </TableCell>
                  <TableCell>{student.correct_answers}</TableCell>
                  <TableCell>
                    <Badge variant={getAccuracy(student.correct_answers, student.total_attempts) >= 70 ? "default" : "secondary"}>
                      {getAccuracy(student.correct_answers, student.total_attempts)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
