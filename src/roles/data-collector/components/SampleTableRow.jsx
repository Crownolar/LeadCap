/**
 * SampleTableRow.jsx
 * ───────────────────
 * Single row for the lg+ desktop table inside SampleList.
 * Rendered inside a <tbody>; never used standalone.
 *
 * Props
 *   sample           – sample object
 *   readings         – reading objects for this sample
 *   status           – { label, colorClass, dot } from getReadingStatus()
 *   sampleHasReadings – boolean
 *   onView           – () => void
 *   onAddResults     – () => void
 *   theme            – from ThemeContext
 */

import React from "react";
import { Eye, Plus, RefreshCw } from "lucide-react";

const SampleTableRow = ({
  sample,
  readings,
  status,
  sampleHasReadings,
  onView,
  onAddResults,
  theme,
}) => (
  <tr className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
    {/* Product / variant */}
    <td className="px-5 py-3.5 align-middle">
      <p className={`font-semibold text-sm ${theme?.text} leading-snug`}>
        {sample.productName}
      </p>
      <p className={`text-xs ${theme?.textMuted} mt-0.5`}>
        {sample.productVariant?.displayName ||
          sample.productVariant?.name ||
          "Unknown variant"}
      </p>
    </td>

    {/* Location */}
    <td className="px-5 py-3.5 align-middle">
      <p className={`text-sm ${theme?.text}`}>
        {sample.marketName || sample.market?.name || "N/A"}
      </p>
      <p className={`text-xs ${theme?.textMuted} mt-0.5`}>
        {sample.lga?.name}, {sample.state?.name}
      </p>
    </td>

    {/* Price */}
    <td className="px-5 py-3.5 align-middle whitespace-nowrap">
      <span className={`text-sm font-semibold ${theme?.text}`}>
        {!Number.isNaN(parseFloat(sample.price))
          ? `₦${parseFloat(sample.price).toLocaleString()}`
          : "N/A"}
      </span>
    </td>

    {/* Metals logged */}
    <td className="px-5 py-3.5 align-middle">
      {readings.length > 0 ? (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {readings.slice(0, 3).map((r) => (
            <span
              key={r.id}
              className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            >
              {r.heavyMetal}
            </span>
          ))}
          {readings.length > 3 && (
            <span className={`text-xs ${theme?.textMuted} self-center`}>
              +{readings.length - 3} more
            </span>
          )}
        </div>
      ) : (
        <span className={`text-xs ${theme?.textMuted} italic`}>None yet</span>
      )}
    </td>

    {/* Status */}
    <td className="px-5 py-3.5 align-middle whitespace-nowrap">
      <span
        className={`inline-flex items-center gap-1.5 ${status.colorClass} px-2.5 py-1 rounded-full text-[10px] font-semibold`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot} flex-shrink-0`} />
        {status.label}
      </span>
    </td>

    {/* Actions */}
    <td className="px-5 py-3.5 align-middle">
      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          title="View details"
          className={`w-9 h-9 rounded-xl border ${theme?.border} ${theme?.text} flex items-center justify-center hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/10 transition`}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {sampleHasReadings ? (
          <button
            onClick={onAddResults}
            className={`inline-flex items-center gap-1.5 h-9 px-3.5 border ${theme?.border} ${theme?.text} text-xs font-medium rounded-xl hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/10 transition whitespace-nowrap`}
          >
            <RefreshCw className="w-3 h-3" />
            Update
          </button>
        ) : (
          <button
            onClick={onAddResults}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add results
          </button>
        )}
      </div>
    </td>
  </tr>
);

export default SampleTableRow;