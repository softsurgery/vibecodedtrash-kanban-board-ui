"use client"

import { useState, useEffect, useCallback } from "react"
import KanbanColumn from "./kanban-column"
import TaskDialog from "./task-dialog"
import type { Task } from "@/types/task"
import type { Column } from "@/types/column"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface KanbanBoardProps {
  searchQuery: string
}

const COLORS = [
  { value: "bg-slate-500", label: "Slate" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-amber-500", label: "Amber" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-lime-500", label: "Lime" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-emerald-500", label: "Emerald" },
  { value: "bg-teal-500", label: "Teal" },
  { value: "bg-cyan-500", label: "Cyan" },
  { value: "bg-sky-500", label: "Sky" },
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-violet-500", label: "Violet" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-fuchsia-500", label: "Fuchsia" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-rose-500", label: "Rose" },
]

export default function KanbanBoard({ searchQuery }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  
  // Add Column Dialog State
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [newColumnColor, setNewColumnColor] = useState("bg-slate-500")
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, columnsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/columns")
      ])

      const tasksData = await tasksRes.json()
      const columnsData = await columnsRes.json()

      if (Array.isArray(tasksData)) setTasks(tasksData)
      if (Array.isArray(columnsData)) {
          setColumns(columnsData.sort((a, b) => a.order - b.order))
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Polling
  useEffect(() => {
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [fetchData])

  const openAddDialog = (columnId: string) => {
    setEditingTask(null)
    setSelectedColumn(columnId)
    setIsDialogOpen(true)
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setSelectedColumn(task.columnId)
    setIsDialogOpen(true)
  }

  const handleSaveTask = async (title: string, description: string, priority: "low" | "medium" | "high") => {
    if (editingTask) {
      // Update
      try {
         const updatedTask = { ...editingTask, title, description, priority }
         const res = await fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTask),
        })
        if (!res.ok) throw new Error("Failed to update task")
        fetchData()
      } catch (error) {
        console.error(error)
      }
    } else {
      // Create
      const newTaskPartial = {
        title,
        description,
        priority,
        assignee: "Unassigned",
        columnId: selectedColumn || columns[0]?.id || "backlog",
      }
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTaskPartial),
        })
        if (!res.ok) throw new Error("Failed to create task")
        fetchData()
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleDeleteTask = async () => {
     if (!editingTask) return
     try {
       const res = await fetch(`/api/tasks?id=${editingTask.id}`, {
         method: "DELETE"
       })
       if (!res.ok) throw new Error("Failed to delete task")
       fetchData()
     } catch (error) {
        console.error(error)
     }
  }

  const moveTask = async (taskId: string, fromColumn: string, toColumn: string) => {
    if (fromColumn === toColumn) return

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, columnId: toColumn } : t))
    )

    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, columnId: toColumn }),
      })
      if (!res.ok) throw new Error("Failed to update task")
    } catch (error) {
      console.error("Failed to move task:", error)
      fetchData()
    }
  }

  const handleCreateColumn = async () => {
    if (!newColumnTitle) return
    try {
      await fetch("/api/columns", {
        method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ title: newColumnTitle, color: newColumnColor })
      })
      setNewColumnTitle("")
      setNewColumnColor("bg-slate-500")
      setIsAddColumnDialogOpen(false)
      fetchData()
    } catch(error) {
      console.error(error)
    }
  }

  const handleDeleteColumn = (columnId: string) => {
    setColumnToDelete(columnId)
  }

  const confirmDeleteColumn = async () => {
    if (!columnToDelete) return
    try {
      await fetch(`/api/columns?id=${columnToDelete}`, { method: "DELETE" })
      setColumnToDelete(null)
      fetchData()
    } catch(error) {
      console.error(error)
    }
  }

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading board...</div>
  }

  return (
    <>
      <div className="h-full flex gap-6 p-6 overflow-x-auto bg-background items-start">
        {columns.map((col) => (
            <KanbanColumn
                key={col.id}
                title={col.title}
                columnId={col.id}
                tasks={filteredTasks.filter(t => t.columnId === col.id)}
                onTaskMove={moveTask}
                onAddTask={openAddDialog}
                onTaskClick={openEditDialog}
                onDeleteColumn={handleDeleteColumn}
                color={col.color}
            />
        ))}

        {/* Add Column Button */}
        <div className="flex-shrink-0 w-80">
            <Button 
                variant="outline" 
                className="w-full justify-start h-12 border-dashed border-2 hover:border-primary"
                onClick={() => setIsAddColumnDialogOpen(true)}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Space
            </Button>
        </div>
      </div>

      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTask}
        onDelete={editingTask ? handleDeleteTask : undefined}
        task={editingTask}
      />

      <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Create New Space</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Space Name</Label>
                    <Input 
                        value={newColumnTitle} 
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        placeholder="e.g. QA, Review" 
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                        {COLORS.map((c) => (
                            <button
                                key={c.value}
                                className={`w-6 h-6 rounded-full ${c.value} ${newColumnColor === c.value ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                                onClick={() => setNewColumnColor(c.value)}
                                title={c.label}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddColumnDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateColumn} disabled={!newColumnTitle}>Create</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!columnToDelete} onOpenChange={(open) => !open && setColumnToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this space?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Tasks within this space will remain but will be hidden from the board until moved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={confirmDeleteColumn}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
