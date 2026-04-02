import React, { useEffect, useState, useCallback } from "react";
import { Download, Pencil, Beaker } from "lucide-react";
import api from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";

const normalizeRecording = (recording) => ({
  id: recording.readingId,
  sampleName: recording.sampleCode,
  unit: recording.unit,
  xrfReading: recording.xrf?.reading || "-",
  aasReading: recording.aas?.reading || "-",
  recordedAt: recording.aas?.recordedAt || recording.createdAt,
  status: recording.finalStatus,
});

const LabWorkloadAnalytics = () => {
  const { theme } = useTheme();

  const [myRecordings, setMyRecordings] = useState([]);
  const [workloadMetrics, setWorkloadMetrics] = useState(null);
  const [comparisonReport, setComparisonReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecording, setEditingRecording] = useState(null);
  const [aasValue, setAasValue] = useState("");
  const [aasNotes, setAasNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    const newSkip = skip + 20;
    if (skip + take >= (totalItems || 1)) return;
    try {
      setIsLoadingMore(true);

      setSkip(newSkip);
      const res = await api.get("/lab/my-recordings", {
        params: { take, skip: newSkip },
      });
      const more = (res.data.data || []).map(normalizeRecording);
      if (more.length > 0) setMyRecordings((prev) => [...prev, ...more]);
    } catch (err) {
      console.error("Failed to load more recordings:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleEdit = (recording) => {
    setEditingRecording(recording);
    setAasValue(recording.aasReading);
    setAasNotes(recording.aasNotes || "");
  };

  const handleUpdateAAS = async () => {
    if (!editingRecording) return;

    try {
      setUpdating(true);

      const payload = {
        aasReadingValue: Number(aasValue),
        aasNotes: aasNotes || editingRecording.aasNotes || "",
      };

      await api.patch(`/lab/aas-reading/${editingRecording.id}`, payload);

      setMyRecordings((prev) =>
        prev.map((rec) =>
          rec.id === editingRecording.id
            ? { ...rec, aasReading: Number(aasValue), aasNotes: aasNotes }
            : rec,
        ),
      );

      setEditingRecording(null);
      setAasValue("");
      setAasNotes("");
    } catch (err) {
      console.error("Failed to update AAS", err);
      setError(err.response?.data?.message || "Failed to update AAS reading");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          setError("Access token not found. Please log in again.");
          setLoading(false);
          return;
        }

        setLoading(true);
        const recordingsRes = await api.get("/lab/my-recordings", {
          params: { take: 20, skip: 0 },
        });

        const normalized = (recordingsRes.data.data || []).map(
          normalizeRecording,
        );
        setMyRecordings(normalized);
        setTotalItems(recordingsRes.data.pagination?.total || 0);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const response = await api.get("/lab/export-results", {
        params: { format: "csv" },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `lab-results-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export results:", error);
      alert("Failed to export results");
    }
  }, []);

  if (loading) {
    return (
      <p className={`text-center mt-10 text-lg animate-pulse ${theme?.text}`}>
        Loading samples...
      </p>
    );
  }

  return (
    <div className='space-y-8'>
      {error && (
        <div className='p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 shadow-sm'>
          {error}
        </div>
      )}

      {/* AAS Recordings */}
      <div
        className={`p-6 rounded-lg shadow-md border ${theme?.card} ${theme?.border}`}
      >
        <div className='flex justify-between items-center mb-4 flex-wrap gap-2'>
          <h2
            className={`text-xl font-semibold flex items-center gap-2 ${theme?.text}`}
          >
            <Beaker size={20} /> My AAS Recordings
          </h2>
          <button
            onClick={handleExport}
            className='flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition'
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Responsive table wrapper */}
        <div className='overflow-x-auto rounded-lg border border-gray-200'>
          <table
            className={`w-full min-w-[600px] border-collapse text-left ${theme?.text}`}
          >
            <thead className={`sticky top-0 ${theme.bg} z-10`}>
              <tr>
                <th className='px-4 py-2'>Sample Name</th>
                <th className='px-4 py-2'>XRF Result</th>
                <th className='px-4 py-2'>AAS Result</th>
                <th className='px-4 py-2'>Status</th>
                <th className='px-4 py-2'>Date Recorded</th>
                <th className='px-4 py-2'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
              {myRecordings.length > 0 ? (
                myRecordings.map((rec) => (
                  <tr key={rec.id} className={`${theme?.hover}`}>
                    <td className='px-4 py-2 font-medium'>{rec.sampleName}</td>
                    <td className='px-4 py-2 whitespace-nowrap'>
                      {rec.xrfReading}{" "}
                      <span className='text-gray-500 text-sm'>{rec.unit}</span>
                    </td>
                    <td className='px-4 py-2 font-semibold whitespace-nowrap'>
                      {rec.aasReading}{" "}
                      <span className='text-gray-500 text-sm'>{rec.unit}</span>
                    </td>
                    <td className='px-4 py-2'>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          rec.status === "SAFE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className='px-4 py-2 text-xs whitespace-nowrap'>
                      {new Date(rec.recordedAt).toLocaleDateString()}
                    </td>
                    <td className='px-4 py-2 whitespace-nowrap'>
                      <button
                        onClick={() => handleEdit(rec)}
                        className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800'
                      >
                        <Pencil size={16} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className='px-4 py-6 text-center text-gray-500'
                  >
                    No recordings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className='py-3 flex justify-center'>
            {myRecordings.length > 0 && (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore || skip + take >= (totalItems || 1)}
                className={`px-4 py-2 rounded-lg text-sm text-white ${isLoadingMore || skip + take >= (totalItems || 0) ? "bg-gray-400 opacity-60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        </div>
        <p className='text-xs mt-3 text-gray-500'>
          Total: {myRecordings.length} recordings
        </p>
      </div>

      {editingRecording && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div
            className={`p-6 rounded-lg shadow-lg w-full max-w-md ${theme?.card} ${theme?.border}`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${theme?.text}`}>
              Update AAS Reading
            </h2>
            <div className='space-y-4'>
              <div>
                <label className={`block text-sm mb-1 ${theme?.text}`}>
                  Sample
                </label>
                <p className={`text-sm font-medium ${theme?.textMuted}`}>
                  {editingRecording.sampleName}
                </p>
              </div>

              <label className={`block text-sm mb-1 ${theme?.text}`}>
                AAS Reading
              </label>
              <div className='flex gap-2 items-center'>
                <input
                  type='number'
                  value={aasValue}
                  onChange={(e) => setAasValue(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg ${theme?.border} focus:outline-none focus:ring-2 focus:ring-emerald-400`}
                />
                <span className='text-sm text-gray-500'>
                  {editingRecording.unit}
                </span>
              </div>

              <div>
                <label className='block text-sm mb-1 text-gray-500'>
                  Notes
                </label>
                <textarea
                  value={aasNotes}
                  onChange={(e) => setAasNotes(e.target.value)}
                  rows='3'
                  className='w-full px-3 py-2 border rounded-lg'
                />
              </div>

              <div className='flex justify-end gap-3 pt-3'>
                <button
                  onClick={() => setEditingRecording(null)}
                  className='px-4 py-2 rounded bg-gray-400 text-white'
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAAS}
                  disabled={updating}
                  className='px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600'
                >
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

const MetricCard = ({ label, value, color }) => (
  <div
    className={`p-4 rounded-lg shadow ${
      color === "blue"
        ? "bg-blue-50 text-blue-600"
        : color === "green"
          ? "bg-green-50 text-green-600"
          : color === "purple"
            ? "bg-purple-50 text-purple-600"
            : "bg-orange-50 text-orange-600"
    }`}
  >
    <p className='text-sm'>{label}</p>
    <p className='text-3xl font-bold'>{value}</p>
  </div>
);

const ComparisonCard = ({ label, percent, count, color }) => (
  <div
    className={`p-4 border rounded-lg ${
      color === "green"
        ? "border-green-300 bg-green-50"
        : color === "amber"
          ? "border-amber-300 bg-amber-50"
          : "border-red-300 bg-red-50"
    }`}
  >
    <p
      className={`text-sm font-semibold ${
        color === "green"
          ? "text-green-700"
          : color === "amber"
            ? "text-amber-700"
            : "text-red-700"
      }`}
    >
      {label}
    </p>
    <p
      className={`text-3xl font-bold ${
        color === "green"
          ? "text-green-600"
          : color === "amber"
            ? "text-amber-600"
            : "text-red-600"
      }`}
    >
      {percent}%
    </p>
    <p className='text-xs mt-2 text-gray-500'>{count} cases</p>
  </div>
);

export default LabWorkloadAnalytics;
