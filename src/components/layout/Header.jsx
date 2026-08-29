import React, { useState } from "react";
import {
  AlertTriangle,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogoutConfirmModal from "../../pages/LogoutConfirmModal";
import { useTheme } from "../../context/ThemeContext";

const Header = ({
  currentUser,
  handleLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { theme, darkMode, toggleDarkMode } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const confirmLogout = () => {
    handleLogout();
    setShowLogoutConfirm(false);
  };

  const isSuperAdmin =
    currentUser?.role === "SUPER_ADMIN" ||
    currentUser?.role === "SYSTEM_ADMIN";

  return (
    <>
      <LogoutConfirmModal
        show={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        theme={theme}
      />

      <header
        className={`${theme.card} border-b ${theme.border} sticky top-0 z-[3000] transition-colors duration-300`}
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[72px] flex items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>

              <div className="min-w-0 leading-none">
                <div className={`text-[17px] font-extrabold tracking-tight ${theme.text}`}>
                  LEADcap
                </div>
                <div className={`mt-1 text-[10px] tracking-wide ${theme.textMuted} hidden sm:block truncate`}>
                  Lead Exposure & Detection Capacity Platform
                </div>
              </div>
            </div>

            {/* User controls */}
            <div className="flex items-center gap-2">
              <div
                className={`hidden md:flex items-center gap-3 rounded-xl border ${theme.border} px-3 py-1.5`}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  {currentUser?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0 leading-tight">
                  <p className={`text-xs font-semibold truncate max-w-[170px] ${theme.text}`}>
                    {currentUser?.fullName || "User"}
                  </p>
                  <p className={`text-[10px] uppercase tracking-wide ${theme.textMuted}`}>
                    {currentUser?.role?.replace(/[\s_.]/g, " ") || "USER"}
                  </p>
                </div>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={() => navigate("/invitecodes")}
                  className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm"
                  title="Invite Codes"
                  aria-label="Invite Codes"
                >
                  <ShieldCheck className="w-[18px] h-[18px]" />
                </button>
              )}

              <button
                onClick={toggleDarkMode}
                className={`w-9 h-9 rounded-xl border ${theme.border} ${theme.hover} ${theme.text} flex items-center justify-center transition-colors`}
                title="Toggle theme"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-[18px] h-[18px]" />
                ) : (
                  <Moon className="w-[18px] h-[18px]" />
                )}
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`w-9 h-9 rounded-xl border ${theme.border} ${theme.hover} ${theme.text} flex items-center justify-center transition-colors`}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden w-9 h-9 rounded-xl border ${theme.border} ${theme.hover} ${theme.text} flex items-center justify-center transition-colors`}
                title={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-[18px] h-[18px]" />
                ) : (
                  <Menu className="w-[18px] h-[18px]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
