<<<<<<< HEAD
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./Route/PrivateRoute";
import Layout from "./Route/Layout";
import AuthModal from "./components/auth/AuthModal";
import InviteCodeGenerate from "./pages/InviteCodeGenerate";
import { useSelector, useDispatch } from "react-redux";
import { handleLogout } from "./redux/slice/authSlice";
import MapView from "./components/views/MapView";
import Reports from "./components/other/Reports";
import Database from "./pages/Database";
import PolicyWelcome from "./pages/PolicyWelcome";
import HeavyMetalFormModalNew from "./components/modals/lab-result_modal/HeavyMetalFormModalNew";
import {
  DataCollectorDashboard,
  DataCollectorWelcome,
} from "./roles/data-collector";
import ThresholdManagement from "./components/other/ThresholdManagement";
import InviteCodeManagement from "./components/other/InviteCodeManagement";
import {
  SupervisorDashboard,
  CollectorManagement,
  SampleReview,
} from "./roles/supervisor";
import {
  LabAnalystDashboard,
  LabConfirmationForm,
  LabWorkloadAnalytics,
} from "./roles/lab-analyst";
import { EnumsProvider } from "./context/EnumsContext";
import { Toaster } from "react-hot-toast";
import UsersGovernance from "./roles/nafdac/pages/UsersGovernance";
import RiskIntelligence from "./roles/nafdac/pages/RiskIntelligence";
import VerificationLogs from "./roles/nafdac/pages/VerificationLogs";
import ProductSearch from "./roles/nafdac/pages/ProductSearch";
import RegistryHistory from "./roles/nafdac/pages/RegistryHistory";
import RegistryUpload from "./roles/nafdac/pages/RegistryUpload";
import MohDashboard from "./roles/moh/pages/dashboard/MohDashboard";
import MohSamples from "./roles/moh/pages/MohSamples";
import MohReports from "./roles/moh/pages/reports/MohReports";
import MohVerification from "./roles/moh/pages/MohVerification";
import MohContamination from "./roles/moh/pages/MohContamination";
import { useTheme } from "./context/ThemeContext";
import { PolicyDashboard } from "./roles/son";
import { NafdacDashboard } from "./roles/nafdac";
import NotFound from "./pages/NotFound";
=======
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import PrivateRoute from "./Route/PrivateRoute";
import Layout from "./Route/Layout";
import AuthModal from "./components/auth/AuthModal";

const Dashboard = lazy(() => import("./components/views/Dashboard"));
const InviteCodeGenerate = lazy(() => import("./pages/InviteCodeGenerate"));
const MapView = lazy(() => import("./components/views/MapView"));
const Reports = lazy(() => import("./components/views/Reports"));
const Database = lazy(() => import("./pages/Database"));
const PolicyWelcome = lazy(() => import("./pages/PolicyWelcome"));

const HeavyMetalFormModalNew = lazy(
  () => import("./components/modals/lab-result_modal/HeavyMetalFormModalNew")
);

const ThresholdManagement = lazy(
  () => import("./components/views/ThresholdManagement")
);

const InviteCodeManagement = lazy(
  () => import("./components/views/InviteCodeManagement")
);

const DataCollectorDashboard = lazy(() =>
  import("./modules/data-collector/pages/DataCollectorDashboard")
);

const DataCollectorWelcome = lazy(() =>
  import("./modules/data-collector/pages/DataCollectorWelcome")
);

const SupervisorDashboard = lazy(() =>
  import("./modules/supervisor/pages/SupervisorDashboard")
);

const CollectorManagement = lazy(() =>
  import("./modules/supervisor/pages/CollectorManagement")
);

const SampleReview = lazy(() =>
  import("./modules/supervisor/pages/SampleReview")
);

const LabAnalystDashboard = lazy(() =>
  import("./modules/lab-analyst/pages/LabAnalystDashboard")
);

const LabConfirmationForm = lazy(() =>
  import("./modules/lab-analyst/pages/LabConfirmationForm")
);

const LabWorkloadAnalytics = lazy(() =>
  import("./modules/lab-analyst/pages/LabWorkloadAnalytics")
);

const RiskIntelligence = lazy(
  () => import("./modules/nafdac/pages/RiskIntelligence")
);

const VerificationLogs = lazy(
  () => import("./modules/nafdac/pages/VerificationLogs")
);

const ProductSearch = lazy(
  () => import("./modules/nafdac/pages/ProductSearch")
);

