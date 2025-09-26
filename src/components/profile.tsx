import React from "react";
import StatCard from "./statcard";

const API_BASE = "https://take-home-test-api.nutech-integrasi.com";

type ProfileResp = {
  data?: {
    first_name?: string;
    last_name?: string;
    profile_image?: string;
  };
  message?: string;
};

type BalanceResp = {
  data?: { balance?: number };
  message?: string;
};

const formatIDR = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const DUMMY_PROFILE_IMAGE = "https://fisika.uad.ac.id/wp-content/uploads/blank-profile-picture-973460_1280.png";

export default function Profile() {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [profileImage, setProfileImage] = React.useState<string | null>(null);
  const [balance, setBalance] = React.useState<number | null>(null);

  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [loadingBalance, setLoadingBalance] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const token = React.useMemo(() => localStorage.getItem("auth_token"), []);

  const fetchProfile = React.useCallback(async () => {
    if (!token) return;
    setLoadingProfile(true);
    setError(null);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      let data: ProfileResp | null = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok || !data?.data) throw new Error(data?.message || "Gagal memuat profil.");

      setFirstName(data.data.first_name ?? "");
      setLastName(data.data.last_name ?? "");
      // Set profile image dari API atau gunakan dummy jika tidak ada
      setProfileImage(data.data.profile_image || DUMMY_PROFILE_IMAGE);
    } catch (e: unknown) {
      if (typeof e === "object" && e !== null && "name" in e && "message" in e) {
        const err = e as { name?: string; message?: string };
        setError(err?.name === "AbortError" ? "Memuat profil terlalu lama." : err?.message || "Gagal memuat profil.");
      } else {
        setError("Gagal memuat profil.");
      }
    } finally {
      clearTimeout(t);
      setLoadingProfile(false);
    }
  }, [token]);

  const fetchBalance = React.useCallback(async () => {
    if (!token) return;
    setLoadingBalance(true);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${API_BASE}/balance`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      let data: BalanceResp | null = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok || !data?.data) throw new Error(data?.message || "Gagal memuat saldo.");
      const num = Number(data.data.balance ?? 0);
      setBalance(Number.isFinite(num) ? num : 0);
    } catch (e: unknown) {
      if (typeof e === "object" && e !== null && "name" in e && "message" in e) {
        const err = e as { name?: string; message?: string };
        setError((prev) => prev ?? (err?.name === "AbortError" ? "Memuat saldo terlalu lama." : err?.message || "Gagal memuat saldo."));
      } else {
        setError((prev) => prev ?? "Gagal memuat saldo.");
      }
    } finally {
      clearTimeout(t);
      setLoadingBalance(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchProfile();
    fetchBalance();
  }, [fetchProfile, fetchBalance]);

  React.useEffect(() => {
    const onRefresh = () => fetchBalance();
    window.addEventListener("balance:refresh", onRefresh);
    return () => window.removeEventListener("balance:refresh", onRefresh);
  }, [fetchBalance]);

  React.useEffect(() => {
    const onFocus = () => fetchBalance();
    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchBalance]);

  const loading = loadingProfile || loadingBalance;

  const handleImageError = () => {
    setProfileImage(DUMMY_PROFILE_IMAGE);
  };

  return (
    <div className="">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex items-center gap-4 w-full">
          
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-700 flex-shrink-0 shadow-lg">
            {profileImage ? (
              <img src={profileImage} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" onError={handleImageError} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-gray-100 font-bold">{firstName ? firstName[0]?.toUpperCase() : "U"}</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-100 truncate">{loadingProfile ? "Memuat..." : `Selamat Datang ${firstName} ${lastName}`}</h2>
            <p className="text-sm text-gray-400 truncate">{error ? error : "Semoga harimu menyenangkan"}</p>
          </div>

          <button
            onClick={() => {
              fetchProfile();
              fetchBalance();
            }}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-xl bg-gray-700 border border-gray-600 text-gray-100 hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200 flex-shrink-0"
          >
            {loading ? "..." : "Refresh"}
          </button>
        </div>

        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 w-full">
          <StatCard title="Saldo Dompet" value={loadingBalance ? "Memuat..." : balance != null ? formatIDR(balance) : "Rp 0"} desc="Klik Refresh untuk memperbarui saldo" />
        </div>
      </div>
    </div>
  );
}
