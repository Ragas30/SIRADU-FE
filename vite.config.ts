import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { fileURLToPath } from "url"

const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "")
const target = env.VITE_API_BASE_URL || "http://localhost:3000"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
