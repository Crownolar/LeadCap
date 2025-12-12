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

const Header = ({
  theme,
  currentUser,
  darkMode,
  toggleDarkMode,
  handleLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
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
        className={`${theme?.card} shadow-sm border-b ${theme?.border} sticky top-0 z-40`}
      >
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${theme?.text}`}>LEADcap</h1>
                <p className={`text-xs ${theme?.textMuted}`}>
                  Lead Exposure & Detection Capacity Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg ${theme?.card} border ${theme?.border}`}
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentUser?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className={`font-medium ${theme?.text}`}>
                    {currentUser?.fullName}
                  </p>
                  <p className={`text-xs ${theme?.textMuted}`}>
                    {currentUser?.role}
                  </p>
                </div>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={handleAdminAccess}
                  className={`p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg text-white`}
                  title="invite-codes"
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${theme?.hover} transition-colors ${theme?.text}`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`p-2 rounded-lg ${theme?.hover} transition-colors ${theme?.text}`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg ${theme?.hover}`}
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
