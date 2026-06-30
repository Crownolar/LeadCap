/**
 * labAnalyst.constants.js
 * ─────────────────────────
 * All static config for the Lab Analyst module.
 * Never hardcode these inline in components or pages.
 */

// ── Pagination ────────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;

// ── Heavy metal requiring AAS confirmation ───────────────────────────────────
// AAS is only enforced for Lead — other metals don't require lab confirmation.

export const AAS_REQUIRED_METAL = "LEAD";

// ── Export format ─────────────────────────────────────────────────────────────

export const EXPORT_FORMAT = "csv";

// ── Status badge color maps ───────────────────────────────────────────────────

export const FINAL_STATUS_COLORS = {
  SAFE: "bg-green-100 text-green-800",
  CONTAMINATED: "bg-red-100 text-red-800",
};

export const DEFAULT_STATUS_COLOR = "bg-red-100 text-red-800";