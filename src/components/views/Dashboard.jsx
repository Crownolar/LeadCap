import React, { useMemo } from "react";
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

const monthNamesShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function safeGet(obj, path, fallback = undefined) {
  try {
    return (
      path
        .split(".")
        .reduce((a, b) => (a && a[b] !== undefined ? a[b] : undefined), obj) ??
      fallback
    );
  } catch {
    return fallback;
  }
}

function aggregateByMonth(samples, monthsBack = 6) {
  const now = new Date();
  const months = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: monthNamesShort[d.getMonth()],
      detected: 0,
      safe: 0,
      critical: 0,
      capacity: 0,
      count: 0,
    });
  }
  const monthIndex = (year, month) => `${year}-${month}`;

  samples.forEach((s) => {
    const dateStr =
      safeGet(s, "createdAt") ??
      safeGet(s, "sampleDate") ??
      safeGet(s, "date") ??
      null;
    let d;
    if (dateStr) {
      d = new Date(dateStr);
      if (isNaN(d)) d = null;
    }
    const placeKey = d
      ? monthIndex(d.getFullYear(), d.getMonth() + 1)
      : months[months.length - 1].key;
    const monthObj =
      months.find((m) => m.key === placeKey) ?? months[months.length - 1];

    const status = (s.status || "").toLowerCase();
    if (["contaminated", "detected", "exposed"].includes(status)) {
      monthObj.detected += 1;
    } else if (status === "safe") {
      monthObj.safe += 1;
    } else if (status === "critical" || s.isCritical) {
      monthObj.critical += 1;
    } else {
      const lvl = safeGet(s, "leadLevel");
      if (typeof lvl === "number") {
        if (lvl > 70) monthObj.critical += 1;
        else if (lvl > 30) monthObj.detected += 1;
        else monthObj.safe += 1;
      }
    }

    const cap = safeGet(s, "detectionCapacity");
    if (typeof cap === "number") {
      monthObj.capacity += cap;
      monthObj.count += 1;
    }
  });

  return months.map((m) => ({
    month: m.label,
    detected: m.detected,
    safe: m.safe,
    critical: m.critical,
    capacity:
      m.count > 0
        ? Math.round(m.capacity / m.count)
        : Math.round(
            (m.detected / Math.max(1, m.detected + m.safe + m.critical)) * 100
          ) || 80,
  }));
}

function deriveLocationData(samples) {
  const byLocation = samples.reduce((acc, s) => {
    const loc =
      safeGet(s, "location") ??
      safeGet(s, "campus") ??
      safeGet(s, "site") ??
      safeGet(s, "stateName") ??
      "Unknown";
    acc[loc] = acc[loc] || { exposure: 0, capacityValues: [], population: 0 };
    const status = (s.status || "").toLowerCase();
    if (["contaminated", "detected", "exposed"].includes(status))
      acc[loc].exposure += 1;
    const cap = safeGet(s, "detectionCapacity");
    if (typeof cap === "number") acc[loc].capacityValues.push(cap);
    const pop =
      safeGet(s, "population") ?? safeGet(s, "sitePopulation") ?? null;
    if (typeof pop === "number")
      acc[loc].population = Math.max(acc[loc].population, pop);
    return acc;
  }, {});

  return Object.entries(byLocation).map(([location, v]) => ({
    location,
    exposure: v.exposure,
    capacity: v.capacityValues.length
      ? Math.round(
          v.capacityValues.reduce((a, b) => a + b, 0) / v.capacityValues.length
        )
      : 80,
    population: v.population || Math.max(50, v.exposure * 10),
  }));
}

