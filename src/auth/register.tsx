import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

type RegisterForm = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const API_BASE = "https://take-home-test-api.nutech-integrasi.com";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterForm>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const validate = (): string | null => {
    if (!formData.first_name.trim()) return "First name wajib diisi.";
    if (!formData.last_name.trim()) return "Last name wajib diisi.";
    if (!EMAIL_REGEX.test(formData.email)) return "Format email tidak valid.";
    if (formData.password.length < 6) return "Password minimal 6 karakter.";
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const err = validate();
    if (err) {
      setApiError(err);
      return;
    }

    setLoading(true);
    setApiError(null);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${API_BASE}/registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      clearTimeout(t);

      let data: { message?: string; error?: string } | string | null = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        let msg: string | undefined = undefined;
        if (typeof data === "object" && data !== null) {
          msg = (data as { message?: string; error?: string }).message || (data as { message?: string; error?: string }).error;
        } else if (typeof data === "string") {
          msg = data;
        }
        msg = msg || "Registrasi gagal. Periksa kembali data Anda.";
        setApiError(String(msg));
        return;
      }

      // Sukses
      setToast("Registrasi berhasil! Mengarahkan ke halaman login…");
      setTimeout(() => {
        setToast(null);
        navigate("/login");
      }, 1200);
    } catch (error: unknown) {
      const msg = error instanceof Error ? (error.name === "AbortError" ? "Permintaan waktu habis. Coba lagi." : error.message) : "Tidak bisa menghubungi server. Periksa koneksi Anda.";
      setApiError(msg);
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="relative bg-gray-800/90 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-3xl p-8 transition-all duration-500 hover:shadow-gray-900/50">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg border border-gray-600">
              <svg className="w-8 h-8 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Buat Akun</h1>
          </div>

          {apiError && (
            <div role="alert" className="mb-6 rounded-xl border border-red-900/50 bg-red-900/20 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {apiError}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-200">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Nama depan"
                  className="w-full px-4 py-3 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition-all duration-300 hover:border-gray-500/70"
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-200">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Nama belakang"
                  className="w-full px-4 py-3 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition-all duration-300 hover:border-gray-500/70"
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition-all duration-300 hover:border-gray-500/70"
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 pr-12 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition-all duration-300 hover:border-gray-500/70"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  aria-label={showPwd ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPwd}
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-0 px-4 text-gray-400 hover:text-gray-200 transition-colors duration-200 focus:outline-none"
                >
                  {showPwd ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Mendaftarkan...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Daftar Sekarang
                </span>
              )}
            </button>

            <p className="text-center text-sm text-gray-300">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-gray-100 hover:text-white hover:underline font-semibold transition-all duration-200">
                Masuk di sini
              </Link>
            </p>
          </form>

          {toast && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white text-sm px-6 py-2 rounded-full shadow-lg animate-bounce z-20 border border-emerald-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {toast}
              </div>
            </div>
          )}
        </div>

        
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            Dengan mendaftar, Anda menyetujui{" "}
            <a href="#" className="text-gray-300 hover:text-white underline transition-colors duration-200">
              syarat dan ketentuan
            </a>{" "}
            serta{" "}
            <a href="#" className="text-gray-300 hover:text-white underline transition-colors duration-200">
              kebijakan privasi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
