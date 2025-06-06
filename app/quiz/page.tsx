"use client"

import { useEffect, useState } from "react"
import { type Question, type QuizAttempt } from "@/lib/supabase"
import { useApp } from "@/lib/context/AppContext"
import { useAuth } from "@/lib/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { useSound } from "@/components/sound-effects"
import { Timer, Star, Activity, CheckCircle2, XCircle, Clock, Brain } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function QuizPage() {
  const { user } = useAuth()
  const { questions, loading } = useApp()
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const { playSound } = useSound()

  useEffect(() => {
    if (user && !loading) {
      // Load user's quiz attempts
      loadAttempts()
    }
  }, [user, loading])

  const loadAttempts = async () => {
    try {
      // In a real app, you would fetch this from your API
      // For now, we'll use mock data
      const mockAttempts: QuizAttempt[] = []
      setAttempts(mockAttempts)
    } catch (error) {
      console.error('Failed to load attempts:', error)
    }
  }

  const startQuiz = () => {
    if (questions.length === 0) return

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
    setCurrentQuestion(randomQuestion)
    setTimeLeft(randomQuestion.time_limit || 60)
    setSelectedOption(null)
    setIsAnswered(false)
    setShowExplanation(false)
    setQuizStarted(true)
    playSound("click")
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (quizStarted && timeLeft > 0 && !isAnswered) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleTimeout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [quizStarted, timeLeft, isAnswered])

  const handleTimeout = async () => {
    if (!currentQuestion || !user) return

    setIsAnswered(true)
    playSound("error")

    try {
      // Record the attempt
      const attempt: Partial<QuizAttempt> = {
        user_id: user.id,
        question_id: currentQuestion.id,
        selected_option: null,
        is_correct: false,
        time_taken: currentQuestion.time_limit || 60,
        points_earned: 0,
        metadata: {
          result: "timeout",
          question_difficulty: currentQuestion.difficulty,
          question_topic: currentQuestion.topic
        }
      }

      // In a real app, you would save this to your database
      console.log('Recording attempt:', attempt)
    } catch (error) {
      console.error('Failed to record attempt:', error)
    }
  }

  const handleAnswer = async (optionIndex: number) => {
    if (!currentQuestion || !user || isAnswered) return

    setSelectedOption(optionIndex)
    setIsAnswered(true)
    const isCorrect = optionIndex === currentQuestion.correct_option
    const timeTaken = (currentQuestion.time_limit || 60) - timeLeft
    const pointsEarned = isCorrect ? currentQuestion.points || 1 : 0

    if (isCorrect) {
      setScore((prev) => prev + pointsEarned)
      playSound("success")
    } else {
      playSound("error")
    }

    try {
      // Record the attempt
      const attempt: Partial<QuizAttempt> = {
        user_id: user.id,
        question_id: currentQuestion.id,
        selected_option: optionIndex,
        is_correct: isCorrect,
        time_taken: timeTaken,
        points_earned: pointsEarned,
        metadata: {
          result: isCorrect ? "correct" : "incorrect",
          question_difficulty: currentQuestion.difficulty,
          question_topic: currentQuestion.topic,
          response_time: timeTaken
        }
      }

      // In a real app, you would save this to your database
      console.log('Recording attempt:', attempt)
    } catch (error) {
      console.error('Failed to record attempt:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-gradient-to-r from-green-400 to-green-500"
      case "normal":
        return "bg-gradient-to-r from-amber-400 to-amber-500"
      case "hard":
        return "bg-gradient-to-r from-red-400 to-red-500"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load the quiz.</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz</h1>
          <p className="text-muted-foreground">Test your knowledge with random questions</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No questions available</AlertTitle>
          <AlertDescription>Add some questions to get started with the quiz.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quiz</h1>
        <p className="text-muted-foreground">Test your knowledge with random questions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Question</CardTitle>
                  <CardDescription>Answer questions to earn points</CardDescription>
                </div>
                <Button
                  onClick={startQuiz}
                  disabled={!questions.length}
                  className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                >
                  <Brain className="h-4 w-4" />
                  {currentQuestion ? "Next Question" : "Start Quiz"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {currentQuestion ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getDifficultyColor(currentQuestion.difficulty)}`}>
                      {currentQuestion.difficulty}
                    </Badge>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{timeLeft}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{currentQuestion.points || 1} points</span>
                      </div>
                    </div>
                  </div>

                  <Progress value={(timeLeft / (currentQuestion.time_limit || 60)) * 100} />

                  <div>
                    <h3 className="mb-4 text-lg font-semibold">{currentQuestion.question}</h3>
                    <div className="space-y-2">
                      {Object.entries(currentQuestion.options).map(([key, value]) => (
                        <Button
                          key={key}
                          variant={selectedOption === parseInt(key) ? "default" : "outline"}
                          className="w-full justify-start gap-2"
                          onClick={() => handleAnswer(parseInt(key))}
                          disabled={isAnswered}
                        >
                          {isAnswered && parseInt(key) === currentQuestion.correct_option && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {isAnswered && parseInt(key) === selectedOption && selectedOption !== currentQuestion.correct_option && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {isAnswered && currentQuestion.explanation && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="w-full"
                      >
                        {showExplanation ? "Hide Explanation" : "Show Explanation"}
                      </Button>
                      {showExplanation && (
                        <div className="mt-2 rounded-lg bg-muted p-4">
                          <p className="text-sm">{currentQuestion.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Click the button above to start answering questions
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b dark:border-gray-700">
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your quiz performance</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl border p-4 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">Score</h3>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{score} points</p>
                </div>
                <div className="rounded-xl border p-4 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Attempts</h3>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{attempts.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Recent Attempts</h3>
                {attempts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Result</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.slice(0, 5).map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell>
                            <Badge
                              className={
                                attempt.is_correct
                                  ? "bg-green-500 text-white"
                                  : "bg-red-500 text-white"
                              }
                            >
                              {attempt.is_correct ? "Correct" : "Incorrect"}
                            </Badge>
                          </TableCell>
                          <TableCell>{attempt.points_earned}</TableCell>
                          <TableCell>{attempt.time_taken}s</TableCell>
                          <TableCell>
                            {format(new Date(attempt.created_at), "MMM d, HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="rounded-lg border p-4 text-center text-muted-foreground dark:border-gray-700">
                    No attempts yet. Start the quiz to track your progress!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
