import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const API_BASE = "https://take-home-test-api.nutech-integrasi.com";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiError(null);
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!EMAIL_REGEX.test(form.email)) return "Format email tidak valid.";
    if (form.password.length < 6) return "Password minimal 6 karakter.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    if (err) return setApiError(err);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.data?.token) {
        setApiError(data?.message || "Username atau password salah.");
        return;
      }

      const { token, user } = data.data;
      localStorage.setItem("auth_token", token);
      if (user) localStorage.setItem("auth_user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Tidak bisa menghubungi server. Periksa koneksi/jaringan.";
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="relative bg-gray-800/90 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-3xl p-8 transition-all duration-500 hover:shadow-gray-900/50">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg border border-blue-600/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Masuk</h1>
            <p className="text-gray-300 text-sm">Selamat datang kembali</p>
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

          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                autoComplete="email"
                inputMode="email"
                placeholder="nama@email.com"
                className="w-full px-4 py-3 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition-all duration-300 hover:border-gray-500/70"
                required
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
                  value={form.password}
                  onChange={onChange}
                  autoComplete="current-password"
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 pr-12 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition-all duration-300 hover:border-gray-500/70"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPwd}
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
              <p className="text-xs text-gray-400">Minimal 6 karakter.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-600/20 text-white font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Masuk
                </span>
              )}
            </button>

            <p className="text-center text-sm text-gray-300">
              Belum punya akun?{" "}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold transition-all duration-200">
                Daftar
              </Link>
            </p>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            Dengan masuk, Anda menyetujui{" "}
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
