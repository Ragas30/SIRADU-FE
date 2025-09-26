import React from "react";

const API_BASE = "https://take-home-test-api.nutech-integrasi.com";

const DUMMY_PROFILE_IMAGE = "https://fisika.uad.ac.id/wp-content/uploads/blank-profile-picture-973460_1280.png";

type ProfileData = {
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_image?: string;
};
type ProfileResp = { data?: ProfileData; message?: string };
type UpdateResp = { data?: ProfileData; message?: string };

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MAX_IMAGE_BYTES = 102400;

async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default function EditProfile() {
  const token = React.useMemo(() => localStorage.getItem("auth_token"), []);

  const firstRef = React.useRef<HTMLInputElement>(null);
  const lastRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  const [initial, setInitial] = React.useState<Required<Pick<ProfileData, "first_name" | "last_name" | "email">>>({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [dirty, setDirty] = React.useState(false);

  const snapshotValues = () => ({
    first_name: firstRef.current?.value?.trim() || "",
    last_name: lastRef.current?.value?.trim() || "",
    email: emailRef.current?.value?.trim() || "",
  });

  const recalcDirty = React.useCallback(() => {
    const now = snapshotValues();
    const changedText = now.first_name !== initial.first_name || now.last_name !== initial.last_name || now.email !== initial.email;
    const changedImg = !!avatarFile;
    setDirty(changedText || changedImg);
  }, [initial, avatarFile]);

  const fetchProfile = React.useCallback(async () => {
    if (!token) {
      setError("Sesi login berakhir. Silakan masuk kembali.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeJson<ProfileResp>(res);
      if (!res.ok || !data?.data) {
        setError(data?.message || `Gagal memuat profil (status ${res.status}).`);
        return;
      }
      const p = data.data;

      if (firstRef.current) firstRef.current.value = p.first_name ?? "";
      if (lastRef.current) lastRef.current.value = p.last_name ?? "";
      if (emailRef.current) emailRef.current.value = p.email ?? "";

      setInitial({
        first_name: p.first_name ?? "",
        last_name: p.last_name ?? "",
        email: p.email ?? "",
      });

      setAvatarUrl(p.profile_image || DUMMY_PROFILE_IMAGE);
      setDirty(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Tidak bisa menghubungi server.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = () => {
    setError(null);
    setSuccess(null);
    recalcDirty();
  };

  const onPickImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setError(null);
    setSuccess(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
      setError("Format gambar harus JPG/PNG/WEBP.");
      e.currentTarget.value = "";
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setError("Ukuran gambar maksimal 100 KB.");
      e.currentTarget.value = "";
      return;
    }
    setAvatarFile(f);
    const url = URL.createObjectURL(f);
    setAvatarPreview(url);
    setDirty(true);
  };

  const onCancel = () => {
    if (firstRef.current) firstRef.current.value = initial.first_name;
    if (lastRef.current) lastRef.current.value = initial.last_name;
    if (emailRef.current) emailRef.current.value = initial.email;
    // batal gambar
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarFile(null);
    setError(null);
    setSuccess(null);
    setDirty(false);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!token || saving || !dirty) return;

    const { first_name, last_name, email } = snapshotValues();
    if (!first_name) return setError("First name wajib diisi.");
    if (!last_name) return setError("Last name wajib diisi.");
    if (!EMAIL_RE.test(email)) return setError("Format email tidak valid.");

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const textChanged = first_name !== initial.first_name || last_name !== initial.last_name || email !== initial.email;

      if (textChanged) {
        const res = await fetch(`${API_BASE}/profile/update`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ first_name, last_name, email }),
        });
        const data = await safeJson<UpdateResp>(res);
        if (!res.ok || !data?.data) {
          throw new Error(data?.message || `Gagal memperbarui profil (status ${res.status}).`);
        }
      }

      if (avatarFile) {
        const form = new FormData();
        form.append("file", avatarFile);
        const resImg = await fetch(`${API_BASE}/profile/image`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` } as HeadersInit,
          body: form,
        });
        const dataImg = await safeJson<{ data?: { profile_image?: string }; message?: string }>(resImg);
        if (!resImg.ok || !dataImg?.data) {
          throw new Error(dataImg?.message || `Gagal memperbarui gambar (status ${resImg.status}).`);
        }
        setAvatarUrl(dataImg.data.profile_image ?? DUMMY_PROFILE_IMAGE);
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
        setAvatarFile(null);
      }

      setInitial({ first_name, last_name, email });
      setDirty(false);
      setSuccess("Profil berhasil diperbarui ");
      window.dispatchEvent(new CustomEvent("profile:refresh"));
      setTimeout(() => setSuccess(null), 2500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan saat menyimpan.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleImageError = () => {
    setAvatarUrl(DUMMY_PROFILE_IMAGE);
  };

  const displayName = `${initial.first_name || firstRef.current?.value || ""} ${initial.last_name || lastRef.current?.value || ""}`.trim() || "Profil";

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-800 border border-gray-700 bg-gray-800/70 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={handleImageError} />
              ) : (
                <span className="text-3xl text-gray-300 font-semibold">{(firstRef.current?.value?.[0] || "U").toUpperCase()}</span>
              )}
            </div>

            <label htmlFor="avatar" className="absolute bottom-0 right-0 p-2 rounded-full bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-100 cursor-pointer shadow" title="Ubah foto">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M4 13.5V19h5.5l9.793-9.793a1.5 1.5 0 10-2.121-2.121L7.379 16.879 4 13.5z" />
              </svg>
            </label>
            <input id="avatar" type="file" accept="image/*" className="hidden" onChange={onPickImage} />
          </div>

          <h2 className="mt-3 text-xl font-semibold text-gray-100 text-center">{loading ? "Memuat…" : displayName}</h2>
        </div>

        {error && <div className="mb-4 rounded-xl border border-rose-900/50 bg-rose-900/20 px-4 py-3 text-sm text-rose-300">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-emerald-900/50 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-300">{success}</div>}

        <form onSubmit={onSubmit} className="bg-gray-800/70 border border-gray-700 rounded-2xl p-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8-4H8m8 8H8M4 6h16v12H4z" />
                </svg>
              </span>
              <input
                id="email"
                ref={emailRef}
                type="email"
                onChange={onInputChange}
                disabled={loading}
                className="w-full pl-9 pr-3 py-3 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 
                  focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition disabled:opacity-50"
                placeholder="email@contoh.com"
                defaultValue={initial.email}
              />
            </div>
          </div>

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-2">
              Nama Depan
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 12h9M5 16h6" />
                </svg>
              </span>
              <input
                id="firstName"
                ref={firstRef}
                type="text"
                onChange={onInputChange}
                disabled={loading}
                className="w-full pl-9 pr-3 py-3 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 
                  focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition disabled:opacity-50"
                placeholder="Nama depan"
                defaultValue={initial.first_name}
              />
            </div>
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-2">
              Nama Belakang
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 12h9M5 16h6" />
                </svg>
              </span>
              <input
                id="lastName"
                ref={lastRef}
                type="text"
                onChange={onInputChange}
                disabled={loading}
                className="w-full pl-9 pr-3 py-3 rounded-xl border bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 
                  focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 focus:outline-none transition disabled:opacity-50"
                placeholder="Nama belakang"
                defaultValue={initial.last_name}
              />
            </div>
          </div>

          <div className="pt-1 flex gap-3">
            {dirty ? (
              <>
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow 
                    focus:outline-none focus:ring-4 focus:ring-red-500/30 disabled:opacity-60"
                >
                  {saving ? "Menyimpan…" : "Simpan"}
                </button>
                <button type="button" onClick={onCancel} disabled={saving || loading} className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-medium">
                  Batal
                </button>
              </>
            ) : (
              <button type="button" disabled className="w-full px-6 py-3 rounded-xl bg-gray-700/60 text-gray-300 border border-gray-600 cursor-not-allowed" title="Tidak ada perubahan">
                Tidak ada perubahan
              </button>
            )}
          </div>

          {avatarPreview && (
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Gambar baru dipilih (≤ 100 KB). Klik Simpan untuk mengunggah.</span>
              <button
                type="button"
                onClick={() => {
                  if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                  setAvatarPreview(null);
                  setAvatarFile(null);
                  recalcDirty();
                }}
                className="px-2 py-1 rounded-lg border border-gray-600 hover:bg-gray-700 text-gray-200"
              >
                Batalkan gambar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
