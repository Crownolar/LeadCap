import Dashboard from "./components/views/Dashboard";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./Route/PrivateRoute";
import Layout from "./Route/Layout";
import AuthModal from "./components/auth/AuthModal";
import InviteCodeGenerate from "./pages/InviteCodeGenerate";
// import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleLogout } from "./redux/slice/authSlice";
import MapView from "./components/views/MapView";
import Reports from "./components/views/Reports";
import Database from "./components/views/Database";
// import { fetchSamples } from "./redux/slice/samplesSlice";
import PolicyWelcome from "./pages/PolicyWelcome";
import HeavyMetalFormModalNew from "./components/modals/lab-result_modal/HeavyMetalFormModalNew";
import DataCollectorDashboard from "./pages/DataCollectorDashboard";
import DataCollectorWelcome from "./pages/DataCollectorWelcome";
import ThresholdManagement from "./components/views/ThresholdManagement";
import InviteCodeManagement from "./components/views/InviteCodeManagement";
import SupervisorDashboard from "./components/views/SupervisorDashboard";
import CollectorManagement from "./components/views/CollectorManagement";
import SampleReview from "./components/views/SampleReview";
import LabAnalystDashboard from "./components/views/LabAnalystDashboard";
import LabConfirmationForm from "./components/views/LabConfirmationForm";
import { EnumsProvider } from "./context/EnumsContext";
import { Toaster } from "react-hot-toast";
import LabWorkloadAnalytics from "./components/views/LabWorkloadAnalytics";
import { useState } from "react";
import UsersGovernance from "./modules/nafdac/pages/UsersGovernance";
import RiskIntelligence from "./modules/nafdac/pages/RiskIntelligence";
import VerificationLogs from "./modules/nafdac/pages/VerificationLogs";
import ProductSearch from "./modules/nafdac/pages/ProductSearch";
import RegistryHistory from "./modules/nafdac/pages/RegistryHistory";
import RegistryUpload from "./modules/nafdac/pages/RegistryUpload";

const lightTheme = {
  bg: "bg-gray-100",
  text: "text-gray-900",
  textMuted: "text-gray-500",
  card: "bg-white",
  border: "border-gray-200",
  input: "bg-white text-gray-900 border-gray-300",
  hover: "hover:bg-gray-200",
};

const darkTheme = {
  bg: "bg-gray-900",
  text: "text-white",
  textMuted: "text-gray-400",
  card: "bg-gray-800",
  border: "border-gray-700",
  input: "bg-gray-700 text-white border-gray-600",
  hover: "hover:bg-gray-700",
};

