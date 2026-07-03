/**
 * LabAnalystDashboard.jsx
 * ─────────────────────────
 * Thin orchestrator. Data via useLabWorkload + useSamplesRequiringConfirmation.
 * No API calls or business logic here.
 */

import React from "react";
import { Beaker, CheckCircle, Clock, TrendingUp, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

import { useLabWorkload } from "../hooks/useLabWorkload";
import { useSamplesRequiringConfirmation } from "../hooks/useSamplesRequiringConfirmation";
import StatCard from "../components/ui/StatCard";

const LabAnalystDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { labStats } = useLabWorkload();
  const {
    samples, loading, isLoadingMore, error,
    query, setQuery, canLoadMore, loadMore,
  } = useSamplesRequiringConfirmation();

  const goToRecordReading = (sample) => navigate(`/record-reading/${sample.sampleId}`);

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* ── KPI strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Beaker} label="Pending Confirmations" value={labStats?.pendingCount ?? "--"} color="bg-blue-600" theme={theme} />
        <StatCard icon={CheckCircle} label="Completed AAS Tests" value={labStats?.completedCount ?? "--"} color="bg-green-600" theme={theme} />
        <StatCard icon={Clock} label="In Progress" value={labStats?.inProgressCount ?? "--"} color="bg-yellow-500" theme={theme} />
        <StatCard
          icon={TrendingUp}
          label="Accuracy Rate"
          value={labStats?.completedCount === 0 ? "N/A" : `${(labStats?.accuracyRate ?? 0).toFixed(1)}%`}
          color="bg-purple-600"
          theme={theme}
        />
      </div>

      {/* ── Samples requiring confirmation panel ── */}
      <div className={`${theme?.card} ${theme.text} rounded-lg shadow-md border ${theme?.border} p-4 sm:p-6`}>
        {/* Search */}
        <div className="relative mb-7">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme?.textMuted}`} />
          <input
            type="text"
            placeholder="Search samples..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg ${theme?.input} focus:ring-emerald-500`}
          />
        </div>

        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 inline-flex items-center gap-2">
          Samples Requiring Lab Confirmation
          <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            {loading ? "--" : samples.length}
          </span>
        </h3>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={theme?.bg}>
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Sample ID</th>
                <th className="px-4 py-2 text-left font-semibold">Product</th>
                <th className="px-4 py-2 text-left font-semibold">Heavy Metals</th>
                <th className="px-4 py-2 text-left font-semibold">XRF Status</th>
                <th className="px-4 py-2 text-left font-semibold">Date Screened</th>
                <th className="px-4 py-2 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {samples.length > 0 && !loading && samples.map((sample) => (
                <tr key={sample.id} className={theme?.hover}>
                  <td className="px-4 py-2 font-medium">{sample.code}</td>
                  <td className="px-4 py-2">{sample.product?.variantName || "N/A"}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {sample.readings?.filter((r) => r.requiresLabConfirmation).map((r) => (
                        <span key={r.readingId} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs rounded">
                          {r.heavyMetal}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded font-semibold">Pending AAS</span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                    {sample.createdAt ? new Date(sample.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    <button type="button" onClick={() => goToRecordReading(sample)} className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold text-sm">
                      Record AAS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3">
          {samples.length > 0 && !loading && samples.map((sample) => (
            <div key={sample.id} className={`border ${theme?.border} rounded-lg p-3 sm:p-4 space-y-3 ${theme?.hover}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${theme?.textMuted} font-semibold uppercase`}>Sample ID</p>
                  <p className="font-bold text-sm sm:text-base truncate">{sample.code}</p>
                </div>
                <span className="self-start sm:self-auto px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded font-semibold whitespace-nowrap">
                  Pending AAS
                </span>
              </div>

              <div>
                <p className={`text-xs ${theme?.textMuted} font-semibold uppercase mb-1`}>Product</p>
                <p className="text-sm font-medium">{sample.product?.variantName || "N/A"}</p>
              </div>

              <div>
                <p className={`text-xs ${theme?.textMuted} font-semibold uppercase mb-1.5`}>Heavy Metals Requiring Confirmation</p>
                <div className="flex flex-wrap gap-1.5">
                  {sample.readings?.filter((r) => r.requiresLabConfirmation).map((r) => (
                    <span key={r.readingId} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs rounded font-medium">
                      {r.heavyMetal}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <p className={`text-xs ${theme?.textMuted} font-semibold uppercase`}>Date Screened</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {sample.createdAt ? new Date(sample.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <button type="button" onClick={() => goToRecordReading(sample)} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors">
                  Record AAS Reading
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Loading / load-more / empty / error states */}
        <div>
          {loading && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span className={`text-sm ${theme?.textMuted}`}>Loading samples...</span>
            </div>
          )}

          {samples.length > 0 && !loading && (
            <div className="py-3 flex justify-center">
              <button
                onClick={loadMore}
                disabled={isLoadingMore || !canLoadMore}
                className={`px-4 py-2 rounded-lg text-sm text-white ${isLoadingMore || !canLoadMore ? "bg-gray-400 opacity-60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}

          {!loading && samples.length === 0 && !query && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className={`text-sm font-medium ${theme?.text} mb-1`}>No samples pending lab confirmation</p>
              <p className={`text-xs ${theme?.textMuted}`}>Samples with Lead XRF results requiring AAS will appear here</p>
            </div>
          )}

          {query && samples.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className={`text-sm font-medium ${theme?.text} mb-1`}>No samples matches the query</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className={`text-sm font-medium ${theme?.text} mb-1`}>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Comparison insights ── */}
      {labStats?.comparisonMetrics && (
        <div className={`${theme?.card} ${theme.text} rounded-lg shadow-md border ${theme?.border} p-4 sm:p-6`}>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">XRF vs AAS Agreement Analysis</h3>
          {labStats?.completedCount === 0 ? (
            <p className={`text-sm ${theme?.textMuted}`}>Record AAS readings to see agreement metrics.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className={`${theme?.bg} p-3 sm:p-4 rounded`}>
                <p className={`text-xs sm:text-sm ${theme?.textMuted} mb-1`}>Full Agreement</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{labStats.comparisonMetrics.fullAgreement}%</p>
              </div>
              <div className={`${theme?.bg} p-3 sm:p-4 rounded`}>
                <p className={`text-xs sm:text-sm ${theme?.textMuted} mb-1`}>Partial Agreement</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{labStats.comparisonMetrics.partialAgreement}%</p>
              </div>
              <div className={`${theme?.bg} p-3 sm:p-4 rounded`}>
                <p className={`text-xs sm:text-sm ${theme?.textMuted} mb-1`}>Disagreement</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{labStats.comparisonMetrics.disagreement}%</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LabAnalystDashboard;