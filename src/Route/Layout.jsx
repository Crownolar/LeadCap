import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { handleLogout } from "../redux/slice/authSlice";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";
import SampleFormModal from "../components/modals/SampleFormModal";
import HeavyMetalFormModalNew from "../components/modals/lab-result_modal/HeavyMetalFormModalNew";
import { createSample } from "../redux/slice/samplesSlice";
// import api from "../utils/api";
import useRoleDataLoader from "../hooks/useRoleDataLoader";

const Layout = () => { 
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [showHeavyMetalModal, setShowHeavyMetalModal] = useState(false);

  const logout = () => {
    dispatch(handleLogout());
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  };

  const handleFormSubmit = async (formData) => {
    try {
      await dispatch(createSample(formData)).unwrap();
      // await api.post("/samples", formData);
      // // Refresh samples after successful creation
      // dispatch(fetchSamples());
      setShowForm(false);
      // Optional: Show success message
      // Toast or notification could go here
    } catch (error) {
      console.error("Failed to create sample:", error);
      throw error;
    }
  };

  useRoleDataLoader(currentUser);

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <Header
        currentUser={currentUser}
        handleLogout={logout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex flex-1">
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          currentView={currentView}
          setCurrentView={setCurrentView}
          setShowForm={setShowForm}
          setShowHeavyMetalModal={setShowHeavyMetalModal}
        />
        <main className={`flex-1 p-6 overflow-y-auto ${theme.bg}`}>
          <Outlet />
        </main>

        {showForm && (
          <SampleFormModal
            onClose={() => setShowForm(false)}
            onSubmit={handleFormSubmit}
          />
        )}

        {showHeavyMetalModal && (
          <HeavyMetalFormModalNew
            theme={theme}
            onClose={() => setShowHeavyMetalModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