const RegistryHistory = lazy(
  () => import("./modules/nafdac/pages/RegistryHistory")
);

const RegistryUpload = lazy(
  () => import("./modules/nafdac/pages/RegistryUpload")
);

const MohDashboard = lazy(
  () => import("./modules/modulesMoh/pages/dashboard/MohDashboard")
);

const MohSamples = lazy(
  () => import("./modules/modulesMoh/pages/MohSamples")
);

const MohReports = lazy(
  () => import("./modules/modulesMoh/pages/reports/MohReports")
);

const MohVerification = lazy(
  () => import("./modules/modulesMoh/pages/MohVerification")
);

const MohContamination = lazy(
  () => import("./modules/modulesMoh/pages/MohContamination")
);

import { EnumsProvider } from "./context/EnumsContext";
import { Toaster } from "react-hot-toast";
import { useTheme } from "./context/ThemeContext";

const PolicyDashboard = lazy(
  () =>
    import("./modules/son").then((module) => ({
      default: module.PolicyDashboard,
    }))
);

const NafdacDashboard = lazy(
  () =>
    import("./modules/nafdac").then((module) => ({
      default: module.NafdacDashboard,
    }))
);

const HeadResearcherDashboard = lazy(
  () => import("./modules/shared/pages/HeadResearcherDashboard")
);

const ResearchModelingDashboard = lazy(
  () => import("./modules/university/pages/ResearchModelingDashboard")
);

import {
  ROLES,
  ROUTE_PERMISSIONS,
  getCanonicalRole,
} from "./config/permissions";
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f

const App = () => {
  const dispatch = useDispatch();

  const {
    currentUser,
    isAuthenticated,
  } = useSelector((state) => state.auth);

  const { theme } = useTheme();

  const logout = () => {
    // The actual logout implementation remains in Layout/Header.
    // This function is retained for compatibility with the existing layout API.
    dispatch({ type: "auth/logout" });
  };

  const canonicalRole = getCanonicalRole(
    currentUser?.role,
  );

  /**
   * Decide where an authenticated user should land.
   *
   * This is navigation convenience, NOT authorization.
   * Authorization is handled by PrivateRoute.
   */
  const getAuthenticatedHome = () => {
    switch (canonicalRole) {
      case ROLES.DATA_COLLECTOR:
        return "/data-collector-welcome";

      case ROLES.SUPERVISOR:
        return "/collectors";

      case ROLES.LAB_ANALYST:
        return "/lab-samples";

      case ROLES.FMOH:
        return "/moh/dashboard";

      case ROLES.NAFDAC:
        return "/dashboard";

      case ROLES.UNIVERSITY:
        return "/research";

      case ROLES.SON:
      case ROLES.RTSL:
        return "/dashboard";

      case ROLES.HEAD_RESEARCHER:
        return "/dashboard";

      case ROLES.SUPERADMIN:
      default:
        return "/dashboard";
    }
  };

  return (
    <EnumsProvider isAuthenticated={isAuthenticated}>
      <div>
<<<<<<< HEAD
        <Toaster position='top-center' toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/auth' element={<AuthModal theme={theme} />} />
          <Route path='/policy-welcome' element={<PolicyWelcome />} />
=======
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
          }}
        />
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f

        <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          Loading...
        </div>
      }
    >

        <Routes>
          {/* ================================================================== */}
          {/* PUBLIC                                                             */}
          {/* ================================================================== */}

          {/*
            /auth is the ONLY public application route.

            It contains BOTH:
              - Login
              - Sign Up

            Unauthenticated users must not reach any other application page.
          */}
          <Route
<<<<<<< HEAD
            path='/data-collector-welcome'
=======
            path="/auth"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
            element={
              isAuthenticated && currentUser ? (
                <Navigate
                  to={getAuthenticatedHome()}
                  replace
                />
              ) : (
                <AuthModal theme={theme} />
              )
            }
          />
