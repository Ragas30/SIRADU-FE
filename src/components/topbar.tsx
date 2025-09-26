import React, { useState } from "react";
import { clearAuth } from "../auth/auth";
import { useNavigate, useLocation } from "react-router-dom";

type Props = {
  onOpenSidebar?: () => void;
};

const Topbar: React.FC<Props> = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className="h-16 sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="h-full flex items-center px-3 md:px-6">

          <button className="md:hidden mr-3 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors" onClick={onOpenSidebar} aria-label="Open sidebar">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 hidden lg:block">
            <div className="max-w-md relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari sesuatu..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 lg:hidden">
            <button className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate("/topup")}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-gray-800/60 border border-gray-700 text-gray-100 hover:bg-gray-700/60 hover:border-gray-600 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden lg:inline">Top Up</span>
            </button>

            <button
              onClick={() => navigate("/payment")}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-gray-800/60 border border-gray-700 text-gray-100 hover:bg-gray-700/60 hover:border-gray-600 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden lg:inline">Payment</span>
            </button>

            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-gray-800/60 border border-gray-700 text-gray-100 hover:bg-gray-700/60 hover:border-gray-600 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden lg:inline">History</span>
            </button>
          </div>

          <div className="flex items-center gap-3 ml-3">

            <button className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors" onClick={toggleMobileMenu} aria-label="Toggle menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            <button onClick={logout} className="hidden md:flex items-center gap-2 px-3 py-2 text-sm rounded-xl bg-red-600/80 border border-red-600/50 text-red-100 hover:bg-red-600 hover:border-red-500 transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden lg:inline">Logout</span>
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-600/30 flex items-center justify-center text-white font-semibold shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200">
              U
            </div>
          </div>
        </div>
      </header>

      
      {showMobileMenu && (
        <>
          
          <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setShowMobileMenu(false)} />

          
          <div className="fixed top-16 right-3 left-3 z-40 md:hidden">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 space-y-2">
                
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari sesuatu..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600"
                  />
                </div>

                
                <button
                  onClick={() => handleNavigation("/topup")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl border transition-all ${
                    isActive("/topup") ? "bg-blue-600/30 border-blue-500/50 text-blue-200" : "bg-gray-800/40 border-gray-700/50 text-gray-100 hover:bg-gray-700/60"
                  }`}
                >
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Top Up Saldo
                  {isActive("/topup") && <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>}
                </button>

                <button
                  onClick={() => handleNavigation("/payment")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl border transition-all ${
                    isActive("/payment") ? "bg-green-600/30 border-green-500/50 text-green-200" : "bg-gray-800/40 border-gray-700/50 text-gray-100 hover:bg-gray-700/60"
                  }`}
                >
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Pembayaran
                  {isActive("/payment") && <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>}
                </button>

                <button
                  onClick={() => handleNavigation("/history")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl border transition-all ${
                    isActive("/history") ? "bg-yellow-600/30 border-yellow-500/50 text-yellow-200" : "bg-gray-800/40 border-gray-700/50 text-gray-100 hover:bg-gray-700/60"
                  }`}
                >
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Riwayat Transaksi
                  {isActive("/history") && <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full"></div>}
                </button>

                <div className="border-t border-gray-700 pt-2 mt-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl bg-red-600/20 border border-red-600/30 text-red-300 hover:bg-red-600/30 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Topbar;
