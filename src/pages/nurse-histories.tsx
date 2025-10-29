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
  nurseId: string
  position: string
  bradenQ: number
  Time: string
  foto: string
  patient?: { id: string; name: string }
  nurse?: { id: string; name: string }
}

type Period = "day" | "week" | "month" | "custom"

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

export default function NurseHistoriesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState<Period>("day")

  const [activeFrom, setActiveFrom] = useState<string | undefined>(undefined)
  const [activeTo, setActiveTo] = useState<string | undefined>(undefined)

  const [draftFrom, setDraftFrom] = useState("")
  const [draftTo, setDraftTo] = useState("")

  const [photoOpen, setPhotoOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoTitle, setPhotoTitle] = useState<string>("")

  const { startDate, endDate } = useMemo(() => {
    if (period === "day") return { startDate: startOfTodayISO(), endDate: endOfTodayISO() }
    if (period === "week") return { startDate: startOfWeekISO(), endDate: endOfWeekISO() }
    if (period === "month") return { startDate: startOfMonthISO(), endDate: endOfMonthISO() }
    const s = activeFrom ? new Date(activeFrom + "T00:00:00").toISOString() : undefined
    const e = activeTo ? new Date(activeTo + "T23:59:59").toISOString() : undefined
    return { startDate: s, endDate: e }
  }, [period, activeFrom, activeTo])

  const { data, isLoading } = useList<HistoryRow>("nurse-histories", {
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
      key: "nurseId",
      label: "Perawat",
      sortable: true,
      render: (_, row) => row.nurse?.name ?? row.nurseId,
    },
    {
      key: "patientId",
      label: "Pasien",
      sortable: true,
      render: (_, row) => row.patient?.name ?? row.patientId,
    },
    {
      key: "position",
      label: "Posisi",
      sortable: true,
      render: (v) => <Badge variant="secondary">{String(v).replace("_", " ")}</Badge>,
    },
    { key: "bradenQ", label: "BradenQ", sortable: true },
    {
      key: "Time",
      label: "Waktu",
      sortable: true,
      render: (v) => new Date(String(v)).toLocaleString(),
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
              setPhotoUrl(row.foto)
              setPhotoTitle(
                `${row.nurse?.name ?? row.nurseId} • ${row.patient?.name ?? row.patientId} • ${new Date(row.Time).toLocaleString()}`
              )
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

  const applyCustomRange = () => {
    setActiveFrom(draftFrom || undefined)
    setActiveTo(draftTo || undefined)
    setPage(1)
  }

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
      const res = await api.get("/nurse-histories", { params, silent: true })
      const rows: HistoryRow[] = res.data?.data ?? res.data ?? []
      if (!rows.length) {
        toast.info("Tidak ada data pada rentang waktu yang dipilih.")
        return
      }

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" })
      const title = "Riwayat Perawat"
      const subtitle =
        period === "custom"
          ? `Periode: ${activeFrom || "NA"} s/d ${activeTo || "NA"}`
          : `Periode: ${period.toUpperCase()}`
      doc.setFontSize(16)
      doc.text(title, 40, 40)
      doc.setFontSize(10)
      doc.text(subtitle, 40, 58)
      doc.setFontSize(9)
      doc.text(`Dibuat: ${new Date().toLocaleString()}`, 40, 74)

      const marginX = 40
      const pageWidth = doc.internal.pageSize.getWidth()
      const contentWidth = pageWidth - marginX * 2
      const weights = [8, 18, 18, 12, 7, 30, 7]
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      const widths = weights.map((w) => Math.floor((w / totalWeight) * contentWidth))

      autoTable(doc, {
        startY: 90,
        margin: { top: 90, left: marginX, right: marginX },
        head: [["ID", "Perawat", "Pasien", "Posisi", "BradenQ", "Waktu", "Foto"]],
        body: rows.map((r) => [
          r.id,
          r.nurse?.name ?? r.nurseId,
          r.patient?.name ?? r.patientId,
          r.position.replace("_", " "),
          String(r.bradenQ),
          new Date(r.Time).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }),
          r.foto ? "Ada" : "-",
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: "linebreak",
          valign: "top",
        },
        headStyles: {
          fontSize: 9,
          fillColor: [2, 186, 165],
        },
        columnStyles: {
          0: { cellWidth: widths[0] },
          1: { cellWidth: widths[1] },
          2: { cellWidth: widths[2] },
          3: { cellWidth: widths[3] },
          4: { cellWidth: widths[4], halign: "right" },
          5: { cellWidth: widths[5] },
          6: { cellWidth: widths[6] },
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

      const rangeLabel = period === "custom" ? `${activeFrom || "NA"}_to_${activeTo || "NA"}` : period
      const fileName = `nurse-histories_${rangeLabel}_${new Date().toISOString().slice(0, 19)}.pdf`
      doc.save(fileName)
      toast.success("Export PDF berhasil.")
    } catch (e) {
      console.error(e)
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
        title="Riwayat Perawat"
        description="Daftar riwayat tindakan/kejadian oleh perawat"
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={period}
                onChange={(e) => {
                  const val = e.target.value as Period
                  setPeriod(val)
                  setPage(1)
                  if (val !== "custom") {
                    setActiveFrom(undefined)
                    setActiveTo(undefined)
                  }
                }}
              >
                <option value="day">Hari ini</option>
                <option value="week">Minggu ini</option>
                <option value="month">Bulan ini</option>
                <option value="custom">Custom</option>
              </select>

              {period === "custom" && (
                <>
                  <input
                    type="date"
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={draftFrom}
                    onChange={(e) => setDraftFrom(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">s/d</span>
                  <input
                    type="date"
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={draftTo}
                    onChange={(e) => setDraftTo(e.target.value)}
                  />
                  <Button variant="secondary" onClick={applyCustomRange} className="whitespace-nowrap">
                    Terapkan
                  </Button>
                </>
              )}
            </div>

            <Button onClick={handleExportPdf}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Search bar reuse */}
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

      {/* Modal Foto */}
      <Dialog open={photoOpen} onOpenChange={(v) => setPhotoOpen(v)}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{photoTitle || "Foto"}</DialogTitle>
            <DialogDescription>Klik tombol download untuk mengunduh foto.</DialogDescription>
          </DialogHeader>
          <div className="w-full">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={photoTitle}
                className="w-full max-h-[70vh] object-contain rounded-md border"
                loading="lazy"
              />
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
