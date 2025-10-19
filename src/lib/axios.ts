import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from "axios"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner"

const baseURL = import.meta.env.VITE_API_BASE_URL

// Tambah flag opsional per-request
declare module "axios" {
  export interface AxiosRequestConfig {
    /** Matikan semua toast untuk request ini */
    silent?: boolean
    /** Paksa tampilkan success toast jika server kirim message */
    successToast?: boolean
    /** Matikan error toast untuk request ini */
    errorToast?: boolean
    /** Success message custom */
    successMessage?: string
    /** Error message custom override */
    errorMessage?: string
  }
}

export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token!)))
  failedQueue = []
}

// ------ Helpers ------
function extractErrorMessage(err: unknown, override?: string): string {
  if (override) return override
  const axErr = err as AxiosError<any>
  const data = axErr?.response?.data
  if (data?.error) return String(data.error)
  if (Array.isArray(data?.message)) return data.message.join(", ")
  if (data?.message) return String(data.message)
  if (axErr?.message) return axErr.message
  return "Terjadi kesalahan. Coba lagi."
}

function maybeToastSuccess(response: any) {
  const cfg = response?.config
  if (cfg?.silent) return
  const msg = cfg?.successMessage ?? response?.data?.message
  if (cfg?.successToast && msg) {
    toast.success(String(msg))
  }
}

function maybeToastAppError(response: any) {
  const cfg = response?.config
  if (cfg?.silent) return
  // Tangkap pola success:false dalam 2xx
  if (response?.data?.success === false) {
    const msg = response.data.error || response.data.message || cfg?.errorMessage || "Permintaan gagal."
    if (cfg?.errorToast !== false) {
      toast.error(String(msg))
    }
  }
}

// ------ Interceptors ------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    maybeToastAppError(response)
    maybeToastSuccess(response)
    return response
  },
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config
    const status = error.response?.status

    if (!originalRequest?.silent && originalRequest?.errorToast !== false) {
      toast.error(extractErrorMessage(error, originalRequest?.errorMessage))
    }

    // 401 refresh flow
    if (status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true, headers: { Accept: "application/json" } }
        )
        const { accessToken } = response.data
        useAuthStore.getState().setAccessToken(accessToken)
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        const { logout } = useAuthStore.getState()
        logout()
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
