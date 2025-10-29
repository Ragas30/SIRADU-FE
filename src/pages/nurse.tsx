"use client"

import { useState } from "react"
import { Eye, EyeOff, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import PageHeader from "@/components/common/page-header"
import Toolbar from "@/components/common/toolbar"
import DataTable, { type Column } from "@/components/common/data-table"
import Pagination from "@/components/common/pagination"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useList } from "@/hooks/useList"
import type { Nurse } from "@/types"
import { api } from "@/lib/axios"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const NurseCreateSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
})
type NurseCreateInput = z.infer<typeof NurseCreateSchema>

const NurseEditSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter").optional().or(z.literal("")),
})
type NurseEditInput = z.infer<typeof NurseEditSchema>

export default function PerawatPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<keyof Nurse>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [editing, setEditing] = useState<Nurse | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Nurse | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useList<Nurse>("nurse", {
    page,
    pageSize: 10,
    search,
    sortBy: String(sortBy),
    sortOrder,
  })

  const createForm = useForm<NurseCreateInput>({
    resolver: zodResolver(NurseCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const editForm = useForm<NurseEditInput>({
    resolver: zodResolver(NurseEditSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const createMutation = useMutation({
    mutationFn: async (payload: NurseCreateInput) => {
      const { data } = await api.post("/nurse/add", payload, { successToast: true })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nurse"] })
      createForm.reset({
        name: "",
        email: "",
        password: "",
      })
      setOpenCreate(false)
      setShowPassword(false)
    },
  })

  const editMutation = useMutation({
    mutationFn: async (payload: NurseEditInput & { id: string }) => {
      const { id, ...rest } = payload
      const body: Record<string, unknown> = {
        name: rest.name,
        email: rest.email,
      }
      if (rest.password) body.password = rest.password
      const { data } = await api.put(`/nurse/${id}`, body, { successToast: true })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nurse"] })
      setOpenEdit(false)
      setEditing(null)
      editForm.reset({
        name: "",
        email: "",
        password: "",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/nurse/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nurse"] })
      setConfirmDelete(null)
    },
  })

  const columns: Column<Nurse>[] = [
    { key: "name", label: "Nama", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Peran",
      sortable: true,
      render: (value) => {
        const role = value as Nurse["role"]
        const variant = role === "PERAWAT" ? "destructive" : "default"
        return <Badge variant={variant}>{role === "KEPALA_PERAWAT" ? "KEPALA PERAWAT" : "PERAWAT"}</Badge>
      },
    },
    {
      key: "createdAt",
      label: "Dibuat",
      sortable: true,
      render: (value) => new Date(String(value)).toLocaleDateString(),
    },
    {
      key: "id",
      label: "",
      render: (_, row) => (
        <RowActions
          row={row}
          onEdit={() => {
            setEditing(row)
            editForm.reset({
              name: row.name,
              email: row.email,
              password: "",
            })
            setOpenEdit(true)
          }}
          onDelete={() => setConfirmDelete(row)}
        />
      ),
    },
  ]

  const handleCloseCreate = (v: boolean) => {
    setOpenCreate(v)
    if (!v) {
      createForm.reset({
        name: "",
        email: "",
        password: "",
      })
      createForm.clearErrors()
      setShowPassword(false)
    }
  }

  const handleCloseEdit = (v: boolean) => {
    setOpenEdit(v)
    if (!v) {
      setEditing(null)
      editForm.reset({
        name: "",
        email: "",
        password: "",
      })
      editForm.clearErrors()
    }
  }

  return (
    <div>
      <PageHeader
        title="Perawat"
        description="Kelola data perawat dan perannya"
        action={
          <Dialog open={openCreate} onOpenChange={handleCloseCreate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Perawat
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Perawat</DialogTitle>
                <DialogDescription>Isi data perawat kemudian simpan.</DialogDescription>
              </DialogHeader>

              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute inset-y-0 right-2 grid place-items-center"
                              tabIndex={0}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCloseCreate(false)}
                      disabled={createMutation.isPending}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <Toolbar search={search} onSearchChange={setSearch} />

      <DataTable<Nurse>
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
          <Pagination page={page} pageSize={data.pageSize ?? 10} total={data.total} onPageChange={setPage} />
        </div>
      )}

      <Dialog open={openEdit} onOpenChange={handleCloseEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Perawat</DialogTitle>
            <DialogDescription>Perbarui data perawat lalu simpan.</DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((values) => {
                if (!editing) return
                editMutation.mutate({ id: editing.id, ...values })
              })}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (opsional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Biarkan kosong jika tidak diubah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCloseEdit(false)}
                  disabled={editMutation.isPending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={editMutation.isPending}>
                  {editMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus perawat?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data <b>{confirmDelete?.name}</b> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function RowActions({ row, onEdit, onDelete }: { row: Nurse; onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onEdit} className="gap-2">
          <Pencil className="h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4" /> Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
