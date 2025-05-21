"use client"

import { useEffect, useState } from "react"
import { type Question, type Student } from "@/lib/api"
import { useApp } from "@/lib/context/AppContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, BookOpen, Trophy, Users, User } from "lucide-react"
import { Label } from "@/components/ui/label"
import { QuestionCard } from "@/components/question-card"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function QuizPage() {
  const router = useRouter()
  const { students, questions, updateStudent, loading } = useApp()
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [difficulty, setDifficulty] = useState<string>("all")
  const [topic, setTopic] = useState<string>("all")
  const [topics, setTopics] = useState<string[]>([])
  const [pickedStudentIds, setPickedStudentIds] = useState<number[]>([])
  const [quizMode, setQuizMode] = useState<"individual" | "group">("individual")
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [groups, setGroups] = useState<string[]>([])
  const [groupParticipation, setGroupParticipation] = useState<Record<string, number>>({})

  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizResults, setQuizResults] = useState<Array<{ studentId: number | null; correct: boolean }>>([])

  useEffect(() => {
    if (!loading) {
      setFilteredQuestions(questions)
      // Extract unique topics
      const uniqueTopics = Array.from(new Set(questions.map((q) => q.topic)))
      setTopics(uniqueTopics)
      // Extract unique groups
      const uniqueGroups = Array.from(new Set(students.map((s) => s.group).filter(Boolean)))
      setGroups(uniqueGroups)
    }
  }, [loading, questions, students])

  // Reset picked students when moving to next question in group mode
  useEffect(() => {
    if (quizMode === "group") {
      setPickedStudentIds([])
    }
  }, [currentQuestionIndex, quizMode])

  useEffect(() => {
    // Filter questions based on selected difficulty and topic
    let filtered = [...questions]

    if (difficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty === difficulty)
    }

    if (topic !== "all") {
      filtered = filtered.filter((q) => q.topic === topic)
    }

    setFilteredQuestions(filtered)
  }, [difficulty, topic, questions])

  const startQuiz = () => {
    if (filteredQuestions.length === 0) return

    setQuizStarted(true)
    setCurrentQuestionIndex(0)
    setQuizResults([])
    setPickedStudentIds([])
    setGroupParticipation({})
  }

  const handleAnswer = async (isCorrect: boolean, studentId: number | null) => {
    setQuizResults([...quizResults, { studentId, correct: isCorrect }])

    // Award points if correct and student is selected
    if (isCorrect && studentId) {
      const currentQuestion = filteredQuestions[currentQuestionIndex]
      const points = getPointsForDifficulty(currentQuestion.difficulty)
      const student = students.find(s => s.id === studentId)
      
      if (student) {
        try {
          await updateStudent(studentId, {
            score: student.score + points
          })
          
          // Track group participation if in group mode
          if (quizMode === "group" && student.group) {
            setGroupParticipation(prev => ({
              ...prev,
              [student.group]: (prev[student.group] || 0) + 1
            }))
          }
          
          // In individual mode, add to picked students
          if (quizMode === "individual" && !pickedStudentIds.includes(studentId)) {
            setPickedStudentIds([...pickedStudentIds, studentId])
          }
        } catch (error) {
          console.error('Failed to update student score:', error)
        }
      }
    }
  }

  const getPointsForDifficulty = (difficulty: string): number => {
    switch (difficulty) {
      case "Easy":
        return 1
      case "Normal":
        return 2
      case "Hard":
        return 3
      default:
        return 1
    }
  }

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1)
  }

  const handleEndQuiz = () => {
    setQuizStarted(false)
    // Navigate to leaderboard
    router.push("/leaderboard")
  }

  const getAvailableStudents = () => {
    if (quizMode === "individual") {
      return students.filter(s => !pickedStudentIds.includes(s.id))
    } else {
      // In group mode, get students from selected group
      // Sort by participation count to prioritize students who haven't answered yet
      return students
        .filter(s => s.group === selectedGroup)
        .sort((a, b) => {
          const aParticipation = groupParticipation[a.group || ""] || 0
          const bParticipation = groupParticipation[b.group || ""] || 0
          return aParticipation - bParticipation
        })
    }
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Quiz Session</h1>
        <p className="text-muted-foreground">Conduct a quiz session with your students</p>
      </div>

      {!quizStarted ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b dark:border-gray-700">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Start a New Quiz
              </CardTitle>
              <CardDescription>Select quiz parameters and start a new session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty" className="rounded-xl">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger id="topic" className="rounded-xl">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {topics.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Quiz Mode</Label>
                <RadioGroup
                  value={quizMode}
                  onValueChange={(value: "individual" | "group") => {
                    setQuizMode(value)
                    setSelectedGroup("")
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="individual"
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-4 ${
                      quizMode === "individual"
                        ? "border-primary bg-primary/10"
                        : "hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <RadioGroupItem value="individual" id="individual" className="sr-only" />
                    <User className="h-5 w-5" />
                    <span>Individual Mode</span>
                  </Label>
                  <Label
                    htmlFor="group"
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-4 ${
                      quizMode === "group" ? "border-primary bg-primary/10" : "hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <RadioGroupItem value="group" id="group" className="sr-only" />
                    <Users className="h-5 w-5" />
                    <span>Group Mode</span>
                  </Label>
                </RadioGroup>
              </div>

              {quizMode === "group" && (
                <div className="space-y-2">
                  <Label htmlFor="group">Select Group</Label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger id="group" className="rounded-xl">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="rounded-xl border bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:border-gray-700 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Available Questions:</span>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {filteredQuestions.length}
                  </span>
                </div>
              </div>

              {filteredQuestions.length === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No questions available</AlertTitle>
                  <AlertDescription>Please add questions or change your filter criteria.</AlertDescription>
                </Alert>
              )}

              {getAvailableStudents().length === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No students available</AlertTitle>
                  <AlertDescription>
                    {quizMode === "group" && !selectedGroup
                      ? "Please select a group to start the quiz."
                      : quizMode === "group"
                      ? "No students found in the selected group."
                      : "Please add students before starting a quiz."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6 dark:border-gray-700">
              <Button variant="outline" onClick={() => router.push("/students")} className="gap-2">
                <Trophy className="h-4 w-4" />
                View Leaderboard
              </Button>
              <Button
                onClick={startQuiz}
                disabled={
                  filteredQuestions.length === 0 ||
                  getAvailableStudents().length === 0 ||
                  (quizMode === "group" && !selectedGroup)
                }
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
              >
                Start Quiz
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <QuestionCard
          question={filteredQuestions[currentQuestionIndex]}
          students={getAvailableStudents()}
          pickedStudentIds={pickedStudentIds}
          onAnswer={handleAnswer}
          onNext={handleNextQuestion}
          onEnd={handleEndQuiz}
          isLast={currentQuestionIndex === filteredQuestions.length - 1}
        />
      )}
    </div>
  )
}
