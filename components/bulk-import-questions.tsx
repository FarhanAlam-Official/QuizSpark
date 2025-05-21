"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, FileText, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { useSound } from "@/components/sound-effects"
import { useApp } from "@/lib/context/AppContext"

interface BulkImportQuestionsProps {
  onImportComplete: () => void
}

export function BulkImportQuestions({ onImportComplete }: BulkImportQuestionsProps) {
  const { addQuestion } = useApp()
  const [inputText, setInputText] = useState("")
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importCount, setImportCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const { playSound } = useSound()

  const handleImport = async () => {
    if (!inputText.trim()) {
      setImportStatus("error")
      setErrorMessage("Please enter questions in JSON format")
      return
    }

    try {
      // Parse JSON input
      const questionsData = JSON.parse(inputText)

      if (!Array.isArray(questionsData)) {
        setImportStatus("error")
        setErrorMessage("Input must be an array of questions")
        return
      }

      // Validate and add each question
      let addedCount = 0
      for (const q of questionsData) {
        if (
          typeof q.question === "string" &&
          Array.isArray(q.options) &&
          q.options.length >= 2 &&
          typeof q.correctOption === "number" &&
          typeof q.topic === "string" &&
          ["Easy", "Normal", "Hard"].includes(q.difficulty)
        ) {
          await addQuestion({
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            topic: q.topic,
            difficulty: q.difficulty,
          })
          addedCount++
        }
      }

      if (addedCount === 0) {
        setImportStatus("error")
        setErrorMessage("No valid questions found in the input")
        return
      }

      setImportCount(addedCount)
      setImportStatus("success")

      // Use setTimeout to ensure UI updates before playing sound
      setTimeout(() => {
        playSound("click")
      }, 100)

      onImportComplete()
    } catch (error) {
      setImportStatus("error")
      setErrorMessage("Error parsing JSON: " + (error instanceof Error ? error.message : String(error)))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-medium">Bulk Import Questions</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="questions-import">Enter questions in JSON format</Label>
        <Textarea
          id="questions-import"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`[
  {
    "question": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correctOption": 1,
    "topic": "Math",
    "difficulty": "Easy"
  },
  {
    "question": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctOption": 2,
    "topic": "Geography",
    "difficulty": "Normal"
  }
]`}
          className="min-h-[300px] font-mono text-sm rounded-xl"
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
                Successfully imported {importCount} question{importCount !== 1 ? "s" : ""}
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
          Import Questions
        </Button>
      </div>
    </div>
  )
}