<<<<<<< HEAD
=======

          {/* ================================================================== */}
          {/* AUTHENTICATED APPLICATION                                          */}
          {/* ================================================================== */}

          {/*
            IMPORTANT:

            The authentication guard wraps Layout itself.

            This prevents Header, Sidebar, role data loading and other
            authenticated application infrastructure from mounting for
            unauthenticated users.
          */}
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* ---------------------------------------------------------------- */}
            {/* Root                                                             */}
            {/* ---------------------------------------------------------------- */}

            <Route
              path="/"
              element={
                <Navigate
                  to={getAuthenticatedHome()}
                  replace
                />
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* General Dashboard                                                */}
            {/* ---------------------------------------------------------------- */}

            <Route
              path='/dashboard'
              element={
                <PrivateRoute
                  allowedRoles={ROUTE_PERMISSIONS.dashboard}
                >
                  {canonicalRole === ROLES.SUPERVISOR ? (
                    <SupervisorDashboard />
                  ) : canonicalRole === ROLES.HEAD_RESEARCHER ? (
                    <HeadResearcherDashboard />
                  ) : canonicalRole === ROLES.NAFDAC ? (
                    <NafdacDashboard />
                  ) : canonicalRole === ROLES.UNIVERSITY ? (
                    <ResearchModelingDashboard />
                  ) : [
                      ROLES.SON,
                      ROLES.RTSL,
                    ].includes(canonicalRole) ? (
                    <PolicyDashboard />
                  ) : (
                    <Dashboard theme={theme} />
                  )}
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* Data Collector                                                   */}
            {/* ---------------------------------------------------------------- */}

            <Route
              path="/data-collector-welcome"
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.dataCollector
                  }
                >
                  <DataCollectorWelcome />
                </PrivateRoute>
              }
            />

            <Route
              path='/data-collector'
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.dataCollector
                  }
                >
                  <DataCollectorDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path='/heavy-metal'
              element={
                <PrivateRoute
                  allowedRoles={[
                    ROLES.SUPERADMIN,
                    ROLES.DATA_COLLECTOR,
                  ]}
                >
                  <HeavyMetalFormModalNew />
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* Database                                                          */}
            {/* ---------------------------------------------------------------- */}

            <Route
<<<<<<< HEAD
              path='database'
=======
              path="/database"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.database
                  }
                >
                  <Database theme={theme} />
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* Reports                                                           */}
            {/* ---------------------------------------------------------------- */}

            <Route
<<<<<<< HEAD
              path='reports'
=======
              path="/reports"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.reports
                  }
                >
                  <Reports theme={theme} />
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* University Research & Modeling                                   */}
            {/* ---------------------------------------------------------------- */}

            <Route
<<<<<<< HEAD
              path='map'
=======
              path="/research"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={ROUTE_PERMISSIONS.research}
                >
                  <ResearchModelingDashboard />
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* Geographic Map                                                    */}
            {/* ---------------------------------------------------------------- */}

            <Route
              path="/map"
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.map
                  }
                >
                  <MapView theme={theme} />
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* Superadmin / Platform Management                                  */}
            {/* ---------------------------------------------------------------- */}

            <Route
<<<<<<< HEAD
              path='thresholds'
=======
              path="/thresholds"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.thresholds
                  }
                >
                  <ThresholdManagement
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            <Route
<<<<<<< HEAD
              path='invitecodes'
=======
              path="/invitecodes"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.inviteCodes
                  }
                >
                  <InviteCodeGenerate
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            <Route
<<<<<<< HEAD
              path='invites'
=======
              path="/invites"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.inviteCodes
                  }
                >
                  <InviteCodeManagement
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* Supervisor                                                        */}
            {/* ---------------------------------------------------------------- */}

            <Route
<<<<<<< HEAD
              path='collectors'
=======
              path="/collectors"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.collectorManagement
                  }
                >
                  <CollectorManagement />
                </PrivateRoute>
              }
            />

            <Route
<<<<<<< HEAD
              path='sample-review/:collectorId'
=======
              path="/sample-review/:collectorId"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.sampleReview
                  }
                >
                  <SampleReview />
                </PrivateRoute>
              }
            />

            <Route
<<<<<<< HEAD
              path='sample-review'
=======
              path="/sample-review"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.sampleReview
                  }
                >
                  <SampleReview
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* Laboratory                                                        */}
            {/* ---------------------------------------------------------------- */}

            <Route
              path="/lab-samples"
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.lab
                  }
                >
                  <LabAnalystDashboard
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            <Route
<<<<<<< HEAD
              path='lab-samples'
=======
              path="/lab-recording"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.lab
                  }
                >
                  <LabWorkloadAnalytics
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            <Route
<<<<<<< HEAD
              path='lab-recording'
=======
              path="/record-reading/:sampleId"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.lab
                  }
                >
                  <LabConfirmationForm
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* NAFDAC                                                            */}
            {/* ---------------------------------------------------------------- */}

            <Route
              path="/nafdac-upload"
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.nafdac
                  }
                >
                  <RegistryUpload
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            <Route
<<<<<<< HEAD
              path='record-reading/:sampleId'
