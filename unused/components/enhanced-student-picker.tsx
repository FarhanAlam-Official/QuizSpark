"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import type { Student } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Shuffle, 
  UserCheck, 
  Users, 
  Search, 
  Filter,
  RotateCcw,
  Grid3x3,
  Layers,
  CircleDot,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useSound } from "@/components/sound-effects"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface EnhancedStudentPickerProps {
  students: Student[]
  excludeIds?: string[]
  onStudentPicked: (student: Student) => void
  onClose: () => void
}

type PickerMode = "slot" | "wheel" | "grid" | "cards"

// Custom hook for managing picker state
function usePickerState(students: Student[], excludeIds: string[]) {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [recentlyPicked, setRecentlyPicked] = useState<Set<string>>(new Set())
  const [pickHistory, setPickHistory] = useState<Student[]>([])
  const [filterGroup, setFilterGroup] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Initialize available students
  useEffect(() => {
    const filtered = students.filter(student => !excludeIds.includes(student.id))
    setAvailableStudents(filtered)
  }, [students, excludeIds])

  // Get unique groups
  const groups = useMemo(() => {
    const groupSet = new Set(students.map(s => s.group_name).filter(Boolean))
    return Array.from(groupSet)
  }, [students])

  // Filter students by group and search
  const filteredStudents = useMemo(() => {
    let result = availableStudents

    if (filterGroup !== "all") {
      result = result.filter(s => s.group_name === filterGroup)
    }

    if (searchQuery) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return result
  }, [availableStudents, filterGroup, searchQuery])

  // Get students prioritizing those who haven't been picked recently
  const getPrioritizedStudents = useCallback(() => {
    const unpicked = filteredStudents.filter(s => !recentlyPicked.has(s.id))
    return unpicked.length > 0 ? unpicked : filteredStudents
  }, [filteredStudents, recentlyPicked])

  // Mark student as picked
  const markAsPicked = useCallback((student: Student) => {
    setRecentlyPicked(prev => {
      const newSet = new Set(prev)
      newSet.add(student.id)
      // Reset if all students have been picked
      if (newSet.size >= filteredStudents.length) {
        return new Set([student.id])
      }
      return newSet
    })
    setPickHistory(prev => [student, ...prev.slice(0, 9)]) // Keep last 10
  }, [filteredStudents])

  // Reset recently picked
  const resetRecentlyPicked = useCallback(() => {
    setRecentlyPicked(new Set())
  }, [])

  return {
    availableStudents: filteredStudents,
    recentlyPicked,
    pickHistory,
    groups,
    filterGroup,
    setFilterGroup,
    searchQuery,
    setSearchQuery,
    getPrioritizedStudents,
    markAsPicked,
    resetRecentlyPicked,
  }
}

// Custom hook for animation control
function usePickerAnimation() {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const animationRef = useRef<NodeJS.Timeout>()
  const { playSound } = useSound()

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = undefined
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    isSelecting,
    setIsSelecting,
    selectedStudent,
    setSelectedStudent,
    animationRef,
    cleanup,
    playSound,
  }
}

