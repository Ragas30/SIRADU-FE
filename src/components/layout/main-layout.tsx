// src/components/layout/MainLayout.tsx
import { Outlet } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "./sidebar"
import Topbar from "./topbar"

export default function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen bg-background">
        <AppSidebar />
        <div className="flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 min-h-0 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
