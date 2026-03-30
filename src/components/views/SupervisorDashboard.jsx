import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const SupervisorDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, collectorsRes] = await Promise.all([
          api.get("/supervisor/stats"),
          api.get("/supervisor/collectors"),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (collectorsRes.data.success) {
          const data = collectorsRes.data.data || collectorsRes.data;
          setCollectors(Array.isArray(data) ? data : data?.data || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const COLORS = ["#030a07", "#ef4444", "#f59e0b", "#8b5cf6"];

  if (loading) {
    return (
      <div className={`${theme?.card} rounded-lg p-8 text-center`}>
        <p className={theme?.textMuted}>Loading supervisor dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
        Error: {error}
      </div>
    );
  }

  // Prepare data for charts - map backend data structure to frontend expectations
  const reviewChartData = stats
    ? [
        { name: "Pending", value: stats.pendingReviews || 0 },
        { name: "Approved", value: stats.approvedSamples || 0 },
        { name: "Rejected", value: stats.reviewBreakdown?.rejected || 0 },
        { name: "Flagged", value: stats.flaggedSamples || 0 },
      ]
    : [];

  return (
    <div className={`${theme?.text} space-y-6`}>
      {/* Header Stats - clickable cards for affordance and efficiency */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <button
          type='button'
          onClick={() => navigate("/collectors")}
          className={`${theme?.card} rounded-lg p-6 border ${theme?.border} text-left w-full cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
        >
          <p className={`text-sm ${theme?.textMuted} mb-2`}>Data Collectors</p>
          <p className='text-3xl font-bold text-emerald-600'>
            {stats?.totalCollectors || 0}
          </p>
          <p className={`text-xs ${theme?.textMuted} mt-2`}>Assigned to you</p>
        </button>

        <button
          type='button'
          onClick={() => navigate("/sample-review")}
          className={`${theme?.card} rounded-lg p-6 border ${theme?.border} text-left w-full cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <p className={`text-sm ${theme?.textMuted} mb-2`}>Total Samples</p>
          <p className='text-3xl font-bold text-blue-600'>
            {stats?.totalSamples || 0}
          </p>
          <p className={`text-xs ${theme?.textMuted} mt-2`}>
            From all collectors
          </p>
        </button>

        <button
          type='button'
          onClick={() => navigate("/sample-review")}
          className={`${theme?.card} rounded-lg p-6 border ${theme?.border} text-left w-full cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2`}
        >
          <p className={`text-sm ${theme?.textMuted} mb-2`}>This Month</p>
          <p className='text-3xl font-bold text-violet-600'>
            {stats?.samplesThisMonth ?? 0}
          </p>
          <p className={`text-xs ${theme?.textMuted} mt-2`}>
            Samples collected
          </p>
        </button>

        <button
          type='button'
          onClick={() => navigate("/sample-review")}
          className={`${theme?.card} rounded-lg p-6 border ${theme?.border} text-left w-full cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
        >
          <p className={`text-sm ${theme?.textMuted} mb-2`}>Pending Review</p>
          <p className='text-3xl font-bold text-orange-600'>
            {stats?.pendingReviews || 0}
          </p>
          <p className={`text-xs ${theme?.textMuted} mt-2`}>
            Awaiting approval
          </p>
        </button>
      </div>

      {/* Review Status Overview */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Status Breakdown */}
        <div
          className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}
        >
          <h3 className='text-lg font-semibold mb-4'>Sample Review Status</h3>
          {stats && (
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className={theme?.textMuted}>Pending Review</span>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
                  <span className='font-semibold'>
                    {stats.pendingReviews || 0}
                  </span>
                </div>
              </div>
              <div className='flex justify-between items-center'>
                <span className={theme?.textMuted}>Approved</span>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='font-semibold'>
                    {stats.approvedSamples || 0}
                  </span>
                </div>
              </div>
              <div className='flex justify-between items-center'>
                <span className={theme?.textMuted}>Rejected</span>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                  <span className='font-semibold'>
                    {stats.reviewBreakdown?.rejected || 0}
                  </span>
                </div>
              </div>
              <div className='flex justify-between items-center'>
                <span className={theme?.textMuted}>Flagged</span>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                  <span className='font-semibold'>
                    {stats.flaggedSamples || 0}
                  </span>
                </div>
              </div>
              {/* <div className="flex justify-between items-center">
                <span className={theme?.textMuted}>Correction Requested</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold">
                    {stats.reviewBreakdown?.correction_requested || 0}
                  </span>
                </div>
              </div> */}
            </div>
          )}
        </div>

        {/* Pie Chart - Legend only (no slice labels) to avoid overlap when values are 0 */}
        <div
          className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}
        >
          <h3 className='text-lg font-semibold mb-4'>Review Distribution</h3>
          {reviewChartData.length > 0 && (
            <ResponsiveContainer width='100%' height={250}>
              <PieChart>
                <Pie
                  data={reviewChartData}
                  cx='50%'
                  cy='50%'
                  outerRadius={isMobile ? 60 : 80}
                  innerRadius={isMobile ? 30 : 40}
                  paddingAngle={2}
                  dataKey='value'
                  nameKey='name'
                >
                  {reviewChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div
                        className={`rounded px-2 py-1 text-sm ${theme?.card ?? "bg-white"} border ${theme?.border ?? "border-gray-200"}`}
                      >
                        {payload[0].name}: {payload[0].value}
                      </div>
                    ) : null
                  }
                />
                <Legend
                  layout='vertical'
                  align={isMobile ? "center" : "right"}
                  verticalAlign={isMobile ? "bottom" : "middle"}
                  formatter={(value, entry) => (
                    <span className={theme?.text ?? "text-gray-700"}>
                      {value}: {entry.payload?.value ?? 0}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Collectors */}
      <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
        <h3 className='text-lg font-semibold mb-4 inline-flex items-center gap-2'>
          Your Data Collectors
          <span className='inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'>
            {collectors.length}
          </span>
        </h3>
        {collectors.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-10 text-center'>
            <p className={`text-sm font-medium ${theme?.text} mb-1`}>
              No data collectors assigned yet
            </p>
            <p className={`text-xs ${theme?.textMuted}`}>
              Collectors in your assigned states will appear here
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className={`border-b ${theme?.border}`}>
                  <th className='text-left py-3 px-4 font-semibold'>Name</th>
                  <th className='text-left py-3 px-4 font-semibold'>Email</th>
                  <th className='text-center py-3 px-4 font-semibold'>
                    Total Samples
                  </th>
                  <th className='text-center py-3 px-4 font-semibold'>
                    This Month
                  </th>
                  <th className='text-center py-3 px-4 font-semibold'>
                    States Covered
                  </th>
                  <th className='text-center py-3 px-4 font-semibold'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {collectors.map((collector) => (
                  <tr
                    key={collector.id}
                    className={`border-b ${theme?.border} hover:${theme?.hoverBg}`}
                  >
                    <td className='py-3 px-4 font-medium'>{collector.name}</td>
                    <td className={`py-3 px-4 ${theme?.textMuted} text-xs`}>
                      {collector.email}
                    </td>
                    <td className='py-3 px-4 text-center font-semibold'>
                      {collector.totalSamples || 0}
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold'>
                        {collector.samplesThisMonth || 0}
                      </span>
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <span className='text-xs px-2 py-1'>
                        {collector.samplesByState
                          ? Object.keys(collector.samplesByState).length
                          : 0}{" "}
                        states
                      </span>
                    </td>
                    <td className='py-3 px-4 text-center'>
                      <span
                        className={`font-semibold ${
                          collector.isActive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {collector.isActive ? "Active" : "Inactive"}
                      </span>
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