// Slot Machine Mode Component
function SlotMachineMode({
  students,
  isSelecting,
  selectedStudent,
  onComplete,
}: {
  students: Student[]
  isSelecting: boolean
  selectedStudent: Student | null
  onComplete: (student: Student) => void
}) {
  const [displayedStudents, setDisplayedStudents] = useState<Student[]>([])
  const spinCountRef = useRef(0)

  useEffect(() => {
    if (students.length > 0) {
      setDisplayedStudents(getRandomStudents(students, 5))
    }
  }, [students])

  const getRandomStudents = (studentList: Student[], count: number) => {
    const result: Student[] = []
    for (let i = 0; i < Math.min(count, studentList.length); i++) {
      const randomIndex = Math.floor(Math.random() * studentList.length)
      result.push(studentList[randomIndex])
    }
    return result
  }

  const getRandomStudent = () => {
    return students[Math.floor(Math.random() * students.length)]
  }

  useEffect(() => {
    if (isSelecting && students.length > 0) {
      spinCountRef.current += 1
      let startTime = Date.now()
      const duration = 3000
      const baseInterval = 100

      let animationTimeout: NodeJS.Timeout

      const updateDisplay = () => {
        const elapsed = Date.now() - startTime
        const progress = elapsed / duration
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentInterval = baseInterval + (easeOutQuart * 300)
        
        if (elapsed < duration) {
          setDisplayedStudents(prev => {
            const newList = [...prev]
            newList.shift()
            newList.push(getRandomStudent())
            return newList
          })
          
          animationTimeout = setTimeout(updateDisplay, currentInterval)
        } else {
          // Animation complete - select the card that's in the center position
          // Cards are positioned at: 175, 260, 345, 430, 515
          // Center of container (175px) means the FIRST card (index 0) is centered
          setDisplayedStudents(prev => {
            // The first card in the list is the one in the center frame
            const winner = prev[0] || getRandomStudent()
            
            // Update to show only the winner
            setDisplayedStudents([winner])
            onComplete(winner)
            
            return [winner]
          })
        }
      }

      animationTimeout = setTimeout(updateDisplay, baseInterval)
      
      return () => {
        if (animationTimeout) clearTimeout(animationTimeout)
      }
    }
  }, [isSelecting, students])

  return (
    <div className="relative h-[350px] overflow-hidden rounded-lg border bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30">
      {/* Top and bottom gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      
      {/* Selection highlight - matches card size exactly */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[86px] border-2 border-primary rounded-lg z-10 pointer-events-none">
        <div className="absolute inset-0 bg-primary/5 rounded-lg animate-pulse" />
      </div>

      {/* Student cards */}
      <div className="relative h-full flex flex-col items-center justify-center py-8">
        <AnimatePresence mode="popLayout">
          {displayedStudents.map((student, index) => (
            <motion.div
              key={`${student.id}-${index}-${spinCountRef.current}`}
              initial={{ y: 150, opacity: 0 }}
              animate={{ 
                y: isSelecting ? -150 : 0,
                opacity: 1,
                scale: !isSelecting ? 1.05 : 1,
              }}
              exit={{ y: -150, opacity: 0 }}
              transition={{ 
                duration: 0.3,
                ease: "easeOut"
              }}
              className={cn(
                "absolute w-[85%] rounded-lg shadow-lg transform-gpu",
                !isSelecting
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6"
                  : "bg-white dark:bg-gray-800 p-4"
              )}
              style={{
                top: isSelecting ? `${175 + (index * 85)}px` : "50%",
                transform: !isSelecting ? "translateY(-50%)" : undefined,
              }}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full font-bold text-xl shrink-0",
                  !isSelecting
                    ? "bg-white/20"
                    : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                )}>
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold truncate">{student.name}</h4>
                  {student.group_name && (
                    <p className={cn(
                      "text-sm truncate",
                      !isSelecting ? "opacity-90" : "text-muted-foreground"
                    )}>
                      Group {student.group_name}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Wheel Mode Component
function WheelMode({
  students,
  isSelecting,
  onComplete,
}: {
  students: Student[]
  isSelecting: boolean
  onComplete: (student: Student) => void
}) {
  const [rotation, setRotation] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const displayStudents = students.slice(0, 8)

  useEffect(() => {
    if (isSelecting && students.length > 0) {
      const winner = students[Math.floor(Math.random() * students.length)]
      const winnerDisplayIndex = displayStudents.findIndex(s => s.id === winner.id)
      const targetIndex = winnerDisplayIndex !== -1 ? winnerDisplayIndex : Math.floor(Math.random() * displayStudents.length)
      
      const spins = 5
      const anglePerSegment = 360 / displayStudents.length
      const finalRotation = rotation + (360 * spins) + (anglePerSegment * targetIndex)
      
      setRotation(finalRotation)
      setSelectedIndex(targetIndex)

      const timer = setTimeout(() => {
        onComplete(displayStudents[targetIndex] || winner)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isSelecting, students])

  if (displayStudents.length === 0) return null

  const anglePerSegment = 360 / displayStudents.length

  return (
    <div className="relative h-[400px] flex items-center justify-center">
      <div className="relative w-[350px] h-[350px]">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-primary drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <motion.div
          className="relative w-full h-full rounded-full border-8 border-primary shadow-2xl overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
        >
          {displayStudents.map((student, index) => {
            const angle = (anglePerSegment * index) - 90
            const bgColor = index % 2 === 0 
              ? "bg-gradient-to-br from-indigo-500 to-purple-500" 
              : "bg-gradient-to-br from-purple-500 to-pink-500"
            
            return (
              <div
                key={student.id}
                className={cn("absolute inset-0", bgColor)}
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle) * Math.PI / 180)}%, ${50 + 50 * Math.cos((angle + anglePerSegment) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle + anglePerSegment) * Math.PI / 180)}%)`,
                }}
              >
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-center whitespace-nowrap"
                  style={{
                    transform: `rotate(${angle + anglePerSegment / 2 + 90}deg) translateY(-100px)`,
                    transformOrigin: "center",
                  }}
                >
                  <div className="text-sm truncate max-w-[100px]">{student.name}</div>
                </div>
              </div>
            )
          })}
          
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white dark:bg-gray-900 border-4 border-primary flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Grid Mode Component  
function GridMode({
  students,
  recentlyPicked,
  onSelect,
}: {
  students: Student[]
  recentlyPicked: Set<string>
  onSelect: (student: Student) => void
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <ScrollArea className="h-[400px] w-full rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
        {students.map((student) => {
          const isPicked = recentlyPicked.has(student.id)
          const pickCount = Math.floor(Math.random() * 5) // In real app, track this

          return (
            <motion.button
              key={student.id}
              onClick={() => onSelect(student)}
              onHoverStart={() => setHoveredId(student.id)}
              onHoverEnd={() => setHoveredId(null)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative p-4 rounded-lg border-2 text-left transition-all",
                isPicked
                  ? "border-muted bg-muted/30 opacity-60"
                  : "border-primary/20 bg-card hover:border-primary hover:shadow-lg"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full font-bold shrink-0",
                  isPicked
                    ? "bg-muted-foreground/20 text-muted-foreground"
                    : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                )}>
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{student.name}</h4>
                  {student.group_name && (
                    <p className="text-xs text-muted-foreground truncate">
                      Group {student.group_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Fairness indicator */}
              {!isPicked && (
                <div className="absolute top-2 right-2">
                  <Badge variant={pickCount === 0 ? "default" : "secondary"} className="text-xs">
                    {pickCount === 0 ? "New" : `${pickCount}x`}
                  </Badge>
                </div>
              )}

              {/* Picked indicator */}
              {isPicked && (
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="text-xs bg-background">
                    Recently Picked
                  </Badge>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </ScrollArea>
  )
}

// Main Enhanced Student Picker Component
export function EnhancedStudentPicker({
  students,
  excludeIds = [],
  onStudentPicked,
  onClose,
}: EnhancedStudentPickerProps) {
  const [mode, setMode] = useState<PickerMode>("slot")
  const [showHistory, setShowHistory] = useState(false)

  const pickerState = usePickerState(students, excludeIds)
  const animation = usePickerAnimation()

  const {
    availableStudents,
    recentlyPicked,
    pickHistory,
    groups,
    filterGroup,
    setFilterGroup,
    searchQuery,
    setSearchQuery,
    getPrioritizedStudents,
    markAsPicked,
    resetRecentlyPicked,
  } = pickerState

  const {
    isSelecting,
    setIsSelecting,
    selectedStudent,
    setSelectedStudent,
    cleanup,
    playSound,
  } = animation

  const startSelection = useCallback(() => {
    if (availableStudents.length === 0) return

    cleanup()
    setSelectedStudent(null)
    setIsSelecting(true)
    playSound("click")
  }, [availableStudents, cleanup, setSelectedStudent, setIsSelecting, playSound])

  const handleComplete = useCallback((student: Student) => {
    setSelectedStudent(student)
    setIsSelecting(false)
    markAsPicked(student)
    playSound("complete")

    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B'],
    })
  }, [setSelectedStudent, setIsSelecting, markAsPicked, playSound])

  const handleConfirm = useCallback(() => {
    if (selectedStudent) {
      playSound("click")
      onStudentPicked(selectedStudent)
      onClose()
    }
  }, [selectedStudent, onStudentPicked, onClose, playSound])

  const handleGridSelect = useCallback((student: Student) => {
    setSelectedStudent(student)
    handleComplete(student)
  }, [handleComplete, setSelectedStudent])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault()
          if (!isSelecting && !selectedStudent && availableStudents.length > 0) {
            startSelection()
          }
          break
        case 'Enter':
          e.preventDefault()
          if (selectedStudent && !isSelecting) {
            handleConfirm()
          }
          break
        case 'Escape':
          e.preventDefault()
          if (selectedStudent && !isSelecting) {
            setSelectedStudent(null)
          } else {
            onClose()
          }
          break
        case 'r':
        case 'R':
          if (!isSelecting && selectedStudent) {
            startSelection()
          }
          break
        case 'h':
        case 'H':
          setShowHistory(!showHistory)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isSelecting,
    selectedStudent,
    availableStudents,
    startSelection,
    handleConfirm,
    onClose,
    setSelectedStudent,
    showHistory,
  ])

  // Empty state
  if (availableStudents.length === 0 && !searchQuery && filterGroup === "all") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
          <Users className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p className="text-lg font-semibold">No students available</p>
          <p className="text-sm text-muted-foreground mt-1">
            All students have been excluded or no students exist
          </p>
        </div>
        <Button onClick={onClose}>Close</Button>
      </div>
    )
  }

  // No results state
  if (availableStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/20">
          <Search className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-lg font-semibold">No students found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or search query
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("")
            setFilterGroup("all")
          }}
        >
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Enhanced Student Picker
          </h3>
          <div className="flex-1 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="gap-2"
            >
              <Layers className="h-4 w-4" />
              {pickHistory.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pickHistory.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {availableStudents.length} available
          </span>
          <span>•</span>
          <span>{recentlyPicked.size} recently picked</span>
          {recentlyPicked.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetRecentlyPicked}
              className="h-6 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && pickHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Recent Picks
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {pickHistory.map((student, index) => (
                  <div
                    key={`${student.id}-${index}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Badge variant="outline" className="w-6 h-6 p-0 justify-center">
                      {index + 1}
                    </Badge>
                    <span className="truncate">{student.name}</span>
                    {student.group_name && (
                      <span className="text-xs text-muted-foreground">
                        ({student.group_name})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            disabled={isSelecting}
          />
        </div>
        
        {groups.length > 0 && (
          <Select
            value={filterGroup}
            onValueChange={setFilterGroup}
            disabled={isSelecting}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group} value={group}>
                  Group {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Mode Selector - Hidden only while actively selecting */}
      {!isSelecting && (
        <Tabs value={mode} onValueChange={(v) => setMode(v as PickerMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="slot" className="gap-2" disabled={isSelecting}>
              <Layers className="h-4 w-4" />
              Slot
            </TabsTrigger>
            <TabsTrigger value="wheel" className="gap-2" disabled={isSelecting}>
              <CircleDot className="h-4 w-4" />
              Wheel
            </TabsTrigger>
            <TabsTrigger value="grid" className="gap-2" disabled={isSelecting}>
              <Grid3x3 className="h-4 w-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2" disabled={isSelecting}>
              <Shuffle className="h-4 w-4" />
              Cards
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Picker Display */}
      <div className="relative">
        {mode === "slot" && mode !== "grid" && (
          <SlotMachineMode
            students={getPrioritizedStudents()}
            isSelecting={isSelecting}
            selectedStudent={selectedStudent}
            onComplete={handleComplete}
          />
        )}

        {mode === "wheel" && mode !== "grid" && (
          <WheelMode
            students={getPrioritizedStudents()}
            isSelecting={isSelecting}
            onComplete={handleComplete}
          />
        )}

        {mode === "grid" && (
          <GridMode
            students={availableStudents}
            recentlyPicked={recentlyPicked}
            onSelect={handleGridSelect}
          />
        )}

        {mode === "cards" && mode !== "grid" && (
          <SlotMachineMode
            students={getPrioritizedStudents()}
            isSelecting={isSelecting}
            selectedStudent={selectedStudent}
            onComplete={handleComplete}
          />
        )}

        {/* Selected Student Display (for non-grid modes) */}
        {selectedStudent && mode !== "grid" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xl font-bold">{selectedStudent.name}</h4>
                {selectedStudent.group_name && (
                  <p className="text-sm opacity-90">Group {selectedStudent.group_name}</p>
                )}
              </div>
              <Badge variant="secondary" className="bg-white/20">
                Selected!
              </Badge>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        {mode === "grid" ? (
          <>
            {selectedStudent ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStudent(null)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
                >
                  <UserCheck className="h-4 w-4" />
                  Confirm Selection
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </>
        ) : (
          <>
            {selectedStudent ? (
              <>
                <Button
                  variant="outline"
                  onClick={startSelection}
                  disabled={isSelecting}
                  className="gap-2"
                >
                  <Shuffle className="h-4 w-4" />
                  Pick Again
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isSelecting}
                  className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
                >
                  <UserCheck className="h-4 w-4" />
                  Confirm Selection
                </Button>
              </>
            ) : !isSelecting ? (
              <Button
                onClick={startSelection}
                disabled={availableStudents.length === 0}
                className="gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
              >
                <Shuffle className="h-4 w-4" />
                Start Picking
              </Button>
            ) : (
              <Button variant="outline" disabled className="opacity-50">
                Selecting...
              </Button>
            )}
          </>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-xs text-muted-foreground">
        <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> to start •{" "}
        <kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> to confirm •{" "}
        <kbd className="px-2 py-1 bg-muted rounded">R</kbd> to pick again •{" "}
        <kbd className="px-2 py-1 bg-muted rounded">H</kbd> toggle history •{" "}
        <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> to close
      </div>
    </div>
  )
}