=======
              path="/nafdac-history"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.nafdac
                  }
                >
                  <RegistryHistory
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            <Route
<<<<<<< HEAD
              path='nafdac-upload'
              element={
                <PrivateRoute allowedRoles={["policymakernafdac"]}>
                  <RegistryUpload theme={theme} />
                </PrivateRoute>
              }
            />

            <Route
              path='nafdac-history'
              element={
                <PrivateRoute allowedRoles={["policymakernafdac"]}>
                  <RegistryHistory theme={theme} />
                </PrivateRoute>
              }
            />

            <Route
              path='nafdac-products'
=======
              path="/nafdac-products"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={[
                    ROLES.NAFDAC,
                    ROLES.LAB_ANALYST,
                    ROLES.HEAD_RESEARCHER,
                  ]}
                >
                  <ProductSearch
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            <Route
<<<<<<< HEAD
              path='nafdac-verifications'
=======
              path="/nafdac-verifications"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={[
                    ROLES.NAFDAC,
                    ROLES.SUPERVISOR,
                    ROLES.HEAD_RESEARCHER,
                  ]}
                >
                  <VerificationLogs
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            <Route
<<<<<<< HEAD
              path='nafdac-risk'
=======
              path="/nafdac-risk"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={[
                    ROLES.NAFDAC,
                    ROLES.SON,
                  ]}
                >
                  <RiskIntelligence
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* Ministry of Health                                               */}
            {/* ---------------------------------------------------------------- */}

            <Route
              path="/moh/dashboard"
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.moh
                  }
                >
                  <MohDashboard
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            <Route
<<<<<<< HEAD
              path='nafdac-users'
=======
              path="/moh/samples"
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.moh
                  }
                >
                  <MohSamples
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

<<<<<<< HEAD
            <Route path='moh'>
              <Route
                path='dashboard'
                element={
                  <PrivateRoute
                    allowedRoles={["superadmin", "policymakerfmohsw"]}
                  >
                    <MohDashboard theme={theme} />
                  </PrivateRoute>
                }
              />
              <Route
                path='samples'
                element={
                  <PrivateRoute
                    allowedRoles={["superadmin", "policymakerfmohsw"]}
                  >
                    <MohSamples theme={theme} />
                  </PrivateRoute>
                }
              />
              <Route
                path='verification'
                element={
                  <PrivateRoute
                    allowedRoles={["superadmin", "policymakerfmohsw"]}
                  >
                    <MohVerification theme={theme} />
                  </PrivateRoute>
                }
              />
              <Route
                path='contamination'
                element={
                  <PrivateRoute
                    allowedRoles={["superadmin", "policymakerfmohsw"]}
                  >
                    <MohContamination theme={theme} />
                  </PrivateRoute>
                }
              />
              <Route
                path='reports'
                element={
                  <PrivateRoute
                    allowedRoles={["superadmin", "policymakerfmohsw"]}
                  >
                    <MohReports theme={theme} />
                  </PrivateRoute>
                }
              />
            </Route>
          </Route>
          <Route path='*' element={<NotFound />} />
=======
            <Route
              path="/moh/verification"
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.moh
                  }
                >
                  <MohVerification
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            <Route
              path="/moh/contamination"
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.moh
                  }
                >
                  <MohContamination
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            <Route
              path="/moh/reports"
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.moh
                  }
                >
                  <MohReports
                    theme={theme}
                  />
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* Policy Welcome                                                    */}
            {/* ---------------------------------------------------------------- */}

            <Route
              path="/policy-welcome"
              element={
                <PrivateRoute
                  allowedRoles={
                    ROUTE_PERMISSIONS.policy
                  }
                >
                  <PolicyWelcome />
                </PrivateRoute>
              }
            />

            {/* ---------------------------------------------------------------- */}
            {/* Unknown authenticated route                                       */}
            {/* ---------------------------------------------------------------- */}

            <Route
              path="*"
              element={
                <Navigate
                  to={getAuthenticatedHome()}
                  replace
                />
              }
            />
          </Route>

          {/* ------------------------------------------------------------------ */}
          {/* Unknown unauthenticated route                                      */}
          {/* ------------------------------------------------------------------ */}

          <Route
            path="*"
            element={<Navigate to="/auth" replace />}
          />
>>>>>>> 5154c95bb8a09c1bfa1c070f873e32370179438f
        </Routes>
        </Suspense>
      </div>
    </EnumsProvider>
  );
};

export default App;