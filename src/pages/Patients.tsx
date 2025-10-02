import {
  addPatient,
  deletePatient,
  getPatients,
  Patient,
  updatePatient,
} from "@/api/mockPatients";
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
import {
  Calendar,
  Hash,
  MoreVertical,
  Plus,
  Stethoscope,
  User,
} from "lucide-react";

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | string>("");
  const [diagnosis, setDiagnosis] = useState("");
  const { open: isOpen, onOpen, onClose } = useDisclosure();

  const [editingRow, setEditingRow] = useState<Patient | null>(null);
  const {
    open: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  async function loadData() {
    const data = await getPatients();
    setPatients(data);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd() {
    if (!name || !age || !diagnosis) return;
    await addPatient({ name, age: Number(age), diagnosis });
    uiToast.success("Pasien ditambahkan");
    setName("");
    setAge("");
    setDiagnosis("");
    onClose();
    loadData();
  }

  async function handleDelete(id: number) {
    await deletePatient(id);
    uiToast.info("Pasien dihapus");
    loadData();
  }

  function handleEdit(row: Patient) {
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
      field: "age",
      headerComponent: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={16} />
          <span>Usia</span>
        </div>
      ),
    },
    {
      field: "diagnosis",
      headerComponent: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Stethoscope size={16} />
          <span>Diagnosis</span>
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
          onDetail={(row) => uiToast.info(`Detail pasien: ${row.name}`)}
        />
      ),
    },
  ];

  return (
    <Box>
      <Heading size="md" mb={4}>
        Management Pasien
      </Heading>

      {/* Dialog Tambah Pasien */}
      <UiDialog
        open={isOpen}
        onOpenChange={(o) => (o ? onOpen() : onClose())}
        trigger={
          <Button colorScheme="blue">
            <Plus /> Tambah Pasien
          </Button>
        }
        title="Tambah Pasien"
        body={
          <>
            <Field.Root mb={3}>
              <Field.Label>Nama</Field.Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field.Root>
            <Field.Root mb={3}>
              <Field.Label>Usia</Field.Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Diagnosis</Field.Label>
              <Input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
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

      <UiDialog
        open={isEditOpen}
        onOpenChange={(o) => (o ? onEditOpen() : onEditClose())}
        trigger={null}
        title="Edit Pasien"
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
            <Field.Root mb={3}>
              <Field.Label>Usia</Field.Label>
              <Input
                type="number"
                value={editingRow?.age ?? ""}
                onChange={(e) =>
                  setEditingRow((prev) =>
                    prev ? { ...prev, age: Number(e.target.value) } : prev
                  )
                }
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Diagnosis</Field.Label>
              <Input
                value={editingRow?.diagnosis ?? ""}
                onChange={(e) =>
                  setEditingRow((prev) =>
                    prev ? { ...prev, diagnosis: e.target.value } : prev
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
                await updatePatient(editingRow);
                uiToast.success("Pasien diupdate");
                onEditClose();
                loadData();
              }}
            >
              Simpan
            </Button>
          </>
        }
      />

      <Box mt={4}>
        <UiAgTable<Patient>
          rowData={patients}
          columnDefs={columnDefs}
          title="Daftar Pasien"
          height={400}
        />
      </Box>
    </Box>
  );
}
