/**
 * CollectorStats.jsx
 * ───────────────────
 * Two rows of summary numbers:
 *   1. Three big KPI cards (Total / Pending / Complete) from the API stats endpoint.
 *   2. Three compact pills showing counts from the currently-loaded page.
 *
 * Props
 *   stats            – object from useCollectorStats (may be null while loading)
 *   allSamples       – array from useCollectorSamples
 *   samplesLoading   – boolean
 *   hasReadings      – (sample) => boolean helper
 *   theme            – from ThemeContext
 */

import React from "react";
import { STAT_CARDS, PAGE_COUNT_LABELS } from "../constants/collector.constants";

const CollectorStats = ({ stats, allSamples, samplesLoading, hasReadings, theme }) => {
  const withReadings = allSamples.filter((s) => hasReadings(s)).length;
  const withoutReadings = allSamples.filter((s) => !hasReadings(s)).length;

  // Keyed counts for page pills
  const pageCounts = {
    total: allSamples.length,
    withReadings,
    withoutReadings,
  };

  return (
    <>
      {/* ── KPI cards ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        {STAT_CARDS.map(({ key, label, sub, accent }) => (
          <div
            key={label}
            className={`${theme?.card} border ${theme?.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 relative overflow-hidden`}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${accent} rounded-l-xl sm:rounded-l-2xl`}
            />
            <p
              className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest ${theme?.textMuted} mb-1 sm:mb-1.5 leading-none`}
            >
              {label}
            </p>
            <p className={`text-xl sm:text-2xl font-semibold ${theme?.text} leading-none`}>
              {stats?.[key] ?? "—"}
            </p>
            <p className={`text-[10px] sm:text-xs ${theme?.textMuted} mt-0.5 sm:mt-1`}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Page-count pills ── */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {PAGE_COUNT_LABELS.map(({ key, label }) => (
          <div
            key={label}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border ${theme?.border} ${theme?.card} text-[10px] sm:text-xs`}
          >
            <span className={theme?.textMuted}>{label}</span>
            <span className={`font-semibold ${theme?.text}`}>
              {samplesLoading ? "—" : pageCounts[key]}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default CollectorStats;