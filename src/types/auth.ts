// src/types/auth.ts
export type RoleName = "ADMIN" | "MANAGER" | "STAFF"

export type UserRole = {
  id: string
  name: RoleName
}

export type User = {
  id: string
  name: string
  email: string
  roles: UserRole[]
}
