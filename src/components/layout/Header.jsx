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
    currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "SYSTEM_ADMIN";

  const handleAdminAccess = () => {
    navigate("/invitecodes");
  };

  return (
    <>
      <LogoutConfirmModal
        show={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        theme={theme}
      />

      <header
        className={`${theme.card} border-b ${theme.border} shadow-sm sticky top-0 z-[3000] transition-colors duration-300`}
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-emerald-500 p-2 rounded-lg flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>

              <div className="min-w-0">
                <h1 className={`text-xl font-bold ${theme.text}`}>LEADcap</h1>
                <p className={`text-xs ${theme.textMuted} hidden sm:block truncate`}>
                  Lead Exposure & Detection Capacity Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border ${theme.card} ${theme.border}`}
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentUser?.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className={`font-medium ${theme.text}`}>
                    {currentUser?.fullName}
                  </p>
                  <p className={`text-xs ${theme.textMuted}`}>
                    {currentUser?.role?.replace(/[\s_.]/g, " ")}
                  </p>
                </div>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={handleAdminAccess}
                  className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md text-white"
                  title="Invite Codes"
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${theme.hover} ${theme.text} transition-colors`}
                title="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`p-2 rounded-lg ${theme.hover} ${theme.text}`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg ${theme.hover} ${theme.text}`}
                title={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
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