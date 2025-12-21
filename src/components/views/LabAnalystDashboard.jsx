import React, { useEffect, useMemo, useState } from "react";
import {
  Beaker,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import StatCard from "../common/StatCard";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";

const LabAnalystDashboard = ({ theme: propTheme }) => {
  const { theme } = useTheme();

  const [samplesRequiringConfirmation, setSamplesRequiringConfirmation] =
    useState([]);
  const [labStats, setLabStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLabData = async () => {
      console.log("🟢 [LabAnalystDashboard] Fetching lab data");
      try {
        // Check if token exists before making request
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          console.error("❌ [LabAnalystDashboard] No access token found");
          setError("Access token not found. Please log in again.");
          setLoading(false);
          return;
        }

        setLoading(true);

        // Fetch samples requiring confirmation
        console.log(
          "🔵 [LabAnalystDashboard] Fetching samples requiring confirmation"
        );
        const samplesRes = await api.get(
          "/lab/samples-requiring-confirmation",
          {
            params: { take: 10, skip: 0 },
          }
        );
        console.log(
          "✅ [LabAnalystDashboard] Samples fetched:",
          samplesRes.data.data
        );
        console.log("   Sample count:", samplesRes.data.data?.length);
        samplesRes.data.data?.forEach((sample, idx) => {
          console.log(`   Sample ${idx}:`, {
            id: sample.id,
            sampleId: sample.sampleId,
          });
        });
        setSamplesRequiringConfirmation(samplesRes.data.data || []);

        // Fetch lab workload stats
        console.log("🔵 [LabAnalystDashboard] Fetching workload stats");
        const statsRes = await api.get("/lab/my-workload");
        console.log(
          "✅ [LabAnalystDashboard] Stats fetched:",
          statsRes.data.data
        );
        setLabStats(statsRes.data.data);

        setError(null);
      } catch (err) {
        console.error(
          "❌ [LabAnalystDashboard] Failed to fetch lab data:",
          err
        );
        console.error("   Error message:", err.message);
        setError(err.response?.data?.message || "Failed to load lab data");
      } finally {
        setLoading(false);
      }
    };

    fetchLabData();
  }, []);

  if (loading) {
    return (
      <p className={`text-center mt-10 text-lg animate-pulse ${theme?.text}`}>
        Loading lab dashboard...
      </p>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center mt-10">
        <div
          className={`border-l-4 border-red-600 bg-red-50 text-red-700 p-4 rounded shadow max-w-xl`}
        >
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <AlertTriangle size={20} /> Error
          </h2>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`}>
        <StatCard
          icon={Beaker}
          label="Pending Confirmations"
          value={labStats?.pendingCount || 0}
          color="bg-blue-600"
          theme={theme}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed AAS Tests"
          value={labStats?.completedCount || 0}
          color="bg-green-600"
          theme={theme}
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={labStats?.inProgressCount || 0}
          color="bg-yellow-500"
          theme={theme}
        />
        <StatCard
          icon={TrendingUp}
          label="Accuracy Rate"
          value={`${(labStats?.accuracyRate || 0).toFixed(1)}%`}
          color="bg-purple-600"
          theme={theme}
        />
      </div>

      {/* PENDING CONFIRMATIONS TABLE */}
      <div
        className={`${theme?.card} ${theme.text} rounded-lg shadow-md border ${theme?.border} p-6`}
      >
        <h3 className="text-lg font-semibold mb-4">
          Samples Requiring Lab Confirmation
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead
              className={
                theme?.bg === "bg-gray-100" ? "bg-gray-100" : "bg-gray-800"
              }
            >
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Sample ID</th>
                <th className="px-4 py-2 text-left font-semibold">Product</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Heavy Metals
                </th>
                <th className="px-4 py-2 text-left font-semibold">
                  XRF Status
                </th>
                <th className="px-4 py-2 text-left font-semibold">
                  Date Screened
                </th>
                <th className="px-4 py-2 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {samplesRequiringConfirmation.length > 0 ? (
                samplesRequiringConfirmation.map((sample) => (
                  <tr key={sample.id} className={theme?.hover}>
                    <td className="px-4 py-2 font-medium">{sample.sampleId}</td>
                    <td className="px-4 py-2">
                      {sample.product?.variantName || "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {sample.readings
                          ?.filter((r) => r.requiresLabConfirmation)
                          .map((r) => (
                            <span
                              key={r.readingId}
                              className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded"
                            >
                              {r.heavyMetal}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-semibold">
                        Pending AAS
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {sample.createdAt
                        ? new Date(sample.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2">
                      <a
                        href={`/record-reading/${sample.sampleId}`}
                        onClick={(e) => {
                          console.log(
                            "🟡 [LabAnalystDashboard] Record AAS clicked"
                          );
                          console.log("   sample.sampleId:", sample.sampleId);
                          console.log("   Full sample object:", sample);
                          console.log(
                            "   Generated URL:",
                            `/record-reading/${sample.sampleId}`
                          );
                        }}
                        className="text-emerald-500 hover:text-emerald-600 font-semibold"
                      >
                        Record AAS
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No samples pending lab confirmation
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPARISON INSIGHTS */}
      {labStats?.comparisonMetrics && (
        <div
          className={`${theme?.card} ${theme.text} rounded-lg shadow-md border ${theme?.border} p-6`}
        >
          <h3 className="text-lg font-semibold mb-4">
            XRF vs AAS Agreement Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`${
                theme?.bg === "bg-gray-100" ? "bg-gray-50" : "bg-gray-900"
              } p-4 rounded`}
            >
              <p className={`text-sm ${theme?.textMuted}`}>Full Agreement</p>
              <p className="text-2xl font-bold text-green-600">
                {labStats.comparisonMetrics.fullAgreement}%
              </p>
            </div>
            <div
              className={`${
                theme?.bg === "bg-gray-100" ? "bg-gray-50" : "bg-gray-900"
              } p-4 rounded`}
            >
              <p className={`text-sm ${theme?.textMuted}`}>Partial Agreement</p>
              <p className="text-2xl font-bold text-amber-600">
                {labStats.comparisonMetrics.partialAgreement}%
              </p>
            </div>
            <div
              className={`${
                theme?.bg === "bg-gray-100" ? "bg-gray-50" : "bg-gray-900"
              } p-4 rounded`}
            >
              <p className={`text-sm ${theme?.textMuted}`}>Disagreement</p>
              <p className="text-2xl font-bold text-red-600">
                {labStats.comparisonMetrics.disagreement}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabAnalystDashboard;
