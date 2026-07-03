/**
 * index.js — data-collector module barrel
 * ─────────────────────────────────────────
 * The router and Layout import from here only.
 * Internal module structure can change without touching any external files.
 *
 * Usage in router:
 *   import { DataCollectorDashboard, DataCollectorWelcome } from "../modules/data-collector";
 *
 * Usage for hooks (e.g. in a future shared stats widget):
 *   import { useCollectorStats } from "../modules/data-collector";
 */

// ── Pages (used by router) ───────────────────────────────────────────────────
export { default as DataCollectorDashboard } from "./pages/DataCollectorDashboard";
export { default as DataCollectorWelcome } from "./pages/DataCollectorWelcome";

// ── Hooks (available if needed outside the module) ───────────────────────────
export { useCollectorSamples } from "./hooks/useCollectorSamples";
export { useCollectorStats } from "./hooks/useCollectorStats";
export { useSupervisor } from "./hooks/useSupervisor";