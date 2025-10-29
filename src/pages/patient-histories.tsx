// src/pages/patient-histories/index.tsx
"use client"

import { useMemo, useState } from "react"
import { Download, Image as ImageIcon } from "lucide-react"
import PageHeader from "@/components/common/page-header"
import Toolbar from "@/components/common/toolbar"
import DataTable, { type Column } from "@/components/common/data-table"
import Pagination from "@/components/common/pagination"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useList } from "@/hooks/useList"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type HistoryRow = {
  id: string
  patientId: string
  position: string
  nurseId: string
  bradenQ: number
  Time: string
  foto: string | null
  roomName: string | null
  dekubitus: boolean
  patient?: { id: string; name: string }
  nurse?: { id: string; name: string }
}

type Period = "day" | "week" | "month" | "custom"

const ID_TZ = "Asia/Jakarta"
const fmtID = (v: string | number | Date, opts?: Intl.DateTimeFormatOptions) =>
  new Date(v).toLocaleString("id-ID", { timeZone: ID_TZ, dateStyle: "short", timeStyle: "short", ...opts })

function startOfTodayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
function endOfTodayISO() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}
function startOfWeekISO() {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
function endOfWeekISO() {
  const d = new Date(startOfWeekISO())
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}
function startOfMonthISO() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
function endOfMonthISO() {
  const d = new Date()
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  last.setHours(23, 59, 59, 999)
  return last.toISOString()
}

export default function PatientHistoriesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState<Period>("day")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const [photoOpen, setPhotoOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoTitle, setPhotoTitle] = useState<string>("")

  const { startDate, endDate } = useMemo(() => {
    if (period === "day") return { startDate: startOfTodayISO(), endDate: endOfTodayISO() }
    if (period === "week") return { startDate: startOfWeekISO(), endDate: endOfWeekISO() }
    if (period === "month") return { startDate: startOfMonthISO(), endDate: endOfMonthISO() }
    const s = customFrom ? new Date(customFrom + "T00:00:00").toISOString() : undefined
    const e = customTo ? new Date(customTo + "T23:59:59").toISOString() : undefined
    return { startDate: s, endDate: e }
  }, [period, customFrom, customTo])

  const { data, isLoading } = useList<HistoryRow>("patient-histories", {
    page,
    pageSize: 10,
    search,
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    sortBy: "Time",
    sortOrder: "desc",
  })

  const columns: Column<HistoryRow>[] = [
    {
      key: "patient",
      label: "Nama Pasien",
      sortable: true,
      render: (_, row) => row.patient?.name ?? "-",
    },
    {
      key: "nurse",
      label: "Nama Perawat",
      sortable: true,
      render: (_, row) => row.nurse?.name ?? "-",
    },
    {
      key: "roomName",
      label: "Ruangan",
      sortable: true,
      render: (v) => (v ? <Badge variant="outline">{String(v)}</Badge> : "-"),
    },
    {
      key: "position",
      label: "Posisi",
      sortable: true,
      render: (v) => <Badge variant="secondary">{String(v).replace(/_/g, " ")}</Badge>,
    },
    { key: "bradenQ", label: "BradenQ", sortable: true },
    {
      key: "dekubitus",
      label: "Dekubitus",
      sortable: true,
      render: (v) => (v ? <Badge variant="destructive">Ya</Badge> : <Badge variant="default">Tidak</Badge>),
    },
    {
      key: "Time",
      label: "Waktu",
      sortable: true,
      render: (v) => fmtID(String(v)),
    },
    {
      key: "foto",
      label: "Foto",
      render: (_, row) =>
        row.foto ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPhotoUrl(row.foto as string)
              setPhotoTitle(`${row.patient?.name ?? "Pasien Tanpa Nama"} - ${fmtID(row.Time)}`)
              setPhotoOpen(true)
            }}
            className="h-8 gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Lihat
          </Button>
        ) : (
          "-"
        ),
    },
  ]

  const handleExportPdf = async () => {
    try {
      const params: Record<string, any> = {
        search,
        startDate,
        endDate,
        sortBy: "Time",
        sortOrder: "desc",
        page: 1,
        pageSize: 10000,
      }
      const res = await api.get("/patient-histories", { params, silent: true })
      const rows: HistoryRow[] = res.data?.data ?? res.data ?? []
      if (!rows.length) {
        toast.info("Tidak ada data pada rentang waktu yang dipilih.")
        return
      }

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" })
      const title = "Riwayat Pasien"
      const subtitle =
        period === "custom"
          ? `Periode: ${customFrom || "NA"} s/d ${customTo || "NA"}`
          : `Periode: ${period.toUpperCase()}`
      doc.setFontSize(16)
      doc.text(title, 40, 40)
      doc.setFontSize(10)
      doc.text(subtitle, 40, 58)
      doc.setFontSize(9)
      doc.text(`Dibuat: ${fmtID(new Date())}`, 40, 74)

      const marginX = 40
      const pageWidth = doc.internal.pageSize.getWidth()
      const contentWidth = pageWidth - marginX * 2
      const weights = [18, 18, 10, 12, 8, 20, 7, 7]
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      const widths = weights.map((w) => Math.floor((w / totalWeight) * contentWidth))

      autoTable(doc, {
        startY: 90,
        margin: { top: 90, left: marginX, right: marginX },
        head: [["Nama Pasien", "Nama Perawat", "Ruangan", "Posisi", "Dekubitus", "Waktu", "BradenQ", "Foto"]],
        body: rows.map((r) => [
          r.patient?.name ?? "-",
          r.nurse?.name ?? "-",
          r.roomName ?? "-",
          r.position.replace(/_/g, " "),
          r.dekubitus ? "Ya" : "Tidak",
          new Date(r.Time).toLocaleString("id-ID", { timeZone: ID_TZ, dateStyle: "short", timeStyle: "short" }),
          String(r.bradenQ),
          r.foto ? "Ada" : "-",
        ]),
        styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak", valign: "top" },
        headStyles: { fontSize: 9, fillColor: [2, 186, 165] },
        columnStyles: {
          0: { cellWidth: widths[0] },
          1: { cellWidth: widths[1] },
          2: { cellWidth: widths[2] },
          3: { cellWidth: widths[3] },
          4: { cellWidth: widths[4] },
          5: { cellWidth: widths[5] },
          6: { cellWidth: widths[6], halign: "right" },
          7: { cellWidth: widths[7] },
        },
        pageBreak: "auto",
        rowPageBreak: "auto",
        didDrawPage: () => {
          const w = doc.internal.pageSize.getWidth()
          const h = doc.internal.pageSize.getHeight()
          doc.setFontSize(9)
          doc.text(`Halaman ${doc.getNumberOfPages()}`, w - 80, h - 20)
        },
      })

      const rangeLabel = period === "custom" ? `${customFrom || "NA"}_to_${customTo || "NA"}` : period
      const fileName = `patient-histories_${rangeLabel}_${new Date().toISOString().slice(0, 19)}.pdf`
      doc.save(fileName)
      toast.success("Export PDF berhasil.")
    } catch {
      toast.error("Gagal export PDF.")
    }
  }

  const downloadPhoto = async () => {
    if (!photoUrl) return
    try {
      const resp = await fetch(photoUrl)
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = (photoTitle || "foto").replace(/\s+/g, "_") + ".jpg"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Gagal mengunduh foto.")
    }
  }

  return (
    <div>
      <PageHeader
        title="Riwayat Pasien"
        description="Daftar riwayat tindakan/kejadian pasien"
        action={
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
            >
              <option value="day">Hari ini</option>
              <option value="week">Minggu ini</option>
              <option value="month">Bulan ini</option>
              <option value="custom">Custom</option>
            </select>
            {period === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <span className="text-sm text-muted-foreground">s/d</span>
                <input
                  type="date"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            )}
            <Button onClick={handleExportPdf}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        }
      />

      <Toolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
      />

      <DataTable<HistoryRow>
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        rowKey="id"
        sortKey={"Time" as keyof HistoryRow}
        sortOrder={"desc"}
      />

      {data && (
        <div className="mt-6">
          <Pagination page={page} pageSize={data.pageSize ?? 10} total={data.total ?? 0} onPageChange={setPage} />
        </div>
      )}

      <Dialog open={photoOpen} onOpenChange={(v) => setPhotoOpen(v)}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{photoTitle || "Foto"}</DialogTitle>
            <DialogDescription>Klik tombol download untuk mengunduh foto.</DialogDescription>
          </DialogHeader>
          <div className="w-full">
            {photoUrl ? (
              <img src={photoUrl} alt={photoTitle} className="w-full h-auto rounded-md border" loading="lazy" />
            ) : (
              <div className="h-64 grid place-items-center text-sm text-muted-foreground">Tidak ada foto</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoOpen(false)}>
              Tutup
            </Button>
            <Button onClick={downloadPhoto}>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
