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

import {
  aggregateByMonth,
  deriveLocationData,
  deriveDetectionMetrics,
  getContaminationStatus,
} from "../../utils/chartDataHelpers";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import { useEnums } from "../../context/EnumsContext";

const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`${
          theme?.card || "bg-white"
        } p-2 sm:p-3 md:p-4 rounded-lg shadow-lg border ${
          theme?.border || "border-gray-200"
        }`}
      >
        <p
          className={`font-semibold text-xs sm:text-sm ${
            theme?.text || "text-gray-800"
          } mb-1 sm:mb-2`}
        >
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className='text-xs sm:text-sm'
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [filterState, setFilterState] = useState("all");
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [filterProduct, setFilterProduct] = useState("all");

  const [states, setStates] = useState([]);
  const [stats, setStats] = useState(null);
  const { theme } = useTheme();

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const api = await import("../../utils/api").then((m) => m.default);
        const response = await api.get("/management/states", {
          params: { activeOnly: "true" },
        });
        setStates(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch states:", err);
      }
    };
    fetchStates();
  }, []);

  const enums = useEnums();

  useEffect(() => {
    const dateTo = new Date().toISOString().split("T")[0];
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    const dateFrom = date.toISOString().split("T")[0];

    setLoadingStats(true);
    setLoadingError(null);
    api
      .get(`/samples/stats?from=${dateFrom}&to=${dateTo}`)
      .then((res) => setStats(res.data.data))
      .catch(() => setLoadingError(true))
      .finally(() => setLoadingStats(false));
  }, []);

  const calculateAnalytics = () => {
    let total;
    let contaminated;
    let safe;
    let pending;
    if (filterState == "all") {
      total = stats?.totalSamples;
      contaminated = stats?.contaminated;
      safe = stats?.safe;
      pending = stats?.pending;
    } else {
      const stateStats = stats?.byState?.filter((s) => s.state == filterState);
      if (stateStats.length > 0) {
        total = stateStats[0]?.count;
        contaminated = stateStats[0]?.contaminated;
        safe = stateStats[0]?.safe;
        pending = stateStats[0]?.pending;
      } else {
        total = 0;
        contaminated = 0;
        safe = 0;
        pending = 0;
      }
    }

    const byState = stats?.byState?.map((s) => ({
      name: s?.state,
      value: s?.count,
    }));

    const productTypeStats =
      stats?.byProductVariant?.reduce((acc, s) => {
        const type = s?.productCategoryName || "Unknown";
        acc[type] = (acc[type] || 0) + (s?.count || 0);
        return acc;
      }, {}) || {};

    const byProductType = Object.entries(productTypeStats).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    const byProduct = stats?.byProductVariant?.map((s) => ({
      name: s?.productVariantName || "Unknown",
      value: s?.count,
    }));

    const registeredVsUnregistered = [
      {
        name: "Registered",
        total: stats?.total,
        contaminated: stats?.contaminated,
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
      byProduct,
      registeredVsUnregistered,
    };
  };

  const analytics = calculateAnalytics();
  const exposureData = aggregateByMonth(stats);
  const locationData = deriveLocationData(stats);
  const detectionMetrics = deriveDetectionMetrics(stats);

  return (
    <div
      className={`space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6 lg:px-10 ${theme.text} transition-colors duration-300`}
    >
      {/* Filters Section */}

      <div
        className={`${theme.card} rounded-lg shadow-md border ${theme?.border} p-3 sm:p-4`}
      >
        <div className='grid grid-cols-1  gap-3 sm:gap-4'>
          <div className='w-full'>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className={`w-full px-3 py-2 sm:px-4 text-sm sm:text-base border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
            >
              <option value='all'>All States</option>
              {states.map((state) => (
                <option key={state.id} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className={`w-full px-3 py-2 sm:px-4 text-sm sm:text-base border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value='all'>All Products</option>
            {enums?.productCategories?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.displayName || v.name || "Unknown"}
              </option>
            ))}
          </select> */}

          {/* <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`w-full px-3 py-2 sm:px-4 text-sm sm:text-base border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500 sm:col-span-2 lg:col-span-1`}
          >
            <option value='all'>All Status</option>
            <option value='safe'>Safe</option>
            <option value='moderate'>Moderate</option>
            <option value='contaminated'>Contaminated</option>
            <option value='pending'>Pending</option>
          </select> */}
        </div>
      </div>
      {/* Stats Cards (server-side stats when available, else client analytics) */}
      <h1 className='text-base sm:text-2xl font-semibold mb-3 sm:mb-4'>
        {filterState.charAt(0).toUpperCase() + filterState.slice(1)} Stats
      </h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
        <StatCard
          icon={Package}
          label='Total Samples'
          value={analytics.total ?? "--"}
          color='bg-blue-600'
          theme={theme}
        />
        <StatCard
          icon={AlertTriangle}
          label='Contaminated'
          value={analytics?.contaminated ?? "--"}
          color='bg-red-600'
          subtext={`${(
            ((analytics?.contaminated ?? 0) / (analytics.total || 1)) *
            100
          ).toFixed(1)}% of total`}
          theme={theme}
        />
        <StatCard
          icon={CheckCircle}
          label='Safe'
          value={analytics.safe ?? "--"}
          color='bg-green-600'
          subtext={`${(
            ((analytics.safe ?? 0) / (analytics.total || 1)) *
            100
          ).toFixed(1)}% of total`}
          theme={theme}
        />
        <StatCard
          icon={Clock}
          label='Pending'
          value={analytics?.pending ?? "--"}
          color='bg-yellow-500'
          theme={theme}
        />
      </div>
      {loadingError && (
        <div className='w-full flex justify-center mt-6 sm:mt-10 px-3 sm:px-4'>
          <div
            className={`border-l-4 border-red-600 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 sm:p-4 rounded shadow max-w-xl w-full`}
          >
            <h2 className='font-semibold text-base sm:text-lg flex items-center gap-2'>
              <>
                <AlertTriangle size={18} className='sm:w-5 sm:h-5' /> Server
                Error.Try refreshing.
              </>
            </h2>
          </div>
        </div>
      )}
      {loadingStats && (
        <p
          className={`text-center mt-6 sm:mt-10 text-base sm:text-lg animate-pulse ${theme?.text} px-4 pt-[30px] pb-[30px]`}
        >
          Loading dashboard data...
        </p>
      )}

      {/* Charts Grid 1: Area & Radar */}
      {!loadingStats && !loadingError && (
        <>
          <h2 className='text-base sm:text-3xl font-semibold mb-3 sm:mb-4'>
            General Overview
          </h2>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
            <div
              className={`${theme?.card} rounded-lg shadow-md p-4 sm:p-6 border ${theme?.border}`}
            >
              <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
                Contamination Status Trends
              </h3>
              <ResponsiveContainer
                width='100%'
                height={250}
                className='sm:h-[300px]'
              >
                <AreaChart data={exposureData}>
                  <defs>
                    <linearGradient
                      id='colorDetected'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='5%' stopColor='#ef4444' stopOpacity={0.8} />
                      <stop
                        offset='95%'
                        stopColor='#ef4444'
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id='colorSafe' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
                      <stop
                        offset='95%'
                        stopColor='#10b981'
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis
                    dataKey='month'
                    stroke='#6b7280'
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke='#6b7280' tick={{ fontSize: 12 }} />
                  <RechartsTooltip content={<CustomTooltip theme={theme} />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area
                    type='monotone'
                    dataKey='safe'
                    stroke='#10b981'
                    fillOpacity={1}
                    fill='url(#colorSafe)'
                    name='Safe Levels'
                  />
                  <Area
                    type='monotone'
                    dataKey='detected'
                    stroke='#ef4444'
                    fillOpacity={1}
                    fill='url(#colorDetected)'
                    name='Contaminated'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div
              className={`${theme?.card} rounded-lg shadow-md p-4 sm:p-6 border ${theme?.border}`}
            >
              <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
                Detection Capacity Metrics
              </h3>
              <ResponsiveContainer
                width='100%'
                height={250}
                className='sm:h-[300px]'
              >
                <RadarChart data={detectionMetrics}>
                  <PolarGrid stroke='#e5e7eb' />
                  <PolarAngleAxis
                    dataKey='metric'
                    stroke='#6b7280'
                    tick={{ fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    stroke='#6b7280'
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    name='Capacity Score'
                    dataKey='value'
                    stroke='#3b82f6'
                    fill='#3b82f6'
                    fillOpacity={0.6}
                  />
                  <RechartsTooltip content={<CustomTooltip theme={theme} />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Composed Chart */}
          <div
            className={`${theme?.card} rounded-lg shadow-md p-4 sm:p-6 border ${theme?.border}`}
          >
            <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
              Monthly Analysis & Critical Cases
            </h3>
            <ResponsiveContainer
              width='100%'
              height={300}
              className='sm:h-[350px] md:h-[400px]'
            >
              <ComposedChart data={exposureData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis
                  dataKey='month'
                  stroke='#6b7280'
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId='left'
                  stroke='#6b7280'
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId='right'
                  orientation='right'
                  stroke='#6b7280'
                  tick={{ fontSize: 11 }}
                />
                <RechartsTooltip content={<CustomTooltip theme={theme} />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar
                  yAxisId='left'
                  dataKey='detected'
                  fill='#f59e0b'
                  name='Contaminated'
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  yAxisId='left'
                  dataKey='critical'
                  fill='#ef4444'
                  name='Critical Cases'
                  radius={[8, 8, 0, 0]}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='capacity'
                  stroke='#3b82f6'
                  strokeWidth={2}
                  name='Contamination Rate %'
                  dot={{ r: 4, fill: "#3b82f6" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Location Analysis */}
          <div
            className={`${theme?.card} rounded-lg shadow-md p-4 sm:p-6 border ${theme?.border}`}
          >
            <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
              Location Analysis
            </h3>
            <ResponsiveContainer
              width='100%'
              height={300}
              className='sm:h-[350px] md:h-[400px]'
            >
              <BarChart data={locationData} layout='vertical'>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis type='number' stroke='#6b7280' tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey='location'
                  type='category'
                  stroke='#6b7280'
                  width={50}
                  tick={{ fontSize: 10 }}
                  className='sm:w-[100px] md:w-[120px]'
                />
                <RechartsTooltip content={<CustomTooltip theme={theme} />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar
                  dataKey='exposure'
                  fill='#8b5cf6'
                  name='Contaminated Cases'
                  radius={[0, 8, 8, 0]}
                />
                <Bar
                  dataKey='capacity'
                  fill='#10b981'
                  name='Detection Rate'
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* bar charts for products  */}
          <div
            className={`${theme?.card} rounded-lg shadow-md p-4 sm:p-6  border ${theme?.border} overflow-x-auto`}
          >
            <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
              Product type
            </h3>
            <ResponsiveContainer width='100%' height={500}>
              <BarChart
                data={analytics?.byProduct ?? [{ name: "unknown", value: 100 }]}
                layout='vertical'
              >
                <CartesianGrid vertical={true} horizontal={false} />

                <XAxis type='number' dataKey='value' />
                <YAxis
                  type='category'
                  dataKey='name'
                  width={50}
                  tick={{ fontSize: 10 }}
                />
                <RechartsTooltip />
                <Bar
                  dataKey='value'
                  fill='#4F46E5'
                  barSize={30}
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Charts Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
            <div
              className={`${theme?.card} rounded-lg shadow-md p-4 sm:p-6 border ${theme?.border}`}
            >
              <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
                Product Type Distribution
              </h3>
              <ResponsiveContainer
                width='100%'
                height={250}
                className='sm:h-[300px]'
              >
                <PieChart>
                  <Pie
                    data={
                      Array.isArray(analytics?.byProductType) &&
                      analytics.byProductType.length > 0
                        ? analytics.byProductType
                        : [{ name: "No Data", value: 100 }]
                    }
                    cx='50%'
                    cy='50%'
                    outerRadius={80}
                    label={(entry) => entry.name}
                    labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                    dataKey='value'
                    stroke='none'
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
              className={`${theme?.card} rounded-lg shadow-md p-4 sm:p-6 border ${theme?.border}`}
            >
              <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
                Contamination Distribution
              </h3>
              <ResponsiveContainer
                width='100%'
                height={250}
                className='sm:h-[300px]'
              >
                <PieChart>
                  <Pie
                    data={
                      !stats?.safe && !stats?.contaminated && !stats?.pending
                        ? [{ name: "No Data", value: 100 }]
                        : [
                            { name: "Safe", value: stats?.safe ?? 100 },
                            {
                              name: "Contaminated",
                              value: stats?.contaminated ?? 100,
                            },
                            { name: "Pending", value: stats?.pending ?? 100 },
                          ]
                    }
                    cx='50%'
                    cy='50%'
                    outerRadius={80}
                    label={(entry) => {
                      if (entry.value) {
                        return entry.name;
                      }
                      return null;
                    }}
                    labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                    dataKey='value'
                    stroke='none'
                  >
                    <Cell fill='#10b981' />
                    <Cell fill='#ef4444' />
                    <Cell fill='#f59e0b' />
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
