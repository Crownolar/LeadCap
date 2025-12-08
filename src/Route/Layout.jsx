// src/Route/Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { handleLogout } from "../redux/slice/authSlice";
import { useTheme } from "../hooks/useTheme";
import { useState } from "react";
import SampleFormModal from "../components/modals/SampleFormModal";
import HeavyMetalFormModal from "../components/modals/lab-result_modal/HeavyMetalFormModal";
import DataCollectorDashboard from "../components/views/DataCollectorDashboard";

const Layout = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { theme, darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showHeavyMetalModal, setShowHeavyMetalModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const logout = () => {
    dispatch(handleLogout());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg} ${theme.text}`}>
      <Header
        theme={theme}
        currentUser={currentUser}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        handleLogout={logout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex flex-1 ">
        <Sidebar
          theme={theme}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          darkMode={darkMode}
          currentView={currentView}
          setCurrentView={setCurrentView}
          setShowForm={setShowForm}
          setShowHeavyMetalModal={setShowHeavyMetalModal}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

        {showForm && (
          <SampleFormModal
            theme={theme}
            onClose={() => setShowForm(false)}
            onSubmit={(formData) => {
              console.log("Form submitted:", formData);
              setShowForm(false);
            }}
          />
        )}

        {showHeavyMetalModal && (
          <HeavyMetalFormModal
            theme={theme}
            onClose={() => setShowHeavyMetalModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
