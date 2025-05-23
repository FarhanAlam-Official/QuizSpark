"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import type { Question, Student } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, UserPlus, Users } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { VisualStudentPicker } from "@/components/visual-student-picker"
import { useSound } from "@/components/sound-effects"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface QuestionCardProps {
  question: Question
  students: Student[]
  pickedStudentIds: number[]
  onAnswer: (isCorrect: boolean, studentId: number | null) => void
  onNext: () => void
  onEnd: () => void
  isLast: boolean
  currentQuestionIndex: number
  totalQuestions: number
  currentGroup?: string | null
  isGroupMode?: boolean
  onPassTurn?: () => void
}

export function QuestionCard({
  question,
  students,
  pickedStudentIds,
  onAnswer,
  onNext,
  onEnd,
  isLast,
  currentQuestionIndex,
  totalQuestions,
  currentGroup,
  isGroupMode,
  onPassTurn,
}: QuestionCardProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [initialTime, setInitialTime] = useState(30)
  const [timerActive, setTimerActive] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showStudentPicker, setShowStudentPicker] = useState(false)
  const { playSound } = useSound()
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [isPaused, setIsPaused] = useState(false)
  const [submittedAnswer, setSubmittedAnswer] = useState(false)

  const handleTimeUp = () => {
    setTimerActive(false)
    setShowResult(true)
    setIsCorrect(false)
    setSelectedOption(null)
    playSound("fail")
  }

  const getRandomStudent = useCallback(() => {
    const unpickedStudents = students.filter((s) => !pickedStudentIds.includes(s.id.toString()))
    const availableStudents = unpickedStudents.length > 0 ? unpickedStudents : students
    return availableStudents[Math.floor(Math.random() * availableStudents.length)]
  }, [students, pickedStudentIds])

  const startStudentSelection = () => {
    setShowCountdown(true)
    setCountdown(3)
    playSound("click")
  }

  useEffect(() => {
    let timer: NodeJS.Timeout

    const cleanup = () => {
      if (timer) clearTimeout(timer)
    }

    if (timerActive && timeLeft > 0 && !showResult && !isPaused) {
      timer = setTimeout(() => {
        if (timeLeft === 1) {
          handleTimeUp()
        } else {
          setTimeLeft((prev) => prev - 1)
        }
      }, 1000)
    }

    return cleanup
  }, [timeLeft, timerActive, showResult, isPaused, handleTimeUp])

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
        playSound("click")
      }, 1000)
      return () => clearTimeout(timer)
    } else if (showCountdown && countdown === 0) {
      setShowCountdown(false)
      setIsSelecting(true)
      const selectionDuration = 2000
      const intervalTime = 100
      const startTime = Date.now()

      const interval = setInterval(() => {
        const currentTime = Date.now()
        const elapsed = currentTime - startTime

        if (elapsed >= selectionDuration) {
          clearInterval(interval)
          setIsSelecting(false)
          const selected = getRandomStudent()
          setSelectedStudent(selected)
          playSound("complete")
        } else {
          setSelectedStudent(getRandomStudent())
          playSound("click")
        }
      }, intervalTime)

      return () => clearInterval(interval)
    }
  }, [showCountdown, countdown, getRandomStudent, playSound])

  useEffect(() => {
    if (selectedStudent && !showResult) {
      setTimerActive(true)
      setTimeLeft(initialTime)
      setIsPaused(false)
    } else {
      setTimerActive(false)
    }
  }, [selectedStudent, showResult, initialTime])

  useEffect(() => {
    return () => {
      setTimerActive(false)
      setTimeLeft(initialTime)
    }
  }, [initialTime])

  useEffect(() => {
    if (showResult) {
      setTimerActive(false)
    }
  }, [showResult])

  useEffect(() => {
    if (isPaused) {
      setTimerActive(false)
    }
  }, [isPaused])

  const handlePauseResume = () => {
    if (isPaused) {
      // Resuming
      setIsPaused(false)
      setTimerActive(true)
    } else {
      // Pausing
      setIsPaused(true)
      setTimerActive(false)
    }
  }

  const handleAddTime = () => {
    if (timerActive && !showResult) {
      setTimeLeft(prev => prev + 60)
      playSound("click")
    }
  }

  const handleSetCustomTime = (seconds: number) => {
    if (!timerActive || selectedStudent === null) {
      setInitialTime(seconds)
      setTimeLeft(seconds)
      playSound("click")
    }
  }

  const handleSubmitAnswer = useCallback(async () => {
    if (selectedOption !== null && selectedStudent) {
      setTimerActive(false)
      const isCorrect = selectedOption === question.correctOption
      setIsCorrect(isCorrect)
      setSubmittedAnswer(true)

      if (isCorrect) {
        playSound("correct")
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      } else {
        playSound("incorrect")
      }

      setShowResult(true)
      await onAnswer(isCorrect, selectedStudent.id.toString())
    }
  }, [selectedOption, selectedStudent, question.correctOption, playSound, onAnswer])

  const handleOptionSelect = (optionIndex: number) => {
    if (showResult || !selectedStudent || timeLeft === 0 || !timerActive) return
    setSelectedOption(optionIndex)
  }

  const handlePassTurn = () => {
    if (onPassTurn) {
      setSelectedStudent(null)
      setSelectedOption(null)
      setTimeLeft(initialTime)
      setTimerActive(false)
      onPassTurn()
    }
  }

  const handleNext = () => {
    setSelectedStudent(null)
    setSelectedOption(null)
    setShowResult(false)
    if (isLast) {
      playSound("complete")
      onEnd()
    } else {
      onNext()
    }
  }

  const handlePickStudent = () => {
    setShowStudentPicker(true)
    playSound("click")
  }

  const handleStudentPicked = (student: Student) => {
    setSelectedStudent(student)
    setShowStudentPicker(false)
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-gradient-to-r from-green-400 to-green-500"
      case "Normal":
        return "bg-gradient-to-r from-amber-400 to-amber-500"
      case "Hard":
        return "bg-gradient-to-r from-red-400 to-red-500"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500"
    }
  }

  const getProgressColor = (value: number) => {
    if (value > 66) return "bg-green-500"
    if (value > 33) return "bg-amber-500"
    return "bg-red-500"
  }

  const handleEndQuiz = () => {
    playSound("complete")
    onEnd()
  }

  // Reset submittedAnswer when question changes
  useEffect(() => {
    setSubmittedAnswer(false)
  }, [question])

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
              {isGroupMode && currentGroup && (
                <Badge variant="secondary">Current Turn: Group {currentGroup}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{question.topic}</Badge>
              <Badge variant="secondary">Question {currentQuestionIndex + 1} of {totalQuestions}</Badge>
            </div>
          </div>
          <CardTitle className="mt-2">{question.question}</CardTitle>
          <CardDescription>
            {isGroupMode 
              ? `Group ${currentGroup}: Select a student to answer this question`
              : "Select a student to answer this question"
            }
          </CardDescription>
          {selectedStudent && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Time Remaining:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{formatTime(timeLeft)}</span>
                  {!showResult && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePauseResume}
                        className="h-8 px-2"
                      >
                        {isPaused ? "Resume" : "Pause"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddTime}
                        className="h-8 px-2"
                      >
                        +1 Min
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Progress value={(timeLeft / initialTime) * 100} className={getProgressColor((timeLeft / initialTime) * 100)} />
              {!selectedStudent && (
                <div className="flex justify-center gap-2 mt-2">
                  {[30, 60, 120].map((seconds) => (
                    <Button
                      key={seconds}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetCustomTime(seconds)}
                      className={`h-8 px-2 ${initialTime === seconds ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      {formatTime(seconds)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="relative flex min-h-[100px] items-center justify-center rounded-xl border bg-gradient-to-r from-indigo-50 to-purple-50 p-6 dark:border-gray-700 dark:from-indigo-900/20 dark:to-purple-900/20">
            <AnimatePresence mode="wait">
              {!selectedStudent && !isSelecting && !showCountdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button onClick={handlePickStudent} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Pick Student
                  </Button>
                </motion.div>
              )}

              {showCountdown && (
                <motion.div
                  key="countdown"
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-6xl font-bold text-primary"
                >
                  {countdown}
                </motion.div>
              )}

              {isSelecting && (
                <motion.div
                  key="selecting"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="text-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                      }}
                      className="text-2xl font-bold"
                    >
                      {selectedStudent?.name}
                    </motion.div>
                    <div className="absolute inset-0 -z-10 opacity-10 blur-lg">
                      {students.map((student, index) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.5 }}
                          style={{
                            position: "absolute",
                            top: `${Math.sin(index) * 50}%`,
                            left: `${Math.cos(index) * 50}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          {student.name}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedStudent && !isSelecting && (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-xl font-bold text-white">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div className="text-xl font-bold">{selectedStudent.name}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid gap-4">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={!selectedStudent || timeLeft === 0 || !timerActive || showResult}
                className={`relative flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 ${
                  !showResult && selectedStudent && timeLeft > 0 && timerActive
                    ? selectedOption === index 
                      ? "border-transparent bg-gradient-to-r from-purple-500/20 to-indigo-500/20 shadow-lg shadow-purple-500/10 dark:from-purple-500/30 dark:to-indigo-500/30"
                      : "border-gray-200 bg-white hover:border-transparent hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30"
                    : index === question.correctOption && showResult
                    ? "border-transparent bg-gradient-to-r from-green-500/20 to-emerald-500/20 shadow-lg shadow-green-500/10 dark:from-green-500/30 dark:to-emerald-500/30"
                    : selectedOption === index && showResult
                    ? "border-transparent bg-gradient-to-r from-red-500/20 to-pink-500/20 shadow-lg shadow-red-500/10 dark:from-red-500/30 dark:to-pink-500/30"
                    : "border-gray-200 bg-white/50 dark:border-gray-700 dark:bg-gray-800/50 opacity-50"
                }`}
                whileHover={{ 
                  scale: !showResult && selectedStudent && timeLeft > 0 && timerActive ? 1.02 : 1,
                }}
                whileTap={{ 
                  scale: !showResult && selectedStudent && timeLeft > 0 && timerActive ? 0.98 : 1,
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${
                      !showResult && selectedOption === index
                        ? "bg-purple-500 text-white"
                        : showResult && index === question.correctOption
                        ? "bg-green-500 text-white"
                        : showResult && selectedOption === index
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={`font-medium ${
                      !showResult && selectedOption === index
                        ? "text-purple-700 dark:text-purple-300"
                        : showResult && (index === question.correctOption || selectedOption === index)
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-600 dark:text-gray-300"
                    }`}>{option}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!showResult && selectedOption === index && (
                      <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
                        Selected
                      </div>
                    )}
                    {showResult && (
                      <>
                        {index === question.correctOption && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Correct</span>
                          </div>
                        )}
                        {selectedOption === index && index !== question.correctOption && (
                          <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">Incorrect</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 dark:border-gray-700">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEndQuiz}>
              End Quiz
            </Button>
            {isGroupMode && !showResult && !submittedAnswer && onPassTurn && (
              <Button variant="outline" onClick={handlePassTurn} className="gap-2">
                <Users className="h-4 w-4" />
                Pass to Next Group
              </Button>
            )}
          </div>

          {selectedStudent && !showResult ? (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || !selectedStudent || timeLeft === 0 || !timerActive}
            >
              Submit Answer
            </Button>
          ) : showResult ? (
            <Button onClick={handleNext}>{isLast ? "Finish Quiz" : "Next Question"}</Button>
          ) : null}
        </CardFooter>
      </Card>

      <Dialog open={showStudentPicker} onOpenChange={setShowStudentPicker}>
        <DialogContent className="sm:max-w-md">
          <VisualStudentPicker
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
