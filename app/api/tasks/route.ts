import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { v4 as uuidv4 } from "uuid"
import type { Task } from "@/types/task"

export async function GET() {
  try {
    const tasksMap = await redis.hgetall("kanban:tasks")
    const tasks: Task[] = Object.values(tasksMap).map((t) => JSON.parse(t))
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Body should contain title, description, priority, assignee, columnId
    const task: Task = {
      id: uuidv4(),
      title: body.title,
      description: body.description,
      priority: body.priority,
      assignee: body.assignee,
      columnId: body.columnId || "backlog", // Default to backlog
    }
    
    await redis.hset("kanban:tasks", task.id, JSON.stringify(task))
    return NextResponse.json(task)
  } catch (error) {
    console.error("POST Error:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id } = body
    
    if (!id) {
       return NextResponse.json({ error: "Task ID required" }, { status: 400 })
    }

    const existingStr = await redis.hget("kanban:tasks", id)
    if (!existingStr) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
    const existing = JSON.parse(existingStr)
    const updated = { ...existing, ...body }
    
    await redis.hset("kanban:tasks", id, JSON.stringify(updated))
    return NextResponse.json(updated)
  } catch (error) {
     console.error("PUT Error:", error)
     return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 })
    }

    const deleted = await redis.hdel("kanban:tasks", id)
    if (deleted === 0) {
       return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE Error:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
