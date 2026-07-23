import { useAuth } from "../hooks/useAuth";
import { useSamples } from "../hooks/useSamples";
import { useTheme } from "../hooks/useTheme";
import SampleFormModal from "../components/modals/SampleFormModal";
import SampleDetailModal from "../components/modals/SampleDetailModal";
import { useRef, useState, useMemo } from "react";
import { Navigate } from "react-router";
import { useSelector } from "react-redux";

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
      {currentView === "dashboard" && <Navigate to='dashboard' />}
      {currentView === "database" && <Navigate to='database' />}
      {currentView === "map" && <Navigate to='map' />}
      {currentView === "reports" && <Navigate to='reports' />}
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
