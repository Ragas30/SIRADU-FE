import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/auth"

interface RequireRoleProps {
  roles: string[]
}

export default function RequireRole({ roles }: RequireRoleProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const hasRole = Array.isArray(user.role)
    ? user.role.some((role) => roles.includes(role.name))
    : roles.includes(user.role)

  if (!hasRole) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
