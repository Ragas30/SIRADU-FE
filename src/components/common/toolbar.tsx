"use client"

import type React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ToolbarProps {
  search?: string
  onSearchChange?: (value: string) => void
  filters?: React.ReactNode
  actions?: React.ReactNode
}

export default function Toolbar({ search, onSearchChange, filters, actions }: ToolbarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex gap-4 items-center">
        {onSearchChange && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        {filters && <div className="flex gap-2">{filters}</div>}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  )
}
