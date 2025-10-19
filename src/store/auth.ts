import { create } from "zustand"
import type { User } from "@/types"
import { api } from "@/lib/axios"

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  error: null,
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, accessToken: null }),
  initializeAuth: async () => {
    try {
      const response = await api.post("/auth/refresh", {}, { successToast: true })
      set({ user: response.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false, error: "Failed to initialize auth" })
    }
  },
}))
