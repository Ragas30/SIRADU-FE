import { Routes, Route, Navigate } from "react-router-dom"
import { Suspense, lazy } from "react"
import ProtectedRoute from "./ProtectedRoute"
import RequireRole from "./RequireRole"

const LoginPage = lazy(() => import("@/pages/auth/login"))
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"))
const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-password"))

const DashboardPage = lazy(() => import("@/pages/dashboard"))
const UsersPage = lazy(() => import("@/pages/users"))
const RolesPage = lazy(() => import("@/pages/roles"))
const AuditLogsPage = lazy(() => import("@/pages/audit-logs"))
const ProfilePage = lazy(() => import("@/pages/profile"))
const SettingsPage = lazy(() => import("@/pages/settings"))

const NotFoundPage = lazy(() => import("@/pages/404"))
const ForbiddenPage = lazy(() => import("@/pages/403"))

import { TablePageSkeleton } from "../components/ui/TablePageSkeleton"
import MainLayout from "../components/layout/main-layout"
import PerawatPage from "@/pages/nurse"
import PasienPage from "@/pages/patient"
import PatientHistoriesPage from "@/pages/patient-histories"
import NurseHistoriesPage from "@/pages/nurse-histories"

export default function Router() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<TablePageSkeleton />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<TablePageSkeleton />}>
            <ForgotPasswordPage />
          </Suspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<TablePageSkeleton />}>
            <ResetPasswordPage />
          </Suspense>
        }
      />

      <Route
        path="/403"
        element={
          <Suspense fallback={<TablePageSkeleton />}>
            <ForbiddenPage />
          </Suspense>
        }
      />
      <Route
        path="/404"
        element={
          <Suspense fallback={<TablePageSkeleton />}>
            <NotFoundPage />
          </Suspense>
        }
      />

      {/* Protected layout: chrome selalu tampil */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<TablePageSkeleton />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<TablePageSkeleton />}>
                <ProfilePage />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<TablePageSkeleton />}>
                <SettingsPage />
              </Suspense>
            }
          />

          <Route element={<RequireRole roles={["KEPALA_PERAWAT", "MANAGER"]} />}>
            <Route
              path="/users"
              element={
                <Suspense fallback={<TablePageSkeleton />}>
                  <UsersPage />
                </Suspense>
              }
            />
            <Route
              path="/perawat"
              element={
                <Suspense fallback={<TablePageSkeleton />}>
                  <PerawatPage />
                </Suspense>
              }
            />
            <Route
              path="/riwayat-perawat"
              element={
                <Suspense fallback={<TablePageSkeleton />}>
                  <NurseHistoriesPage />
                </Suspense>
              }
            />
            <Route
              path="/pasien"
              element={
                <Suspense fallback={<TablePageSkeleton />}>
                  <PasienPage />
                </Suspense>
              }
            />
            <Route
              path="/riwayat-pasien"
              element={
                <Suspense fallback={<TablePageSkeleton />}>
                  <PatientHistoriesPage />
                </Suspense>
              }
            />
            <Route
              path="/roles"
              element={
                <Suspense fallback={<TablePageSkeleton />}>
                  <RolesPage />
                </Suspense>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <Suspense fallback={<TablePageSkeleton />}>
                  <AuditLogsPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
