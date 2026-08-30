/**
 * index.js — lab-analyst module barrel
 * ───────────────────────────────────────
 * The router imports from here only.
 * Internal module structure can change without touching App.jsx.
 *
 * Usage in router:
 *   import {
 *     LabAnalystDashboard,
 *     LabConfirmationForm,
 *     LabWorkloadAnalytics,
 *   } from "../modules/lab-analyst";
 */

// ── Pages (used by router) ───────────────────────────────────────────────────
export { default as LabAnalystDashboard } from "./pages/LabAnalystDashboard";
export { default as LabConfirmationForm } from "./pages/LabConfirmationForm";
export { default as LabWorkloadAnalytics } from "./pages/LabWorkloadAnalytics";

// ── Hooks (available if needed outside the module) ───────────────────────────
export { useLabWorkload } from "./hooks/useLabWorkload";
export { useSamplesRequiringConfirmation } from "./hooks/useSamplesRequiringConfirmation";
export { useLabConfirmationForm } from "./hooks/useLabConfirmationForm";
export { useLabRecordings } from "./hooks/useLabRecordings";