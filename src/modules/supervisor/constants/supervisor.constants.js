/**
 * supervisor.constants.js
 * ────────────────────────
 * Static configuration for the Supervisor module.
 */

// ─── Review statuses ────────────────────────────────────────────────────────

export const REVIEW_STATUSES = {
  PENDING_REVIEW: "PENDING_REVIEW",
  APPROVED_FOR_XRF: "APPROVED_FOR_XRF",
  XRF_IN_PROGRESS: "XRF_IN_PROGRESS",
  XRF_COMPLETED: "XRF_COMPLETED",
  APPROVED_FOR_AAS: "APPROVED_FOR_AAS",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  FLAGGED: "FLAGGED",
};


// ─── Review tabs ────────────────────────────────────────────────────────────

export const STATUS_TABS = [
  "PENDING_REVIEW",
  "APPROVED_FOR_XRF",
  "XRF_COMPLETED",
  "APPROVED_FOR_AAS",
  "COMPLETED",
  "REJECTED",
  "FLAGGED",
];

export const STATUS_TAB_META = {
  PENDING_REVIEW: {
    label: "Pending",
    sub: "Awaiting review",
  },

  APPROVED_FOR_XRF: {
    label: "XRF Queue",
    sub: "Ready for screening",
  },

  XRF_COMPLETED: {
    label: "XRF Complete",
    sub: "Screening completed",
  },

  APPROVED_FOR_AAS: {
    label: "AAS Queue",
    sub: "Requires lab confirmation",
  },

  COMPLETED: {
    label: "Completed",
    sub: "Review completed",
  },

  REJECTED: {
    label: "Rejected",
    sub: "Returned samples",
  },

  FLAGGED: {
    label: "Flagged",
    sub: "Needs attention",
  },
};


// ─── Review actions ─────────────────────────────────────────────────────────

export const REVIEW_ACTIONS = {
  APPROVED_FOR_XRF: "APPROVED_FOR_XRF",
  APPROVED_FOR_AAS: "APPROVED_FOR_AAS",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  FLAGGED: "FLAGGED",
};


// ─── Issue checklist ────────────────────────────────────────────────────────

export const ISSUE_OPTIONS = [
  "Incomplete GPS location",
  "Missing product photo",
  "Invalid batch number",
  "Incorrect vendor type",
  "Suspicious pricing",
  "Poor data quality",
  "Missing heavy metal readings",
  "Other",
];


// ─── Heavy metals ───────────────────────────────────────────────────────────

export const HEAVY_METALS = [
  "LEAD",
  "CADMIUM",
  "CHROMIUM",
  "NICKEL",
  "ARSENIC",
  "MERCURY",
];


// ─── Chart colours ──────────────────────────────────────────────────────────

export const REVIEW_CHART_COLORS = [
  "#f59e0b",
  "#10b981",
  "#0ea5e9",
  "#8b5cf6",
  "#64748b",
  "#ef4444",
  "#d97706",
];


// ─── Pagination ─────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 25;

// ── Heavy metals ──────────────────────────────────────────────────────────────
