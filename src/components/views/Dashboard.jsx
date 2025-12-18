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
import api from "../../utils/api";
import {
  aggregateByMonth,
  aggregateHeavyMetals,
  aggregateProductRisk,
  aggregateGeographicRisk,
  aggregateHeavyMetalHeatmap,
  aggregateHeavyMetalProfileByProduct,
  deriveLocationData,
  calculateKPIs,
  getContaminationStatus,
} from "../../utils/chartDataHelpers";
import { CustomTooltip, CONTAMINATION_COLORS, getChartHeight } from "../../utils/chartConfig";



const Dashboard = ({ theme, darkMode }) => {
  const { samples, loading, error, errorCode } = useSelector(
    (state) => state.samples
  );
  const [localStates, setLocalStates] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [selectedProductForRadar, setSelectedProductForRadar] = useState("all");

  // adjust size of charts based on window size
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.get("/samples/states/all");
        if (response.data.success) {
          return setLocalStates(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch states:", err);
      }
    };
    fetchStates();
  }, []);

  const [filteredQueries, setFilteredQueries] = useState({
    state: "all",
    productVariant: "all",
    status: "all",
  });
  
  const filteredSamples = samples.filter((s) => {
    const sampleStatus = getContaminationStatus(s);
    const productVariantId = s.productVariant?.id || "Unknown";
    
    return (
      (filteredQueries.state == "all" ||
        s.state?.name == filteredQueries.state) &&
      (filteredQueries.productVariant == "all" ||
        productVariantId == filteredQueries.productVariant) &&
      (filteredQueries.status == "all" || sampleStatus == filteredQueries.status)
    );
  });

  const analytics = useMemo(() => {
    if (!filteredSamples) return {};
    
    return calculateKPIs(filteredSamples);
  }, [filteredSamples]);

  const exposureData = useMemo(
    () => aggregateByMonth(filteredSamples, 6),
    [filteredSamples]
  );
  const locationData = useMemo(
    () => deriveLocationData(filteredSamples).slice(0, 8),
    [filteredSamples]
  );
  
  // NEW: Heavy metal data (respects filters)
  const heavyMetalData = useMemo(
    () => aggregateHeavyMetals(filteredSamples),
    [filteredSamples]
  );
  
  // NEW: Product risk data (respects filters)
  const productRiskData = useMemo(
    () => aggregateProductRisk(filteredSamples),
    [filteredSamples]
  );
  
  // NEW: Geographic risk data (respects filters)
  const geoRiskData = useMemo(
    () => aggregateGeographicRisk(filteredSamples),
    [filteredSamples]
  );
  
  // NEW: Heavy metal heatmap data (respects filters)
  const heatmapData = useMemo(
    () => aggregateHeavyMetalHeatmap(filteredSamples),
    [filteredSamples]
  );
  
  // NEW: Heavy metal profile radar data (respects filters + product selection)
  const radarData = useMemo(
    () => aggregateHeavyMetalProfileByProduct(
      filteredSamples, 
      selectedProductForRadar !== "all" ? selectedProductForRadar : null
    ),
    [filteredSamples, selectedProductForRadar]
  );
  
  if (!navigator.onLine) {
    return (
      <div className='w-full flex justify-center mt-10'>
        <div
          className={`border-l-4 border-red-600 bg-red-50 text-red-700 p-4 rounded shadow max-w-xl`}
        >
          <h2 className='font-semibold text-lg flex items-center gap-2'>
            <AlertTriangle size={20} />
          </h2>
          <p className='mt-1 text-sm'>Check your Network Connection </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className='w-full flex justify-center mt-10'>
        <div
          className={`border-l-4 ${
            errorCode === 401
              ? "border-red-600 bg-red-50 text-red-700"
              : "border-yellow-500 bg-yellow-50 text-yellow-700"
          } p-4 rounded shadow max-w-xl`}
        >
          <h2 className='font-semibold text-lg flex items-center gap-2'>
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
          <p className='mt-1 text-sm'>{error}</p>
          {error?.status === 401 && (
            <button
              onClick={() => (window.location.href = "/login")}
              className='mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition'
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
    <div className='max-w-screen mx-auto  '>
      {/* FILTER */}
      <div
        className={`${theme?.card} rounded-lg shadow-md mb-8 border ${theme?.border} p-4`}
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='w-full max-w-full sm:max-w-[100%] '>
            <select
              value={filteredQueries.state}
              onChange={(e) =>
                setFilteredQueries((prev) => ({
                  ...prev,
                  state: e.target.value,
                }))
              }
              className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base`}
            >
              <option value='all'>All States</option>
              {localStates.length > 0 &&
                localStates.map((state) => (
                  <option key={state.id} value={state.name}>
                    {state.name}
                  </option>
                ))}
            </select>
          </div>

          <select
            value={filteredQueries.productVariant}
            onChange={(e) =>
              setFilteredQueries((prev) => ({
                ...prev,
                productVariant: e.target.value,
              }))
            }
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value='all'>All Products</option>
            {[...new Set(samples.map((s) => s.productVariant?.id))].filter(Boolean).map((variantId) => {
              const variant = samples.find(s => s.productVariant?.id === variantId)?.productVariant;
              return (
                <option key={variantId} value={variantId}>
                  {variant?.displayName || variant?.name || "Unknown"}
                </option>
              );
            })}
          </select>

          <select
            value={filteredQueries.status}
            onChange={(e) =>
              setFilteredQueries((prev) => ({
                ...prev,
                status: e.target.value,
              }))
            }
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option className='w-full' value='all'>
              All Status
            </option>
            <option className='w-full' value='safe'>
              Safe
            </option>
            <option className='w-full' value='moderate'>
              Moderate
            </option>
            <option className='w-full' value='contaminated'>
              Contaminated
            </option>
            <option className='w-full' value='pending'>
              Pending
            </option>
          </select>
        </div>
      </div>
      {/* STATS */}
      <div className={`space-y-6 px-10 ${theme?.text}`}>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatCard
            icon={Package}
            label='Total Samples'
            value={analytics.total}
            color='bg-blue-600'
            theme={theme}
          />
          <StatCard
            icon={AlertTriangle}
            label='Contaminated'
            value={analytics.contaminated}
            color='bg-red-600'
            subtext={`${(
              (analytics.contaminated / analytics.total) *
              100
            ).toFixed(1)}% of total`}
            theme={theme}
          />
          <StatCard
            icon={CheckCircle}
            label='Safe'
            value={analytics.safe}
            color='bg-green-600'
            subtext={`${((analytics.safe / analytics.total) * 100).toFixed(
              1
            )}% of total`}
            theme={theme}
          />
          <StatCard
            icon={Clock}
            label='Pending'
            value={analytics.pending}
            color='bg-yellow-500'
            theme={theme}
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div
            className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}
          >
            <h3 className='text-lg font-semibold mb-4 [@media(max-width:450px)]:text-base'>
              Contamination Status Trends
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={exposureData}>
                <defs>
                  <linearGradient
                    id='colorDetected'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='5%' stopColor={CONTAMINATION_COLORS.contaminated} stopOpacity={0.8} />
                    <stop offset='95%' stopColor={CONTAMINATION_COLORS.contaminated} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id='colorModerate' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor={CONTAMINATION_COLORS.moderate} stopOpacity={0.8} />
                    <stop offset='95%' stopColor={CONTAMINATION_COLORS.moderate} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id='colorSafe' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor={CONTAMINATION_COLORS.safe} stopOpacity={0.8} />
                    <stop offset='95%' stopColor={CONTAMINATION_COLORS.safe} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis dataKey='month' stroke='#6b7280' />
                <YAxis stroke='#6b7280' width={20} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type='monotone'
                  dataKey='safe'
                  stroke={CONTAMINATION_COLORS.safe}
                  fillOpacity={1}
                  fill='url(#colorSafe)'
                  name='Safe Samples'
                />
                <Area
                  type='monotone'
                  dataKey='moderate'
                  stroke={CONTAMINATION_COLORS.moderate}
                  fillOpacity={1}
                  fill='url(#colorModerate)'
                  name='Moderate Contamination'
                />
                <Area
                  type='monotone'
                  dataKey='detected'
                  stroke={CONTAMINATION_COLORS.contaminated}
                  fillOpacity={1}
                  fill='url(#colorDetected)'
                  name='Contaminated'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div
            className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}
          >
            <h3 className='text-lg font-semibold mb-4 [@media(max-width:450px)]:text-base'>
              Heavy Metal Contamination Profile by Product
            </h3>
            <div className='mb-4'>
              <label className='text-sm font-medium mb-2 block'>Select Product Variant:</label>
              <select
                value={selectedProductForRadar}
                onChange={(e) => setSelectedProductForRadar(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500 text-sm`}
              >
                <option value='all'>All Products (Combined)</option>
                {[...new Set(filteredSamples.map((s) => s.productVariant?.id))].filter(Boolean).map((variantId) => {
                  const variant = filteredSamples.find(s => s.productVariant?.id === variantId)?.productVariant;
                  return (
                    <option key={variantId} value={variantId}>
                      {variant?.displayName || variant?.name || "Unknown"}
                    </option>
                  );
                })}
              </select>
            </div>
            <ResponsiveContainer width='100%' height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke='#d1d5db' />
                <PolarAngleAxis dataKey='metal' stroke='#6b7280' tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke='#6b7280' />
                <Radar 
                  name='Contamination Rate (%)'
                  dataKey='concentration' 
                  stroke='#ef4444'
                  fill='#ef4444'
                  fillOpacity={0.6}
                />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className='bg-white p-3 border border-gray-300 rounded shadow-lg'>
                          <p className='font-semibold text-gray-800'>{data.metal}</p>
                          <p className='text-sm text-red-600'>Contamination: {data.concentration}%</p>
                          <p className='text-xs text-gray-600'>Contaminated: {data.contaminated}</p>
                          <p className='text-xs text-gray-600'>Moderate: {data.moderate}</p>
                          <p className='text-xs text-gray-600'>Safe: {data.safe}</p>
                          <p className='text-xs text-gray-600'>Total: {data.total}</p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
            <p className='text-xs text-gray-500 mt-2'>Shows concentration levels (0-100%) for all 10 heavy metals. Each axis represents a metal type. Data respects current filters.</p>
          </div>
        </div>

        {/* NEW CHART: Product Risk Profile */}
        <div className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}>
          <h3 className='text-lg font-semibold mb-4 [@media(max-width:450px)]:text-base'>
            Product Category Risk Profile
          </h3>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className={`${theme?.bg === 'bg-gray-100' ? 'bg-gray-100' : 'bg-gray-800'}`}>
                <tr>
                  <th className='px-4 py-2 text-left font-semibold'>Category</th>
                  <th className='px-4 py-2 text-center font-semibold'>Total</th>
                  <th className='px-4 py-2 text-center font-semibold'>Safe</th>
                  <th className='px-4 py-2 text-center font-semibold'>Moderate</th>
                  <th className='px-4 py-2 text-center font-semibold'>Contaminated</th>
                  <th className='px-4 py-2 text-center font-semibold'>Risk %</th>
                </tr>
              </thead>
              <tbody>
                {productRiskData.map((cat, idx) => (
                  <tr key={idx} className={`${idx % 2 === 0 ? '' : theme?.bg === 'bg-gray-100' ? 'bg-gray-50' : 'bg-gray-900'}`}>
                    <td className='px-4 py-2 font-medium'>{cat.name}</td>
                    <td className='px-4 py-2 text-center text-blue-600'>{cat.totalSamples}</td>
                    <td className='px-4 py-2 text-center text-green-600'>{cat.safe}</td>
                    <td className='px-4 py-2 text-center text-amber-600'>{cat.moderate}</td>
                    <td className='px-4 py-2 text-center text-red-600'>{cat.contaminated}</td>
                    <td className='px-4 py-2 text-center'>
                      <span className={`px-2 py-1 rounded text-white text-xs font-semibold`}
                        style={{backgroundColor: cat.contaminationRate > 50 ? '#ef4444' : cat.contaminationRate > 30 ? '#f59e0b' : '#10b981'}}>
                        {cat.contaminationRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className='text-xs text-gray-500 mt-3'>Shows product category contamination rates. Click to view variant details.</p>
        </div>

        {/* NEW CHART: Geographic Risk Map */}
        <div className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}>
          <h3 className='text-lg font-semibold mb-4 [@media(max-width:450px)]:text-base'>
            Geographic Risk Distribution (State/LGA)
          </h3>
          <div className='space-y-4'>
            {geoRiskData.map((state, idx) => (
              <div key={idx} className='border rounded-lg p-4'>
                <div className='flex justify-between items-center mb-3'>
                  <div>
                    <h4 className='font-semibold'>{state.state}</h4>
                    <p className='text-xs text-gray-500'>{state.totalSamples} samples</p>
                  </div>
                  <div className='text-right'>
                    <div className='text-2xl font-bold' style={{color: state.contaminationRate > 50 ? '#ef4444' : state.contaminationRate > 30 ? '#f59e0b' : '#10b981'}}>
                      {state.contaminationRate}%
                    </div>
                    <p className='text-xs text-gray-500'>Contamination</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className='w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden'>
                  <div
                    className='h-full transition-all duration-300'
                    style={{
                      width: `${state.contaminationRate}%`,
                      backgroundColor: state.contaminationRate > 50 ? '#ef4444' : state.contaminationRate > 30 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>
                {/* LGA breakdown */}
                <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                  {state.lgas.slice(0, 6).map((lga, lgaIdx) => (
                    <div key={lgaIdx} className='text-xs p-2 bg-gray-50 rounded'>
                      <p className='font-semibold truncate'>{lga.name}</p>
                      <p className='text-gray-600'>{lga.totalSamples} samples</p>
                      <p style={{color: lga.contaminationRate > 50 ? '#ef4444' : lga.contaminationRate > 30 ? '#f59e0b' : '#10b981'}} className='font-semibold'>
                        {lga.contaminationRate}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className='text-xs text-gray-500 mt-3'>Shows state-level risk with LGA breakdown. Data respects current filters.</p>
        </div>

        {/* NEW CHART: Heavy Metal Heatmap */}
        <div className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}>
          <h3 className='text-lg font-semibold mb-4 [@media(max-width:450px)]:text-base'>
            Heavy Metal Contamination Heatmap (by State)
          </h3>
          <div className='overflow-x-auto'>
            <table className='w-full text-xs border-collapse'>
              <thead>
                <tr>
                  <th className='px-3 py-2 text-left font-semibold border border-gray-300'>State</th>
                  {heatmapData.metals.map((metal) => (
                    <th key={metal} className='px-3 py-2 text-center font-semibold border border-gray-300 bg-gray-100 text-gray-700'>
                      {metal}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.data.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? '' : theme?.bg === 'bg-gray-100' ? 'bg-gray-50' : 'bg-gray-900'}>
                    <td className='px-3 py-2 font-medium border border-gray-300'>{row.state}</td>
                    {heatmapData.metals.map((metal) => {
                      const rate = row[metal] || 0;
                      let bgColor = '#10b981'; // Green for safe
                      if (rate > 50) bgColor = '#ef4444'; // Red for high contamination
                      else if (rate > 30) bgColor = '#f59e0b'; // Amber for moderate
                      else if (rate > 10) bgColor = '#fbbf24'; // Light amber
                      
                      return (
                        <td
                          key={`${row.state}-${metal}`}
                          className='px-3 py-2 text-center border border-gray-300 font-semibold text-white transition-all hover:opacity-80'
                          style={{ backgroundColor: bgColor }}
                          title={`${row.state} - ${metal}: ${rate}% contamination (${row[`${metal}_count`]} samples)`}
                        >
                          {rate}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-4 flex flex-wrap gap-4 text-xs'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 rounded' style={{backgroundColor: '#10b981'}}></div>
              <span>Safe (&lt;10%)</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 rounded' style={{backgroundColor: '#fbbf24'}}></div>
              <span>Low (10-30%)</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 rounded' style={{backgroundColor: '#f59e0b'}}></div>
              <span>Moderate (30-50%)</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 rounded' style={{backgroundColor: '#ef4444'}}></div>
              <span>High (&gt;50%)</span>
            </div>
          </div>
          <p className='text-xs text-gray-500 mt-3'>Shows contamination rate (%) for each heavy metal by state. Data respects current filters.</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
