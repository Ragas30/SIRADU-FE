import React from "react";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import { Outlet } from "react-router-dom";

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Topbar />
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
