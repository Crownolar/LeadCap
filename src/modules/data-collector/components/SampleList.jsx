/**
 * SampleList.jsx
 * ───────────────
 * The main sample panel. Orchestrates:
 *   • Empty state (no samples / no filter matches)
 *   • Loading spinner
 *   • Error banner
 *   • Three responsive layout tiers:
 *       lg+  → <table>  via SampleTableRow
 *       sm→lg → cards   via SampleCard
 *       <sm  → compact  via SampleMobileRow
 *   • Load-more footer
 *
 * Props
 *   filteredSamples  – already-filtered array of sample objects
 *   allSamples       – full list (used to look up readings by sample.id)
 *   loading          – boolean
 *   error            – string | null
 *   hasActiveFilters – boolean
 *   canLoadMore      – boolean
 *   onLoadMore       – () => void
 *   onView           – (sample) => void
 *   onAddResults     – (sample) => void
 *   clearFilters     – () => void
 *   filterStatus     – current status filter value
 *   theme            – from ThemeContext
 */

import React from "react";
import { Beaker, AlertCircle } from "lucide-react";
import SampleTableRow from "./SampleTableRow";
import SampleCard from "./SampleCard";
import SampleMobileRow from "./SampleMobileRow";
import SampleListFooter from "./SampleListFooter";
import { READING_STATUS } from "../constants/collector.constants";

// ── Helpers ──────────────────────────────────────────────────────────────────

const hasReadings = (sample) =>
  (sample?.heavyMetalReadings ?? []).length > 0;

const getReadings = (sample, allSamples) =>
  allSamples.find((s) => s.id === sample.id)?.heavyMetalReadings ?? [];

const getReadingStatus = (sample) => {
  const count = (sample?.heavyMetalReadings ?? []).length;
  if (count === 0) {
    return {
      label: "No results",
      ...READING_STATUS.NO_READINGS,
    };
  }
  return {
    label: `${count} result${count > 1 ? "s" : ""}`,
    ...READING_STATUS.HAS_READINGS,
  };
};

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState = ({ hasActiveFilters, filterStatus, clearFilters, theme }) => {
  const message = hasActiveFilters
    ? "No samples match your filters. Try adjusting or clearing them."
    : filterStatus === "completed"
    ? "You haven't added results to any samples yet."
    : filterStatus === "pending"
    ? "All your samples have results."
    : "Start collecting samples to see them here.";

  return (
    <div className={`${theme?.card} border ${theme?.border} rounded-2xl p-10 sm:p-12 text-center`}>
      <div className={`w-11 h-11 sm:w-12 sm:h-12 ${theme?.bg} rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
        <Beaker className={`w-5 h-5 sm:w-6 sm:h-6 ${theme?.textMuted}`} />
      </div>
      <p className={`${theme?.text} font-semibold text-sm sm:text-base mb-1.5`}>
        No samples found
      </p>
      <p className={`text-xs sm:text-sm ${theme?.textMuted} max-w-xs mx-auto`}>
        {message}
      </p>
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="mt-4 sm:mt-5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-xl transition"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

// ── Table column headers ──────────────────────────────────────────────────────

const TABLE_COLS = [
  "Product / variant",
  "Location",
  "Price",
  "Metals logged",
  "Status",
  "Actions",
];

// ── Main component ────────────────────────────────────────────────────────────

const SampleList = ({
  filteredSamples,
  allSamples,
  loading,
  error,
  hasActiveFilters,
  canLoadMore,
  onLoadMore,
  onView,
  onAddResults,
  clearFilters,
  filterStatus,
  theme,
}) => {
  // ── Loading spinner ───────────────────────────────────────────────────────
  if (loading && filteredSamples.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-10">
        {[0, 0.1, 0.2].map((delay, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
        <span className={`ml-2 text-sm ${theme?.textMuted}`}>
          Loading samples…
        </span>
      </div>
    );
  }

  // ── Error banner ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-3 sm:px-4 py-3 rounded-xl mb-4 text-xs sm:text-sm flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (filteredSamples.length === 0) {
    return (
      <EmptyState
        hasActiveFilters={hasActiveFilters}
        filterStatus={filterStatus}
        clearFilters={clearFilters}
        theme={theme}
      />
    );
  }

  // ── Sample row props builder ──────────────────────────────────────────────
  const rowProps = (sample) => ({
    sample,
    readings: getReadings(sample, allSamples),
    status: getReadingStatus(sample),
    sampleHasReadings: hasReadings(sample),
    onView: () => onView(sample),
    onAddResults: () => onAddResults(sample),
    theme,
  });

  // ── Panel ─────────────────────────────────────────────────────────────────
  return (
    <div className={`${theme?.card} border ${theme?.border} rounded-2xl overflow-hidden`}>
      {/* Panel header */}
      <div className={`flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b ${theme?.border}`}>
        <div>
          <h2 className={`text-xs sm:text-sm font-semibold ${theme?.text}`}>
            Submitted samples
          </h2>
          <p className={`text-[10px] sm:text-xs ${theme?.textMuted} mt-0.5`}>
            Manage heavy metal readings per sample
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-semibold whitespace-nowrap">
          {filteredSamples.length} item{filteredSamples.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Desktop table (lg+) ── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${theme?.border} bg-gray-50/80 dark:bg-gray-800/40`}>
              {TABLE_COLS.map((col) => (
                <th
                  key={col}
                  className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest ${theme?.textMuted} whitespace-nowrap`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {filteredSamples.map((sample) => (
              <SampleTableRow key={sample.id} {...rowProps(sample)} />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Tablet cards (sm → lg) ── */}
      <div className="hidden sm:block lg:hidden divide-y divide-gray-100 dark:divide-gray-700/50">
        {filteredSamples.map((sample) => (
          <SampleCard key={sample.id} {...rowProps(sample)} />
        ))}
      </div>

      {/* ── Mobile rows (< sm) ── */}
      <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700/50">
        {filteredSamples.map((sample) => (
          <SampleMobileRow key={sample.id} {...rowProps(sample)} />
        ))}
      </div>

      {/* ── Load-more footer ── */}
      <SampleListFooter
        loading={loading}
        canLoadMore={canLoadMore}
        onLoadMore={onLoadMore}
        theme={theme}
      />
    </div>
  );
};

export default SampleList;