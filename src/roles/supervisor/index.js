//   example import
//     import {
//       SupervisorDashboard,
//       CollectorManagement,
//       SampleReview,
//       CollectorPickerModal,
//     } from "../modules/supervisor";

// ── Pages (used by router) ───────────────────────────────────────────────────
export { default as SupervisorDashboard } from "./pages/SupervisorDashboard";
export { default as CollectorManagement } from "./pages/CollectorManagement";
export { default as SampleReview } from "./pages/SampleReview";

// ── Module-level component (used by Sidebar / Layout for nav interception) ──
export { default as CollectorPickerModal } from "./components/CollectorPickerModal";

// ── Hooks (available if needed outside the module) ───────────────────────────
export { useSupervisorDashboard } from "./hooks/useSupervisorDashboard";
export { useCollectorManagement } from "./hooks/useCollectorManagement";
export { useSampleReview } from "./hooks/useSampleReview";
