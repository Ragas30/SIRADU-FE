"use client"

import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { useEffect, useRef } from "react"
import Router from "./router"
import { useAuthStore } from "./store/auth"
import { useThemeStore } from "./store/theme"
import { Toaster } from "@/components/ui/sonner"

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
    if (ran.current) return
    ran.current = true

    if (window.__APP_INIT_DONE__) return
    window.__APP_INIT_DONE__ = true

    initializeTheme()
    initializeAuth()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Router />
        <Toaster richColors position="top-center" closeButton expand={false} duration={3000} />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
