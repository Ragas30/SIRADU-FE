"use client"

import type React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export interface Column<T> {
  key: keyof T
  label: string
  render?: (value: unknown, row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  onSort?: (key: keyof T, order: "asc" | "desc") => void
  sortKey?: keyof T
  sortOrder?: "asc" | "desc"
  rowKey: keyof T
}

export default function DataTable<T>({
  columns,
  data,
  isLoading,
  onSort,
  sortKey,
  sortOrder,
  rowKey,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="px-6 py-3 text-left text-sm font-semibold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-muted/80"
                onClick={() => {
                  if (col.sortable && onSort) {
                    const newOrder = sortKey === col.key && sortOrder === "asc" ? "desc" : "asc"
                    onSort(col.key, newOrder)
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span>
                      {sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={String(row[rowKey])} className="border-b border-border hover:bg-muted/50">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-6 py-4 text-sm">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
