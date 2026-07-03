/**
 * SampleMobileRow.jsx
 * ────────────────────
 * Compact mobile layout (< sm) for a single sample.
 * Two info tiles (Location / Price) + inline metal tags + action buttons.
 *
 * Props — same shape as SampleTableRow
 */

import React from "react";
import { Eye, Plus, RefreshCw } from "lucide-react";

const SampleMobileRow = ({
  sample,
  readings,
  status,
  sampleHasReadings,
  onView,
  onAddResults,
  theme,
}) => (
  <div className="p-3.5">
    {/* Name + status */}
    <div className="flex items-start justify-between gap-2 mb-2.5">
      <div className="min-w-0">
        <p className={`font-semibold text-sm ${theme?.text} leading-snug`}>
          {sample.productName}
        </p>
        <p className={`text-[11px] ${theme?.textMuted} mt-0.5`}>
          {sample.productVariant?.displayName ||
            sample.productVariant?.name ||
            "Unknown variant"}
        </p>
      </div>
      <span
        className={`inline-flex items-center gap-1 ${status.colorClass} px-2 py-0.5 rounded-full text-[9px] font-semibold flex-shrink-0 mt-0.5`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
        {status.label}
      </span>
    </div>

    {/* Info tiles */}
    <div className="grid grid-cols-2 gap-1.5 mb-2.5">
      <div className={`rounded-lg ${theme?.bg} p-2.5`}>
        <p className={`text-[9px] font-semibold uppercase tracking-wider ${theme?.textMuted} mb-1`}>
          Location
        </p>
        <p className={`text-[11px] font-medium ${theme?.text} leading-snug`}>
          {sample.marketName || sample.market?.name || "N/A"}
        </p>
        <p className={`text-[10px] ${theme?.textMuted} mt-0.5`}>
          {sample.lga?.name}, {sample.state?.name}
        </p>
      </div>

      <div className={`rounded-lg ${theme?.bg} p-2.5`}>
        <p className={`text-[9px] font-semibold uppercase tracking-wider ${theme?.textMuted} mb-1`}>
          Price
        </p>
        <p className={`text-[11px] font-semibold ${theme?.text}`}>
          {!Number.isNaN(parseFloat(sample.price))
            ? `₦${parseFloat(sample.price).toLocaleString()}`
            : "N/A"}
        </p>
      </div>
    </div>

    {/* Metal tags */}
    {readings.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-2.5">
        {readings.map((r) => (
          <span
            key={r.id}
            className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
          >
            {r.heavyMetal}
          </span>
        ))}
      </div>
    )}

    {/* Actions */}
    <div className="flex gap-1.5">
      <button
        onClick={onView}
        className={`inline-flex items-center justify-center gap-1 h-9 px-3 rounded-xl border ${theme?.border} ${theme?.text} text-[11px] font-medium hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex-shrink-0`}
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </button>

      {sampleHasReadings ? (
        <button
          onClick={onAddResults}
          className={`flex-1 inline-flex items-center justify-center gap-1 h-9 border ${theme?.border} ${theme?.text} text-[11px] font-medium rounded-xl hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Update
        </button>
      ) : (
        <button
          onClick={onAddResults}
          className="flex-1 inline-flex items-center justify-center gap-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-xl transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add results
        </button>
      )}
    </div>
  </div>
);

export default SampleMobileRow;