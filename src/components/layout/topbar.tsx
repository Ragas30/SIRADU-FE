import { SidebarTrigger } from "@/components/ui/sidebar"
import ThemeSwitcher from "@/components/theme/theme-switcher"

export default function Topbar() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <SidebarTrigger />
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
      </div>
    </header>
  )
}
