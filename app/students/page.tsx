"use client"

import { useEffect, useState } from "react"
import { type Student } from "@/lib/api"
import { useApp } from "@/lib/context/AppContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash, RotateCcw, UserPlus, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { VisualStudentPicker } from "@/components/visual-student-picker"
import { BulkImportStudents } from "@/components/bulk-import-students"
import { useSound } from "@/components/sound-effects"

export default function StudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent, loading } = useApp()
  const [newStudentName, setNewStudentName] = useState("")
  const [newStudentGroup, setNewStudentGroup] = useState("")
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editName, setEditName] = useState("")
  const [editGroup, setEditGroup] = useState("")
  const [pickedStudent, setPickedStudent] = useState<Student | null>(null)
  const [pickedStudentIds, setPickedStudentIds] = useState<number[]>([])
  const [showStudentPicker, setShowStudentPicker] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const { playSound } = useSound()

  const handleAddStudent = async () => {
    if (newStudentName.trim()) {
      try {
        await addStudent({
          name: newStudentName.trim(),
          group: newStudentGroup.trim()
        });
        setNewStudentName("")
        setNewStudentGroup("")
        playSound("click")
      } catch (error) {
        console.error('Error adding student:', error)
      }
    }
  }

  const handleUpdateStudent = async () => {
    if (editingStudent && editName.trim()) {
      try {
        await updateStudent(editingStudent.id, {
          name: editName.trim(),
          group: editGroup.trim()
        });
        setEditingStudent(null)
        setEditName("")
        setEditGroup("")
        playSound("click")
      } catch (error) {
        console.error('Error updating student:', error)
      }
    }
  }

  const handleDeleteStudent = async (id: number) => {
    try {
      await deleteStudent(id)
      playSound("click")
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  const resetPicker = () => {
    setPickedStudentIds([])
    setPickedStudent(null)
    playSound("click")
  }

  const handleStudentPicked = (student: Student) => {
    setPickedStudent(student)

    // Add to picked students list if not already there
    if (!pickedStudentIds.includes(student.id)) {
      const newPickedIds = [...pickedStudentIds, student.id]
      setPickedStudentIds(newPickedIds)
    }

    setShowStudentPicker(false)
  }

  const handleBulkImportComplete = async (studentsToImport: { name: string, group: string }[]) => {
    try {
      for (const student of studentsToImport) {
        await addStudent(student)
      }
      setShowBulkImport(false)
    } catch (error) {
      console.error('Error bulk importing students:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the student data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground">Manage your classroom students and pick random students</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-indigo-500" />
                  <CardTitle>Add New Student</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowBulkImport(true)} className="gap-1">
                  <Upload className="h-3 w-3" />
                  Bulk Import
                </Button>
              </div>
              <CardDescription>Enter student details to add to your class</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="student-name">Student Name</Label>
                  <Input
                    id="student-name"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddStudent()
                    }}
                    placeholder="Enter student name"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-group">Group</Label>
                  <Input
                    id="student-group"
                    value={newStudentGroup}
                    onChange={(e) => setNewStudentGroup(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddStudent()
                    }}
                    placeholder="Enter student group"
                    className="rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleAddStudent}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                >
                  Add Student
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b dark:border-gray-700">
              <CardTitle>Student Picker</CardTitle>
              <CardDescription>Randomly select a student from your class</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex justify-between">
                <Button
                  onClick={() => {
                    setShowStudentPicker(true)
                    playSound("click")
                  }}
                  disabled={students.length === 0}
                  className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                >
                  Pick Random Student
                </Button>
                <Button variant="outline" onClick={resetPicker} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset Picker
                </Button>
              </div>

              {pickedStudent ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl border bg-gradient-to-r from-indigo-50 to-purple-50 p-4 text-center dark:border-gray-700 dark:from-indigo-900/20 dark:to-purple-900/20"
                >
                  <p className="text-sm text-muted-foreground">Selected Student:</p>
                  <p className="text-xl font-bold">{pickedStudent.name}</p>
                  <p className="text-sm text-muted-foreground">Group: {pickedStudent.group}</p>
                </motion.div>
              ) : (
                <div className="rounded-xl border p-4 text-center text-muted-foreground dark:border-gray-700">
                  No student selected yet
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {pickedStudentIds.length > 0 ? (
                  <p>
                    {pickedStudentIds.length} of {students.length} students have been picked
                  </p>
                ) : (
                  <p>No students have been picked yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle>Student List</CardTitle>
            <CardDescription>Manage your classroom students</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.group}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingStudent(student)
                                  setEditName(student.name)
                                  setEditGroup(student.group)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Student</DialogTitle>
                                <DialogDescription>Update the student's information</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-name">Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    autoFocus
                                    className="rounded-xl"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-group">Group</Label>
                                  <Input
                                    id="edit-group"
                                    value={editGroup}
                                    onChange={(e) => setEditGroup(e.target.value)}
                                    className="rounded-xl"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleUpdateStudent}>Save changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No students found</AlertTitle>
                <AlertDescription>Add students using the form above to get started.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showStudentPicker} onOpenChange={setShowStudentPicker}>
        <DialogContent className="sm:max-w-md">
          <VisualStudentPicker
            students={students}
            excludeIds={pickedStudentIds}
            onStudentPicked={handleStudentPicked}
            onClose={() => setShowStudentPicker(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Import Students</DialogTitle>
            <DialogDescription>Add multiple students at once</DialogDescription>
          </DialogHeader>
          <BulkImportStudents onImportComplete={handleBulkImportComplete} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
