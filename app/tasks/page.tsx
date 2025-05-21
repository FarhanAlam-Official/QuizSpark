"use client"

import { useEffect, useState } from "react"
import { type Task, type Student } from "@/lib/api"
import { useApp } from "@/lib/context/AppContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, Edit, Plus, Trash, FileText, Paperclip, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function TasksPage() {
  const { tasks, students, addTask, updateTask, deleteTask, loading } = useApp()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Add this at the top with other state declarations
  const UNASSIGNED_VALUE = "unassigned"

  interface FormData {
    title: string
    description: string
    assignedTo: string
    assignedGroup: string
    type: "Verbal" | "Written" | "Numerical"
    attachment: File | null
  }

  const initialFormState: FormData = {
    title: "",
    description: "",
    assignedTo: UNASSIGNED_VALUE,
    assignedGroup: UNASSIGNED_VALUE,
    type: "Verbal",
    attachment: null
  }

  const [formData, setFormData] = useState<FormData>(initialFormState)

  const [groups, setGroups] = useState<string[]>([])

  useEffect(() => {
    // Extract unique groups from students
    const uniqueGroups = Array.from(new Set(students.map((s) => s.group).filter(Boolean)))
    setGroups(uniqueGroups)
  }, [students])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, attachment: e.target.files[0] })
    }
  }

  const uploadFile = async (file: File): Promise<{ url: string; name: string }> => {
    // In a real application, you would upload to a server/cloud storage
    // For now, we'll create a local URL
    const url = URL.createObjectURL(file)
    return { url, name: file.name }
  }

  const resetForm = () => {
    setFormData(initialFormState)
  }

  const handleAddTask = async () => {
    if (formData.title.trim()) {
      try {
        let attachmentUrl = null
        let attachmentName = null

        if (formData.attachment) {
          const { url, name } = await uploadFile(formData.attachment)
          attachmentUrl = url
          attachmentName = name
        }

        await addTask({
          title: formData.title.trim(),
          description: formData.description.trim(),
          type: formData.type,
          assignedTo: formData.assignedTo === UNASSIGNED_VALUE ? null : parseInt(formData.assignedTo),
          assignedGroup: formData.assignedGroup === UNASSIGNED_VALUE ? null : formData.assignedGroup,
          attachmentUrl,
          attachmentName,
          completed: false
        })
        setIsAddDialogOpen(false)
        resetForm()
      } catch (error) {
        console.error('Error adding task:', error)
      }
    }
  }

  const handleEditTask = async () => {
    if (!editingTask || !formData.title.trim()) return

    try {
      let attachmentUrl = editingTask.attachmentUrl
      let attachmentName = editingTask.attachmentName

      if (formData.attachment) {
        const { url, name } = await uploadFile(formData.attachment)
        attachmentUrl = url
        attachmentName = name
      }

      const updatedTask: Partial<Task> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        assignedTo: formData.assignedTo === UNASSIGNED_VALUE ? null : parseInt(formData.assignedTo),
        assignedGroup: formData.assignedGroup === UNASSIGNED_VALUE ? null : formData.assignedGroup,
        attachmentUrl,
        attachmentName
      }

      await updateTask(editingTask.id, updatedTask)
      setEditingTask(null)
      setIsEditDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleToggleCompletion = async (id: number) => {
    try {
      const task = tasks.find(t => t.id === id)
      if (task) {
        await updateTask(id, { completed: !task.completed })
      }
    } catch (error) {
      console.error('Failed to toggle task completion:', error)
    }
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title || "",
      description: task.description || "",
      type: task.type,
      assignedTo: task.assignedTo?.toString() || UNASSIGNED_VALUE,
      assignedGroup: task.assignedGroup || UNASSIGNED_VALUE,
      attachment: null
    })
    setIsEditDialogOpen(true)
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "Verbal":
        return "bg-blue-500"
      case "Written":
        return "bg-purple-500"
      case "Numerical":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStudentName = (id: number | null) => {
    if (!id) return "Unassigned"
    const student = students.find((s) => s.id === id)
    return student ? student.name : "Unknown"
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage tasks for your students</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>Create a new task for your students</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input
                  id="task-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-type">Task Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "Verbal" | "Written" | "Numerical") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="task-type">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verbal">Verbal</SelectItem>
                    <SelectItem value="Written">Written</SelectItem>
                    <SelectItem value="Numerical">Numerical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assigned-to">Assign To (Optional)</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                >
                  <SelectTrigger id="assigned-to">
                    <SelectValue placeholder="Select student (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assigned-group">Assign Group (Optional)</Label>
                <Select
                  value={formData.assignedGroup}
                  onValueChange={(value) => setFormData({ ...formData, assignedGroup: value })}
                >
                  <SelectTrigger id="assigned-group">
                    <SelectValue placeholder="Select group (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-attachment">Attachment (Optional)</Label>
                <Input
                  id="task-attachment"
                  type="file"
                  onChange={handleFileChange}
                  accept=".doc,.docx,.pdf,.txt,.jpg,.jpeg,.png"
                />
                {formData.attachment && (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {formData.attachment.name}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTask}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
            <CardDescription>Tasks that are not yet completed</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.filter((task) => !task.completed).length > 0 ? (
              <div className="space-y-4">
                {tasks
                  .filter((task) => !task.completed)
                  .map((task) => (
                    <div key={task.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{task.title}</span>
                          <Badge className={getTaskTypeColor(task.type)}>{task.type}</Badge>
                          {task.attachmentUrl && (
                            <a
                              href={task.attachmentUrl}
                              download={task.attachmentName}
                              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                              <FileText className="h-4 w-4" />
                              {task.attachmentName}
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {task.assignedGroup ? `Group ${task.assignedGroup}` : 'No group'} •{' '}
                          {task.assignedTo ? `Assigned to: ${getStudentName(task.assignedTo)}` : 'Unassigned'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleCompletion(task.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(task)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No active tasks</AlertTitle>
                <AlertDescription>Add tasks using the "Add Task" button to get started.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
            <CardDescription>Tasks that have been completed</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.filter((task) => task.completed).length > 0 ? (
              <div className="space-y-4">
                {tasks
                  .filter((task) => task.completed)
                  .map((task) => (
                    <div key={task.id} className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium line-through">{task.title}</span>
                          <Badge className={getTaskTypeColor(task.type)}>{task.type}</Badge>
                          {task.attachmentUrl && (
                            <a
                              href={task.attachmentUrl}
                              download={task.attachmentName}
                              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                              <FileText className="h-4 w-4" />
                              {task.attachmentName}
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Completed by: {getStudentName(task.assignedTo)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleCompletion(task.id)}>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No completed tasks</AlertTitle>
                <AlertDescription>Tasks will appear here once they are marked as completed.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the task details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-task-title">Task Title</Label>
              <Input
                id="edit-task-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-task-description">Description</Label>
              <Input
                id="edit-task-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-task-type">Task Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "Verbal" | "Written" | "Numerical") => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="edit-task-type">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verbal">Verbal</SelectItem>
                  <SelectItem value="Written">Written</SelectItem>
                  <SelectItem value="Numerical">Numerical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-assigned-to">Assign To (Optional)</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
              >
                <SelectTrigger id="edit-assigned-to">
                  <SelectValue placeholder="Select student (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-assigned-group">Assign Group (Optional)</Label>
              <Select
                value={formData.assignedGroup}
                onValueChange={(value) => setFormData({ ...formData, assignedGroup: value })}
              >
                <SelectTrigger id="edit-assigned-group">
                  <SelectValue placeholder="Select group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-task-attachment">Attachment (Optional)</Label>
              <Input
                id="edit-task-attachment"
                type="file"
                onChange={handleFileChange}
                accept=".doc,.docx,.pdf,.txt,.jpg,.jpeg,.png"
              />
              {formData.attachment && (
                <p className="text-sm text-muted-foreground">
                  Selected file: {formData.attachment.name}
                </p>
              )}
              {editingTask?.attachmentName && !formData.attachment && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Paperclip className="h-4 w-4" />
                  <span>Current file: {editingTask.attachmentName}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
