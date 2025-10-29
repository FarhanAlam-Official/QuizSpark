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
  CircleDot,
  Layers,
  X
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

interface StudentPickerProps {
  students: Student[]
  excludeIds?: string[]
  onStudentPicked: (student: Student) => void
  onClose: () => void
}

type PickerMode = "cards" | "wheel" | "grid"

export function StudentPicker({ students, excludeIds = [], onStudentPicked, onClose }: StudentPickerProps) {
  const [mode, setMode] = useState<PickerMode>("cards")
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [displayedStudents, setDisplayedStudents] = useState<Student[]>([])
  const [recentlyPicked, setRecentlyPicked] = useState<Set<string>>(new Set())
  const [pickHistory, setPickHistory] = useState<Student[]>([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterGroup, setFilterGroup] = useState<string>("all")
  const animationRef = useRef<NodeJS.Timeout>()
  const spinCountRef = useRef(0)
  const { playSound } = useSound()

  // Get unique groups
  const groups = useMemo(() => {
    const groupSet = new Set(students.map(s => s.group_name).filter(Boolean))
    return Array.from(groupSet)
  }, [students])

  // Initialize available students
  useEffect(() => {
    let filtered = students.filter(student => !excludeIds.includes(student.id))
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply group filter
    if (filterGroup !== "all") {
      filtered = filtered.filter(s => s.group_name === filterGroup)
    }
    
    setAvailableStudents(filtered)
    setDisplayedStudents(getRandomStudents(filtered, 5))
  }, [students, excludeIds, searchQuery, filterGroup])

  const getRandomStudents = (studentList: Student[], count: number) => {
    const result: Student[] = []
    let availableForPicking = studentList.filter(
      student => !recentlyPicked.has(student.id)
    )
    
    if (availableForPicking.length === 0) {
      availableForPicking = [...studentList]
    }

    const available: Student[] = [...availableForPicking]
    for (let i = 0; i < Math.min(count, available.length); i++) {
      const randomIndex = Math.floor(Math.random() * available.length)
      result.push(available[randomIndex])
      available.splice(randomIndex, 1)
    }

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

    if (availableForPicking.length === 0) {
      availableForPicking = [...availableStudents]
    }

    return availableForPicking[Math.floor(Math.random() * availableForPicking.length)]
  }

  const cleanup = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = undefined
    }
  }

  useEffect(() => {
    return cleanup
  }, [])

  const startSelection = () => {
    if (availableStudents.length === 0) return

    cleanup()
    setIsSelecting(true)
    setSelectedStudent(null)
    playSound("click")

    if (mode === "wheel") {
      startWheelSelection()
    } else {
      startCardSelection()
    }
  }

  const startCardSelection = () => {
    spinCountRef.current += 1
    let startTime = Date.now()
    const duration = 3000
    const baseInterval = 100
    const minDisplayCount = 5
    const maxInterval = 400

    const updateDisplay = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration
      
      // Smooth easing
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

        if (availableStudents.length <= 1) {
          setRecentlyPicked(new Set([winner.id]))
        } else {
          setRecentlyPicked(prev => new Set([...prev, winner.id]))
        }
        
        setPickHistory(prev => [winner, ...prev.slice(0, 9)])
        
        playSound("complete")
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#7C3AED', '#EC4899']
        })
      }
    }

    animationRef.current = setTimeout(updateDisplay, baseInterval)
  }

  // Wheel selection
  const [rotation, setRotation] = useState(0)
  
  const startWheelSelection = () => {
    const winner = getRandomStudent()
    const displayStudents = availableStudents.slice(0, 8)
    const winnerIndex = displayStudents.findIndex(s => s.id === winner.id)
    const targetIndex = winnerIndex !== -1 ? winnerIndex : 0
    
    const spins = 5
    const anglePerSegment = 360 / displayStudents.length
    const finalRotation = rotation + (360 * spins) + (anglePerSegment * targetIndex)
    
    setRotation(finalRotation)

    setTimeout(() => {
      setSelectedStudent(winner)
      setIsSelecting(false)
      
      if (availableStudents.length <= 1) {
        setRecentlyPicked(new Set([winner.id]))
      } else {
        setRecentlyPicked(prev => new Set([...prev, winner.id]))
      }
      
      setPickHistory(prev => [winner, ...prev.slice(0, 9)])
      playSound("complete")
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B'],
      })
    }, 3000)
  }

  const handleConfirm = () => {
    if (selectedStudent) {
      playSound("click")
      onStudentPicked(selectedStudent)
      onClose()
    }
  }

  const handleGridSelect = (student: Student) => {
    setSelectedStudent(student)
    
    if (availableStudents.length <= 1) {
      setRecentlyPicked(new Set([student.id]))
    } else {
      setRecentlyPicked(prev => new Set([...prev, student.id]))
    }
    
    setPickHistory(prev => [student, ...prev.slice(0, 9)])
    playSound("complete")
    
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#4F46E5', '#7C3AED', '#EC4899'],
    })
  }

  const resetRecentlyPicked = () => {
    setRecentlyPicked(new Set())
    playSound("click")
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isSelecting, selectedStudent, availableStudents, showHistory])

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
            Student Picker
          </h3>
          <div className="flex-1 flex justify-end">
            {pickHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="gap-2"
              >
                <Layers className="h-4 w-4" />
                <Badge variant="secondary" className="ml-1">
                  {pickHistory.length}
                </Badge>
              </Button>
            )}
          </div>
        </div>

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

      {/* Mode Selector */}
      {!isSelecting && (
        <Tabs value={mode} onValueChange={(v) => setMode(v as PickerMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cards" className="gap-2">
              <Shuffle className="h-4 w-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="wheel" className="gap-2">
              <CircleDot className="h-4 w-4" />
              Wheel
            </TabsTrigger>
            <TabsTrigger value="grid" className="gap-2">
              <Grid3x3 className="h-4 w-4" />
              Grid
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Picker Display */}
      <div className="relative">
        {/* Cards Mode */}
        {mode === "cards" && (
          <div className="relative w-full max-w-md mx-auto">
            <div className="relative h-[300px] overflow-hidden rounded-lg border bg-card">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
              
              <div className="relative h-full flex flex-col items-center justify-center">
                {/* Simple highlight zone */}
                <div 
                  className={cn(
                    "absolute top-1/2 left-1/2 w-[85%] h-24 -translate-x-1/2 -translate-y-1/2 rounded-lg transition-opacity duration-300",
                    isSelecting 
                      ? "bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"
                      : "opacity-0"
                  )}
                />
                
                <AnimatePresence mode="popLayout">
                  {displayedStudents.map((student, index) => (
                    <motion.div
                      key={`${student.id}-${index}-${spinCountRef.current}`}
                      initial={{ 
                        y: 150,
                        opacity: 0,
                        scale: 0.95,
                      }}
                      animate={{ 
                        y: isSelecting 
                          ? -20 + (index * 10)
                          : isConfirming
                            ? 100
                            : 0,
                        opacity: isConfirming && student.id !== selectedStudent?.id ? 0 : 1,
                        scale: !isSelecting && !isConfirming ? 1.05 : 0.98,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                          mass: 0.8
                        }
                      }}
                      exit={{ 
                        y: -150,
                        opacity: 0,
                        scale: 0.9,
                        transition: { 
                          duration: 0.2,
                          ease: [0.32, 0, 0.67, 0]
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
                        zIndex: displayedStudents.length - index,
                        filter: isSelecting ? `brightness(${1 - index * 0.1})` : 'none'
                      }}
                    >
                      <div 
                        className="flex flex-col items-center gap-3"
                        style={{
                          transform: isSelecting ? `scale(${1 - index * 0.03})` : 'none'
                        }}
                      >
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200",
                          isSelecting
                            ? "bg-gray-100 dark:bg-gray-700"
                            : "bg-white/20"
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

                {isSelecting && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[20%] w-[75%] h-[4px] rounded-full bg-black/10 dark:bg-white/10 blur-md" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wheel Mode */}
        {mode === "wheel" && !selectedStudent && (
          <div className="relative h-[400px] flex items-center justify-center">
            <div className="relative w-[350px] h-[350px]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-primary drop-shadow-lg" />
              </div>

              <motion.div
                className="relative w-full h-full rounded-full border-8 border-primary shadow-2xl overflow-hidden"
                animate={{ rotate: rotation }}
                transition={{ duration: 3, ease: "easeOut" }}
              >
                {availableStudents.slice(0, 8).map((student, index) => {
                  const anglePerSegment = 360 / Math.min(availableStudents.length, 8)
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
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white dark:bg-gray-900 border-4 border-primary flex items-center justify-center">
                  <CircleDot className="h-6 w-6 text-primary" />
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Grid Mode */}
        {mode === "grid" && !selectedStudent && (
          <ScrollArea className="h-[400px] w-full rounded-lg border p-4">
            <div className="grid grid-cols-2 gap-3">
              {availableStudents.map((student) => {
                const isPicked = recentlyPicked.has(student.id)

                return (
                  <motion.button
                    key={student.id}
                    onClick={() => handleGridSelect(student)}
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

                    {isPicked && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="text-xs bg-background">
                          Recently Picked
                        </Badge>
                      </div>
                    )}

                    {!isPicked && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="text-xs">
                          Available
                        </Badge>
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {/* Selected Student Display */}
        {selectedStudent && mode !== "cards" && (
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
          <Button
            variant="outline"
            disabled
            className="opacity-50"
          >
            Selecting...
          </Button>
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
