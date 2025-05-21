"use client"

import { useEffect, useState } from "react"
import { type Question, type Student } from "@/lib/api"
import { useApp } from "@/lib/context/AppContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, BookOpen, Trophy, Users, User, BookOpenCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { QuestionCard } from "@/components/question-card"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function QuizPage() {
  const router = useRouter()
  const { students, questions, updateStudent, loading } = useApp()
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [difficulty, setDifficulty] = useState<string>("all")
  const [topic, setTopic] = useState<string>("all")
  const [topics, setTopics] = useState<Array<{ name: string, count: number }>>([])
  const [pickedStudentIds, setPickedStudentIds] = useState<number[]>([])
  const [quizMode, setQuizMode] = useState<"individual" | "group">("individual")
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined)
  const [groups, setGroups] = useState<string[]>([])
  const [groupParticipation, setGroupParticipation] = useState<Record<string, number>>({})
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(5)

  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizResults, setQuizResults] = useState<Array<{ studentId: number | null; correct: boolean }>>([])

  // Add new state for custom question count
  const [customQuestionCount, setCustomQuestionCount] = useState<string>("")
  const [showCustomCount, setShowCustomCount] = useState(false)

  useEffect(() => {
    if (!loading) {
      // Extract unique topics with question counts
      const topicCounts = questions.reduce((acc, q) => {
        acc[q.topic] = (acc[q.topic] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const uniqueTopics = Object.entries(topicCounts).map(([name, count]) => ({
        name,
        count
      })).sort((a, b) => a.name.localeCompare(b.name))

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

    // Randomly select questions based on selectedQuestionCount
    if (filtered.length > selectedQuestionCount) {
      const shuffled = [...filtered].sort(() => Math.random() - 0.5)
      filtered = shuffled.slice(0, selectedQuestionCount)
    }

    setFilteredQuestions(filtered)
  }, [difficulty, topic, questions, selectedQuestionCount])

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

  const handleCustomQuestionCount = (value: string) => {
    const num = parseInt(value)
    if (!isNaN(num) && num > 0) {
      setSelectedQuestionCount(num)
    }
    setCustomQuestionCount(value)
  }

  const handleQuizModeChange = (value: "individual" | "group") => {
    setQuizMode(value)
    setSelectedGroup(undefined)
    setPickedStudentIds([])
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
              <Tabs defaultValue="topics" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="topics" className="flex items-center gap-2">
                    <BookOpenCheck className="h-4 w-4" />
                    Topics & Difficulty
                  </TabsTrigger>
                  <TabsTrigger value="mode" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Quiz Mode
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="topics" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <Label>Topic</Label>
                      <div className="max-h-[200px] overflow-y-auto rounded-lg border p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={topic === "all" ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setTopic("all")}
                          >
                            All Topics
                          </Badge>
                          {topics.map((t) => (
                            <Badge
                              key={t.name}
                              variant={topic === t.name ? "default" : "outline"}
                              className="cursor-pointer whitespace-nowrap"
                              onClick={() => setTopic(t.name)}
                            >
                              {t.name} ({t.count})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Difficulty</Label>
                      <div className="rounded-lg border p-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={difficulty === "all" ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setDifficulty("all")}
                          >
                            All Difficulties
                          </Badge>
                          {["Easy", "Normal", "Hard"].map((d) => (
                            <Badge
                              key={d}
                              variant={difficulty === d ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => setDifficulty(d)}
                            >
                              {d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Number of Questions</Label>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 text-xs text-muted-foreground"
                        onClick={() => setShowCustomCount(!showCustomCount)}
                      >
                        {showCustomCount ? "Show Presets" : "Custom Count"}
                      </Button>
                    </div>
                    {showCustomCount ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={customQuestionCount}
                          onChange={(e) => handleCustomQuestionCount(e.target.value)}
                          placeholder="Enter number of questions"
                          min="1"
                          className="w-full rounded-lg border p-2"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[5, 10, 15, 20, 25, 30, 40, 50].map((count) => (
                          <Badge
                            key={count}
                            variant={selectedQuestionCount === count ? "default" : "outline"}
                            className="cursor-pointer text-center"
                            onClick={() => setSelectedQuestionCount(count)}
                          >
                            {count} Questions
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Alert>
                    <BookOpenCheck className="h-4 w-4" />
                    <AlertTitle>Selected Question Set</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <div>
                        {filteredQuestions.length} questions available from {topic === "all" ? "all topics" : `"${topic}"`} 
                        {difficulty !== "all" ? ` with ${difficulty} difficulty` : ""}
                      </div>
                      {filteredQuestions.length < selectedQuestionCount && (
                        <div className="text-yellow-600 dark:text-yellow-400">
                          Note: Only {filteredQuestions.length} questions available with current filters
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="mode" className="space-y-6">
                  <div className="space-y-4">
                    <Label>Quiz Mode</Label>
                    <RadioGroup
                      value={quizMode}
                      onValueChange={handleQuizModeChange}
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
                    <div className="space-y-4">
                      <Label htmlFor="group">Select Group</Label>
                      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger id="group" className="rounded-xl">
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map((g) => (
                            <SelectItem key={g} value={g}>
                              Group {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

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
              <Button variant="outline" onClick={() => router.push("/leaderboard")} className="gap-2">
                <Trophy className="h-4 w-4" />
                View Leaderboard
              </Button>
              <Button
                onClick={startQuiz}
                disabled={
                  filteredQuestions.length === 0 ||
                  getAvailableStudents().length === 0 ||
                  (quizMode === "group" && selectedGroup === undefined)
                }
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
              >
                Start Quiz with {filteredQuestions.length} Questions
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
