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
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
          }}
        />

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
            path="/auth"
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
              path="/dashboard"
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
              path="/data-collector"
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
              path="/heavy-metal"
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
              path="/database"
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
              path="/reports"
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
              path="/research"
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
              path="/thresholds"
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
              path="/invitecodes"
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
              path="/invites"
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
              path="/collectors"
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
              path="/sample-review/:collectorId"
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
              path="/sample-review"
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
              path="/lab-recording"
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
              path="/record-reading/:sampleId"
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
              path="/nafdac-history"
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
              path="/nafdac-products"
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
              path="/nafdac-verifications"
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
              path="/nafdac-risk"
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
              path="/moh/samples"
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
        </Routes>
        </Suspense>
      </div>
    </EnumsProvider>
  );
};

export default App;