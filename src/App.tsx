import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import PrivateRoute from "@/components/PrivateRoute";
import Dashboard from "./pages/Home";
import Nurses from "./pages/Nurses";
import Patients from "./pages/Patients";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/nurses" element={<Nurses />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
