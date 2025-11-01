"use client"

import { useEffect, useState } from "react"
import { type Question, type Student } from "@/lib/supabase"
import { useApp } from "@/lib/context/AppContext"
import { useAuth } from "@/lib/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useSound } from "@/components/sound-effects"
import { Timer, Star, Activity, CheckCircle2, XCircle, Clock, Brain, Users, RotateCcw, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { StudentPicker } from "@/components/student-picker"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function QuizPage() {
  const { user } = useAuth()
  const { questions, loading, students, updateStudent } = useApp()
  const supabase = createClient()

  // Early return if no Supabase client
  if (!supabase) {
    toast.error("Failed to initialize database connection")
    return null
  }

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [confirmedOption, setConfirmedOption] = useState<number | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [sessionScores, setSessionScores] = useState<Record<string, number>>({})
  const [quizStarted, setQuizStarted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const { playSound } = useSound()
  const [showStudentPicker, setShowStudentPicker] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [pickedStudentIds, setPickedStudentIds] = useState<string[]>([])
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set())
  const [globalUsedQuestions, setGlobalUsedQuestions] = useState<Set<string>>(new Set())
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [noQuestionsLeft, setNoQuestionsLeft] = useState(false)

  useEffect(() => {
    if (user && !loading && selectedStudent) {
      loadStudentPoints()
    }
  }, [user, loading, selectedStudent])

  useEffect(() => {
    if (!loading && questions) {
      setTotalQuestions(questions.length)
    }
  }, [loading, questions])

  const loadStudentPoints = async () => {
    if (!user || !selectedStudent) {
      console.log('Missing required data:', { hasUser: !!user, hasStudent: !!selectedStudent })
      return
    }
    
    try {
      console.log('Loading points for student:', selectedStudent.id)

      // First verify the student exists and belongs to the current user
      console.log('Verifying student...', {
        studentId: selectedStudent.id,
        userId: user.id
      })
      
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, name, metadata, user_id')
        .eq('id', selectedStudent.id)
        .eq('user_id', user.id)
        .single()

      console.log('Student verification result:', {
        found: !!students,
        error: studentError,
        studentData: students
      })

      if (studentError) {
        console.error('Error verifying student:', studentError)
        throw new Error('Failed to verify student')
      }

      if (!students) {
        console.error('Student not found or does not belong to current user')
        setScore(0)
        setSessionScores(prev => ({
          ...prev,
          [selectedStudent.id]: 0
        }))
        return
      }

      // Now get the points
      const { data: points, error } = await supabase
        .from('student_points')
        .select('points, quiz_count, correct_answers, total_attempts')
        .eq('student_id', selectedStudent.id)
        .maybeSingle()

      if (error) {
        console.error('Error loading points:', error)
        toast.error("Failed to load student points")
        return
      }

      console.log('Loaded points:', points)
      if (points) {
        setScore(points.points)
        setSessionScores(prev => ({
          ...prev,
          [selectedStudent.id]: points.points
        }))
      } else {
        // Initialize with zero if no points record exists
        setScore(0)
        setSessionScores(prev => ({
          ...prev,
          [selectedStudent.id]: 0
        }))
      }
    } catch (error) {
      console.error('Failed to load points:', error)
      toast.error("Failed to load student points")
    }
  }

  const getNextQuestion = () => {
    const availableQuestions = questions.filter(q => !globalUsedQuestions.has(q.id))
    
    if (availableQuestions.length === 0) {
      setNoQuestionsLeft(true)
      setAnsweredQuestions(questions.length) // Set to total when all are done
      return null
    }
    
    const nextQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
    const newUsedQuestions = new Set([...globalUsedQuestions, nextQuestion.id])
    setGlobalUsedQuestions(newUsedQuestions)
    setAnsweredQuestions(newUsedQuestions.size) // Update count based on used questions
    return nextQuestion
  }

  const startQuiz = () => {
    if (!selectedStudent || !user) {
      toast.error("Please select a student to start the quiz")
      return
    }
    
    const nextQuestion = getNextQuestion()
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion)
      setTimeLeft(nextQuestion.time_limit || 60)
      setIsAnswered(false)
      setSelectedOption(null)
      setConfirmedOption(null)
      setIsConfirming(false)
      setShowExplanation(false)
      setQuizStarted(true)
      setNoQuestionsLeft(false)
      playSound("click")
    }
  }

  const handleNextQuestion = () => {
    const nextQuestion = getNextQuestion()
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion)
      setTimeLeft(nextQuestion.time_limit || 60)
      setIsAnswered(false)
      setSelectedOption(null)
      setConfirmedOption(null)
      setIsConfirming(false)
      setShowExplanation(false)
      playSound("click")
    }
  }

  const resetQuiz = () => {
    setGlobalUsedQuestions(new Set())
    setAnsweredQuestions(0)
    setNoQuestionsLeft(false)
    setCurrentQuestion(null)
    setQuizStarted(false)
    setScore(0)
    setSessionScores({})
    playSound("click")
  }

  const resetPicker = () => {
    setPickedStudentIds([])
    setSelectedStudent(null)
    setQuizStarted(false)
    setScore(0)
    setCurrentQuestion(null)
    setGlobalUsedQuestions(new Set())
    setAnsweredQuestions(0)
    setNoQuestionsLeft(false)
    setSessionScores({})
    playSound("click")
  }

  const handleStudentPicked = async (student: Student) => {
    setSelectedStudent(student)

    // Restore session score if exists
    const studentScore = sessionScores[student.id] || 0
    setScore(studentScore)

    // Add to picked students list if not already there
    if (!pickedStudentIds.includes(student.id)) {
      const newPickedIds = [...pickedStudentIds, student.id]
      setPickedStudentIds(newPickedIds)

      // Increment participation
      try {
        await updateStudent(student.id, {
          participation: (student.participation || 0) + 1,
          metadata: {
            ...student.metadata,
            last_quiz_attempt: new Date().toISOString(),
            quiz_attempts: ((student.metadata?.quiz_attempts || 0) + 1)
          }
        })
      } catch (error) {
        console.error('Error updating student participation:', error)
      }
    }

    setShowStudentPicker(false)
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
    if (!currentQuestion || !user || !selectedStudent) return

    setIsAnswered(true)
    playSound("error")
    toast.error("Time's up!")

    try {
      // Update student points
      await updateStudentPoints(selectedStudent.id, 0, false)
    } catch (error) {
      console.error('Failed to update points:', error)
    }
  }

  const handleOptionSelect = (optionIndex: number) => {
    if (!isAnswered) {
      setSelectedOption(optionIndex)
      setIsConfirming(true)
      playSound("click")
    }
  }

  const handleConfirmAnswer = async () => {
    if (!currentQuestion || !user || !selectedStudent || selectedOption === null) {
      console.log('Missing required data:', { 
        hasQuestion: !!currentQuestion, 
        hasUser: !!user,
        userId: user?.id,
        hasStudent: !!selectedStudent,
        studentId: selectedStudent?.id,
        selectedOption 
      })
      return
    }

    setConfirmedOption(selectedOption)
    setIsConfirming(false)
    setIsAnswered(true)
    
    const isCorrect = selectedOption === currentQuestion.correct_option
    const pointsEarned = isCorrect ? currentQuestion.points || 1 : 0

    try {
      console.log('Current user:', { id: user.id, email: user.email })
      console.log('Selected student:', { id: selectedStudent.id, name: selectedStudent.name })
      console.log('Updating student points...', {
        student_id: selectedStudent.id,
        points_earned: pointsEarned,
        is_correct: isCorrect,
        user_id: user.id
      })

      // First verify the student exists and belongs to the current user
      console.log('Verifying student...', {
        studentId: selectedStudent.id,
        userId: user.id
      })
      
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, name, metadata, user_id')
        .eq('id', selectedStudent.id)
        .eq('user_id', user.id)
        .single()

      console.log('Student verification result:', {
        found: !!students,
        error: studentError,
        studentData: students
      })

      if (studentError) {
        console.error('Error verifying student:', studentError)
        throw new Error('Failed to verify student')
      }

      if (!students) {
        console.error('Student not found or does not belong to current user')
        throw new Error('Student not found')
      }

      const studentData = students
      
      // Get current points data
      const { data: pointsData, error: pointsError } = await supabase
        .from('student_points')
        .select('*')
        .eq('student_id', studentData.id)
        .maybeSingle()

      if (pointsError) {
        console.error('Error fetching points:', pointsError)
        throw new Error('Failed to fetch points')
      }

      // Calculate new values using existing points or starting from 0
      const currentPoints = pointsData?.points || 0
      const currentCorrectAnswers = pointsData?.correct_answers || 0
      const currentTotalAttempts = pointsData?.total_attempts || 0
      const currentQuizCount = pointsData?.quiz_count || 0

      const newPoints = currentPoints + pointsEarned
      const newCorrectAnswers = currentCorrectAnswers + (isCorrect ? 1 : 0)
      const newTotalAttempts = currentTotalAttempts + 1
      const newQuizCount = currentQuizCount + 1

      let updatedPoints
      if (pointsData) {
        // Update existing record
        const { data, error: updateError } = await supabase
          .from('student_points')
          .update({
            points: newPoints,
            quiz_count: newQuizCount,
            correct_answers: newCorrectAnswers,
            total_attempts: newTotalAttempts,
            updated_at: new Date().toISOString()
          })
          .eq('student_id', selectedStudent.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating points:', updateError)
          throw updateError
        }
        updatedPoints = data
        console.log('Points updated successfully:', updatedPoints)
      } else {
        console.log('Creating new points record...')
        const { data, error: insertError } = await supabase
          .from('student_points')
          .insert({
            student_id: selectedStudent.id,
            points: pointsEarned,
            quiz_count: 1,
            correct_answers: isCorrect ? 1 : 0,
            total_attempts: 1,
            metadata: {
              first_quiz_date: new Date().toISOString(),
              last_quiz_date: new Date().toISOString()
            }
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error inserting points:', insertError)
          throw insertError
        }
        updatedPoints = data
        console.log('New points record created:', updatedPoints)
      }

      // Update the score in the UI
      if (updatedPoints) {
        setScore(updatedPoints.points)
        setSessionScores(prev => ({
          ...prev,
          [selectedStudent.id]: updatedPoints.points
        }))
      }

      // Play sound and show toast based on result
      if (isCorrect) {
        console.log('Playing correct sound')
        playSound("correct")
        toast.success("Correct answer!")
      } else {
        console.log('Playing incorrect sound')
        playSound("incorrect")
        toast.error("Incorrect answer!")
      }

      // Update student metadata
      try {
        await updateStudent(selectedStudent.id, {
          metadata: {
            ...studentData.metadata,
            last_quiz_attempt: new Date().toISOString(),
            quiz_attempts: ((studentData.metadata?.quiz_attempts || 0) + 1)
          }
        })
      } catch (error) {
        console.error('Error updating student metadata:', error)
        // Don't throw here as points are already updated
      }

    } catch (error: any) {
      console.error('Failed to update points:', error)
      toast.error(error.message || "Failed to save score")
      playSound("error")
    }
  }

  const getDifficultyColor = (difficulty: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (difficulty) {
      case "easy":
        return "default"
      case "normal":
        return "secondary"
      case "hard":
        return "destructive"
      default:
        return "outline"
    }
  }

  const updateStudentPoints = async (studentId: string, pointsEarned: number, isCorrect: boolean) => {
    if (!user) {
      console.error('No user found in context')
      throw new Error('Not authenticated')
    }

    try {
      console.log('Current user:', { id: user.id, email: user.email })
      console.log('Updating student points...', {
        student_id: studentId,
        points_earned: pointsEarned,
        is_correct: isCorrect,
        user_id: user.id
      })

      // First verify the student exists and belongs to the current user
      console.log('Verifying student...', {
        studentId: studentId,
        userId: user.id
      })
      
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, name, metadata, user_id')
        .eq('id', studentId)
        .eq('user_id', user.id)
        .single()

      console.log('Student verification result:', {
        found: !!students,
        error: studentError,
        studentData: students
      })

      if (studentError) {
        console.error('Error verifying student:', studentError)
        throw new Error('Failed to verify student')
      }

      if (!students) {
        console.error('Student not found in database')
        throw new Error('Student not found')
      }

      const studentData = students
      
      // Get current points data
      const { data: pointsData, error: pointsError } = await supabase
        .from('student_points')
        .select('*')
        .eq('student_id', studentData.id)
        .maybeSingle()

      if (pointsError) {
        console.error('Error fetching points:', pointsError)
        throw new Error('Failed to fetch points')
      }

      // Calculate new values using existing points or starting from 0
      const currentPoints = pointsData?.points || 0
      const currentCorrectAnswers = pointsData?.correct_answers || 0
      const currentTotalAttempts = pointsData?.total_attempts || 0
      const currentQuizCount = pointsData?.quiz_count || 0

      const newPoints = currentPoints + pointsEarned
      const newCorrectAnswers = currentCorrectAnswers + (isCorrect ? 1 : 0)
      const newTotalAttempts = currentTotalAttempts + 1
      const newQuizCount = currentQuizCount + 1

      let updatedPoints
      if (pointsData) {
        // Update existing record
        const { data, error: updateError } = await supabase
          .from('student_points')
          .update({
            points: newPoints,
            quiz_count: newQuizCount,
            correct_answers: newCorrectAnswers,
            total_attempts: newTotalAttempts,
            updated_at: new Date().toISOString()
          })
          .eq('student_id', studentId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating student points:', updateError)
          throw new Error('Failed to update student points')
        }
        updatedPoints = data
      } else {
        // Create new record
        const { data, error: insertError } = await supabase
          .from('student_points')
          .insert({
            student_id: studentId,
            points: pointsEarned,
            quiz_count: 1,
            correct_answers: isCorrect ? 1 : 0,
            total_attempts: 1,
            metadata: {
              first_quiz_date: new Date().toISOString(),
              last_quiz_date: new Date().toISOString()
            }
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating student points:', insertError)
          throw new Error('Failed to create student points')
        }
        updatedPoints = data
      }

      // Update session score
      if (updatedPoints) {
        setScore(updatedPoints.points)
        setSessionScores(prev => ({
          ...prev,
          [studentId]: updatedPoints.points
        }))
      }

      // Play appropriate sound
      if (isCorrect) {
        playSound("correct")
      } else {
        playSound("incorrect")
      }

      return updatedPoints?.points || 0
    } catch (error) {
      console.error('Failed to update points:', error)
      playSound("error")
      throw error
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz</h1>
          <p className="text-muted-foreground">Test your knowledge with random questions</p>
        </div>
        
        <div className="flex items-center gap-4">
          {selectedStudent ? (
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">
                {selectedStudent.name}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetPicker}
                title="Reset student selection"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStudentPicker(true)}
                title="Pick another student"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowStudentPicker(true)}>
              <Users className="h-4 w-4 mr-2" />
              Select Student
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <motion.div 
          className="md:col-span-8"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Question</CardTitle>
                  <CardDescription>
                    {answeredQuestions} of {totalQuestions} questions answered
                  </CardDescription>
                </div>
                {quizStarted && (
                  <Button variant="outline" size="sm" onClick={resetQuiz}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Quiz
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {noQuestionsLeft ? (
                <div className="flex flex-col items-center justify-center space-y-4 p-8">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <h2 className="text-2xl font-bold text-center">All Questions Completed!</h2>
                  <p className="text-center text-muted-foreground">
                    You have answered all {totalQuestions} questions. Reset the quiz to start over.
                  </p>
                  <Button onClick={resetQuiz}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Quiz
                  </Button>
                </div>
              ) : !currentQuestion || !selectedStudent ? (
                <div className="flex flex-col items-center justify-center space-y-4 p-8">
                  <Brain className="h-12 w-12 text-muted-foreground" />
                  <h2 className="text-xl font-semibold text-center">
                    {!selectedStudent 
                      ? "Please select a student to start the quiz"
                      : "Click Start Quiz to begin"}
                  </h2>
                  {selectedStudent && (
                    <Button
                      onClick={startQuiz}
                      className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                    >
                      <Brain className="h-4 w-4" />
                      Start Quiz
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{currentQuestion.topic}</Badge>
                        <Badge variant={getDifficultyColor(currentQuestion.difficulty)}>
                          {currentQuestion.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {currentQuestion.time_limit || 60}s
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Points: {currentQuestion.points || 1}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">{currentQuestion.question}</h3>
                    
                    <div className="grid gap-3">
                      {Object.entries(currentQuestion.options).map(([key, value]) => {
                        const optionNum = parseInt(key)
                        const isSelected = selectedOption === optionNum
                        const isConfirmed = confirmedOption === optionNum
                        const isCorrect = currentQuestion.correct_option === optionNum

                        let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
                        if (isAnswered) {
                          if (isCorrect) variant = "default"
                          else if (isConfirmed) variant = "destructive"
                        } else if (isSelected) {
                          variant = "secondary"
                        }

                        return (
                          <Button
                            key={key}
                            variant={variant}
                            className={`justify-start gap-2 h-auto py-3 px-4 ${
                              isAnswered && isCorrect ? "bg-green-500 hover:bg-green-600 text-white" : ""
                            } ${
                              isAnswered && isConfirmed && !isCorrect ? "bg-red-500 hover:bg-red-600 text-white" : ""
                            }`}
                            onClick={() => !isAnswered && handleOptionSelect(optionNum)}
                            disabled={isAnswered}
                          >
                            <div className="rounded-full border h-6 w-6 flex items-center justify-center shrink-0">
                              {key}
                            </div>
                            <span className="text-left">{value}</span>
                            {isAnswered && isCorrect && (
                              <CheckCircle2 className="h-4 w-4 ml-auto text-white" />
                            )}
                            {isAnswered && isConfirmed && !isCorrect && (
                              <XCircle className="h-4 w-4 ml-auto text-white" />
                            )}
                          </Button>
                        )
                      })}
                    </div>

                    {isConfirming && selectedOption !== null && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedOption(null)
                            setIsConfirming(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          onClick={handleConfirmAnswer}
                        >
                          Confirm Answer
                        </Button>
                      </div>
                    )}

                    {isAnswered && (
                      <div className="space-y-4">
                        <Alert variant={confirmedOption === currentQuestion.correct_option ? "default" : "destructive"}>
                          <div className="flex items-center gap-2">
                            {confirmedOption === currentQuestion.correct_option ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <AlertTitle>
                              {confirmedOption === currentQuestion.correct_option
                                ? "Correct!"
                                : "Incorrect!"}
                            </AlertTitle>
                          </div>
                          <AlertDescription>
                            {currentQuestion.explanation || 
                              (confirmedOption === currentQuestion.correct_option
                                ? "Great job! You got it right."
                                : "The correct answer was option " + currentQuestion.correct_option)}
                          </AlertDescription>
                        </Alert>

                        <div className="flex justify-end">
                          <Button onClick={handleNextQuestion}>
                            Next Question
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="md:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b dark:border-gray-700">
              <CardTitle>Progress</CardTitle>
              <CardDescription>Track quiz performance</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="rounded-xl border p-4 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">Score</h3>
                  </div>
                  <p className="mt-2 text-3xl font-bold">{score} points</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Quiz Progress</h3>
                <div className="rounded-lg border p-4 dark:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Questions Answered</span>
                      <span>{answeredQuestions} / {totalQuestions}</span>
                    </div>
                    <Progress 
                      value={(answeredQuestions / totalQuestions) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Student Picker Dialog */}
      <Dialog open={showStudentPicker} onOpenChange={setShowStudentPicker}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Select a Student</DialogTitle>
          <DialogDescription>
            Choose a student to start the quiz. Each student's performance will be tracked individually.
          </DialogDescription>
          <StudentPicker
            students={students}
            excludeIds={pickedStudentIds}
            onStudentPicked={handleStudentPicked}
            onClose={() => setShowStudentPicker(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
