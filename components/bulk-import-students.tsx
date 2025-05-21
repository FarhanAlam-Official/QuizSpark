"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, FileText, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { useSound } from "@/components/sound-effects"

interface BulkImportStudentsProps {
  onImportComplete: (students: Array<{ name: string, group: string }>) => void
}

export function BulkImportStudents({ onImportComplete }: BulkImportStudentsProps) {
  const [inputText, setInputText] = useState("")
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importCount, setImportCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const { playSound } = useSound()

  const handleImport = () => {
    if (!inputText.trim()) {
      setImportStatus("error")
      setErrorMessage("Please enter student names")
      return
    }

    try {
      // Split by new lines and filter out empty lines
      const lines = inputText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

      if (lines.length === 0) {
        setImportStatus("error")
        setErrorMessage("No valid student data found")
        return
      }

      // Parse each line as "name, group"
      const students = lines.map(line => {
        const [name, group = "A"] = line.split(",").map(s => s.trim())
        return { name, group }
      }).filter(({ name }) => name && name.length > 0)

      if (students.length === 0) {
        setImportStatus("error")
        setErrorMessage("No valid student data found")
        return
      }

      setImportCount(students.length)
      setImportStatus("success")

      // Use setTimeout to ensure UI updates before playing sound
      setTimeout(() => {
        playSound("click")
      }, 100)

      onImportComplete(students)
    } catch (error) {
      setImportStatus("error")
      setErrorMessage("Error importing students: " + (error instanceof Error ? error.message : String(error)))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-medium">Bulk Import Students</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="students-import">Enter student data (one per line, format: name, group)</Label>
        <Textarea
          id="students-import"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="John Doe, A
Jane Smith, B
Alex Johnson, A"
          className="min-h-[200px] rounded-xl"
        />
      </div>

      {importStatus === "success" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <AlertTitle className="text-green-700 dark:text-green-300">Import Successful</AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-400">
                Ready to import {importCount} student{importCount !== 1 ? "s" : ""}
              </AlertDescription>
            </div>
          </div>
        </motion.div>
      )}

      {importStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Import Failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={handleImport} className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <Upload className="h-4 w-4" />
          Import Students
        </Button>
      </div>
    </div>
  )
}
