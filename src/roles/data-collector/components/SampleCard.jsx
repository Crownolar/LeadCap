/**
 * SampleCard.jsx
 * ───────────────
 * Tablet (sm → lg) card layout for a single sample.
 * Three mini info tiles (Location / Price / Metals) above action buttons.
 *
 * Props — same shape as SampleTableRow
 */

import React from "react";
import { Eye, Plus, RefreshCw } from "lucide-react";

const SampleCard = ({
  sample,
  readings,
  status,
  sampleHasReadings,
  onView,
  onAddResults,
  theme,
}) => (
  <div className="p-4 sm:p-5">
    {/* Name + status */}
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="min-w-0 flex-1">
        <p className={`font-semibold text-sm ${theme?.text} truncate`}>
          {sample.productName}
        </p>
        <p className={`text-xs ${theme?.textMuted} mt-0.5`}>
          {sample.productVariant?.displayName ||
            sample.productVariant?.name ||
            "Unknown variant"}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1.5 ${status.colorClass} px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
        {status.label}
      </span>
    </div>

    {/* Info tiles */}
    <div className="grid grid-cols-3 gap-2 mb-3">
      {/* Location */}
      <div className={`rounded-xl ${theme?.bg} p-2.5`}>
        <p className={`text-[9px] font-semibold uppercase tracking-widest ${theme?.textMuted} mb-1`}>
          Location
        </p>
        <p className={`text-xs font-medium ${theme?.text} leading-snug`}>
          {sample.marketName || sample.market?.name || "N/A"}
        </p>
        <p className={`text-[10px] ${theme?.textMuted} mt-0.5`}>
          {sample.lga?.name}, {sample.state?.name}
        </p>
      </div>

      {/* Price */}
      <div className={`rounded-xl ${theme?.bg} p-2.5`}>
        <p className={`text-[9px] font-semibold uppercase tracking-widest ${theme?.textMuted} mb-1`}>
          Price
        </p>
        <p className={`text-xs font-semibold ${theme?.text}`}>
          {!Number.isNaN(parseFloat(sample.price))
            ? `₦${parseFloat(sample.price).toLocaleString()}`
            : "N/A"}
        </p>
      </div>

      {/* Metals */}
      <div className={`rounded-xl ${theme?.bg} p-2.5`}>
        <p className={`text-[9px] font-semibold uppercase tracking-widest ${theme?.textMuted} mb-1`}>
          Metals
        </p>
        {readings.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {readings.slice(0, 2).map((r) => (
              <span
                key={r.id}
                className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
              >
                {r.heavyMetal}
              </span>
            ))}
            {readings.length > 2 && (
              <span className={`text-[10px] ${theme?.textMuted}`}>
                +{readings.length - 2}
              </span>
            )}
          </div>
        ) : (
          <span className={`text-[10px] ${theme?.textMuted} italic`}>None yet</span>
        )}
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <button
        onClick={onView}
        className={`inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl border ${theme?.border} ${theme?.text} text-xs font-medium hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition`}
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </button>

      {sampleHasReadings ? (
        <button
          onClick={onAddResults}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 h-9 border ${theme?.border} ${theme?.text} text-xs font-medium rounded-xl hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Update results
        </button>
      ) : (
        <button
          onClick={onAddResults}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add results
        </button>
      )}
    </div>
  </div>
);

export default SampleCard;