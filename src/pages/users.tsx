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
import type { User } from "@/types"

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<keyof User>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const { data, isLoading } = useList<User>("users", {
    page,
    pageSize: 10,
    search,
    sortBy: String(sortBy),
    sortOrder,
  })

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "roles",
      label: "Roles",
      render: (value) => {
        const roles = value as User["roles"]
        return (
          <div className="flex gap-1">
            {roles.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
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
        title="Users"
        description="Manage system users and their roles"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        }
      />

      <Toolbar search={search} onSearchChange={setSearch} />

      <DataTable<User>
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        rowKey="id"
        sortKey={sortBy}
        sortOrder={sortOrder}
        onSort={(key, order) => {
          setSortBy(key)
          setSortOrder(order)
        }}
      />

      {data && (
        <div className="mt-6">
          <Pagination page={page} pageSize={10} total={data.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
