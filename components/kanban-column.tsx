"use client"

import type React from "react"

import { useState } from "react"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import KanbanCard from "./kanban-card"
import type { Task } from "@/types/task"

interface KanbanColumnProps {
  title: string
  columnId: string
  tasks: Task[]
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string) => void
  onAddTask: (columnId: string) => void
  onTaskClick: (task: Task) => void
  onDeleteColumn?: (columnId: string) => void
  color: string
}

export default function KanbanColumn({ title, columnId, tasks, onTaskMove, onAddTask, onTaskClick, onDeleteColumn, color }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const data = e.dataTransfer.getData("application/json")
    if (data) {
      const { taskId, fromColumn } = JSON.parse(data)
      onTaskMove(taskId, fromColumn, columnId)
    }
  }

  return (
    <div
      className={`flex-shrink-0 w-80 flex flex-col bg-card rounded-lg border border-border ${
        isDragOver ? "ring-2 ring-primary" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">{tasks.length}</span>
        </div>
        {onDeleteColumn && (
          <Button variant="link" size="sm" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onDeleteColumn(columnId)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No tasks</div>
        ) : (
          tasks.map((task) => (
            <KanbanCard key={task.id} task={task} columnId={columnId} onClick={() => onTaskClick(task)} />
          ))
        )}
      </div>

      {/* Add card button */}
      <div className="px-4 py-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => onAddTask(columnId)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add card
        </Button>
      </div>
    </div>
  )
}
