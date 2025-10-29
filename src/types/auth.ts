export type RoleName = "KEPALA_PERAWAT" | "MANAGER" | "STAFF"

export type UserRole = {
  id: string
  name: RoleName
}

export type User = {
  id: string
  name: string
  email: string
  roles: string
}
