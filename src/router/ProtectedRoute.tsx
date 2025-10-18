import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import MainLayout from "@/components/layout/main-layout"

export default function ProtectedRoute() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
