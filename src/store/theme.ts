import { create } from "zustand"

type Theme = "light" | "dark" | "system"

interface ThemeState {
  theme: Theme
  primaryColor: string
  setTheme: (theme: Theme) => void
  setPrimaryColor: (color: string) => void
  initializeTheme: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "system",
  primaryColor: "#02BAA5",
  setTheme: (theme) => {
    set({ theme })
    localStorage.setItem("theme", theme)
    applyTheme(theme)
  },
  setPrimaryColor: (color) => {
    set({ primaryColor: color })
    localStorage.setItem("primaryColor", color)
    applyPrimaryColor(color)
  },
  initializeTheme: () => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "system"
    const savedColor = localStorage.getItem("primaryColor") || "#02BAA5"
    set({ theme: savedTheme, primaryColor: savedColor })
    applyTheme(savedTheme)
    applyPrimaryColor(savedColor)
  },
}))

function applyTheme(theme: Theme) {
  const html = document.documentElement
  if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    html.classList.toggle("dark", isDark)
  } else {
    html.classList.toggle("dark", theme === "dark")
  }
}

function applyPrimaryColor(color: string) {
  const hex = color.replace("#", "")
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)

  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  let h = 0,
    s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6
        break
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6
        break
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6
        break
    }
  }

  const hslH = Math.round(h * 360)
  const hslS = Math.round(s * 100)
  const hslL = Math.round(l * 100)

  document.documentElement.style.setProperty("--primary", `${hslH} ${hslS}% ${hslL}%`)
}
