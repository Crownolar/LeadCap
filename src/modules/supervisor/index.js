/**
 * index.js — supervisor module barrel
 * ─────────────────────────────────────
 * The router and Layout import from here only.
 * Internal module structure can change without touching any external files.
 *
 * Usage in router:
 *   import {
 *     SupervisorDashboard,
 *     CollectorManagement,
 *     SampleReview,
 *     CollectorPickerModal,
 *   } from "../modules/supervisor";
 */

// ── Pages (used by router) ───────────────────────────────────────────────────
export { default as SupervisorDashboard } from "./pages/SupervisorDashboard";
export { default as CollectorManagement } from "./pages/CollectorManagement";
export { default as SampleReview } from "./pages/SampleReview";

// ── Module-level component (used by Sidebar / Layout for nav interception) ──
export { default as CollectorPickerModal } from "./components/CollectorPickerModal";

// ── Hooks (available if needed outside the module) ───────────────────────────
export { useSupervisorDashboard } from "./hooks/useSupervisorDashboard";
export { useSupervisorScope } from "./hooks/useSupervisorScope";
export { useCollectorManagement } from "./hooks/useCollectorManagement";
export { useSampleReview } from "./hooks/useSampleReview";