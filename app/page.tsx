"use client"
import { useState } from "react"
import KanbanBoard from "@/components/kanban-board"
import Header from "@/components/header"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="flex-1 overflow-hidden">
        <KanbanBoard searchQuery={searchQuery} />
      </main>
    </div>
  )
}
