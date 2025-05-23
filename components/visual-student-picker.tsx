"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  onClose: () => void
}

export function VisualStudentPicker({ students, excludeIds = [], onStudentPicked, onClose }: VisualStudentPickerProps) {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [isSelecting, setIsSelecting] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [displayedStudents, setDisplayedStudents] = useState<Student[]>([])
  const animationRef = useRef<NodeJS.Timeout>()
  const spinCountRef = useRef(0)
  const { playSound } = useSound()

  const getRandomStudents = useCallback((studentList: Student[], count: number) => {
    const result = []
    const available = [...studentList]
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * available.length)
      result.push(available[randomIndex])
    }
    return result
  }, [])

  // Initialize available students
  useEffect(() => {
    const filtered = students.filter((student) => !excludeIds.includes(student.id))
    setAvailableStudents(filtered)
    setDisplayedStudents(getRandomStudents(filtered, 8))
  }, [students, excludeIds, getRandomStudents])

  // Cleanup function to reset state
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = undefined
    }
  }, [])

  // Animation effect
  useEffect(() => {
    if (isSelecting && availableStudents.length > 0) {
      cleanup()
      let startTime = Date.now()
      const duration = 3500 // Slightly longer duration
      const interval = 150

      const updateSlot = () => {
        const elapsed = Date.now() - startTime
        const progress = elapsed / duration
        
        // Gradually increase the interval as we approach the end
        const currentInterval = interval + (progress * 150)
        
        if (elapsed < duration) {
          setDisplayedStudents(prev => {
            const newList = [...prev]
            newList.shift()
            newList.push(availableStudents[Math.floor(Math.random() * availableStudents.length)])
            return newList
          })
          
          if (elapsed < duration - 500) {
            playSound("select")
          }
          animationRef.current = setTimeout(updateSlot, currentInterval)
        } else {
          cleanup()
          const winner = availableStudents[Math.floor(Math.random() * availableStudents.length)]
          setSelectedStudent(winner)
          setDisplayedStudents([winner])
          setIsSelecting(false)
          playSound("complete")
          
          // Enhanced confetti effect
          const end = Date.now() + 1000
          const colors = ['#FF69B4', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0']
          
          const frame = () => {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.7 },
              colors: colors
            })
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.7 },
              colors: colors
            })
          
            if (Date.now() < end) {
              requestAnimationFrame(frame)
            }
          }
          
          frame()
        }
      }

      animationRef.current = setTimeout(updateSlot, interval)
    }

    return cleanup
  }, [isSelecting, availableStudents, playSound, cleanup])

  const handleRestart = useCallback(() => {
    cleanup()
    spinCountRef.current += 1
    
    // Reset all states
    setSelectedStudent(null)
    setDisplayedStudents(getRandomStudents(availableStudents, 8))
    
    // Use RAF for smoother state update
    requestAnimationFrame(() => {
      setIsSelecting(true)
    })
    
    playSound("click")
  }, [availableStudents, getRandomStudents, cleanup, playSound])

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
        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
          Student Picker
        </h3>
        <p className="text-sm text-muted-foreground">
          {isSelecting ? "Selecting a student..." : "Student selected!"}
        </p>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent z-10" />
        
        <div className="relative h-[300px] overflow-hidden rounded-lg border bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/50 dark:via-purple-950/30 dark:to-pink-950/50">
          <div className="absolute left-0 w-1 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 z-20" />
          <div className="absolute right-0 w-1 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 z-20" />
          
          <div className="relative h-full flex flex-col items-center justify-center">
            <div className="absolute top-1/2 left-1/2 w-[85%] h-20 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-lg z-10 animate-pulse" />
            
            <AnimatePresence mode="popLayout">
              {displayedStudents.map((student, index) => (
                <motion.div
                  key={`${student.id}-${index}-${spinCountRef.current}`}
                  initial={{ 
                    y: 150,
                    opacity: 1,
                    scale: 0.8,
                    rotateX: -30
                  }}
                  animate={{ 
                    y: isSelecting ? -150 : 0,
                    scale: !isSelecting ? 1.05 : 1,
                    rotateX: !isSelecting ? 0 : -5,
                    transition: {
                      scale: { duration: 0.35, ease: "easeOut" },
                      rotateX: { duration: 0.5, ease: "easeOut" }
                    }
                  }}
                  exit={{ 
                    y: -150,
                    scale: 0.8,
                    rotateX: 30,
                    transition: { duration: 0.25, ease: "easeIn" }
                  }}
                  transition={{ 
                    duration: 0.35,
                    ease: "easeOut"
                  }}
                  className={`absolute ${
                    !isSelecting
                      ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm"
                  } p-4 rounded-lg w-[85%] text-center transform-gpu`}
                  style={{
                    top: isSelecting 
                      ? `${150 + (index * 65)}px`
                      : "150px",
                    perspective: "1000px"
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
            <Button 
              variant="outline" 
              onClick={handleRestart} 
              className="gap-2 hover:scale-105 transition-transform"
            >
              <Shuffle className="h-4 w-4" />
              Pick Again
            </Button>
            <Button 
              onClick={() => {
                playSound("click")
                onStudentPicked(selectedStudent!)
              }} 
              className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:scale-105 transition-transform"
            >
              <UserCheck className="h-4 w-4" />
              Confirm Selection
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            onClick={onClose}
            className="hover:scale-105 transition-transform"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
