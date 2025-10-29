"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageHeader from "@/components/common/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import ThemeSwitcher from "@/components/theme/theme-switcher"
import ColorPicker from "@/components/theme/color-picker"
import { useThemeStore } from "@/store/theme"

export default function SettingsPage() {
  const { primaryColor } = useThemeStore()

  return (
    <div>
      <PageHeader title="Settings" description="Manage your application preferences" />

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSwitcher />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Primary Color</CardTitle>
              <CardDescription>Customize the primary color of the application</CardDescription>
            </CardHeader>
            <CardContent>
              <ColorPicker />
              <div className="mt-4 p-4 rounded-lg bg-primary text-primary-foreground">
                <p className="text-sm">Preview: This is how your primary color looks</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Current API settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">API Base URL</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-2">{import.meta.env.VITE_API_BASE_URL}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Environment</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-2">
                  {import.meta.env.MODE === "development" ? "Development" : "Production"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Info</CardTitle>
              <CardDescription>Version and build information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Version</Label>
                <p className="text-sm">1.0.0</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Build Date</Label>
                <p className="text-sm">{new Date().toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Clear All Data</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
