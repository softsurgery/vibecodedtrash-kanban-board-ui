"use client"

import type React from "react"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
import type { Task } from "@/types/task"

interface KanbanCardProps {
  task: Task
  columnId: string
  onClick: () => void
}

export default function KanbanCard({ task, columnId, onClick }: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("application/json", JSON.stringify({ taskId: task.id, fromColumn: columnId }))
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const priorityColors = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-green-500/20 text-green-400",
  }

  const assigneeColors = {
    Alex: "bg-blue-500",
    Jordan: "bg-purple-500",
    Sam: "bg-pink-500",
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={`p-3 rounded-lg border border-border bg-background hover:border-primary cursor-move transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {/* Title */}
      <h4 className="font-medium text-sm text-foreground mb-2 line-clamp-2">{task.title}</h4>

      {/* Description */}
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${assigneeColors[task.assignee as keyof typeof assigneeColors]}`}
          >
            {task.assignee?.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  )
}
