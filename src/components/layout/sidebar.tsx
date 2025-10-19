import { NavLink, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Shield, FileText, Settings, LogOut, Users2 } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { api } from "@/lib/axios"

// komponen dari shadcn block "sidebar"
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
import { RoleName } from "@/types/auth"

// tipe menu sederhana + roles
type MenuItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: RoleName[] // roles yang diizinkan, undefined = semua
}

export default function AppSidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  console.log(user)
  const roles = user?.role ? [user.role] : []
  console.log(roles)

  const isAllowed = (item: MenuItem) => {
    if (!item.roles || item.roles.length === 0) return true
    if (item.roles.includes("*" as RoleName)) return true
    return item.roles.some((r) => roles.includes(r))
  }

  const menus: MenuItem[] = (
    [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      // { label: "Users", href: "/users", icon: Users, roles: ["KEPALA_PERAWAT", "MANAGER"] },
      { label: "Perawat", href: "/perawat", icon: Users2, roles: ["KEPALA_PERAWAT", "MANAGER"] },
      { label: "Pasien", href: "/pasien", icon: Shield, roles: ["KEPALA_PERAWAT", "MANAGER"] },
      { label: "Riwayat Pasien", href: "/riwayat-pasien", icon: Shield, roles: ["KEPALA_PERAWAT", "MANAGER"] },
      { label: "Roles", href: "/roles", icon: Users2, roles: ["KEPALA_PERAWAT", "MANAGER"] },
      { label: "Audit Logs", href: "/audit-logs", icon: FileText, roles: ["KEPALA_PERAWAT", "MANAGER"] },
      { label: "Settings", href: "/settings", icon: Settings },
    ] as MenuItem[]
  ).filter(isAllowed)

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { successToast: true })
    } catch (e) {
      // ignore
    } finally {
      logout()
      window.location.href = "/login"
    }
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <div className="px-2 py-3 font-bold text-primary text-lg">Siradu</div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menus.map((item) => {
                const Icon = item.icon
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
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive gap-3">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* rail untuk mode collapsed (dari block) */}
      <SidebarRail />
    </Sidebar>
  )
}
