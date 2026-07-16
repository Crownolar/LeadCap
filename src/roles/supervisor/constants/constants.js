// ── Review status tabs ───────────────────────────────────────────────────────

export const STATUS_TABS = [
  "PENDING",
  "APPROVED FOR XRF",
  "XRF COMPLETED",
  "APPROVED FOR AAS",
  "AAS COMPLETED",
  "COMPLETED",
  "REJECTED",
  "FLAGGED",
];

export const STATUS_TAB_META = {
  PENDING: { sub: "Awaiting action" },
  "APPROVED FOR XRF": {
    sub: "Sample approved for XRF testing",
  },
  "XRF COMPLETED": {
    sub: "XRF testing has been completed",
  },
  "APPROVED FOR AAS": {
    sub: "Sample approved for AAS testing",
  },
  "AAS COMPLETED": {
    sub: "AAS testing has been completed",
  },
  COMPLETED: { sub: "Completed items" },
  REJECTED: { sub: "Returned items" },
  FLAGGED: { sub: "Needs attention" },
};

// ── Review decision options ──────────────────────────────────────────────────

export const REVIEW_DECISIONS = [
  "APPROVED_FOR_XRF",
  "APPROVED_FOR_AAS",
  "REJECTED",
  "FLAGGED",
  "COMPLETED",
];

// ── Issue checklist options (sample review form) ─────────────────────────────

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

// ── Pie chart colours (review distribution) ──────────────────────────────────

export const REVIEW_CHART_COLORS = ["#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

// ── Bulk actions that are allowed ────────────────────────────────────────────
// Rejection is excluded from bulk — requires individual comments.

export const BULK_ALLOWED_STATUSES = ["APPROVED", "FLAGGED"];

// ── Default pagination ────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 25;
