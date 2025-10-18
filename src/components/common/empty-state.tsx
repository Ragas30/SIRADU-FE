import type React from "react"
import { AlertCircle } from "lucide-react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-muted-foreground">{icon || <AlertCircle className="w-12 h-12 mx-auto" />}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
