import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { useSelector, useDispatch } from "react-redux";
import { handleLogout } from "../redux/slice/authSlice";
import { useTheme } from "../context/ThemeContext";
import SampleFormModal from "../components/modals/SampleFormModal";
import { lazy, Suspense, useState  } from "react";
const HeavyMetalFormModalNew = lazy(
  () => import("../components/modals/lab-result_modal/HeavyMetalFormModalNew"),
);
import { createSample } from "../redux/slice/samplesSlice";
import useRoleDataLoader from "../hooks/useRoleDataLoader";
import { useSupervisor } from "../modules/data-collector/hooks/useSupervisor";

const Layout = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [showHeavyMetalModal, setShowHeavyMetalModal] = useState(false);

  // Data Collectors may create samples only after a Supervisor assigns them.
  // The hook is role-aware and remains inert for all other roles.
  const {
    supervisor,
    loading: loadingSupervisor,
    error: supervisorError,
    assignmentChecked,
    hasSupervisor,
    isDataCollector,
  } = useSupervisor();

  const canCreateSample = !isDataCollector || hasSupervisor;

  const logout = () => {
    dispatch(handleLogout());
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
  };

  const handleFormSubmit = async (formData) => {
    if (isDataCollector && !hasSupervisor) {
      const message = supervisorError
        ? "Your supervisor assignment could not be verified. Please try again later."
        : "You must be assigned to a Supervisor before creating a sample.";

      throw new Error(message);
    }

    try {
      await dispatch(createSample(formData)).unwrap();
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create sample:", error);
      throw error;
    }
  };

  useRoleDataLoader(currentUser);

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <div className="flex min-h-screen flex-col">
        <Header
          currentUser={currentUser}
          handleLogout={logout}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <div className="flex flex-1 min-h-0 relative">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-1 min-h-0 gap-6">
            <Sidebar
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              currentView={currentView}
              setCurrentView={setCurrentView}
              setShowForm={setShowForm}
              setShowHeavyMetalModal={setShowHeavyMetalModal}
              supervisor={supervisor}
              loadingSupervisor={loadingSupervisor}
              supervisorError={supervisorError}
              assignmentChecked={assignmentChecked}
              canCreateSample={canCreateSample}
            />

            <main
              className={`
                flex-1 min-w-0 min-h-0 overflow-y-auto
                py-4 sm:py-6 lg:py-7
                transition-all duration-300
                ${theme.bg}
              `}
            >
              <div
                className={`
                  min-h-[calc(100vh-110px)] rounded-2xl
                  border shadow-sm
                  p-4 sm:p-5 lg:p-6
                  ${theme.card}
                  ${theme.border}
                `}
              >
                <Outlet />
              </div>
            </main>
          </div>

          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </div>

        {showForm && canCreateSample && (
          <SampleFormModal
            onClose={() => setShowForm(false)}
            onSubmit={handleFormSubmit}
            canCreateSample={canCreateSample}
            creationBlockedReason={
              supervisorError
                ? "Your supervisor assignment could not be verified."
                : "A Supervisor assignment is required before creating a sample."
            }
          />
        )}

        {showHeavyMetalModal && (
          <Suspense fallback={null}>
            <HeavyMetalFormModalNew
              theme={theme}
              onClose={() => setShowHeavyMetalModal(false)}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Layout;
