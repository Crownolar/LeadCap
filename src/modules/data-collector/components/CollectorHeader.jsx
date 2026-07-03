/**
 * CollectorHeader.jsx
 * ────────────────────
 * Renders:
 *   • LeadCap logo + "Field Intelligence" eyebrow
 *   • "Data Collector" role badge
 *   • Collector name, title, and organisation
 *   • Assigned supervisor card
 *
 * Props
 *   currentUser  – from auth slice
 *   supervisor   – from useSupervisor hook (null while loading)
 *   loadingSupervisor – boolean
 *   theme        – from ThemeContext
 */

import React from "react";
import { FlaskConical } from "lucide-react";

const CollectorHeader = ({ currentUser, supervisor, loadingSupervisor, theme }) => (
  <>
    {/* ── Brand bar ── */}
    <div className="flex items-center justify-between mb-5 sm:mb-6">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <p className={`text-xs sm:text-sm font-semibold ${theme?.text} leading-none`}>
            LeadCap
          </p>
          <p className={`text-[10px] sm:text-xs ${theme?.textMuted} mt-0.5`}>
            Field Intelligence
          </p>
        </div>
      </div>

      <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50 whitespace-nowrap">
        Data Collector
      </span>
    </div>

    {/* ── Identity + supervisor card ── */}
    <div className={`${theme?.card} border ${theme?.border} rounded-2xl p-4 sm:p-5 mb-4`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-5">
        {/* Collector identity */}
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5 sm:mb-2">
            Sample operations
          </p>
          <h1 className={`text-lg sm:text-xl font-semibold ${theme?.text} leading-snug truncate`}>
            {currentUser?.fullName || "—"}
          </h1>
          <p className={`text-xs sm:text-sm ${theme?.textMuted} mt-0.5`}>
            Data Collector
          </p>
          {currentUser?.organization && (
            <p className={`text-[11px] sm:text-xs ${theme?.textMuted} mt-0.5 truncate`}>
              {currentUser.organization}
            </p>
          )}
        </div>

        {/* Supervisor card */}
        <div
          className={`rounded-xl border ${theme?.border} p-3 sm:p-4 w-full sm:w-auto sm:min-w-[200px] sm:flex-shrink-0`}
        >
          <p className={`text-[10px] font-semibold uppercase tracking-widest ${theme?.textMuted} mb-1.5`}>
            Assigned supervisor
          </p>

          {supervisor ? (
            <>
              <p className={`text-xs sm:text-sm font-semibold ${theme?.text}`}>
                {supervisor.fullName}
              </p>
              <p className={`text-[11px] sm:text-xs ${theme?.textMuted} mt-0.5 truncate`}>
                {supervisor.email}
              </p>
            </>
          ) : loadingSupervisor ? (
            <p className={`text-xs sm:text-sm ${theme?.textMuted}`}>Loading…</p>
          ) : (
            <p className={`text-xs sm:text-sm ${theme?.textMuted}`}>
              No supervisor assigned
            </p>
          )}
        </div>
      </div>
    </div>
  </>
);

export default CollectorHeader;