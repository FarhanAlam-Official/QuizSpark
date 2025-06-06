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

export default function QuestionsPage() {
  const { user } = useAuth()
  const { questions, addQuestion, updateQuestion, deleteQuestion, loading } = useApp()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const { playSound } = useSound()

  // Filter state
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [topics, setTopics] = useState<Array<{ name: string, count: number }>>([])
  const [tags, setTags] = useState<Array<{ name: string, count: number }>>([])

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    options: {} as Record<string, any>,
    correct_option: 0,
    topic: "",
    difficulty: "normal" as "easy" | "normal" | "hard",
    explanation: "",
    time_limit: 60,
    points: 1,
    tags: [] as string[],
    metadata: {} as Record<string, any>
  })

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

  // Filter questions based on search, topic, difficulty, and tags
  useEffect(() => {
    let filtered = [...questions]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(query) || 
        q.topic.toLowerCase().includes(query) ||
        q.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply topic filter
    if (selectedTopic !== "all") {
      filtered = filtered.filter(q => q.topic === selectedTopic)
    }

    // Apply difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty)
    }

    // Apply tag filter
    if (selectedTag !== "all") {
      filtered = filtered.filter(q => q.tags?.includes(selectedTag))
    }

    setFilteredQuestions(filtered)
  }, [questions, searchQuery, selectedTopic, selectedDifficulty, selectedTag])

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

  const handleAddQuestion = async () => {
    if (!user) return

    // Validate form
    if (!formData.question.trim() || 
        !Object.values(formData.options).every(opt => opt.trim()) || 
        !formData.topic.trim()) {
      return
    }

    try {
      await addQuestion({
        user_id: user.id,
        question: formData.question.trim(),
        options: formData.options,
        correct_option: formData.correct_option,
        topic: formData.topic.trim(),
        difficulty: formData.difficulty,
        explanation: formData.explanation.trim(),
        time_limit: formData.time_limit,
        points: formData.points,
        tags: formData.tags,
        metadata: {
          created_via: "web_interface",
          ...formData.metadata
        },
        is_active: true
      })
      resetForm()
      setIsAddDialogOpen(false)
      playSound("click")
    } catch (error) {
      console.error('Failed to add question:', error)
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
      await updateQuestion(editingQuestion.id, {
        question: formData.question.trim(),
        options: formData.options,
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
        updated_by: user.id
      })
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

  const handleBulkImport = async (questionsToImport: any[]) => {
    if (!user) return

    try {
      for (const q of questionsToImport) {
        await addQuestion({
          user_id: user.id,
          question: q.question.trim(),
          options: q.options,
          correct_option: q.correct_option,
          topic: q.topic.trim(),
          difficulty: q.difficulty || "normal",
          explanation: q.explanation?.trim(),
          time_limit: q.time_limit || 60,
          points: q.points || 1,
          tags: q.tags || [],
          metadata: {
            created_via: "bulk_import",
            import_date: new Date().toISOString(),
            ...q.metadata
          },
          is_active: true
        })
      }
      setShowBulkImport(false)
      playSound("success")
    } catch (error) {
      console.error('Error bulk importing questions:', error)
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
          <p className="text-muted-foreground">Please wait while we fetch the questions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
          <p className="text-muted-foreground">Manage your quiz questions and question bank</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkImport(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>Create a new multiple-choice question for your quiz</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Enter your question"
                    className="min-h-[80px] rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Options</Label>
                  {Object.entries(formData.options).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Input
                        value={value}
                        onChange={(e) => handleOptionChange(key, e.target.value)}
                        placeholder={`Option ${key}`}
                        className="rounded-xl"
                      />
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`correct-${key}`}
                          name="correctAnswer"
                          checked={formData.correct_option === parseInt(key)}
                          onChange={() => setFormData({ ...formData, correct_option: parseInt(key) })}
                          className="mr-2"
                        />
                        <Label htmlFor={`correct-${key}`}>Correct</Label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Textarea
                    id="explanation"
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Explain why the correct answer is correct"
                    className="min-h-[60px] rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="Enter topic"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
                    >
                      <SelectTrigger id="difficulty" className="rounded-xl">
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
                  <div className="grid gap-2">
                    <Label htmlFor="time-limit">Time Limit (seconds)</Label>
                    <Input
                      id="time-limit"
                      type="number"
                      min="10"
                      max="300"
                      value={formData.time_limit}
                      onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(", ")}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="Enter tags, separated by commas"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddQuestion}>Add Question</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Question Bank</CardTitle>
              <CardDescription>Browse and manage your questions</CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px] rounded-xl"
                />
              </div>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="Filter by topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic.name} value={topic.name}>
                      {topic.name} ({topic.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.name} value={tag.name}>
                      {tag.name} ({tag.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-[300px] truncate font-medium">
                    {question.question}
                  </TableCell>
                  <TableCell>{question.topic}</TableCell>
                  <TableCell>
                    <Badge className={`${getDifficultyColor(question.difficulty)} text-white`}>
                      {question.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {question.time_limit}s
                    </div>
                  </TableCell>
                  <TableCell>{question.points}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
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
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import Questions</DialogTitle>
            <DialogDescription>Import multiple questions at once</DialogDescription>
          </DialogHeader>
          <BulkImportQuestions onImport={handleBulkImport} />
        </DialogContent>
      </Dialog>
    </div>
  )
}