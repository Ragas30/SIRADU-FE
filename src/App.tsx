import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/login";
import Register from "./auth/register";
import Dashboard from "./pages/dashboard";
import { getToken } from "./auth/auth";
import AppLayout from "./layout/applayout";
import TopUp from "./pages/topup";
import Payment from "./pages/payment";
import History from "./pages/history";
import EditProfile from "./pages/editprofile";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route index element={<Navigate to="/topUp" replace />} />
        <Route path="topUp" element={<TopUp />} />

        <Route index element={<Navigate to="/payment" replace />} />
        <Route path="payment" element={<Payment />} />

        <Route index element={<Navigate to="/history" replace />} />
        <Route path="history" element={<History />} />

        <Route index element={<Navigate to="/profile" replace />} />
        <Route path="profile" element={<EditProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
