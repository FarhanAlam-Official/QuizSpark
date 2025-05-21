"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import type { Student } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Shuffle, UserCheck, Users } from "lucide-react"
import { useSound } from "@/components/sound-effects"

interface VisualStudentPickerProps {
  students: Student[]
  excludeIds?: number[]
  onStudentPicked: (student: Student) => void
  onClose?: () => void
}

export function VisualStudentPicker({ students, excludeIds = [], onStudentPicked, onClose }: VisualStudentPickerProps) {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [isSelecting, setIsSelecting] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [displayedStudent, setDisplayedStudent] = useState<Student | null>(null)
  const selectionInterval = useRef<NodeJS.Timeout>()
  const { playSound } = useSound()

  useEffect(() => {
    const filtered = students.filter((student) => !excludeIds.includes(Number(student.id)))
    setAvailableStudents(filtered)
    if (filtered.length > 0) {
      setDisplayedStudent(filtered[0])
    }
  }, [students, excludeIds])

  useEffect(() => {
    if (isSelecting && availableStudents.length > 0) {
      let startTime = Date.now()
      const duration = 3000 // 3 seconds total
      const interval = 100 // Update every 100ms

      selectionInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = elapsed / duration

        // Slow down the updates as we progress
        if (Math.random() < (1 - progress)) {
          const randomStudent = availableStudents[Math.floor(Math.random() * availableStudents.length)]
          setDisplayedStudent(randomStudent)
          playSound("tick")
        }

        if (elapsed >= duration) {
          clearInterval(selectionInterval.current)
          const winner = availableStudents[Math.floor(Math.random() * availableStudents.length)]
          setSelectedStudent(winner)
          setDisplayedStudent(winner)
          setIsSelecting(false)
          playSound("success")

          // Celebration effects
          const colors = ['#FF69B4', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0']
          
          // Multiple bursts in sequence
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              confetti({
                particleCount: 50,
                spread: 80,
                origin: { y: 0.7 },
                colors,
                angle: 60 + i * 30,
                startVelocity: 40 + i * 10
              })
            }, i * 200)
          }
        }
      }, interval)
    }

    return () => {
      if (selectionInterval.current) {
        clearInterval(selectionInterval.current)
      }
    }
  }, [isSelecting, availableStudents, playSound])

  const handleConfirm = () => {
    if (selectedStudent) {
      playSound("click")
      onStudentPicked(selectedStudent)
    }
  }

  const handleRestart = () => {
    playSound("click")
    setIsSelecting(true)
    setSelectedStudent(null)
  }

  if (availableStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
          <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-lg font-medium">No students available to pick</p>
        <Button onClick={onClose}>Close</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Student Picker
        </h3>
        <p className="text-sm text-muted-foreground">
          {isSelecting ? "Selecting a student..." : "Student selected!"}
        </p>
      </div>

      <div className="relative w-full max-w-md">
        <div className="h-[200px] rounded-lg border bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {displayedStudent && (
              <motion.div
                key={isSelecting ? 'selecting-' + displayedStudent.id : 'selected-' + displayedStudent.id}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: isSelecting ? 0.2 : 0.5,
                    ease: isSelecting ? "easeOut" : "spring"
                  }
                }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                className={`w-[80%] p-6 rounded-lg text-center ${
                  !isSelecting 
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 shadow"
                }`}
              >
                <motion.h4 
                  className="text-2xl font-bold mb-2"
                  animate={isSelecting ? {
                    scale: [1, 1.1, 1],
                    transition: { duration: 0.3, repeat: Infinity }
                  } : {}}
                >
                  {displayedStudent.name}
                </motion.h4>
                <p className={`text-sm ${!isSelecting ? "text-white/75" : "text-muted-foreground"}`}>
                  Group {displayedStudent.group}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-4">
        {!isSelecting ? (
          <>
            <Button variant="outline" onClick={handleRestart} className="gap-2">
              <Shuffle className="h-4 w-4" />
              Pick Again
            </Button>
            <Button onClick={handleConfirm} className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <UserCheck className="h-4 w-4" />
              Confirm Selection
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
