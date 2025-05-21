"use client"

import { useEffect, useState } from "react"
import { type Question } from "@/lib/api"
import { useApp } from "@/lib/context/AppContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Plus, Trash, Upload } from "lucide-react"
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
  const { questions, addQuestion, updateQuestion, deleteQuestion, loading } = useApp()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const { playSound } = useSound()

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOption: 0,
    topic: "",
    difficulty: "Normal" as "Easy" | "Normal" | "Hard",
  })

  const resetForm = () => {
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correctOption: 0,
      topic: "",
      difficulty: "Normal",
    })
  }

  const handleAddQuestion = async () => {
    // Validate form
    if (!formData.question.trim() || formData.options.some((opt) => !opt.trim()) || !formData.topic.trim()) {
      return
    }

    try {
      await addQuestion({
        question: formData.question.trim(),
        options: formData.options.map((opt) => opt.trim()),
        correctOption: formData.correctOption,
        topic: formData.topic.trim(),
        difficulty: formData.difficulty,
      })
      resetForm()
      setIsAddDialogOpen(false)
      playSound("click")
    } catch (error) {
      console.error('Failed to add question:', error)
    }
  }

  const handleEditQuestion = async () => {
    if (!editingQuestion) return

    // Validate form
    if (!formData.question.trim() || formData.options.some((opt) => !opt.trim()) || !formData.topic.trim()) {
      return
    }

    try {
      await updateQuestion(editingQuestion.id, {
        question: formData.question.trim(),
        options: formData.options.map((opt) => opt.trim()),
        correctOption: formData.correctOption,
        topic: formData.topic.trim(),
        difficulty: formData.difficulty,
      })
      setEditingQuestion(null)
      resetForm()
      setIsEditDialogOpen(false)
      playSound("click")
    } catch (error) {
      console.error('Failed to update question:', error)
    }
  }

  const handleDeleteQuestion = async (id: number) => {
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
      options: [...question.options],
      correctOption: question.correctOption,
      topic: question.topic,
      difficulty: question.difficulty as "Easy" | "Normal" | "Hard",
    })
    setIsEditDialogOpen(true)
    playSound("click")
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleBulkImportComplete = () => {
    playSound("click")
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
          <p className="text-muted-foreground">Manage your quiz questions</p>
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
            <DialogContent className="max-w-md">
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
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="rounded-xl"
                      />
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`correct-${index}`}
                          name="correctAnswer"
                          checked={formData.correctOption === index}
                          onChange={() => setFormData({ ...formData, correctOption: index })}
                          className="mr-2"
                        />
                        <Label htmlFor={`correct-${index}`} className="text-sm">
                          Correct
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="Enter topic or category"
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: "Easy" | "Normal" | "Hard") =>
                      setFormData({ ...formData, difficulty: value })
                    }
                  >
                    <SelectTrigger id="difficulty" className="rounded-xl">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddQuestion}>Add Question</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle>Question List</CardTitle>
            <CardDescription>Manage your quiz questions</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : questions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question: Question, index: number) => (
                    <motion.tr
                      key={question.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <TableCell className="font-medium max-w-[300px] truncate">{question.question}</TableCell>
                      <TableCell>{question.topic}</TableCell>
                      <TableCell>
                        <Badge className={`${getDifficultyColor(question.difficulty)} text-white`}>
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(question)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(question.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No questions found</AlertTitle>
                <AlertDescription>Add questions using the "Add Question" button to get started.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Update the question details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-question">Question</Label>
              <Textarea
                id="edit-question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter your question"
                className="min-h-[80px] rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label>Options</Label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="rounded-xl"
                  />
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`edit-correct-${index}`}
                      name="editCorrectAnswer"
                      checked={formData.correctOption === index}
                      onChange={() => setFormData({ ...formData, correctOption: index })}
                      className="mr-2"
                    />
                    <Label htmlFor={`edit-correct-${index}`} className="text-sm">
                      Correct
                    </Label>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-topic">Topic</Label>
              <Input
                id="edit-topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Enter topic or category"
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: "Easy" | "Normal" | "Hard") => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger id="edit-difficulty" className="rounded-xl">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditQuestion}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Import Questions</DialogTitle>
            <DialogDescription>Add multiple questions at once</DialogDescription>
          </DialogHeader>
          <BulkImportQuestions onImportComplete={handleBulkImportComplete} />
        </DialogContent>
      </Dialog>
    </div>
  )
}