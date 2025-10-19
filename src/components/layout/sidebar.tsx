// src/components/layout/sidebar.tsx
"use client"

import { NavLink, useLocation } from "react-router-dom"
import { LayoutDashboard, Stethoscope, History, ClipboardList, Settings, LogOut, UserCircle } from "lucide-react"
import { useMemo } from "react"
import { useAuthStore } from "@/store/auth"
import { api } from "@/lib/axios"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { RoleName } from "@/types/auth"

type MenuItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: RoleName[] // jika diisi, hanya role tsb yang bisa melihat
}

export default function AppSidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  // role backend-mu tampaknya single (user.role)
  const roles = useMemo<RoleName[]>(() => (user?.role ? [user.role as RoleName] : []), [user?.role])

  const canSee = (item: MenuItem) => {
    if (!item.roles || item.roles.length === 0) return true
    return item.roles.some((r) => roles.includes(r))
  }

  // --- Groups terstruktur ---
  const groups: { label: string; items: MenuItem[] }[] = [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Data Master",
      items: [
        { label: "Perawat", href: "/perawat", icon: Stethoscope, roles: ["KEPALA_PERAWAT", "MANAGER"] },
        { label: "Pasien", href: "/pasien", icon: UserCircle, roles: ["KEPALA_PERAWAT", "MANAGER"] },
      ],
    },
    {
      label: "Riwayat",
      items: [
        {
          label: "Riwayat Perawat",
          href: "/riwayat-perawat",
          icon: ClipboardList,
          roles: ["KEPALA_PERAWAT", "MANAGER"],
        },
        { label: "Riwayat Pasien", href: "/riwayat-pasien", icon: History, roles: ["KEPALA_PERAWAT", "MANAGER"] },
      ],
    },
    {
      label: "Pengaturan",
      items: [{ label: "Settings", href: "/settings", icon: Settings }],
    },
  ]

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { successToast: true })
    } finally {
      logout()
      window.location.href = "/login"
    }
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <div className="px-3 py-3 font-semibold tracking-tight">
          <span className="text-primary">Siradu</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => {
          const visibleItems = group.items.filter(canSee)
          if (visibleItems.length === 0) return null
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const Icon = item.icon
                    // aktif jika persis path atau berada di bawahnya
                    const active = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active}>
                          <NavLink to={item.href} className="gap-3">
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/profile" className="gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="truncate">{user?.name ?? "User"}</div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive gap-3 hover:text-destructive">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
