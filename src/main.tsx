// main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"

const enableMock = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === "true"

if (enableMock) {
  const { worker } = await import("./mock/server")
  await worker.start({ serviceWorker: { url: "/mockServiceWorker.js" }, onUnhandledRequest: "bypass" })
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