function deriveDetectionMetrics(samples) {
  const metrics = {
    "Response Time": null,
    Accuracy: null,
    Coverage: null,
    Equipment: null,
    Training: null,
  };
  let counts = 0;

  samples.forEach((s) => {
    if (typeof safeGet(s, "responseTime") === "number") {
      metrics["Response Time"] =
        (metrics["Response Time"] || 0) + safeGet(s, "responseTime");
      counts++;
    }
    if (typeof safeGet(s, "accuracy") === "number") {
      metrics["Accuracy"] = (metrics["Accuracy"] || 0) + safeGet(s, "accuracy");
      counts++;
    }
    if (typeof safeGet(s, "coverage") === "number") {
      metrics["Coverage"] = (metrics["Coverage"] || 0) + safeGet(s, "coverage");
      counts++;
    }
    if (typeof safeGet(s, "equipment") === "number") {
      metrics["Equipment"] =
        (metrics["Equipment"] || 0) + safeGet(s, "equipment");
      counts++;
    }
    if (typeof safeGet(s, "training") === "number") {
      metrics["Training"] = (metrics["Training"] || 0) + safeGet(s, "training");
      counts++;
    }
  });

  Object.keys(metrics).forEach((k) => {
    if (typeof metrics[k] === "number")
      metrics[k] = Math.round(metrics[k] / Math.max(1, counts));
    else metrics[k] = null;
  });

  const total = samples.length || 1;
  const contaminated = samples.filter(
    (s) => (s.status || "").toLowerCase() === "contaminated"
  ).length;
  if (!metrics["Accuracy"])
    metrics["Accuracy"] = Math.max(
      50,
      100 - Math.round((contaminated / total) * 100)
    );
  if (!metrics["Coverage"])
    metrics["Coverage"] = Math.min(100, 60 + Math.round(total / 50));
  if (!metrics["Equipment"]) metrics["Equipment"] = 75;
  if (!metrics["Training"]) metrics["Training"] = 80;
  if (!metrics["Response Time"]) metrics["Response Time"] = 85;

  return Object.entries(metrics).map(([metric, value]) => ({ metric, value }));
}

const Dashboard = ({ theme, darkMode }) => {
  const { samples, loading, error, errorCode } = useSelector(
    (state) => state.samples
  );

  const analytics = useMemo(() => {
    if (!samples) return {};
    const total = samples.length;
    const contaminated = samples.filter(
      (s) => s.status === "contaminated"
    ).length;
    const safe = samples.filter((s) => s.status === "safe").length;
    const pending = samples.filter((s) => s.status === "pending").length;

    const byState = Object.entries(
      samples.reduce((acc, s) => {
        const stateName = s.stateName || s.state || "Unknown";
        acc[stateName] = (acc[stateName] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const byProductType = Object.entries(
      samples.reduce((acc, s) => {
        const type = s.productType || "Unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const registeredVsUnregistered = [
      {
        name: "Registered",
        total: samples.filter((s) => s.isRegistered)?.length,
        contaminated: samples.filter(
          (s) => s.isRegistered && s.status === "contaminated"
        )?.length,
      },
      {
        name: "Unregistered",
        total: samples.filter((s) => !s.isRegistered)?.length,
        contaminated: samples.filter(
          (s) => !s.isRegistered && s.status === "contaminated"
        )?.length,
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
  }, [samples]);

  const exposureData = useMemo(() => aggregateByMonth(samples, 6), [samples]);
  const locationData = useMemo(
    () => deriveLocationData(samples).slice(0, 8),
    [samples]
  );
  const detectionMetrics = useMemo(
    () => deriveDetectionMetrics(samples),
    [samples]
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
          <h3 className="text-lg font-semibold mb-4">Lead Exposure Trends</h3>
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
                name="Elevated Exposure"
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
              name="Total Detected"
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
              name="Detection Capacity %"
              dot={{ r: 6, fill: "#3b82f6" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}
      >
        <h3 className="text-lg font-semibold mb-4">Campus Location Analysis</h3>
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
              name="Exposure Cases"
              radius={[0, 8, 8, 0]}
            />
            <Bar
              dataKey="capacity"
              fill="#10b981"
              name="Capacity Score"
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
            Registered vs Unregistered
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.registeredVsUnregistered}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                dataKey="total"
              >
                {analytics.registeredVsUnregistered.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
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
