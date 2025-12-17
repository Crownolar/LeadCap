import React, { useEffect, useState } from "react";
import { Download, Filter } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import api from "../../utils/api";

const LabWorkloadAnalytics = ({ theme: propTheme }) => {
  const { theme: hookTheme } = useTheme();
  const theme = propTheme || hookTheme;

  const [myRecordings, setMyRecordings] = useState([]);
  const [workloadMetrics, setWorkloadMetrics] = useState(null);
  const [comparisonReport, setComparisonReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMetal, setFilterMetal] = useState("all");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch my recordings
        const recordingsRes = await api.get("/lab/my-recordings", {
          params: { take: 50, skip: 0 }
        });
        setMyRecordings(recordingsRes.data.data || []);

        // Fetch workload metrics
        const metricsRes = await api.get("/lab/workload-metrics");
        setWorkloadMetrics(metricsRes.data.data);

        // Fetch comparison report
        const compRes = await api.get("/lab/comparison-report");
        setComparisonReport(compRes.data.data);

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

  const handleExport = async () => {
    try {
      const response = await api.get("/lab/export-results", {
        params: { format: "csv" },
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `lab-results-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export results:", error);
      alert("Failed to export results");
    }
  };

  if (loading) {
    return (
      <p className={`text-center mt-10 text-lg animate-pulse ${theme?.text}`}>
        Loading workload analytics...
      </p>
    );
  }

  const filteredRecordings = filterMetal === "all" 
    ? myRecordings 
    : myRecordings.filter(r => r.heavyMetal === filterMetal);

  const metalTypes = [...new Set(myRecordings.map(r => r.heavyMetal))];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* WORKLOAD METRICS */}
      {workloadMetrics && (
        <div className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-6`}>
          <h2 className="text-lg font-semibold mb-4">Workload Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${theme?.bg === 'bg-gray-100' ? 'bg-gray-50' : 'bg-gray-900'} p-4 rounded`}>
              <p className={`text-sm ${theme?.textMuted}`}>Total Tests Completed</p>
              <p className="text-3xl font-bold text-blue-600">{workloadMetrics.totalCompleted}</p>
            </div>
            <div className={`${theme?.bg === 'bg-gray-100' ? 'bg-gray-50' : 'bg-gray-900'} p-4 rounded`}>
              <p className={`text-sm ${theme?.textMuted}`}>This Month</p>
              <p className="text-3xl font-bold text-green-600">{workloadMetrics.thisMonth}</p>
            </div>
            <div className={`${theme?.bg === 'bg-gray-100' ? 'bg-gray-50' : 'bg-gray-900'} p-4 rounded`}>
              <p className={`text-sm ${theme?.textMuted}`}>Average per Day</p>
              <p className="text-3xl font-bold text-purple-600">{workloadMetrics.avgPerDay}</p>
            </div>
            <div className={`${theme?.bg === 'bg-gray-100' ? 'bg-gray-50' : 'bg-gray-900'} p-4 rounded`}>
              <p className={`text-sm ${theme?.textMuted}`}>Peak Metal</p>
              <p className="text-xl font-bold text-orange-600">{workloadMetrics.peakMetal}</p>
            </div>
          </div>
        </div>
      )}

      {/* XRF VS AAS COMPARISON */}
      {comparisonReport && (
        <div className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-6`}>
          <h2 className="text-lg font-semibold mb-4">XRF vs AAS Comparison Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg border-green-300 bg-green-50 dark:bg-green-900">
              <p className={`text-sm font-semibold text-green-700 dark:text-green-300`}>Full Agreement</p>
              <p className="text-3xl font-bold text-green-600">{comparisonReport.fullAgreement}%</p>
              <p className={`text-xs ${theme?.textMuted} mt-2`}>
                {comparisonReport.fullAgreementCount} cases
              </p>
            </div>
            <div className="p-4 border rounded-lg border-amber-300 bg-amber-50 dark:bg-amber-900">
              <p className={`text-sm font-semibold text-amber-700 dark:text-amber-300`}>Partial Agreement</p>
              <p className="text-3xl font-bold text-amber-600">{comparisonReport.partialAgreement}%</p>
              <p className={`text-xs ${theme?.textMuted} mt-2`}>
                {comparisonReport.partialAgreementCount} cases
              </p>
            </div>
            <div className="p-4 border rounded-lg border-red-300 bg-red-50 dark:bg-red-900">
              <p className={`text-sm font-semibold text-red-700 dark:text-red-300`}>Disagreement</p>
              <p className="text-3xl font-bold text-red-600">{comparisonReport.disagreement}%</p>
              <p className={`text-xs ${theme?.textMuted} mt-2`}>
                {comparisonReport.disagreementCount} cases
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MY RECORDINGS TABLE */}
      <div className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">My AAS Recordings</h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* FILTER */}
        <div className="mb-4 flex gap-2">
          <Filter size={18} className={theme?.textMuted} />
          <select
            value={filterMetal}
            onChange={(e) => setFilterMetal(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500 text-sm`}
          >
            <option value="all">All Metals</option>
            {metalTypes.map(metal => (
              <option key={metal} value={metal}>{metal}</option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={theme?.bg === 'bg-gray-100' ? 'bg-gray-100' : 'bg-gray-800'}>
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Sample ID</th>
                <th className="px-4 py-2 text-left font-semibold">Heavy Metal</th>
                <th className="px-4 py-2 text-left font-semibold">XRF Result</th>
                <th className="px-4 py-2 text-left font-semibold">AAS Result</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Date Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecordings.length > 0 ? (
                filteredRecordings.map((recording) => (
                  <tr key={recording.id} className={theme?.hover}>
                    <td className="px-4 py-2 font-medium">{recording.sampleId}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {recording.heavyMetal}
                      </span>
                    </td>
                    <td className="px-4 py-2">{recording.xrfReading} {recording.unit}</td>
                    <td className="px-4 py-2 font-semibold">{recording.aasReading} {recording.unit}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          recording.agreement === 'FULL'
                            ? 'bg-green-100 text-green-800'
                            : recording.agreement === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {recording.finalStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {new Date(recording.aasRecordedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                    No recordings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Total: {filteredRecordings.length} recordings
        </p>
      </div>
    </div>
  );
};

export default LabWorkloadAnalytics;
