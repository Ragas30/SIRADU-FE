import React from "react";
import Profile from "../components/profile";
import StatCard from "../components/statcard";
import Toast from "../components/toast";

const API_BASE = "https://take-home-test-api.nutech-integrasi.com";
const PRESETS = [10000, 20000, 50000, 100000, 200000, 500000] as const;

type ServiceItem = {
  service_code?: string;
  service_name?: string;
  service_icon?: string;
  service_tariff?: number;
};

type ServiceResp = {
  data?: ServiceItem[];
  message?: string;
};

type TransactionResp = {
  message?: string;
  data?: {
    invoice_number?: string;
    service_code?: string;
    total_amount?: number;
    balance?: number;
  };
};

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch (e) {
    console.error("Gagal parsing JSON:", e);
    return null;
  }
}

export default function Payment() {
  const token = React.useMemo(() => localStorage.getItem("auth_token"), []);
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [serviceCode, setServiceCode] = React.useState<string>("");
  const [customerRef, setCustomerRef] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");

  const selectedService = React.useMemo(() => services.find((s) => s.service_code === serviceCode), [services, serviceCode]);

  const [loadingList, setLoadingList] = React.useState<boolean>(false);
  const [loadingPay, setLoadingPay] = React.useState<boolean>(false);
  const [listError, setListError] = React.useState<string | null>(null);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (selectedService && typeof selectedService.service_tariff === "number") {
      setAmount(String(selectedService.service_tariff));
    } else if (!selectedService) {
      setAmount("");
    }
  }, [selectedService]);

  const fetchServicesWithFallback = React.useCallback(async () => {
    if (!token) {
      setListError("Sesi login berakhir. Silakan masuk kembali.");
      return;
    }
    setListError(null);
    setLoadingList(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    const endpoints = [`${API_BASE}/services`];
    let loaded = false;

    try {
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { headers, signal: controller.signal });
          const data = await safeJson<ServiceResp>(res);

          if (res.ok && Array.isArray(data?.data)) {
            setServices(data.data);
            localStorage.setItem("service", JSON.stringify(data.data));
            loaded = true;
            break;
          }

          if (res.status === 404) {
            continue;
          }

          if (!res.ok) {
            const msg = data?.message || `Gagal memuat layanan (status ${res.status}).`;
            setListError((prev) => prev ?? msg);
          }
        } catch (e) {
          console.error("Error fetch service:", e);
          const msg = e instanceof Error ? (e.name === "AbortError" ? "Waktu muat layanan habis." : e.message) : "Gagal memuat layanan.";
          setListError((prev) => prev ?? msg);
        }
      }

      if (!loaded) {
        const cache = localStorage.getItem("service");
        if (cache) {
          try {
            const parsed = JSON.parse(cache) as ServiceItem[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setServices(parsed);
              setListError((prev) => prev ?? "Data layanan dari cache.");
            } else {
              setListError((prev) => prev ?? "Data layanan tidak ditemukan.");
            }
          } catch (e) {
            console.error("Cache service rusak:", e);
            setListError((prev) => prev ?? "Data layanan tidak ditemukan.");
          }
        } else {
          setListError((prev) => prev ?? "Data layanan tidak ditemukan.");
        }
      }
    } finally {
      clearTimeout(timeoutId);
      setLoadingList(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchServicesWithFallback();
  }, [fetchServicesWithFallback]);

  const onChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    const digits = e.target.value.replace(/[^\d]/g, "");
    setAmount(digits);
  };

  const onPickPreset = (val: number) => {
    setApiError(null);
    setAmount(String(val));
  };

  const canSubmit = React.useMemo(() => {
    const parsed = Number(amount);
    const hasAmount = Number.isFinite(parsed) && parsed > 0;
    return !!serviceCode && hasAmount && !loadingPay;
  }, [serviceCode, amount, loadingPay]);

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setApiError("Nominal tidak valid.");
      return;
    }

    if (parsed < 1000) {
      setApiError("Minimal pembayaran Rp 1.000.");
      return;
    }

    const tokenNow = localStorage.getItem("auth_token");
    if (!tokenNow) {
      setApiError("Sesi login berakhir. Silakan masuk kembali.");
      return;
    }

    setLoadingPay(true);
    setApiError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const payload: Record<string, unknown> = {
        service_code: serviceCode,
        amount: parsed,
      };

      if (selectedService && typeof selectedService.service_tariff === "number") {
        payload.service_tariff = selectedService.service_tariff;
      }

      if (customerRef.trim()) {
        payload.customer_no = customerRef.trim();
      }

      const res = await fetch(`${API_BASE}/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenNow}` },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      const data = await safeJson<TransactionResp>(res);

      if (!res.ok) {
        const msg = data?.message || (typeof data === "string" ? data : null) || `Pembayaran gagal (status ${res.status}).`;
        setApiError(String(msg));
        return;
      }

      if (typeof data?.data?.balance === "number") {
        localStorage.setItem("balance", String(data.data.balance));
      }

      window.dispatchEvent(new CustomEvent("balance:refresh"));

      setToast(`Pembayaran berhasil${data?.data?.total_amount ? `: ${formatIDR(data.data.total_amount)}` : ""}${data?.data?.invoice_number ? ` — Invoice ${data.data.invoice_number}` : ""} 🎉`);
      setAmount("");
      setCustomerRef("");
      setTimeout(() => setToast(null), 2200);
    } catch (err) {
      console.error("Pembayaran error:", err);
      const msg = err instanceof Error ? (err.name === "AbortError" ? "Permintaan waktu habis. Coba lagi." : err.message) : "Tidak bisa menghubungi server. Periksa koneksi Anda.";
      setApiError(msg);
    } finally {
      clearTimeout(timeoutId);
      setLoadingPay(false);
    }
  };

  const parsedAmount = React.useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const amountLocked = React.useMemo(() => !!selectedService && typeof selectedService.service_tariff === "number", [selectedService]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Profile />

      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
        <StatCard
          title={selectedService?.service_name ? `Pembayaran — ${selectedService.service_name}` : "Pembayaran"}
          value={parsedAmount > 0 ? formatIDR(parsedAmount) : "Rp 0"}
          desc={selectedService?.service_code ? `Kode: ${selectedService.service_code}` : "Pilih layanan, isi nominal, lalu bayar"}
        />
      </div>

      <div className="bg-gray-800/70 border border-gray-700 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Form Pembayaran</h2>
          <button onClick={fetchServicesWithFallback} className="text-xs px-3 py-1.5 rounded-lg bg-gray-700/70 border border-gray-600 text-gray-100 hover:bg-gray-600" disabled={loadingList}>
            {loadingList ? "Memuat…" : "Refresh Layanan"}
          </button>
        </div>

        {listError && <div className="mb-4 rounded-xl border border-amber-900/50 bg-amber-900/20 px-4 py-3 text-sm text-amber-200">{listError}</div>}

        {apiError && <div className="mb-4 rounded-xl border border-red-900/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">{apiError}</div>}

        <form onSubmit={handlePay} className="space-y-5" noValidate>
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-200 mb-2">
              Pilih Layanan
            </label>
            <div className="relative">
              <select
                id="service"
                name="service"
                value={serviceCode}
                onChange={(e) => {
                  setApiError(null);
                  setServiceCode(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition"
                required
              >
                <option value="">— pilih layanan —</option>
                {services.map((s) => (
                  <option key={s.service_code || s.service_name} value={s.service_code || ""}>
                    {s.service_name || s.service_code}
                    {typeof s.service_tariff === "number" ? ` — ${formatIDR(s.service_tariff)}` : ""}
                  </option>
                ))}
              </select>
              {selectedService?.service_icon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <img src={selectedService.service_icon} alt="icon" className="w-5 h-5 object-contain opacity-80" />
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-400">Tarif otomatis terisi bila disediakan oleh layanan.</p>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-200 mb-2">
              Nominal
            </label>
            <div className="relative">
              <input
                id="amount"
                name="amount"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={amountLocked ? "Nominal mengikuti tarif layanan" : "Contoh: 100000"}
                value={amount}
                onChange={onChangeAmount}
                disabled={amountLocked}
                className={`w-full px-4 py-3 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition ${
                  amountLocked ? "opacity-70 cursor-not-allowed" : ""
                }`}
                required
              />
              {Number(amount) > 0 && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300">{formatIDR(Number(amount))}</div>}
            </div>
            {!amountLocked && (
              <>
                <p className="mt-2 text-xs text-gray-400">Minimal Rp 1.000. Hanya angka (tanpa titik/koma).</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRESETS.map((v) => (
                    <button key={v} type="button" onClick={() => onPickPreset(v)} className="px-3 py-2 rounded-xl border border-gray-600 bg-gray-700/50 text-gray-100 hover:bg-gray-600 hover:border-gray-500 text-sm transition">
                      {formatIDR(v)}
                    </button>
                  ))}
                  <button type="button" onClick={() => setAmount("")} className="px-3 py-2 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm transition">
                    Reset
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loadingPay ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses…
                </span>
              ) : (
                "Bayar Sekarang"
              )}
            </button>
          </div>
        </form>

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
