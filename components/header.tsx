import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          K
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Project Board</h1>
          <p className="text-sm text-muted-foreground">Team Development</p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-72">
        <div className="relative w-full">
           <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Filter tasks..."
             className="pl-8"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>
    </header>
  )
}
