import { useAuth } from "../hooks/useAuth";
import { useSamples } from "../hooks/useSamples";
import { useTheme } from "../hooks/useTheme";
<<<<<<< HEAD
import SampleFormModal from "../components/modals/SampleFormModal";
import SampleDetailModal from "../components/modals/SampleDetailModal";
import { useRef, useState, useMemo } from "react";
import { Navigate } from "react-router";
import { useSelector } from "react-redux";
=======
import AuthModal from "../components/auth/AuthModal";
import Dashboard from "../components/views/Dashboard";
import Database from "../components/views/DatabaseView";
import Reports from "../components/views/Reports";
import SampleFormModal from "../components/modals/SampleFormModal";
import SampleDetailModal from "../components/modals/SampleDetailModal";
import { lazy, Suspense, useRef, useState, useMemo } from "react";
const MapView = lazy(() => import("../components/views/MapView"));
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f

const Home = () => {
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);

  const { theme } = useTheme();
  const { filteredSamples, addSample } = useSamples(currentUser);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const excelImportRef = useRef(null);

  // Calculate analytics from samples
  const analytics = useMemo(() => {
    const total = filteredSamples?.length || 0;
    const safe =
      filteredSamples?.filter((s) => s.status === "safe").length || 0;
    const contaminated =
      filteredSamples?.filter((s) => s.status === "contaminated").length || 0;
    const pending =
      filteredSamples?.filter((s) => s.status === "pending").length || 0;

    return {
      total,
      safe,
      contaminated,
      pending,
      complianceRate: total > 0 ? ((safe / total) * 100).toFixed(1) : 0,
    };
  }, [filteredSamples]);

  const handleFormSubmit = (formData) => addSample(formData);

  if (!isAuthenticated) {
    return <Navigate to='auth' replace />;
  }

  return (
    <>
<<<<<<< HEAD
      {currentView === "dashboard" && <Navigate to='dashboard' />}
      {currentView === "database" && <Navigate to='database' />}
      {currentView === "map" && <Navigate to='map' />}
      {currentView === "reports" && <Navigate to='reports' />}
=======
      {currentView === "dashboard" && (
        <Dashboard samples={filteredSamples} loading={loading} theme={theme} />
      )}
      {currentView === "database" && (
        <Database
          theme={theme}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterState={filterState}
          setFilterState={setFilterState}
          filterProduct={filterProduct}
          setFilterProduct={setFilterProduct}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filteredSamples={filteredSamples}
          setSelectedSample={setSelectedSample}
          states={states}
        />
      )}
      {currentView === "map" && (
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[300px]">
              Loading map...
            </div>
          }
        >
          <MapView theme={theme} samples={filteredSamples} />
        </Suspense>
      )}
      {currentView === "reports" && (
        <Reports theme={theme} samples={filteredSamples} />
      )}
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
      {showForm && (
        <SampleFormModal
          theme={theme}
          onClose={() => setShowForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
      {selectedSample && (
        <SampleDetailModal
          theme={theme}
          sample={selectedSample}
          onClose={() => setSelectedSample(null)}
        />
      )}
    </>
  );
};

export default Home;
