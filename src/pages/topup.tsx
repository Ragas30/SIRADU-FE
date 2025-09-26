import React, { useMemo, useState } from "react";
import Profile from "../components/profile";
import StatCard from "../components/statcard";
import Toast from "../components/toast";

const API_BASE = "https://take-home-test-api.nutech-integrasi.com";

const PRESETS = [10000, 20000, 50000, 100000, 200000, 500000];

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

type TopUpResponse = {
  message?: string;
  data?: {
    balance?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
};

export default function TopUp() {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const parsedAmount = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const canSubmit = parsedAmount > 0 && !loading;

  const pickPreset = (value: number) => {
    setApiError(null);
    setAmount(String(value));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    const digitsOnly = e.target.value.replace(/[^\d]/g, "");
    setAmount(digitsOnly);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (parsedAmount < 10000) {
      setApiError("Minimal top up adalah Rp 10.000.");
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      setApiError("Sesi login berakhir. Silakan masuk kembali.");
      return;
    }

    setLoading(true);
    setApiError(null);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${API_BASE}/topup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
        body: JSON.stringify({ top_up_amount: parsedAmount }),
      });

      
      const data: TopUpResponse = await res.json().catch(() => ({} as TopUpResponse));

      clearTimeout(t);

      if (!res.ok) {
        const msg = data?.message || (typeof data === "string" ? data : null) || "Top up gagal. Coba beberapa saat lagi.";
        setApiError(String(msg));
        return;
      }

      
      if (data?.data?.balance != null) {
        localStorage.setItem("balance", String(data.data.balance));
      }

      
      window.dispatchEvent(new CustomEvent("balance:refresh"));

      setToast(`Top up berhasil: ${formatIDR(parsedAmount)} `);
      setAmount("");
      setTimeout(() => setToast(null), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? (err.name === "AbortError" ? "Permintaan waktu habis. Coba lagi." : err.message) : "Tidak bisa menghubungi server. Periksa koneksi Anda.";
      setApiError(msg);
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Profile />

      
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
        <StatCard title="Top Up Saldo" value={amount ? formatIDR(parsedAmount) : "Rp 0"} desc="Isi jumlah lalu tekan Top Up" />
      </div>

      <div className="bg-gray-800/70 border border-gray-700 rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Form Top Up</h2>

        {apiError && <div className="mb-4 rounded-xl border border-red-900/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">{apiError}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-gray-200 mb-2">
              Nominal Top Up
            </label>
            <div className="relative">
              <input
                id="balance"
                name="balance"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Contoh: 100000"
                value={amount}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition"
              />
              {parsedAmount > 0 && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300">{formatIDR(parsedAmount)}</div>}
            </div>
            <p className="mt-2 text-xs text-gray-400">Minimal Rp 10.000. Hanya angka (tanpa titik/koma).</p>
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-200 mb-2">Pilih Cepat</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((v) => (
                <button key={v} type="button" onClick={() => pickPreset(v)} className="px-3 py-2 rounded-xl border border-gray-600 bg-gray-700/50 text-gray-100 hover:bg-gray-600 hover:border-gray-500 text-sm transition">
                  {formatIDR(v)}
                </button>
              ))}
              <button type="button" onClick={() => setAmount("")} className="px-3 py-2 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm transition">
                Reset
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses…
                </span>
              ) : (
                "Top Up Sekarang"
              )}
            </button>
          </div>
        </form>

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
