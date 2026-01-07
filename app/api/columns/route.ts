import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { v4 as uuidv4 } from "uuid"
import type { Column } from "@/types/column"

const defaultColumns: Column[] = [
  { id: "backlog", title: "Backlog", color: "bg-slate-500", order: 0 },
  { id: "todo", title: "To Do", color: "bg-red-500", order: 1 },
  { id: "inProgress", title: "In Progress", color: "bg-blue-500", order: 2 },
  { id: "done", title: "Done", color: "bg-green-500", order: 3 },
]

export async function GET() {
  try {
    const columnsMap = await redis.hgetall("kanban:columns")
    let columns: Column[] = []

    if (Object.keys(columnsMap).length === 0) {
      // Seed defaults if empty
      console.log("Seeding default columns...")
      for (const col of defaultColumns) {
        await redis.hset("kanban:columns", col.id, JSON.stringify(col))
      }
      columns = defaultColumns
    } else {
      columns = Object.values(columnsMap).map((c) => JSON.parse(c))
    }

    // Sort by order
    columns.sort((a, b) => a.order - b.order)

    return NextResponse.json(columns)
  } catch (error) {
    console.error("GET Columns Error:", error)
    return NextResponse.json({ error: "Failed to fetch columns" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // title, match default colors randomly or let user pick (keeping simple for now)
    
    // Get current max order
    const columnsMap = await redis.hgetall("kanban:columns")
    const columns: Column[] = Object.values(columnsMap).map((c) => JSON.parse(c))
    const maxOrder = columns.length > 0 ? Math.max(...columns.map(c => c.order)) : 0

    const newColumn: Column = {
      id: uuidv4(),
      title: body.title,
      color: body.color || "bg-slate-500",
      order: maxOrder + 1
    }

    await redis.hset("kanban:columns", newColumn.id, JSON.stringify(newColumn))
    return NextResponse.json(newColumn)
  } catch (error) {
    console.error("POST Column Error:", error)
    return NextResponse.json({ error: "Failed to create column" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await redis.hdel("kanban:columns", id)
    // Ideally we should handle tasks in this column, but for now we leave them orphaned or handled by UI filtering
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE Column Error:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
