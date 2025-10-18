// src/App.tsx
"use client"

import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { useEffect, useRef } from "react"
import Router from "./router"
import { useAuthStore } from "./store/auth"
import { useThemeStore } from "./store/theme"

declare global {
  interface Window {
    __APP_INIT_DONE__?: boolean
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      // hindari auto-refetch saat fokus yang bisa memicu request awal ganda:
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

export default function App() {
  const { initializeAuth } = useAuthStore()
  const { initializeTheme } = useThemeStore()
  const ran = useRef(false)

  useEffect(() => {
    // Guard 1: cegah double-invoke StrictMode
    if (ran.current) return
    ran.current = true

    // Guard 2: cegah remount dari HMR
    if (window.__APP_INIT_DONE__) return
    window.__APP_INIT_DONE__ = true

    initializeTheme()
    initializeAuth()
  }, []) // sengaja deps kosong

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