const App = () => {
  const dispatch = useDispatch();

  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const theme = darkMode ? darkTheme : lightTheme;

  const logout = () => dispatch(handleLogout());

  return (
    <EnumsProvider isAuthenticated={isAuthenticated}>
      <div>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthModal theme={theme} />} />{" "}
          <Route path="/policy-welcome" element={<PolicyWelcome />} />
          <Route
            path="/data-collector-welcome"
            element={
              <PrivateRoute allowedRoles={["datacollector"]}>
                <DataCollectorWelcome />
              </PrivateRoute>
            }
          />
          <Route
            element={
              <Layout
                theme={theme}
                currentUser={currentUser}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                handleLogout={logout}
              />
            }
          >
            <Route
              path="/dashboard"
              element={
                <PrivateRoute
                  isAuthenticated={isAuthenticated}
                  allowedRoles={[
                    "superadmin",
                    "supervisor",
                    "headresearcher",
                    "policymakerson",
                    "policymakernafdac",
                    "policymakerresolve",
                    "policymakeruniversity",
                    "labanalyst",
                  ]}
                >
                  {currentUser?.role?.toLowerCase() === "supervisor" ? (
                    <SupervisorDashboard theme={theme} />
                  ) : (
                    <Dashboard theme={theme} />
                  )}
                </PrivateRoute>
              }
            />

            <Route
              path="/data-collector"
              element={
                <PrivateRoute allowedRoles={["datacollector"]}>
                  <DataCollectorDashboard theme={theme} />
                </PrivateRoute>
              }
            />

            <Route
              path="/heavy-metal"
              element={
                <PrivateRoute allowedRoles={["datacollector"]}>
                  <HeavyMetalFormModalNew />
                </PrivateRoute>
              }
            />
            <Route
              path="database"
              element={
                <PrivateRoute
                  allowedRoles={["superadmin", "headresearcher", "supervisor"]}
                >
                  <Database theme={theme} />
                </PrivateRoute>
              }
            />

            <Route
              path="reports"
              element={
                <PrivateRoute allowedRoles={["superadmin", "headresearcher"]}>
                  <Reports theme={theme} />
                </PrivateRoute>
              }
            />

            <Route
              path="map"
              element={
                <PrivateRoute
                  allowedRoles={[
                    "superadmin",
                    "headresearcher",
                    "supervisor",
                    "datacollector",
                    "policymakerson",
                    "policymakernafdac",
                    "policymakerresolve",
                    "policymakeruniversity",
                  ]}
                >
                  <MapView theme={theme} />
                </PrivateRoute>
              }
            />

            <Route
              path="thresholds"
              element={
                <PrivateRoute allowedRoles={["superadmin"]}>
                  <ThresholdManagement theme={theme} darkMode={darkMode} />
                </PrivateRoute>
              }
            />

            <Route
              path="invitecodes"
              element={
                <PrivateRoute allowedRoles={["superadmin"]}>
                  <InviteCodeGenerate theme={theme} darkMode={darkMode} />
                </PrivateRoute>
              }
            />

            <Route
              path="invites"
              element={
                <PrivateRoute allowedRoles={["superadmin"]}>
                  <InviteCodeManagement theme={theme} darkMode={darkMode} />
                </PrivateRoute>
              }
            />

            <Route
              path="collectors"
              element={
                <PrivateRoute allowedRoles={["supervisor"]}>
                  <CollectorManagement theme={theme} darkMode={darkMode} />
                </PrivateRoute>
              }
            />

            <Route
              path="sample-review"
              element={
                <PrivateRoute allowedRoles={["supervisor"]}>
                  <SampleReview theme={theme} darkMode={darkMode} />
                </PrivateRoute>
              }
            />

            <Route
              path="lab-samples"
              element={
                <PrivateRoute allowedRoles={["labanalyst"]}>
                  <LabAnalystDashboard theme={theme} darkMode={darkMode} />
                </PrivateRoute>
              }
            />
            <Route
              path="lab-recording"
              element={
                <PrivateRoute allowedRoles={["labanalyst"]}>
                  <LabWorkloadAnalytics theme={theme} darkMode={darkMode} />
                </PrivateRoute>
              }
            />

            <Route
              path="record-reading/:sampleId"
              element={
                <PrivateRoute allowedRoles={["labanalyst"]}>
                  <LabConfirmationForm theme={theme} darkMode={darkMode} />
                </PrivateRoute>
              }
            />

            <Route
              path="nafdac-upload"
              element={
                <PrivateRoute allowedRoles={["policymakernafdac"]}>
                  <RegistryUpload theme={theme} />
                </PrivateRoute>
              }
            />

            <Route
              path="nafdac-history"
              element={
                <PrivateRoute allowedRoles={["policymakernafdac"]}>
                  <RegistryHistory theme={theme} />
                </PrivateRoute>
              }
            />

            <Route
              path="nafdac-products"
              element={
                <PrivateRoute
                  allowedRoles={[
                    "policymakernafdac",
                    "labanalyst",
                    "headresearcher",
                  ]}
                >
                  <ProductSearch theme={theme} />
                </PrivateRoute>
              }
            />

            <Route
              path="nafdac-verifications"
              element={
                <PrivateRoute
                  allowedRoles={[
                    "policymakernafdac",
                    "supervisor",
                    "headresearcher",
                  ]}
                >
                  <VerificationLogs theme={theme} />
                </PrivateRoute>
              }
            />

            <Route
              path="nafdac-risk"
              element={
                <PrivateRoute
                  allowedRoles={["policymakernafdac", "policymakerson"]}
                >
                  <RiskIntelligence theme={theme} />
                </PrivateRoute>
              }
            />

            <Route
              path="nafdac-users"
              element={
                <PrivateRoute
                  allowedRoles={["superadmin", "policymakernafdac"]}
                >
                  <UsersGovernance theme={theme} />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </div>
    </EnumsProvider>
  );
};

export default App;
