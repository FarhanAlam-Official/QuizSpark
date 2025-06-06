"use client"

import { useEffect, useState } from "react"
import { type Task } from "@/lib/supabase"
import { useApp } from "@/lib/context/AppContext"
import { useAuth } from "@/lib/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Plus, Trash, Search, Filter, Calendar, Clock, Tag, CheckCircle2 } from "lucide-react"
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
import { format } from "date-fns"
import { useSound } from "@/components/sound-effects"

export default function TasksPage() {
  const { user } = useAuth()
  const { tasks, addTask, updateTask, deleteTask, loading } = useApp()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { playSound } = useSound()

  // Filter state
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [showCompleted, setShowCompleted] = useState(false)
  const [tags, setTags] = useState<Array<{ name: string, count: number }>>([])

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending" as "pending" | "in_progress" | "completed",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
    assigned_to: "",
    tags: [] as string[],
    metadata: {} as Record<string, any>
  })

  // Extract unique tags and their counts
  useEffect(() => {
    if (!loading) {
      const tagCounts = tasks.reduce((acc, t) => {
        t.tags?.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>)

      const uniqueTags = Object.entries(tagCounts).map(([name, count]) => ({
        name,
        count
      })).sort((a, b) => a.name.localeCompare(b.name))

      setTags(uniqueTags)
    }
  }, [loading, tasks])

  // Filter tasks
  useEffect(() => {
    let filtered = [...tasks]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description?.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(t => t.status === selectedStatus)
    }

    // Apply priority filter
    if (selectedPriority !== "all") {
      filtered = filtered.filter(t => t.priority === selectedPriority)
    }

    // Apply tag filter
    if (selectedTag !== "all") {
      filtered = filtered.filter(t => t.tags?.includes(selectedTag))
    }

    // Filter completed tasks
    if (!showCompleted) {
      filtered = filtered.filter(t => t.status !== "completed")
    }

    setFilteredTasks(filtered)
  }, [tasks, searchQuery, selectedStatus, selectedPriority, selectedTag, showCompleted])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      due_date: "",
      assigned_to: "",
      tags: [],
      metadata: {}
    })
  }

  const handleAddTask = async () => {
    if (!user) return

    // Validate form
    if (!formData.title.trim()) {
      return
    }

    try {
      await addTask({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        assigned_to: formData.assigned_to || null,
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
      console.error('Failed to add task:', error)
    }
  }

  const handleEditTask = async () => {
    if (!editingTask || !user) return

    // Validate form
    if (!formData.title.trim()) {
      return
    }

    try {
      await updateTask(editingTask.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        assigned_to: formData.assigned_to || null,
        tags: formData.tags,
        metadata: {
          ...editingTask.metadata,
          last_updated: new Date().toISOString(),
          updated_via: "web_interface"
        },
        updated_by: user.id
      })
      setEditingTask(null)
      resetForm()
      setIsEditDialogOpen(false)
      playSound("click")
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id)
      playSound("click")
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleCompleteTask = async (task: Task) => {
    if (!user) return

    try {
      await updateTask(task.id, {
        status: "completed",
        completed_at: new Date().toISOString(),
        metadata: {
          ...task.metadata,
          completed_by: user.id,
          completed_at: new Date().toISOString()
        },
        updated_by: user.id
      })
      playSound("success")
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status as any,
      priority: task.priority as any,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "",
      assigned_to: task.assigned_to || "",
      tags: task.tags || [],
      metadata: task.metadata || {}
    })
    setIsEditDialogOpen(true)
    playSound("click")
  }

  const handleTagsChange = (value: string) => {
    const newTags = value.split(",").map(tag => tag.trim()).filter(Boolean)
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "in_progress":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your tasks.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a new task to track</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title"
                    className="rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter task description"
                    className="min-h-[80px] rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    >
                      <SelectTrigger id="status" className="rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                    >
                      <SelectTrigger id="priority" className="rounded-xl">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="assigned-to">Assigned To (User ID)</Label>
                    <Input
                      id="assigned-to"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      placeholder="Enter user ID"
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
                <Button onClick={handleAddTask}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Task List</CardTitle>
              <CardDescription>View and manage your tasks</CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px] rounded-xl"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
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
              <Button
                variant="outline"
                onClick={() => setShowCompleted(!showCompleted)}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {showCompleted ? "Hide Completed" : "Show Completed"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="max-w-[300px] truncate font-medium">
                    {task.title}
                    {task.description && (
                      <p className="truncate text-sm text-muted-foreground">{task.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(task.status)} text-white`}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.due_date ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(task.due_date), "MMM d, yyyy")}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{task.assigned_to || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {task.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCompleteTask(task)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
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
    </div>
  )
}
