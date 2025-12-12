import React, { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const SupervisorDashboard = ({ theme: propTheme }) => {
  const { theme: hookTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = propTheme || hookTheme;
  const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#8b5cf6"];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, collectorsRes] = await Promise.all([
          axios.get("/api/supervisor/stats", { headers }),
          axios.get("/api/supervisor/collectors", { headers }),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (collectorsRes.data.success) setCollectors(collectorsRes.data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className={`${theme?.card} rounded-lg p-8 text-center`}>
        <p className={theme?.textMuted}>Loading supervisor dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error: {error}
      </div>
    );
  }

  // Prepare data for charts
  const reviewChartData = stats
    ? [
        { name: "Pending", value: stats.reviewStats.pending },
        { name: "Approved", value: stats.reviewStats.approved },
        { name: "Rejected", value: stats.reviewStats.rejected },
        { name: "Flagged", value: stats.reviewStats.flagged },
      ]
    : [];

  return (
    <div className={`${theme?.text} space-y-6`}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
          <p className={`text-sm ${theme?.textMuted} mb-2`}>Data Collectors</p>
          <p className="text-3xl font-bold text-emerald-600">{stats?.totalCollectors || 0}</p>
          <p className={`text-xs ${theme?.textMuted} mt-2`}>Assigned to you</p>
        </div>

        <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
          <p className={`text-sm ${theme?.textMuted} mb-2`}>Total Samples</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.totalSamples || 0}</p>
          <p className={`text-xs ${theme?.textMuted} mt-2`}>From all collectors</p>
        </div>

        <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
          <p className={`text-sm ${theme?.textMuted} mb-2`}>This Month</p>
          <p className="text-3xl font-bold text-violet-600">{stats?.samplesThisMonth || 0}</p>
          <p className={`text-xs ${theme?.textMuted} mt-2`}>Samples collected</p>
        </div>

        <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
          <p className={`text-sm ${theme?.textMuted} mb-2`}>Pending Review</p>
          <p className="text-3xl font-bold text-orange-600">{stats?.reviewStats.pending || 0}</p>
          <p className={`text-xs ${theme?.textMuted} mt-2`}>Awaiting approval</p>
        </div>
      </div>

      {/* Review Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
          <h3 className="text-lg font-semibold mb-4">Sample Review Status</h3>
          {stats && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={theme?.textMuted}>Pending Review</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-semibold">{stats.reviewStats.pending}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme?.textMuted}>Approved</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-semibold">{stats.reviewStats.approved}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme?.textMuted}>Rejected</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-semibold">{stats.reviewStats.rejected}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme?.textMuted}>Flagged</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-semibold">{stats.reviewStats.flagged}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme?.textMuted}>Correction Requested</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold">{stats.reviewStats.correctionRequested}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
          <h3 className="text-lg font-semibold mb-4">Review Distribution</h3>
          {reviewChartData.length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={reviewChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reviewChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Collectors */}
      <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
        <h3 className="text-lg font-semibold mb-4">Your Data Collectors</h3>
        {collectors.length === 0 ? (
          <p className={`${theme?.textMuted} text-center py-8`}>
            No data collectors assigned yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${theme?.border}`}>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-center py-3 px-4 font-semibold">Samples</th>
                  <th className="text-center py-3 px-4 font-semibold">States</th>
                  <th className="text-center py-3 px-4 font-semibold">Pending Review</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {collectors.map((collector) => (
                  <tr
                    key={collector.id}
                    className={`border-b ${theme?.border} hover:${theme?.hoverBg}`}
                  >
                    <td className="py-3 px-4 font-medium">{collector.name}</td>
                    <td className={`py-3 px-4 ${theme?.textMuted} text-xs`}>
                      {collector.email}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {collector.totalSamples}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {collector.assignedStates.length}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {collector.reviewStats.pending > 0 ? (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                          {collector.reviewStats.pending}
                        </span>
                      ) : (
                        <span className={theme?.textMuted}>-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-green-600 font-semibold">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorDashboard;
