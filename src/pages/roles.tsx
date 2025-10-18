"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import PageHeader from "@/components/common/page-header"
import Toolbar from "@/components/common/toolbar"
import DataTable, { type Column } from "@/components/common/data-table"
import Pagination from "@/components/common/pagination"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useList } from "@/hooks/useList"
import type { Role } from "@/types"

export default function RolesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  const { data, isLoading } = useList<Role>("roles", {
    page,
    pageSize: 10,
    search,
  })

  const columns: Column<Role>[] = [
    {
      key: "name",
      label: "Role Name",
      sortable: true,
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (value) => {
        const permissions = value as Role["permissions"]
        return (
          <div className="flex gap-1 flex-wrap">
            {permissions.slice(0, 2).map((perm) => (
              <Badge key={perm.id} variant="outline">
                {perm.name}
              </Badge>
            ))}
            {permissions.length > 2 && <Badge variant="outline">+{permissions.length - 2} more</Badge>}
          </div>
        )
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Manage system roles and their permissions"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        }
      />

      <Toolbar search={search} onSearchChange={setSearch} />

      <DataTable<Role> columns={columns} data={data?.data || []} isLoading={isLoading} rowKey="id" />

      {data && (
        <div className="mt-6">
          <Pagination page={page} pageSize={10} total={data.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
