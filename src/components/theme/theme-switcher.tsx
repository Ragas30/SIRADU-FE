"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/store/theme"

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className="flex gap-1 bg-muted p-1 rounded-lg">
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        size="icon"
        onClick={() => setTheme("light")}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        size="icon"
        onClick={() => setTheme("dark")}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </Button>
      <Button
        variant={theme === "system" ? "default" : "ghost"}
        size="icon"
        onClick={() => setTheme("system")}
        title="System theme"
      >
        <Monitor className="w-4 h-4" />
      </Button>
    </div>
  )
}
