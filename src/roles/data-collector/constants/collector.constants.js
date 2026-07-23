// ── Filter select options ────────────────────────────────────────────────────

export const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending results" },
  { value: "completed", label: "With results" },
];

// ── Stat strip config ────────────────────────────────────────────────────────
// Used by CollectorStats to render the three big KPI cards.
// `key` maps to the /samples/stats API response shape.

export const STAT_CARDS = [
  {
    key: "total",
    label: "Total",
    sub: "All-time",
    accent: "bg-blue-500",
  },
  {
    key: "pendingResults",
    label: "Pending",
    sub: "No readings",
    accent: "bg-amber-500",
  },
  {
    key: "withResults",
    label: "Complete",
    sub: "Logged",
    accent: "bg-emerald-500",
  },
];

// ── Page-count pill labels ───────────────────────────────────────────────────
// The three small pills below the KPI strip.

export const PAGE_COUNT_LABELS = [
  { key: "total", label: "On page" },
  { key: "withReadings", label: "With results" },
  { key: "withoutReadings", label: "No results" },
];

// ── Reading status badge config ──────────────────────────────────────────────

export const READING_STATUS = {
  HAS_READINGS: {
    colorClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  NO_READINGS: {
    colorClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    dot: "bg-amber-500",
  },
};

// ── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;

// ── Select element class builder ─────────────────────────────────────────────
// Returns the className string for a <select> given the current theme tokens.
// Keeps all select elements visually consistent across the module.

export const buildSelectCls = (theme) =>
  `appearance-none w-full h-10 pl-3.5 pr-8 rounded-xl border ${theme?.border} ${theme?.card} ${theme?.text} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition cursor-pointer`;
