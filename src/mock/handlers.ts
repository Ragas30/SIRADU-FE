import { rest } from "msw"
import type { User, Role, AuditLog } from "../types"

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

// Mock data
const mockUser: User = {
  id: "1",
  name: "Admin User",
  email: "admin@example.com",
  roles: [
    {
      id: "1",
      name: "ADMIN",
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockUsers: User[] = [
  mockUser,
  {
    id: "2",
    name: "Manager User",
    email: "manager@example.com",
    roles: [
      {
        id: "2",
        name: "MANAGER",
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockRoles: Role[] = [
  {
    id: "1",
    name: "ADMIN",
    permissions: [
      { id: "1", name: "users.read", description: "Read users" },
      { id: "2", name: "users.write", description: "Write users" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "MANAGER",
    permissions: [{ id: "1", name: "users.read", description: "Read users" }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    userId: "1",
    action: "CREATE",
    resource: "users",
    resourceId: "2",
    changes: { name: "Manager User", email: "manager@example.com" },
    timestamp: new Date().toISOString(),
  },
]

export const handlers = [
  // Auth endpoints
  rest.post(`${baseURL}/auth/login`, async (req, res, ctx) => {
    const body = (await req.json()) as { email: string; password: string }
    if (body.email === "admin@example.com" && body.password === "password123") {
      return res(ctx.status(200), ctx.json({ accessToken: "mock-token-123", user: mockUser }))
    }
    return res(ctx.status(401), ctx.json({ error: "Invalid credentials" }))
  }),

  rest.post(`${baseURL}/auth/refresh`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ accessToken: "mock-token-123" }))
  }),

  rest.post(`${baseURL}/auth/logout`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }))
  }),

  rest.get(`${baseURL}/me`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockUser))
  }),

  // Users endpoints
  rest.get(`${baseURL}/users`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockUsers, total: mockUsers.length, page: 1, pageSize: 10 }))
  }),

  rest.get(`${baseURL}/users/:id`, (req, res, ctx) => {
    const user = mockUsers.find((u) => u.id === req.params.id)
    return user ? res(ctx.status(200), ctx.json(user)) : res(ctx.status(404), ctx.json({ error: "Not found" }))
  }),

  rest.post(`${baseURL}/users`, async (req, res, ctx) => {
    const body = (await req.json()) as Partial<User>
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name: body.name || "",
      email: body.email || "",
      roles: body.roles || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockUsers.push(newUser)
    return res(ctx.status(201), ctx.json(newUser))
  }),

  rest.put(`${baseURL}/users/:id`, async (req, res, ctx) => {
    const body = (await req.json()) as Partial<User>
    const user = mockUsers.find((u) => u.id === req.params.id)
    if (!user) return res(ctx.status(404), ctx.json({ error: "Not found" }))
    Object.assign(user, body, { updatedAt: new Date().toISOString() })
    return res(ctx.status(200), ctx.json(user))
  }),

  rest.delete(`${baseURL}/users/:id`, (req, res, ctx) => {
    const index = mockUsers.findIndex((u) => u.id === req.params.id)
    if (index === -1) return res(ctx.status(404), ctx.json({ error: "Not found" }))
    mockUsers.splice(index, 1)
    return res(ctx.status(200), ctx.json({ success: true }))
  }),

  // Roles endpoints
  rest.get(`${baseURL}/roles`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockRoles, total: mockRoles.length, page: 1, pageSize: 10 }))
  }),

  rest.get(`${baseURL}/roles/:id`, (req, res, ctx) => {
    const role = mockRoles.find((r) => r.id === req.params.id)
    return role ? res(ctx.status(200), ctx.json(role)) : res(ctx.status(404), ctx.json({ error: "Not found" }))
  }),

  // Audit logs endpoints
  rest.get(`${baseURL}/audit-logs`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockAuditLogs, total: mockAuditLogs.length, page: 1, pageSize: 10 }))
  }),
]
