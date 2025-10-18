"use client"

import { useState } from "react"
import PageHeader from "@/components/common/page-header"
import Toolbar from "@/components/common/toolbar"
import DataTable, { type Column } from "@/components/common/data-table"
import Pagination from "@/components/common/pagination"
import { Badge } from "@/components/ui/badge"
import { useList } from "@/hooks/useList"
import type { AuditLog } from "@/types"

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  const { data, isLoading } = useList<AuditLog>("audit-logs", {
    page,
    pageSize: 10,
    search,
  })

  const columns: Column<AuditLog>[] = [
    {
      key: "action",
      label: "Action",
      render: (value) => {
        const action = value as string
        const colors: Record<string, string> = {
          CREATE: "bg-green-500/10 text-green-700 dark:text-green-400",
          UPDATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
          DELETE: "bg-red-500/10 text-red-700 dark:text-red-400",
        }
        return <Badge className={colors[action] || ""}>{action}</Badge>
      },
    },
    {
      key: "resource",
      label: "Resource",
    },
    {
      key: "userId",
      label: "User ID",
    },
    {
      key: "timestamp",
      label: "Timestamp",
      render: (value) => new Date(value as string).toLocaleString(),
    },
  ]

  return (
    <div>
      <PageHeader title="Audit Logs" description="View system activity and changes" />

      <Toolbar search={search} onSearchChange={setSearch} />

      <DataTable<AuditLog> columns={columns} data={data?.data || []} isLoading={isLoading} rowKey="id" />

      {data && (
        <div className="mt-6">
          <Pagination page={page} pageSize={10} total={data.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
