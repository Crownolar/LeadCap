import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Package, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import StatCard from "../common/StatCard";
import { COLORS } from "../../utils/constants";
import { useSelector } from "react-redux";
import {
  aggregateByMonth,
  deriveLocationData,
  deriveDetectionMetrics,
  getContaminationStatus,
} from "../../utils/chartDataHelpers";


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const Dashboard = ({ theme, darkMode }) => {
  const { samples, loading, error, errorCode } = useSelector(
    (state) => state.samples
  );
  
  // Filter states
  const [filterState, setFilterState] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [states, setStates] = useState([]);

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const api = await import("../../utils/api").then(m => m.default);
        const response = await api.get("/management/states");
        setStates(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch states:", err);
      }
    };
    fetchStates();
  }, []);

  // Filter samples based on filters
  const filteredSamples = useMemo(() => {
    if (!samples) return [];
    return samples.filter(s => {
      if (filterState !== "all" && s.state?.id !== filterState) return false;
      if (filterProduct !== "all" && s.productVariant?.id !== filterProduct) return false;
      if (filterStatus !== "all" && getContaminationStatus(s).toLowerCase() !== filterStatus.toLowerCase()) return false;
      return true;
    });
  }, [samples, filterState, filterProduct, filterStatus]);

  const analytics = useMemo(() => {
    if (!filteredSamples) return {};
    const total = filteredSamples.length;
    const contaminated = filteredSamples.filter(
      (s) => getContaminationStatus(s).toLowerCase() === "contaminated"
    ).length;
    const safe = filteredSamples.filter((s) => getContaminationStatus(s).toLowerCase() === "safe").length;
    const pending = filteredSamples.filter((s) => getContaminationStatus(s).toLowerCase() === "pending").length;

    const byState = Object.entries(
      filteredSamples.reduce((acc, s) => {
        const stateName = s.state?.name || "Unknown";
        acc[stateName] = (acc[stateName] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const byProductType = Object.entries(
      filteredSamples.reduce((acc, s) => {
        const type = s.productVariant?.category?.name || s.productVariant?.displayName || "Unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const registeredVsUnregistered = [
      {
        name: "Registered",
        total: samples.length,
        contaminated: contaminated,
      },
      {
        name: "Unregistered",
        total: 0,
        contaminated: 0,
      },
    ];

    return {
      total,
      contaminated,
      safe,
      pending,
      byState,
      byProductType,
      registeredVsUnregistered,
    };
  }, [filteredSamples]);

  const exposureData = useMemo(() => aggregateByMonth(filteredSamples, 6), [filteredSamples]);
  const locationData = useMemo(
    () => deriveLocationData(filteredSamples).slice(0, 8),
    [filteredSamples]
  );
  const detectionMetrics = useMemo(
    () => deriveDetectionMetrics(filteredSamples),
    [filteredSamples]
  );

  if (error) {
    return (
      <div className="w-full flex justify-center mt-10">
        <div
          className={`border-l-4 ${
            errorCode === 401
              ? "border-red-600 bg-red-50 text-red-700"
              : "border-yellow-500 bg-yellow-50 text-yellow-700"
          } p-4 rounded shadow max-w-xl`}
        >
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {errorCode === 401 ? (
              <>
                <AlertTriangle size={20} /> Authentication Error
              </>
            ) : (
              <>
                <AlertTriangle size={20} /> Server Error
              </>
            )}
          </h2>
          <p className="mt-1 text-sm">{error}</p>
          {error?.status === 401 && (
            <button
              onClick={() => (window.location.href = "/login")}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Login Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <p className={`text-center mt-10 text-lg animate-pulse ${theme?.text}`}>
        Loading dashboard data...
      </p>
    );
  if (!samples || samples.length === 0)
    return (
      <p className={`text-center mt-10 text-lg ${theme?.text}`}>
        No samples found.
      </p>
    );

  return (
    <div className={`space-y-6 px-10 ${theme?.text}`}>
      {/* Filters Section */}
      <div
        className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-4`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="w-full">
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
            >
              <option value="all">All States</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value="all">All Products</option>
            {[...new Set(filteredSamples.map((s) => s.productVariant?.id))].filter(Boolean).map((variantId) => {
              const variant = filteredSamples.find(s => s.productVariant?.id === variantId)?.productVariant;
              return (
                <option key={variantId} value={variantId}>
                  {variant?.displayName || variant?.name || "Unknown"}
                </option>
              );
            })}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value="all">All Status</option>
            <option value="safe">Safe</option>
            <option value="moderate">Moderate</option>
            <option value="contaminated">Contaminated</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Total Samples"
          value={analytics.total}
          color="bg-blue-600"
          theme={theme}
        />
        <StatCard
          icon={AlertTriangle}
          label="Contaminated"
          value={analytics.contaminated}
          color="bg-red-600"
          subtext={`${(
            (analytics.contaminated / analytics.total) *
            100
          ).toFixed(1)}% of total`}
          theme={theme}
        />
        <StatCard
          icon={CheckCircle}
          label="Safe"
          value={analytics.safe}
          color="bg-green-600"
          subtext={`${((analytics.safe / analytics.total) * 100).toFixed(
            1
          )}% of total`}
          theme={theme}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={analytics.pending}
          color="bg-yellow-500"
          theme={theme}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}
        >
          <h3 className="text-lg font-semibold mb-4">Contamination Status Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={exposureData}>
              <defs>
                <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="safe"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSafe)"
                name="Safe Levels"
              />
              <Area
                type="monotone"
                dataKey="detected"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorDetected)"
                name="Contaminated"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}
        >
          <h3 className="text-lg font-semibold mb-4">
            Detection Capacity Metrics
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={detectionMetrics}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
              <Radar
                name="Capacity Score"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <RechartsTooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}
      >
        <h3 className="text-lg font-semibold mb-4">
          Monthly Analysis & Critical Cases
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={exposureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis yAxisId="left" stroke="#6b7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="detected"
              fill="#f59e0b"
              name="Contaminated"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="critical"
              fill="#ef4444"
              name="Critical Cases"
              radius={[8, 8, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="capacity"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Contamination Rate %"
              dot={{ r: 6, fill: "#3b82f6" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}
      >
        <h3 className="text-lg font-semibold mb-4">Location Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={locationData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis
              dataKey="location"
              type="category"
              stroke="#6b7280"
              width={120}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="exposure"
              fill="#8b5cf6"
              name="Contaminated Cases"
              radius={[0, 8, 8, 0]}
            />
            <Bar
              dataKey="capacity"
              fill="#10b981"
              name="Detection Rate"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}
        >
          <h3 className="text-lg font-semibold mb-4">
            Product Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.byProductType}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                dataKey="value"
              >
                {analytics.byProductType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}
        >
          <h3 className="text-lg font-semibold mb-4">
            Contamination Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Safe", value: analytics.safe },
                  { name: "Contaminated", value: analytics.contaminated },
                  { name: "Pending", value: analytics.pending }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
                <Cell fill="#f59e0b" />
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
