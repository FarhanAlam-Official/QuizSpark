"use client"

import { useState } from "react"
import { useApp } from "@/lib/context/AppContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Medal, RotateCcw, Trophy, User, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"

export default function LeaderboardPage() {
  const { students, updateStudent, loading } = useApp()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"individual" | "group">("individual")

  const handleResetScores = async () => {
    try {
      // Reset all student scores to 0
      await Promise.all(students.map(student => updateStudent(student.id, { score: 0 })))
      setIsResetDialogOpen(false)
    } catch (error) {
      console.error('Failed to reset scores:', error)
    }
  }

  // Sort students by score (highest first)
  const sortedStudents = [...students].sort((a, b) => b.score - a.score)

  // Calculate group scores
  const groupScores = students.reduce((acc, student) => {
    if (student.group) {
      acc[student.group] = (acc[student.group] || 0) + student.score
    }
    return acc
  }, {} as Record<string, number>)

  // Sort groups by score
  const sortedGroups = Object.entries(groupScores)
    .sort(([, a], [, b]) => b - a)
    .map(([group, score]) => ({
      group,
      score,
      members: students.filter(s => s.group === group).length
    }))

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-yellow-500"
      case 1:
        return "text-gray-400"
      case 2:
        return "text-amber-600"
      default:
        return "text-transparent"
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">View student scores and rankings</p>
        </div>
        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Scores
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset All Scores</DialogTitle>
              <DialogDescription>
                This will reset all student scores to zero. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleResetScores}>
                Reset All Scores
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 mb-4">
        <Button
          variant={activeTab === "individual" ? "default" : "outline"}
          onClick={() => setActiveTab("individual")}
          className="gap-2"
        >
          <User className="h-4 w-4" />
          Individual Rankings
        </Button>
        <Button
          variant={activeTab === "group" ? "default" : "outline"}
          onClick={() => setActiveTab("group")}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Group Rankings
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        key={activeTab}
      >
        <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {activeTab === "individual" ? "Student Rankings" : "Group Rankings"}
            </CardTitle>
            <CardDescription>
              {activeTab === "individual" 
                ? "Students ranked by total score" 
                : "Groups ranked by combined score"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {activeTab === "individual" ? (
              sortedStudents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`${
                          index < 3
                            ? "bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10"
                            : ""
                        }`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {index < 3 && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                                <Medal className={`h-4 w-4 ${getMedalColor(index)}`} />
                              </div>
                            )}
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div>{student.name}</div>
                              {student.group && (
                                <div className="text-sm text-muted-foreground">Group {student.group}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="rounded-full bg-indigo-100 px-3 py-1 font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            {student.score} pts
                          </span>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No students found</AlertTitle>
                  <AlertDescription>Add students in the Students section to see rankings.</AlertDescription>
                </Alert>
              )
            ) : (
              sortedGroups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead className="text-right">Total Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedGroups.map(({ group, score, members }, index) => (
                      <motion.tr
                        key={group}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`${
                          index < 3
                            ? "bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10"
                            : ""
                        }`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {index < 3 && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                                <Medal className={`h-4 w-4 ${getMedalColor(index)}`} />
                              </div>
                            )}
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                              {group}
                            </div>
                            <span>Group {group}</span>
                          </div>
                        </TableCell>
                        <TableCell>{members} students</TableCell>
                        <TableCell className="text-right">
                          <span className="rounded-full bg-indigo-100 px-3 py-1 font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            {score} pts
                          </span>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No groups found</AlertTitle>
                  <AlertDescription>Add students to groups to see group rankings.</AlertDescription>
                </Alert>
              )
            )}
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
            <CardTitle>Score Statistics</CardTitle>
            <CardDescription>Overview of {activeTab === "individual" ? "student" : "group"} performance</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:border-gray-700 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="text-sm font-medium text-muted-foreground">Total Points</div>
                <div className="text-2xl font-bold">
                  {activeTab === "individual" 
                    ? students.reduce((sum, student) => sum + student.score, 0)
                    : Object.values(groupScores).reduce((sum, score) => sum + score, 0)
                  }
                </div>
              </div>
              <div className="rounded-xl border bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:border-gray-700 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="text-sm font-medium text-muted-foreground">
                  {activeTab === "individual" ? "Average Score" : "Average Group Score"}
                </div>
                <div className="text-2xl font-bold">
                  {activeTab === "individual"
                    ? students.length > 0
                      ? (students.reduce((sum, student) => sum + student.score, 0) / students.length).toFixed(1)
                      : "0"
                    : sortedGroups.length > 0
                      ? (Object.values(groupScores).reduce((sum, score) => sum + score, 0) / sortedGroups.length).toFixed(1)
                      : "0"
                  }
                </div>
              </div>
              <div className="rounded-xl border bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:border-gray-700 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="text-sm font-medium text-muted-foreground">Highest Score</div>
                <div className="text-2xl font-bold">
                  {activeTab === "individual"
                    ? students.length > 0 ? Math.max(...students.map((s) => s.score)) : "0"
                    : sortedGroups.length > 0 ? Math.max(...Object.values(groupScores)) : "0"
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
