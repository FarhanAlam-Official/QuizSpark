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
  const [displayedStudents, setDisplayedStudents] = useState<Student[]>([])
  const [slotPosition, setSlotPosition] = useState(0)
  const animationRef = useRef<NodeJS.Timeout>()
  const { playSound } = useSound()

  useEffect(() => {
    // Convert excludeIds to strings for comparison since student IDs are strings
    const excludeIdStrings = excludeIds.map(id => id.toString())
    const filtered = students.filter((student) => !excludeIdStrings.includes(student.id.toString()))
    setAvailableStudents(filtered)
    // Initialize with enough students for the slot effect
    setDisplayedStudents(getRandomStudents(filtered, 20))
  }, [students, excludeIds])

  const getRandomStudents = (studentList: Student[], count: number) => {
    const result = []
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * studentList.length)
      result.push(studentList[randomIndex])
    }
    return result
  }

  useEffect(() => {
    if (isSelecting && availableStudents.length > 0) {
      let startTime = Date.now()
      const duration = 3000 // 3 seconds total
      const interval = 100 // Update every 100ms for smoother animation

      const updateSlot = () => {
        const elapsed = Date.now() - startTime
        const progress = elapsed / duration

        // Update slot position for smooth scrolling
        setSlotPosition(prev => (prev + 1) % 20)
        
        if (elapsed < duration) {
          // Continue scrolling with smoother updates
          setDisplayedStudents(prev => {
            const newList = [...prev]
            // Add 3 new students at a time for smoother transition
            for (let i = 0; i < 3; i++) {
              newList.push(availableStudents[Math.floor(Math.random() * availableStudents.length)])
            }
            // Remove the same number of students from the start
            newList.splice(0, 3)
            return newList
          })
          playSound("select")
          animationRef.current = setTimeout(updateSlot, interval)
        } else {
          // Selection complete
          const winner = availableStudents[Math.floor(Math.random() * availableStudents.length)]
          setSelectedStudent(winner)
          setDisplayedStudents([winner])
          setIsSelecting(false)
          playSound("complete")

          // Celebration effects
          const colors = ['#FF69B4', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0']
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
      }

      animationRef.current = setTimeout(updateSlot, interval)
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
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
    setDisplayedStudents(getRandomStudents(availableStudents, 20))
    setSlotPosition(0)
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
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent z-10" />
        
        <div className="relative h-[300px] overflow-hidden rounded-lg border bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/50 dark:to-purple-950/50">
          <div className="absolute left-0 w-1 h-full bg-gradient-to-r from-indigo-500 to-purple-600 z-20" />
          <div className="absolute right-0 w-1 h-full bg-gradient-to-r from-indigo-500 to-purple-600 z-20" />
          
          <div className="relative h-full flex flex-col items-center justify-center py-4">
            <div className="absolute top-1/2 left-1/2 w-[80%] h-16 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 rounded-lg z-10" />
            
            <AnimatePresence>
              {displayedStudents.map((student, index) => (
                <motion.div
                  key={`${student.id}-${index}-${slotPosition}`}
                  initial={{ 
                    y: 150,
                    opacity: 1
                  }}
                  animate={{ 
                    y: isSelecting ? -150 : 0,
                    opacity: 1
                  }}
                  exit={{ 
                    y: -150,
                    opacity: 1
                  }}
                  transition={{ 
                    y: {
                      type: "tween",
                      duration: isSelecting ? 0.4 : 0.3,
                      ease: "linear"
                    }
                  }}
                  className={`absolute ${
                    !isSelecting
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                      : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                  } p-4 rounded-lg shadow-lg w-[80%] text-center transform transition-all`}
                  style={{
                    top: isSelecting 
                      ? `${150 + (index * 80)}px`
                      : "150px",
                    zIndex: !isSelecting ? 30 : 15
                  }}
                >
                  <div className="font-bold text-lg truncate">{student.name}</div>
                  <div className="text-sm opacity-75">Group {student.group}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
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
