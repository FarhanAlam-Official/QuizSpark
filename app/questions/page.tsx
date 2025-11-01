"use client"

import { useEffect, useState } from "react"
import { type Question } from "@/lib/supabase"
import { useApp } from "@/lib/context/AppContext"
import { useAuth } from "@/lib/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Plus, Trash, Upload, Search, Filter, Clock, Tag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { BulkImportQuestions } from "@/components/bulk-import-questions"
import { useSound } from "@/components/sound-effects"
import { QuestionFormData } from '@/components/bulk-import-questions'
import { createClient } from "@/lib/supabase/client"

export default function QuestionsPage() {
  const { user } = useAuth()
  const { addQuestion, updateQuestion, deleteQuestion, loading } = useApp()
  const { playSound } = useSound()
  const supabase = createClient()

  // State
  const [questions, setQuestions] = useState<Question[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [sortField, setSortField] = useState<keyof Question>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState<"easy" | "normal" | "hard" | "all">("all")

  // Filter state
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [topics, setTopics] = useState<Array<{ name: string, count: number }>>([])
  const [tags, setTags] = useState<Array<{ name: string, count: number }>>([])
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [questionsPerPage] = useState(10)
  const [totalQuestions, setTotalQuestions] = useState(0)

  // Form state
  interface Question {
    id: string;
    user_id: string;
    question: string;
    options: Record<string, string>;
    correct_option: number;
    topic: string;
    difficulty: "easy" | "normal" | "hard";
    explanation: string;
    time_limit: number;
    points: number;
    tags: string[];
    metadata: Record<string, any>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
  }

  type NewQuestion = Omit<Question, "id" | "created_at" | "updated_at">;

  interface QuestionFormData {
    question: string;
    options: Record<string, string>;
    correct_option: number;
    topic: string;
    difficulty: "easy" | "normal" | "hard";
    explanation: string;
    time_limit: number;
    points: number;
    tags: string[];
    metadata: Record<string, any>;
  }

  interface BulkImportQuestionsProps {
    onImport: (questions: QuestionFormData[]) => Promise<void>;
  }

  const [formData, setFormData] = useState<QuestionFormData>({
    question: "",
    options: {
      "1": "",
      "2": "",
      "3": "",
      "4": ""
    },
    correct_option: 0,
    topic: "",
    difficulty: "normal",
    explanation: "",
    time_limit: 60,
    points: 1,
    tags: [],
    metadata: {}
  })

  const resetForm = () => {
    setFormData({
      question: "",
      options: {
        "1": "",
        "2": "",
        "3": "",
        "4": ""
      },
      correct_option: 0,
      topic: "",
      difficulty: "normal",
      explanation: "",
      time_limit: 60,
      points: 1,
      tags: [],
      metadata: {}
    })
  }

  // Calculate pagination
  const indexOfLastQuestion = currentPage * questionsPerPage
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion)
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage)

  // Extract unique topics, tags, and their counts
  useEffect(() => {
    if (!loading) {
      const topicCounts = questions.reduce((acc, q) => {
        acc[q.topic] = (acc[q.topic] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const tagCounts = questions.reduce((acc, q) => {
        q.tags?.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>)

      const uniqueTopics = Object.entries(topicCounts).map(([name, count]) => ({
        name,
        count
      })).sort((a, b) => a.name.localeCompare(b.name))

      const uniqueTags = Object.entries(tagCounts).map(([name, count]) => ({
        name,
        count
      })).sort((a, b) => a.name.localeCompare(b.name))

      setTopics(uniqueTopics)
      setTags(uniqueTags)
    }
  }, [loading, questions])

  // Filter and sort questions
  useEffect(() => {
    let filtered = [...questions]

    // Apply search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase()
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(query) || 
        q.topic.toLowerCase().includes(query) ||
        q.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        q.explanation?.toLowerCase().includes(query)
      )
    }

    // Apply topic filter
    if (selectedTopic !== "all") {
      filtered = filtered.filter(q => q.topic === selectedTopic)
    }

    // Apply difficulty filter
    if (filterDifficulty !== "all") {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty)
    }

    // Apply tag filter
    if (selectedTag !== "all") {
      filtered = filtered.filter(q => q.tags?.includes(selectedTag))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof Question]
      let bValue = b[sortField as keyof Question]

      // Handle special cases
      if (sortField === "created_at" || sortField === "updated_at") {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }

      if (sortDirection === "asc") {
        return aValue && bValue ? (aValue > bValue ? 1 : -1) : 0
      } else {
        return aValue && bValue ? (aValue < bValue ? 1 : -1) : 0
      }
    })

    setFilteredQuestions(filtered)
    setTotalQuestions(filtered.length)
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [questions, searchTerm, selectedTopic, filterDifficulty, selectedTag, sortField, sortDirection])

  // Add this near the other useEffects
  useEffect(() => {
    if (user) {
      fetchQuestions()
    }
  }, [user])

  const fetchQuestions = async () => {
    if (!user || !supabase) return

    try {
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setQuestions(questions.map(q => ({
        ...q,
        difficulty: q.difficulty as "easy" | "normal" | "hard",
        options: q.options || {},
        tags: q.tags || [],
        metadata: q.metadata || {}
      })))
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const handleAddQuestion = async () => {
    console.log('handleAddQuestion called')
    console.log('Current form data:', formData)
    
    if (!user) {
      console.error('No user found')
      return
    }

    // Validate form
    if (!formData.question.trim() || 
        !Object.values(formData.options).every(opt => opt.trim()) || 
        !formData.topic.trim() ||
        !formData.correct_option) {
      console.error('Validation failed:', {
        hasQuestion: !!formData.question.trim(),
        hasAllOptions: Object.values(formData.options).every(opt => opt.trim()),
        hasTopic: !!formData.topic.trim(),
        correctOption: formData.correct_option
      })
      return
    }

    try {
      const newQuestion: NewQuestion = {
        user_id: user.id,
        question: formData.question.trim(),
        options: Object.entries(formData.options).reduce((acc, [key, value]) => {
          acc[key] = value.trim()
          return acc
        }, {} as Record<string, string>),
        correct_option: formData.correct_option,
        topic: formData.topic.trim(),
        difficulty: formData.difficulty.toLowerCase() as "easy" | "normal" | "hard",
        explanation: formData.explanation.trim(),
        time_limit: formData.time_limit,
        points: formData.points,
        tags: formData.tags,
        metadata: {
          created_via: "web_interface",
          created_at: new Date().toISOString(),
          ...formData.metadata
        },
        is_active: true,
        created_by: user.id,
        updated_by: user.id
      }

      console.log('Attempting to add question:', newQuestion)
      await addQuestion(newQuestion)
      console.log('Question added successfully')
      
      await fetchQuestions()
      resetForm()
      setIsAddDialogOpen(false)
      playSound("success")
    } catch (error) {
      console.error('Failed to add question:', error)
      playSound("error")
      // Keep the dialog open on error
    }
  }

  const handleEditQuestion = async () => {
    if (!editingQuestion || !user) return

    // Validate form
    if (!formData.question.trim() || 
        !Object.values(formData.options).every(opt => opt.trim()) || 
        !formData.topic.trim()) {
      return
    }

    try {
      const updatedQuestion: NewQuestion = {
        user_id: editingQuestion.user_id,
        question: formData.question.trim(),
        options: Object.entries(formData.options).reduce((acc, [key, value]) => {
          acc[key] = value.trim()
          return acc
        }, {} as Record<string, string>),
        correct_option: formData.correct_option,
        topic: formData.topic.trim(),
        difficulty: formData.difficulty,
        explanation: formData.explanation.trim(),
        time_limit: formData.time_limit,
        points: formData.points,
        tags: formData.tags,
        metadata: {
          ...editingQuestion.metadata,
          last_updated: new Date().toISOString(),
          updated_via: "web_interface"
        },
        is_active: true,
        created_by: editingQuestion.created_by,
        updated_by: user.id
      }
      await updateQuestion(editingQuestion.id, updatedQuestion)
      setEditingQuestion(null)
      resetForm()
      setIsEditDialogOpen(false)
      playSound("click")
    } catch (error) {
      console.error('Failed to update question:', error)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestion(id)
      playSound("click")
    } catch (error) {
      console.error('Failed to delete question:', error)
    }
  }

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question)
    setFormData({
      question: question.question,
      options: question.options,
      correct_option: question.correct_option,
      topic: question.topic,
      difficulty: question.difficulty,
      explanation: question.explanation || "",
      time_limit: question.time_limit || 60,
      points: question.points || 1,
      tags: question.tags || [],
      metadata: question.metadata || {}
    })
    setIsEditDialogOpen(true)
    playSound("click")
  }

  const handleOptionChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value
      }
    }))
  }

  const handleTagsChange = (value: string) => {
    const newTags = value.split(",").map(tag => tag.trim()).filter(Boolean)
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }))
  }

  const handleBulkImport = async (questionsToImport: QuestionFormData[]) => {
    if (!user) return

    try {
      for (const q of questionsToImport) {
        const newQuestion: NewQuestion = {
          user_id: user.id,
          question: q.question.trim(),
          options: Object.entries(q.options).reduce((acc, [key, value]) => {
            acc[key] = value.trim()
            return acc
          }, {} as Record<string, string>),
          correct_option: q.correct_option,
          topic: q.topic.trim(),
          difficulty: q.difficulty,
          explanation: q.explanation?.trim() || "",
          time_limit: q.time_limit,
          points: q.points,
          tags: q.tags,
          metadata: {
            created_via: "bulk_import",
            ...q.metadata
          },
          is_active: true,
          created_by: user.id,
          updated_by: user.id
        }
        await addQuestion(newQuestion)
      }
      setShowBulkImport(false)
      playSound("success")
    } catch (error) {
      console.error('Failed to import questions:', error)
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

  const handleDifficultyChange = (value: string) => {
    setFilterDifficulty(value as "easy" | "normal" | "hard" | "all")
  }

  const handleSortFieldChange = (value: string) => {
    setSortField(value as keyof Question)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the questions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Questions</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkImport(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => {
            resetForm()
            setIsAddDialogOpen(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="space-y-2">
            <Label>Topic</Label>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map(topic => (
                  <SelectItem key={topic.name} value={topic.name}>
                    {topic.name} ({topic.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={filterDifficulty} onValueChange={handleDifficultyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortField} onValueChange={handleSortFieldChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="updated_at">Date Updated</SelectItem>
                <SelectItem value="topic">Topic</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="points">Points</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Order</Label>
            <Select value={sortDirection} onValueChange={(value: "asc" | "desc") => setSortDirection(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <Card>
        <CardContent className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Time Limit</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium max-w-md truncate">
                      {question.question}
                    </TableCell>
                    <TableCell>{question.topic}</TableCell>
                    <TableCell>
                      <Badge variant={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{question.points}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {question.time_limit}s
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {question.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {indexOfFirstQuestion + 1} to {Math.min(indexOfLastQuestion, totalQuestions)} of {totalQuestions} questions
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Questions</DialogTitle>
            <DialogDescription>
              Import multiple questions at once using a CSV or JSON file
            </DialogDescription>
          </DialogHeader>
          
          <BulkImportQuestions onImport={handleBulkImport} />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkImport(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Question Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit Question' : 'Add New Question'}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? 'Update the existing question' : 'Create a new multiple-choice question for your quiz'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* Question Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question Text</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter your question"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {Object.entries(formData.options).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Input
                      value={value}
                      onChange={(e) => handleOptionChange(key, e.target.value)}
                      placeholder={`Option ${key}`}
                    />
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id={`correct-${key}`}
                        name="correctAnswer"
                        checked={formData.correct_option === parseInt(key)}
                        onChange={() => setFormData(prev => ({ ...prev, correct_option: parseInt(key) }))}
                        className="mr-2"
                      />
                      <Label htmlFor={`correct-${key}`}>Correct</Label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why the correct answer is correct"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="Enter topic"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as any }))}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time-limit">Time Limit (seconds)</Label>
                  <Input
                    id="time-limit"
                    type="number"
                    min="10"
                    max="300"
                    value={formData.time_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(", ")}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="Enter tags, separated by commas"
                />
              </div>
            </div>

            {/* Question Preview */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold">Question Preview</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg">
                  <p className="font-medium">{formData.question || "Your question will appear here"}</p>
                  
                  <div className="mt-4 space-y-2">
                    {Object.entries(formData.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`p-3 rounded-lg border ${
                          parseInt(key) === formData.correct_option
                            ? "border-green-500 bg-green-50 dark:bg-green-950"
                            : "border-border"
                        }`}
                      >
                        {value || `Option ${key} will appear here`}
                      </div>
                    ))}
                  </div>
                </div>

                {formData.explanation && (
                  <div className="p-4 bg-background rounded-lg">
                    <h4 className="font-medium mb-2">Explanation:</h4>
                    <p className="text-muted-foreground">{formData.explanation}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{formData.topic || "Topic"}</Badge>
                  <Badge variant={getDifficultyColor(formData.difficulty)}>
                    {formData.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {formData.time_limit}s
                  </Badge>
                  <Badge variant="outline">
                    {formData.points} {formData.points === 1 ? "point" : "points"}
                  </Badge>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              setIsEditDialogOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                console.log('Add/Edit button clicked')
                if (isEditDialogOpen) {
                  await handleEditQuestion()
                } else {
                  await handleAddQuestion()
                }
              }}
              disabled={
                !formData.question.trim() ||
                !Object.values(formData.options).every(opt => opt.trim()) ||
                !formData.topic.trim() ||
                !formData.correct_option
              }
            >
              {isEditDialogOpen ? "Save Changes" : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}