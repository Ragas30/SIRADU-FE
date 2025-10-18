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

  const hasRole = user.roles.some((role) => roles.includes(role.name))

  if (!hasRole) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
