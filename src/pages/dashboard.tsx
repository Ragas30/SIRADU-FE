import React from "react";
import Profile from "../components/profile";

const API_BASE = "https://take-home-test-api.nutech-integrasi.com";

type ServiceItem = {
  service_code?: string;
  service_name?: string;
  service_icon?: string;
  service_tariff?: number;
};
type ServiceResp = { data?: ServiceItem[]; message?: string };

type BannerItem = {
  banner_name?: string;
  banner_image?: string;
  description?: string;
  [k: string]: unknown;
};
type BannerResp = { data?: BannerItem[]; message?: string };

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const Dashboard: React.FC = () => {
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [banners, setBanners] = React.useState<BannerItem[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [serviceError, setServiceError] = React.useState<string | null>(null);

  const token = React.useMemo(() => localStorage.getItem("auth_token"), []);

  async function safeJson<T>(res: Response): Promise<T | null> {
    try {
      return (await res.json()) as T;
    } catch (e) {
      console.error("Gagal parsing JSON:", e);
      return null;
    }
  }

  const fetchServicesWithFallback = async (headers: HeadersInit, signal: AbortSignal) => {
    setServiceError(null);
    const endpoints = [`${API_BASE}/services`];

    for (const url of endpoints) {
      try {
        const r = await fetch(url, { headers, signal });
        const data = await safeJson<ServiceResp>(r);

        if (r.ok && Array.isArray(data?.data)) {
          setServices(data.data);
          localStorage.setItem("service", JSON.stringify(data.data));
          return;
        }

        if (r.status === 404) continue; // coba endpoint berikutnya

        setServiceError(data?.message || `Gagal memuat layanan (status ${r.status}).`);
      } catch (e) {
        console.error("Error fetch service:", e);
        const msg = e instanceof Error ? (e.name === "AbortError" ? "Waktu muat layanan habis." : e.message) : "Gagal memuat layanan.";
        setServiceError(msg);
      }
    }

    if (services.length === 0 && !localStorage.getItem("service")) {
      setServiceError("Data layanan tidak ditemukan.");
    }
  };

  const fetchAll = React.useCallback(async () => {
    if (!token) {
      setError("Sesi login berakhir. Silakan masuk kembali.");
      setLoading(false);
      return;
    }

    setError(null);
    setServiceError(null);
    setLoading(true);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const banRes = await fetch(`${API_BASE}/banner`, {
        headers,
        signal: controller.signal,
      });
      const banData = await safeJson<BannerResp>(banRes);

      if (banRes.ok && Array.isArray(banData?.data)) {
        setBanners(banData.data);
        localStorage.setItem("banner", JSON.stringify(banData.data));
      } else if (!banRes.ok) {
        setError(banData?.message || "Gagal memuat banner.");
      }

      await fetchServicesWithFallback(headers, controller.signal);
    } catch (err) {
      console.error("FetchAll error:", err);
      const msg = err instanceof Error ? (err.name === "AbortError" ? "Permintaan waktu habis." : err.message) : "Tidak bisa menghubungi server.";
      setError(msg);
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  }, [token, services.length]);

  React.useEffect(() => {
    const cachedSvc = localStorage.getItem("service");
    const cachedBan = localStorage.getItem("banner");

    if (cachedSvc) {
      try {
        setServices(JSON.parse(cachedSvc));
      } catch (e) {
        console.error("Cache service rusak:", e);
      }
    }
    if (cachedBan) {
      try {
        setBanners(JSON.parse(cachedBan));
      } catch (e) {
        console.error("Cache banner rusak:", e);
      }
    }

    fetchAll();
  }, [fetchAll]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-400">Ringkasan performa hari ini</p>
      </div>

      <Profile />

      <section className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-100">Banner</h2>
          <button onClick={fetchAll} className="text-xs px-3 py-1.5 rounded-lg bg-gray-700/70 border border-gray-600 text-gray-100 hover:bg-gray-600">
            Refresh
          </button>
        </div>
        {banners.length === 0 && (loading ? <div className="h-24 rounded-xl bg-gray-700/40 animate-pulse" /> : <p className="text-sm text-gray-400">Belum ada banner.</p>)}
        {banners.length > 0 && (
          <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {banners.map((b, i) => (
              <div key={(b.banner_name || "banner") + i} className="min-w-[260px] bg-gray-800/70 border border-gray-700 rounded-xl overflow-hidden">
                <div className="aspect-[16/9] bg-gray-700/40 flex items-center justify-center">
                  {b.banner_image ? <img src={b.banner_image} alt={b.banner_name || `Banner ${i + 1}`} className="w-full h-full object-cover" loading="lazy" /> : <span className="text-xs text-gray-400">No Image</span>}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-100 truncate">{b.banner_name || "Banner"}</h3>
                  {b.description && <p className="text-xs text-gray-400 line-clamp-2 mt-1">{b.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">Layanan</h2>
          <span className="text-xs text-gray-400">{services.length} layanan tersedia</span>
        </div>

        {serviceError && <div className="mb-3 rounded-xl border border-amber-900/50 bg-amber-900/20 px-4 py-3 text-xs text-amber-200">{serviceError}</div>}

        {services.length === 0 &&
          (loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-gray-700/40 animate-pulse" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Belum ada layanan.</p>
          ))}

        {services.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {services.map((svc, idx) => (
              <button
                key={(svc.service_code || "svc") + idx}
                type="button"
                className="group rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 transition-colors p-3 text-left"
                onClick={() => console.log("Klik layanan:", svc.service_code)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-700/50 border border-gray-600 flex items-center justify-center overflow-hidden">
                    {svc.service_icon ? (
                      <img src={svc.service_icon} alt={svc.service_name || "icon"} className="w-6 h-6 object-contain" loading="lazy" />
                    ) : (
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-100 font-medium truncate">{svc.service_name || svc.service_code || "Layanan"}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{svc.service_code || "-"}</p>
                    {typeof svc.service_tariff === "number" && <p className="text-xs text-gray-300 mt-0.5">{formatIDR(svc.service_tariff)}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {error && <div className="rounded-xl border border-rose-900/50 bg-rose-900/20 px-4 py-3 text-sm text-rose-300">{error}</div>}
    </div>
  );
};

export default Dashboard;
