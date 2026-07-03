/**
 * LabWorkloadAnalytics.jsx
 * ──────────────────────────
 * Thin orchestrator. Data via useLabRecordings.
 * No API calls or business logic here.
 *
 * Note: MetricCard and ComparisonCard from the original file were unused
 * dead code (never rendered anywhere in the component tree) — dropped
 * during refactor per "no behaviour change" since they had zero effect
 * on rendered output. Flagging here in case they were meant to be wired in.
 */

import React from "react";
import { Download, Pencil, Beaker } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { useLabRecordings } from "../hooks/useLabRecordings";

const LabWorkloadAnalytics = () => {
  const { theme } = useTheme();
  const {
    recordings, loading, isLoadingMore, error,
    canLoadMore, loadMore,
    editingRecording, aasValue, setAasValue, aasNotes, setAasNotes,
    updating, openEdit, closeEdit, submitEdit, exportCsv,
  } = useLabRecordings();

  if (loading) {
    return (
      <p className={`text-center mt-10 text-lg animate-pulse ${theme?.text}`}>
        Loading samples...
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      {/* Recordings table */}
      <div className={`p-6 rounded-lg shadow-md border ${theme?.card} ${theme?.border}`}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className={`text-xl font-semibold flex items-center gap-2 ${theme?.text}`}>
            <Beaker size={20} /> My AAS Recordings
          </h2>
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition">
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className={`w-full min-w-[600px] border-collapse text-left ${theme?.text}`}>
            <thead className={`sticky top-0 ${theme.bg} z-10`}>
              <tr>
                <th className="px-4 py-2">Sample Name</th>
                <th className="px-4 py-2">XRF Result</th>
                <th className="px-4 py-2">AAS Result</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date Recorded</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recordings.length > 0 ? (
                recordings.map((rec) => (
                  <tr key={rec.id} className={theme?.hover}>
                    <td className="px-4 py-2 font-medium">{rec.sampleName}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {rec.xrfReading} <span className="text-gray-500 text-sm">{rec.unit}</span>
                    </td>
                    <td className="px-4 py-2 font-semibold whitespace-nowrap">
                      {rec.aasReading} <span className="text-gray-500 text-sm">{rec.unit}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rec.status === "SAFE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs whitespace-nowrap">
                      {new Date(rec.recordedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button onClick={() => openEdit(rec)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                        <Pencil size={16} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No recordings found</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="py-3 flex justify-center">
            {recordings.length > 0 && (
              <button
                onClick={loadMore}
                disabled={isLoadingMore || !canLoadMore}
                className={`px-4 py-2 rounded-lg text-sm text-white ${isLoadingMore || !canLoadMore ? "bg-gray-400 opacity-60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs mt-3 text-gray-500">Total: {recordings.length} recordings</p>
      </div>

      {/* Edit AAS modal */}
      {editingRecording && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg w-full max-w-md ${theme?.card} ${theme?.border}`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme?.text}`}>Update AAS Reading</h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-1 ${theme?.text}`}>Sample</label>
                <p className={`text-sm font-medium ${theme?.textMuted}`}>{editingRecording.sampleName}</p>
              </div>

              <label className={`block text-sm mb-1 ${theme?.text}`}>AAS Reading</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={aasValue}
                  onChange={(e) => setAasValue(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg ${theme?.border} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                />
                <span className="text-sm text-gray-500">{editingRecording.unit}</span>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-500">Notes</label>
                <textarea
                  value={aasNotes}
                  onChange={(e) => setAasNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button onClick={closeEdit} className="px-4 py-2 rounded bg-gray-400 text-white">
                  Cancel
                </button>
                <button onClick={submitEdit} disabled={updating} className="px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600">
                  {updating ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabWorkloadAnalytics;