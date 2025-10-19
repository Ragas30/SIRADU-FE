"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import PageHeader from "@/components/common/page-header"
import Toolbar from "@/components/common/toolbar"
import DataTable, { type Column } from "@/components/common/data-table"
import Pagination from "@/components/common/pagination"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useList } from "@/hooks/useList"
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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// ================= Types =================
export type Gender = "LAKI_LAKI" | "PEREMPUAN"
export type Status = "ACTIVE" | "NON_ACTIVE"

export interface Pasien {
  id: string
  name: string
  nik: string
  birthDate: string // ISO date
  bedNumber: number
  gender: Gender
  bradenQ: number
  status: Status
  createdAt?: string
}

// ================= Zod Schemas =================
const GenderEnum = z.enum(["LAKI_LAKI", "PEREMPUAN"])
const StatusEnum = z.enum(["ACTIVE", "NON_ACTIVE"])

const PasienCreateSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit"),
  birthDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Tanggal lahir tidak valid"),
  bedNumber: z.coerce.number().int().min(1, "Nomor tempat tidur minimal 1"),
  gender: GenderEnum,
  bradenQ: z.coerce.number().int().min(0, "BradenQ minimal 0"),
  status: StatusEnum,
})
type PasienCreateInput = z.infer<typeof PasienCreateSchema>

const PasienEditSchema = PasienCreateSchema // saat ini field sama
type PasienEditInput = z.infer<typeof PasienEditSchema>

// ================= Page =================
export default function PasienPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<keyof Pasien>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editing, setEditing] = useState<Pasien | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Pasien | null>(null)

  const queryClient = useQueryClient()

  // ===== List: resource "pasiens" -> GET /pasiens
  const { data, isLoading } = useList<Pasien>("pasiens", {
    page,
    pageSize: 10,
    search,
    sortBy: String(sortBy),
    sortOrder,
  })

  // ===== Forms
  const createForm = useForm<PasienCreateInput>({
    resolver: zodResolver(PasienCreateSchema),
    defaultValues: {
      name: "",
      nik: "",
      birthDate: "",
      bedNumber: 1,
      gender: "LAKI_LAKI",
      bradenQ: 0,
      status: "ACTIVE",
    },
  })

  const editForm = useForm<PasienEditInput>({
    resolver: zodResolver(PasienEditSchema),
    defaultValues: {
      name: "",
      nik: "",
      birthDate: "",
      bedNumber: 1,
      gender: "LAKI_LAKI",
      bradenQ: 0,
      status: "ACTIVE",
    },
  })

  // ===== Mutations
  // POST /pasienCreate
  const createMutation = useMutation({
    mutationFn: async (payload: PasienCreateInput) => {
      const { data } = await api.post("/pasienCreate", payload, { successToast: true })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pasiens"] })
      createForm.reset({
        name: "",
        nik: "",
        birthDate: "",
        bedNumber: 1,
        gender: "LAKI_LAKI",
        bradenQ: 0,
        status: "ACTIVE",
      })
      setOpenCreate(false)
    },
  })

  // PUT /pasiens/:id  (ASUMSI — sesuaikan jika beda)
  const editMutation = useMutation({
    mutationFn: async (payload: PasienEditInput & { id: string }) => {
      const { id, ...body } = payload
      const { data } = await api.put(`/pasien/${id}`, body, { successToast: true })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pasiens"] })
      setOpenEdit(false)
      setEditing(null)
      editForm.reset()
    },
  })

  // DELETE /pasiens/:id (ASUMSI — sesuaikan jika beda)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/pasiens/${id}`, { successToast: true })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pasiens"] })
      setConfirmDelete(null)
    },
  })

  // ===== Columns
  const columns: Column<Pasien>[] = [
    { key: "name", label: "Nama", sortable: true },
    { key: "nik", label: "NIK", sortable: true },
    {
      key: "birthDate",
      label: "Tanggal Lahir",
      sortable: true,
      render: (v) => new Date(String(v)).toLocaleDateString(),
    },
    { key: "bedNumber", label: "No. TT", sortable: true },
    {
      key: "gender",
      label: "Gender",
      sortable: true,
      render: (v) =>
        v === "LAKI_LAKI" ? <Badge variant="default">LAKI-LAKI</Badge> : <Badge variant="secondary">PEREMPUAN</Badge>,
    },
    { key: "bradenQ", label: "BradenQ", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (v) =>
        v === "ACTIVE" ? <Badge variant="default">ACTIVE</Badge> : <Badge variant="destructive">INACTIVE</Badge>,
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
              nik: row.nik,
              birthDate: row.birthDate?.slice(0, 10) ?? "",
              bedNumber: row.bedNumber,
              gender: row.gender,
              bradenQ: row.bradenQ,
              status: row.status,
            })
            setOpenEdit(true)
          }}
          onDelete={() => setConfirmDelete(row)}
        />
      ),
    },
  ]

  // ===== Helpers
  const handleCloseCreate = (v: boolean) => {
    setOpenCreate(v)
    if (!v) {
      createForm.reset({
        name: "",
        nik: "",
        birthDate: "",
        bedNumber: 1,
        gender: "LAKI_LAKI",
        bradenQ: 0,
        status: "ACTIVE",
      })
      createForm.clearErrors()
    }
  }

  const handleCloseEdit = (v: boolean) => {
    setOpenEdit(v)
    if (!v) {
      setEditing(null)
      editForm.reset()
      editForm.clearErrors()
    }
  }

  return (
    <div>
      <PageHeader
        title="Pasien"
        description="Kelola data pasien"
        action={
          <Dialog open={openCreate} onOpenChange={handleCloseCreate}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pasien
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pasien</DialogTitle>
                <DialogDescription>Isi data pasien kemudian simpan.</DialogDescription>
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
                          <Input placeholder="Nama pasien" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="nik"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIK</FormLabel>
                          <FormControl>
                            <Input placeholder="16 digit NIK" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Lahir</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={createForm.control}
                      name="bedNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Tempat Tidur</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LAKI_LAKI">LAKI-LAKI</SelectItem>
                                <SelectItem value="PEREMPUAN">PEREMPUAN</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="bradenQ"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BradenQ</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                              <SelectItem value="NON_ACTIVE">INACTIVE</SelectItem>
                            </SelectContent>
                          </Select>
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

      <DataTable<Pasien>
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

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={handleCloseEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pasien</DialogTitle>
            <DialogDescription>Perbarui data pasien lalu simpan.</DialogDescription>
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
                      <Input placeholder="Nama pasien" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="nik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIK</FormLabel>
                      <FormControl>
                        <Input placeholder="16 digit NIK" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Lahir</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="bedNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Tempat Tidur</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LAKI_LAKI">LAKI-LAKI</SelectItem>
                            <SelectItem value="PEREMPUAN">PEREMPUAN</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="bradenQ"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BradenQ</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                          <SelectItem value="NON_ACTIVE">INACTIVE</SelectItem>
                        </SelectContent>
                      </Select>
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

      {/* Delete Confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pasien?</AlertDialogTitle>
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

// ============== Row Actions ==============
function RowActions({ row, onEdit, onDelete }: { row: Pasien; onEdit: () => void; onDelete: () => void }) {
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
