"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import type { Student } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Shuffle, UserCheck, Users } from "lucide-react"
import { useSound } from "@/components/sound-effects"
import { cn } from "@/lib/utils"

interface StudentPickerProps {
  students: Student[]
  excludeIds?: string[]
  onStudentPicked: (student: Student) => void
  onClose: () => void
}

export function StudentPicker({ students, excludeIds = [], onStudentPicked, onClose }: StudentPickerProps) {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [displayedStudents, setDisplayedStudents] = useState<Student[]>([])
  const [recentlyPicked, setRecentlyPicked] = useState<Set<string>>(new Set())
  const [isConfirming, setIsConfirming] = useState(false)
  const animationRef = useRef<NodeJS.Timeout>()
  const spinCountRef = useRef(0)
  const { playSound } = useSound()

  // Initialize available students
  useEffect(() => {
    const filtered = students.filter(student => !excludeIds.includes(student.id))
    setAvailableStudents(filtered)
    setDisplayedStudents(getRandomStudents(filtered, 5)) // Reduced from 8 to 5 for better performance
    setRecentlyPicked(new Set())
  }, [students, excludeIds])

  const getRandomStudents = (studentList: Student[], count: number) => {
    const result: Student[] = []
    let availableForPicking = studentList.filter(
      student => !recentlyPicked.has(student.id)
    )
    
    // If no students are available for picking, use all students
    if (availableForPicking.length === 0) {
      availableForPicking = [...studentList]
    }

    // Get random students from available pool
    const available: Student[] = [...availableForPicking]
    for (let i = 0; i < Math.min(count, available.length); i++) {
      const randomIndex = Math.floor(Math.random() * available.length)
      result.push(available[randomIndex])
      available.splice(randomIndex, 1) // Remove picked student to avoid duplicates
    }

    // If we need more students than available, add from the full list
    if (result.length < count) {
      const remainingNeeded = count - result.length
      const remainingStudents = studentList.filter(s => !result.includes(s))
      for (let i = 0; i < remainingNeeded && remainingStudents.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * remainingStudents.length)
        result.push(remainingStudents[randomIndex])
        remainingStudents.splice(randomIndex, 1)
      }
    }

    return result
  }

  const getRandomStudent = () => {
    let availableForPicking = availableStudents.filter(
      student => !recentlyPicked.has(student.id)
    )

    // If no students are available for picking, reset the picked list and use all students
    if (availableForPicking.length === 0) {
      availableForPicking = [...availableStudents]
      // We'll reset the recentlyPicked set in the winner selection instead of here
    }

    return availableForPicking[Math.floor(Math.random() * availableForPicking.length)]
  }

  // Cleanup function
  const cleanup = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = undefined
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [])

  const startSelection = () => {
    if (availableStudents.length === 0) return

    cleanup()
    setIsSelecting(true)
    setSelectedStudent(null)
    playSound("click")

    let startTime = Date.now()
    const duration = 3000
    const baseInterval = 150 // Slightly increased for smoother animation
    const minDisplayCount = 3
    const maxInterval = 400

    const updateDisplay = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentInterval = baseInterval + (easeOutQuart * maxInterval)
      
      if (elapsed < duration) {
        setDisplayedStudents(prev => {
          const newList = [...prev].filter(student => student)
          while (newList.length < minDisplayCount) {
            const nextStudent = getRandomStudent()
            if (nextStudent) newList.push(nextStudent)
          }
          
          newList.shift()
          const nextStudent = getRandomStudent()
          if (!nextStudent) return newList
          
          if (!newList.some(s => s.id === nextStudent.id)) {
            newList.push(nextStudent)
          } else {
            const alternative = getRandomStudent()
            if (alternative) newList.push(alternative)
          }
          
          return newList
        })
        
        if (elapsed < duration - 500 && progress < 0.7) {
          playSound("select")
        }
        
        animationRef.current = setTimeout(updateDisplay, currentInterval)
      } else {
        const winner = getRandomStudent()
        setSelectedStudent(winner)
        setDisplayedStudents([winner])
        setIsSelecting(false)

        // Update recently picked
        if (availableStudents.length <= 1) {
          setRecentlyPicked(new Set([winner.id]))
        } else {
          setRecentlyPicked(prev => new Set([...prev, winner.id]))
        }
        
        playSound("complete")
        
        // Optimized confetti
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#4F46E5', '#7C3AED', '#EC4899'],
          ticks: 100
        })
      }
    }

    animationRef.current = setTimeout(updateDisplay, baseInterval)
  }

  const handleConfirm = () => {
    if (selectedStudent) {
      playSound("click")
      onStudentPicked(selectedStudent)
      onClose() // Close the dialog after confirming selection
    }
  }

  if (availableStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
          <Users className="h-6 w-4 text-red-600 dark:text-red-400" />
        </div>
        <p className="mt-4 text-lg font-medium">No students available to pick</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Student Picker
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSelecting ? "Selecting a student..." : selectedStudent ? "Student selected!" : "Click start to pick a student"}
        </p>
      </div>

      <div className="relative w-full max-w-md">
        <div className="relative h-[300px] overflow-hidden rounded-lg border bg-card">
          {/* Optimized gradient borders */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
          
          <div className="relative h-full flex flex-col items-center justify-center">
            {/* Card stack effect */}
            {isSelecting && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%]">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`stack-${i}`}
                    className="absolute top-0 left-0 w-full h-[120px] rounded-lg bg-black/5 dark:bg-white/5"
                    style={{
                      transform: `translate(${i * 2}px, ${i * 2}px)`,
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Simplified spotlight */}
            <div 
              className={cn(
                "absolute top-1/2 left-1/2 w-[85%] h-20 -translate-x-1/2 -translate-y-1/2 rounded-lg transition-opacity duration-300",
                isSelecting 
                  ? "bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"
                  : "opacity-0"
              )}
            />
            
            {/* Student cards */}
            <AnimatePresence mode="popLayout">
              {displayedStudents.map((student, index) => (
                <motion.div
                  key={`${student.id}-${index}-${spinCountRef.current}`}
                  initial={{ 
                    y: 150, // Start from below
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{ 
                    y: isSelecting 
                      ? -20 + (index * 8) // Slight vertical offset for stacking, reduced from previous
                      : isConfirming
                        ? 100
                        : 0,
                    opacity: isConfirming && student.id !== selectedStudent?.id ? 0 : 1,
                    scale: !isSelecting && !isConfirming ? 1 : 0.98,
                    transition: {
                      type: "spring",
                      stiffness: 400, // Increased stiffness for snappier upward motion
                      damping: 30,
                      mass: 0.5,
                      velocity: 2 // Added initial velocity for more energetic upward motion
                    }
                  }}
                  exit={{ 
                    y: -150, // Exit upward
                    opacity: 0,
                    scale: 0.9,
                    transition: { 
                      duration: 0.15, // Slightly faster exit
                      ease: [0.32, 0, 0.67, 0] // Fast out, slow in easing
                    }
                  }}
                  className={cn(
                    "absolute p-6 w-[85%] text-center rounded-lg shadow-lg transform-gpu",
                    isSelecting
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
                  )}
                  style={{
                    willChange: "transform, opacity",
                    zIndex: displayedStudents.length - index, // Stack cards properly
                    filter: isSelecting ? `brightness(${1 - index * 0.1})` : 'none' // Subtle darkening for stacked cards
                  }}
                >
                  <div 
                    className="flex flex-col items-center gap-3"
                    style={{
                      transform: isSelecting ? `scale(${1 - index * 0.02})` : 'none' // Subtle scaling for depth effect
                    }}
                  >
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200",
                      isSelecting
                        ? "bg-gray-100 dark:bg-gray-700"
                        : "bg-white/10"
                    )}>
                      <span className="text-xl font-bold">
                        {student?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="min-h-[3rem] flex flex-col justify-center">
                      <h4 className="text-lg font-semibold truncate max-w-[200px]">
                        {student?.name || 'Unknown Student'}
                      </h4>
                      {student?.group_name && (
                        <p className="text-sm opacity-90">
                          Group {student.group_name}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Card stack shadow effect */}
            {isSelecting && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[20%] w-[75%] h-[4px] rounded-full bg-black/10 dark:bg-white/10 blur-md" />
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {!isSelecting && selectedStudent ? (
          <>
            <Button
              variant="outline"
              onClick={startSelection}
              className="gap-2"
              disabled={isSelecting || isConfirming}
            >
              <Shuffle className="h-4 w-4" />
              Pick Again
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
            >
              <UserCheck className="h-4 w-4" />
              Confirm Selection
            </Button>
          </>
        ) : !isSelecting ? (
          <Button
            onClick={startSelection}
            className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
          >
            <Shuffle className="h-4 w-4" />
            Start Picking
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled
            className="opacity-50"
          >
            Selecting...
          </Button>
        )}
      </div>
    </div>
  )
} 

