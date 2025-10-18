"use client"

import { useThemeStore } from "@/store/theme"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ColorPicker() {
  const { primaryColor, setPrimaryColor } = useThemeStore()

  return (
    <div className="space-y-2">
      <Label htmlFor="color">Primary Color</Label>
      <div className="flex gap-2">
        <Input
          id="color"
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          className="w-16 h-10 cursor-pointer"
        />
        <Input
          type="text"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          placeholder="#02BAA5"
          className="flex-1"
        />
      </div>
    </div>
  )
}
