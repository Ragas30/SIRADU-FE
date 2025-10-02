import {
  addNurse,
  deleteNurse,
  getNurses,
  Nurse,
  updateNurse, // kalau belum ada, buat sama kayak updatePatient
} from "@/api/mockNurses";
import {
  Box,
  Button,
  Heading,
  Input,
  Field,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { UiAgTable } from "@/components/ui/UiAgTable";
import { UiDialog } from "@/components/ui/UiDialog";
import { uiToast } from "@/components/ui/uiToast";
import type { ColDef } from "ag-grid-community";
import { AgActionCell } from "@/components/ui/AgActionCell";
import { Hash, User, Building2, MoreVertical, Plus } from "lucide-react";

export default function Nurses() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [editingRow, setEditingRow] = useState<Nurse | null>(null);
  const {
    open: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  async function loadData() {
    const data = await getNurses();
    setNurses(data);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd() {
    if (!name.trim() || !department.trim()) {
      uiToast.error("Nama dan departemen wajib diisi");
      return;
    }
    await addNurse({ name, department });
    uiToast.success("Perawat ditambahkan");
    setName("");
    setDepartment("");
    onClose();
    loadData();
  }

  async function handleDelete(id: number) {
    await deleteNurse(id);
    uiToast.info("Perawat dihapus");
    loadData();
  }

  function handleEdit(row: Nurse) {
    setEditingRow(row);
    onEditOpen();
  }

  const columnDefs: ColDef[] = [
    {
      field: "id",
      width: 90,
      headerComponent: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Hash size={16} />
          <span>ID</span>
        </div>
      ),
    },
    {
      field: "name",
      headerComponent: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <User size={16} />
          <span>Nama</span>
        </div>
      ),
    },
    {
      field: "department",
      headerComponent: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Building2 size={16} />
          <span>Departemen</span>
        </div>
      ),
    },
    {
      field: "actions",
      width: 120,
      headerComponent: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MoreVertical size={16} />
          <span>Aksi</span>
        </div>
      ),
      cellRenderer: (params: any) => (
        <AgActionCell
          data={params.data}
          onEdit={(row) => handleEdit(row)}
          onDelete={(row) => handleDelete(row.id)}
          onDetail={(row) => uiToast.info(`Detail perawat: ${row.name}`)}
        />
      ),
    },
  ];

  return (
    <Box>
      <Heading size="md" mb={4}>
        Management Perawat
      </Heading>

      {/* Dialog Tambah */}
      <UiDialog
        open={isOpen}
        onOpenChange={(o) => (o ? onOpen() : onClose())}
        trigger={
          <Button colorScheme="blue">
            <Plus size={16} style={{ marginRight: 6 }} />
            Tambah Perawat
          </Button>
        }
        title="Tambah Perawat"
        body={
          <>
            <Field.Root mb={3}>
              <Field.Label>Nama</Field.Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field.Root>
            <Field.Root>
              <Field.Label>Departemen</Field.Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </Field.Root>
          </>
        }
        footer={
          <>
            <Button variant="outline" mr={3} onClick={onClose}>
              Batal
            </Button>
            <Button colorScheme="blue" onClick={handleAdd}>
              Simpan
            </Button>
          </>
        }
      />

      {/* Dialog Edit */}
      <UiDialog
        open={isEditOpen}
        onOpenChange={(o) => (o ? onEditOpen() : onEditClose())}
        trigger={null}
        title="Edit Perawat"
        body={
          <>
            <Field.Root mb={3}>
              <Field.Label>Nama</Field.Label>
              <Input
                value={editingRow?.name ?? ""}
                onChange={(e) =>
                  setEditingRow((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev
                  )
                }
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Departemen</Field.Label>
              <Input
                value={editingRow?.department ?? ""}
                onChange={(e) =>
                  setEditingRow((prev) =>
                    prev ? { ...prev, department: e.target.value } : prev
                  )
                }
              />
            </Field.Root>
          </>
        }
        footer={
          <>
            <Button variant="outline" mr={3} onClick={onEditClose}>
              Batal
            </Button>
            <Button
              colorScheme="blue"
              onClick={async () => {
                if (!editingRow) return;
                if (typeof updateNurse === "function") {
                  await updateNurse(editingRow);
                } else {
                  // fallback mock
                  await deleteNurse(editingRow.id);
                  await addNurse({
                    name: editingRow.name,
                    department: editingRow.department,
                  });
                }
                uiToast.success("Perawat diupdate");
                onEditClose();
                loadData();
              }}
            >
              Simpan
            </Button>
          </>
        }
      />

      {/* Tabel */}
      <Box mt={4}>
        <UiAgTable<Nurse>
          rowData={nurses}
          columnDefs={columnDefs}
          title="Daftar Perawat"
          height={400}
        />
      </Box>
    </Box>
  );
}
