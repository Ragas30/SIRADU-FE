import React from "react";

const API_BASE = "https://take-home-test-api.nutech-integrasi.com";

type HistoryItem = {
  invoice_number?: string;
  transaction_type?: string;
  description?: string;
  total_amount?: number;
  created_on?: string | number;
};

type AnyResp = unknown;

const formatIDR = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function toMs(epochOrIso: string | number | undefined): number | null {
  if (epochOrIso == null) return null;
  if (typeof epochOrIso === "number") return epochOrIso < 10_000_000_000 ? epochOrIso * 1000 : epochOrIso;
  const t = new Date(epochOrIso).getTime();
  return Number.isFinite(t) ? t : null;
}

function extractArray(resp: AnyResp): unknown[] {
  const r = resp as Record<string, unknown> | null;
  if (!r) return [];
  // kemungkinan umum
  if (Array.isArray((r as Record<string, unknown>).data)) return (r as Record<string, unknown>).data as unknown[];
  if (Array.isArray((r as Record<string, unknown>).records)) return (r as Record<string, unknown>).records as unknown[];
  if (
    (r as Record<string, unknown>).data &&
    Array.isArray(((r as Record<string, unknown>).data as Record<string, unknown>).records)
  )
    return ((r as Record<string, unknown>).data as Record<string, unknown>).records as unknown[];
  if (
    (r as Record<string, unknown>).data &&
    Array.isArray(((r as Record<string, unknown>).data as Record<string, unknown>).history)
  )
    return ((r as Record<string, unknown>).data as Record<string, unknown>).history as unknown[];
  if (Array.isArray((r as Record<string, unknown>).history)) return (r as Record<string, unknown>).history as unknown[];
  return [];
}

function normalizeItem(x: Record<string, unknown>): HistoryItem {
  const invoice_number =
    typeof x.invoice_number === "string"
      ? x.invoice_number
      : typeof x.invoice === "string"
      ? x.invoice
      : typeof x.ref === "string"
      ? x.ref
      : typeof x.reference === "string"
      ? x.reference
      : undefined;

  const transaction_type =
    typeof x.transaction_type === "string"
      ? x.transaction_type
      : typeof x.type === "string"
      ? x.type
      : typeof x.direction === "string"
      ? x.direction
      : undefined;

  const description =
    typeof x.description === "string"
      ? x.description
      : typeof x.note === "string"
      ? x.note
      : typeof x.notes === "string"
      ? x.notes
      : typeof x.service_name === "string"
      ? x.service_name
      : typeof x.title === "string"
      ? x.title
      : undefined;

  const total_amount =
    typeof x.total_amount === "number"
      ? x.total_amount
      : typeof x.amount === "number"
      ? x.amount
      : typeof x.nominal === "number"
      ? x.nominal
      : undefined;

  const created_on =
    typeof x.created_on === "string" || typeof x.created_on === "number"
      ? x.created_on
      : typeof x.created_at === "string" || typeof x.created_at === "number"
      ? x.created_at
      : typeof x.created === "string" || typeof x.created === "number"
      ? x.created
      : typeof x.date === "string" || typeof x.date === "number"
      ? x.date
      : typeof x.timestamp === "string" || typeof x.timestamp === "number"
      ? x.timestamp
      : undefined;

  return { invoice_number, transaction_type, description, total_amount, created_on };
}

async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch (e) {
    console.error("Gagal parsing JSON:", e);
    return null;
  }
}

export default function History() {
  const token = React.useMemo(() => localStorage.getItem("auth_token"), []);
  const LIMIT = 5;

  const [rows, setRows] = React.useState<HistoryItem[]>([]);
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);

  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPage = React.useCallback(
    async (nextOffset: number, append: boolean) => {
      if (!token) {
        setError("Sesi login berakhir. Silakan masuk kembali.");
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      setError(null);
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 10000);

      try {
        const url = new URL(`${API_BASE}/transaction/history`);
        url.searchParams.set("limit", String(LIMIT));
        url.searchParams.set("offset", String(nextOffset));

        const res = await fetch(url.toString(), {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const json = await safeJson<AnyResp>(res);
        if (!res.ok) {
          const msg = (json as Record<string, unknown>)?.message as string || `Gagal memuat riwayat (status ${res.status}).`;
          setError(msg);
          if (!append) setRows([]);
          setHasMore(false);
          return;
        }

        const raw = extractArray(json);
        const page = raw.map((x) => normalizeItem(x as Record<string, unknown>));


        page.sort((a, b) => {
          const ta = toMs(a.created_on) ?? 0;
          const tb = toMs(b.created_on) ?? 0;
          return tb - ta;
        });

        setRows((prev) => (append ? [...prev, ...page] : page));
        setOffset(nextOffset);
        setHasMore(page.length === LIMIT);
      } catch (e) {
        console.error("Fetch history error:", e);
        const msg = e instanceof Error ? (e.name === "AbortError" ? "Permintaan waktu habis. Coba lagi." : e.message) : "Tidak bisa menghubungi server. Periksa koneksi Anda.";
        setError(msg);
        if (!append) setRows([]);
        setHasMore(false);
      } finally {
        clearTimeout(tid);
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [token]
  );

  React.useEffect(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  const onRefresh = () => {
    setHasMore(true);
    fetchPage(0, false);
  };

  const onShowMore = () => {
    fetchPage(offset + LIMIT, true);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Riwayat Transaksi</h1>
          <p className="text-sm text-gray-400">Menampilkan {rows.length} item</p>
        </div>
        <button onClick={onRefresh} disabled={loading || loadingMore} className="px-3 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white text-sm disabled:opacity-60">
          {loading ? "Memuat…" : "Refresh"}
        </button>
      </div>

      {error && <div className="rounded-xl border border-rose-900/50 bg-rose-900/20 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
        <div className="hidden md:grid grid-cols-12 gap-3 px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <div className="col-span-3">Invoice</div>
          <div className="col-span-2">Tipe</div>
          <div className="col-span-3">Deskripsi</div>
          <div className="col-span-2">Jumlah</div>
          <div className="col-span-2">Tanggal</div>
        </div>

        <div className="space-y-2">
          {loading && Array.from({ length: 5 }).map((_, i) => <div key={i} className="p-3 rounded-xl bg-gray-800/40 border border-gray-700 animate-pulse h-16" />)}

          {!loading && rows.length === 0 && <div className="py-10 text-center text-sm text-gray-400">Belum ada transaksi.</div>}

          {!loading &&
            rows.map((r, idx) => {
              const ms = toMs(r.created_on);
              const tanggal = ms
                ? new Date(ms).toLocaleString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-";

              return (
                <div key={(r.invoice_number || "row") + idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700">
                  <div className="md:col-span-3">
                    <p className="text-gray-100 text-sm break-words">{r.invoice_number || "-"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-100 text-sm capitalize">{r.transaction_type || "-"}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-gray-300 text-sm">{r.description || "-"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-100 text-sm">{typeof r.total_amount === "number" ? formatIDR(r.total_amount) : "-"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-400 text-sm">{tanggal}</p>
                  </div>
                </div>
              );
            })}
        </div>

        {!loading && rows.length > 0 && hasMore && (
          <div className="mt-4 flex justify-center">
            <button onClick={onShowMore} disabled={loadingMore} className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white text-sm disabled:opacity-60">
              {loadingMore ? "Memuat…" : "Show more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
