import Dashboard from "./components/views/Dashboard";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./Route/PrivateRoute";
import Layout from "./Route/Layout";
import AuthModal from "./components/auth/AuthModal";
import InviteCodeGenerate from "./pages/InviteCodeGenerate";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { handleLogout } from "./redux/slice/authSlice";
import MapView from "./components/views/MapView";
import Agents from "./components/views/Agents";
import Reports from "./components/views/Reports";
import Database from "./components/views/Database";
import { fetchSamples } from "./redux/slice/samplesSlice";
import PolicyWelcome from "./pages/PolicyWelcome";
import HeavyMetalFormModal from "./components/modals/lab-result_modal/HeavyMetalFormModal";
import DataCollectorDashboard from "./components/views/DataCollectorDashboard";
import DataCollectorWelcome from "./pages/DataCollectorWelcome";

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

  useEffect(() => {
    dispatch(fetchSamples({ page: 1, limit: 5000 })); // fetch everything
  }, [dispatch]);

  return (
    <div>
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
          path="/data-collector"
          element={
            <PrivateRoute allowedRoles={["datacollector"]}>
              <DataCollectorDashboard
                currentUser={currentUser}
                theme={theme}
                darkMode={darkMode}
                handleLogout={logout}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/invitecodes"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <InviteCodeGenerate theme={theme} />
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
                ]}
              >
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/heavy-metal"
            element={
              <PrivateRoute>
                <HeavyMetalFormModal />
              </PrivateRoute>
            }
          />
          <Route
            path="database"
            element={
              <PrivateRoute>
                <Database />
              </PrivateRoute>
            }
          />

          <Route
            path="reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />

          <Route
            path="agents"
            element={
              <PrivateRoute>
                <Agents />
              </PrivateRoute>
            }
          />

          <Route
            path="map"
            element={
              <PrivateRoute>
                <MapView />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
