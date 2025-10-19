export interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface Nurse {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: "ADMIN" | "MANAGER" | "STAFF"
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  description: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  changes: Record<string, unknown>
  timestamp: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
