import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Filter,
  Map,
  RefreshCw,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";
import {
  aggregateByMonth,
  deriveLocationData,
} from "../utils/chartDataHelpers";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const COLORS = {
  safe: "#10b981",
  contaminated: "#ef4444",
  pending: "#f59e0b",
  primary: "#0f766e",
  grid: "#e5e7eb",
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "--";
  return new Intl.NumberFormat().format(value);
};

const getValue = (item, keys, fallback = 0) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }

  return fallback;
};

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                  */
/* -------------------------------------------------------------------------- */

const Surface = ({ children, theme, className = "" }) => (
  <section
    className={[
      theme.card,
      "border",
      theme.border,
      "rounded-2xl",
      "shadow-sm",
      className,
    ].join(" ")}
  >
    {children}
  </section>
);

const SectionHeading = ({ title, subtitle, theme }) => (
  <div className='mb-4'>
    <h2 className={`text-base sm:text-lg font-semibold ${theme.text}`}>
      {title}
    </h2>

    {subtitle && (
      <p className={`mt-1 text-xs sm:text-sm ${theme.textMuted}`}>{subtitle}</p>
    )}
  </div>
);

const KpiCard = ({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  note,
  theme,
}) => {
  const styles = {
    neutral: {
      icon: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      accent: "bg-slate-400",
    },
    safe: {
      icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      accent: "bg-emerald-500",
    },
    danger: {
      icon: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
      accent: "bg-red-500",
    },
    warning: {
      icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      accent: "bg-amber-500",
    },
  };

  const style = styles[tone] || styles.neutral;

  return (
    <Surface theme={theme} className='relative overflow-hidden p-4 sm:p-5'>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.accent}`} />

      <div className='flex items-start justify-between gap-3 pl-1'>
        <div className='min-w-0'>
          <p className={`text-xs font-medium ${theme.textMuted}`}>{label}</p>

          <p
            className={`mt-2 text-2xl sm:text-3xl font-bold tracking-tight ${theme.text}`}
          >
            {formatNumber(value)}
          </p>

          {note && (
            <p className={`mt-1.5 text-[11px] ${theme.textMuted}`}>{note}</p>
          )}
        </div>

        <div
          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${style.icon}`}
        >
          <Icon className='w-[18px] h-[18px]' />
        </div>
      </div>
    </Surface>
  );
};

const EmptyState = ({ message, theme }) => (
  <div
    className={`h-[250px] flex flex-col items-center justify-center text-center ${theme.textMuted}`}
  >
    <Database className='w-7 h-7 opacity-40' />

    <p className='mt-3 text-sm'>{message}</p>
  </div>
);

const ChartTooltip = ({ active, payload, label, theme }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={`${theme.card} border ${theme.border} rounded-xl shadow-xl px-3 py-2.5`}
    >
      <p className={`text-xs font-semibold ${theme.text}`}>{label}</p>

      <div className='mt-1.5 space-y-1'>
        {payload.map((entry, index) => (
          <div
            key={`${entry.name}-${index}`}
            className='flex items-center justify-between gap-5'
          >
            <span className={`text-[11px] ${theme.textMuted}`}>
              {entry.name}
            </span>

            <span
              className='text-xs font-semibold'
              style={{ color: entry.color }}
            >
              {formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

const Dashboard = () => {
  const { theme } = useTheme();

  const [stats, setStats] = useState(null);
  const [states, setStates] = useState([]);
  const [filterState, setFilterState] = useState("all");

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* API                                                                      */
  /* ------------------------------------------------------------------------ */

  const fetchStates = async () => {
    try {
      const response = await api.get("/management/states", {
        params: {
          activeOnly: "true",
        },
      });

      setStates(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch states:", error);
    }
  };

  const fetchStats = async () => {
    const dateTo = new Date().toISOString().split("T")[0];

    const dateFromDate = new Date();
    dateFromDate.setMonth(dateFromDate.getMonth() - 6);

    const dateFrom = dateFromDate.toISOString().split("T")[0];

    setLoadingStats(true);
    setLoadingError(false);

    try {
      const response = await api.get(
        `/samples/stats?from=${dateFrom}&to=${dateTo}`,
      );

      setStats(response.data?.data || null);
    } catch (error) {
      console.error("Failed to fetch dashboard statistics:", error);
      setLoadingError(true);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStates();
    fetchStats();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Analytics                                                                */
  /* ------------------------------------------------------------------------ */

  const analytics = useMemo(() => {
    let total = 0;
    let safe = 0;
    let contaminated = 0;
    let pending = 0;

    if (filterState === "all") {
      total = stats?.totalSamples || 0;
      safe = stats?.safe || 0;
      contaminated = stats?.contaminated || 0;
      pending = stats?.pending || 0;
    } else {
      const selected = stats?.byState?.find(
        (item) => item.state === filterState,
      );

      total = selected?.count || 0;
      safe = selected?.safe || 0;
      contaminated = selected?.contaminated || 0;
      pending = selected?.pending || 0;
    }

    return {
      total,
      safe,
      contaminated,
      pending,
    };
  }, [stats, filterState]);

  const trendData = useMemo(() => {
    return aggregateByMonth(stats) || [];
  }, [stats]);

  const locationData = useMemo(() => {
    return deriveLocationData(stats) || [];
  }, [stats]);

  const riskData = useMemo(
    () =>
      [
        {
          name: "Safe",
          value: analytics.safe,
          color: COLORS.safe,
        },
        {
          name: "Contaminated",
          value: analytics.contaminated,
          color: COLORS.contaminated,
        },
        {
          name: "Pending",
          value: analytics.pending,
          color: COLORS.pending,
        },
      ].filter((item) => item.value > 0),
    [analytics],
  );

  const safeRate =
    analytics.total > 0
      ? ((analytics.safe / analytics.total) * 100).toFixed(1)
      : "0.0";

  const contaminationRate =
    analytics.total > 0
      ? ((analytics.contaminated / analytics.total) * 100).toFixed(1)
      : "0.0";

  /* ------------------------------------------------------------------------ */
  /* Recent samples                                                           */
  /* ------------------------------------------------------------------------ */

  const recentSamples = useMemo(() => {
    /*
     * The current /samples/stats endpoint does not expose individual
     * recent-sample records. Therefore we intentionally do not fabricate
     * sample data here.
     *
     * This section becomes the integration point for the existing samples
     * endpoint when it is connected.
     */
    return stats?.recentSamples || stats?.recent || [];
  }, [stats]);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className={`min-h-full ${theme.text} transition-colors duration-300`}>
      <div className='max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-6'>
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <header className='flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4'>
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400`}
            >
              Dashboard
            </p>

            <h1
              className={`mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight ${theme.text}`}
            >
              Environmental Lead Exposure Intelligence
            </h1>

            <p className={`mt-1.5 text-sm ${theme.textMuted}`}>
              Monitor sample collection, laboratory outcomes and exposure risk.
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-2'>
            {/* Period / state filter */}
            <div className='relative'>
              <Filter
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`}
              />

              <select
                value={filterState}
                onChange={(event) => setFilterState(event.target.value)}
                className={`w-full sm:w-[190px] appearance-none pl-9 pr-8 py-2.5 rounded-xl border ${theme.border} ${theme.input} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30`}
              >
                <option value='all'>Last 6 months</option>

                {states.map((state) => (
                  <option key={state.id} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type='button'
              onClick={fetchStats}
              disabled={loadingStats}
              className='inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-60'
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingStats ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Error                                                            */}
        {/* ---------------------------------------------------------------- */}

        {loadingError && (
          <div className='rounded-2xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 p-4'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='w-5 h-5 shrink-0 text-red-600 dark:text-red-400' />

              <div>
                <p className='text-sm font-semibold text-red-700 dark:text-red-300'>
                  Dashboard data could not be loaded.
                </p>

                <p className='mt-1 text-xs text-red-600/80 dark:text-red-300/70'>
                  Check the server connection and try refreshing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* KPI Cards                                                        */}
        {/* ---------------------------------------------------------------- */}

        <section className='grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4'>
          <KpiCard
            theme={theme}
            label='Total Samples'
            value={analytics.total}
            icon={Database}
            tone='neutral'
            note='Collected samples'
          />

          <KpiCard
            theme={theme}
            label='Safe'
            value={analytics.safe}
            icon={ShieldCheck}
            tone='safe'
            note={`${safeRate}% of total`}
          />

          <KpiCard
            theme={theme}
            label='Contaminated'
            value={analytics.contaminated}
            icon={AlertTriangle}
            tone='danger'
            note={`${contaminationRate}% of total`}
          />

          <KpiCard
            theme={theme}
            label='Pending'
            value={analytics.pending}
            icon={Clock3}
            tone='warning'
            note='Awaiting final result'
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Loading                                                           */}
        {/* ---------------------------------------------------------------- */}

        {loadingStats ? (
          <Surface
            theme={theme}
            className='p-12 flex flex-col items-center justify-center'
          >
            <RefreshCw className='w-6 h-6 animate-spin text-emerald-500' />

            <p className={`mt-3 text-sm ${theme.textMuted}`}>
              Loading environmental intelligence...
            </p>
          </Surface>
        ) : (
          <>
            {/* ------------------------------------------------------------ */}
            {/* Trend + Risk                                                  */}
            {/* ------------------------------------------------------------ */}

            <section className='grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-4'>
              {/* Collection Trend */}
              <Surface theme={theme} className='overflow-hidden'>
                <div className='px-4 sm:px-5 pt-5'>
                  <SectionHeading
                    theme={theme}
                    title='Sample Collection Trend'
                    subtitle='Sample activity and outcomes over the last six months.'
                  />
                </div>

                <div className='px-2 sm:px-4 pb-4'>
                  {trendData.length ? (
                    <ResponsiveContainer width='100%' height={300}>
                      <AreaChart
                        data={trendData}
                        margin={{
                          top: 10,
                          right: 15,
                          left: -15,
                          bottom: 0,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id='safeGradient'
                            x1='0'
                            y1='0'
                            x2='0'
                            y2='1'
                          >
                            <stop
                              offset='5%'
                              stopColor={COLORS.safe}
                              stopOpacity={0.22}
                            />
                            <stop
                              offset='95%'
                              stopColor={COLORS.safe}
                              stopOpacity={0}
                            />
                          </linearGradient>

                          <linearGradient
                            id='contaminatedGradient'
                            x1='0'
                            y1='0'
                            x2='0'
                            y2='1'
                          >
                            <stop
                              offset='5%'
                              stopColor={COLORS.contaminated}
                              stopOpacity={0.18}
                            />
                            <stop
                              offset='95%'
                              stopColor={COLORS.contaminated}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          vertical={false}
                          stroke={COLORS.grid}
                          strokeDasharray='4 4'
                        />

                        <XAxis
                          dataKey='month'
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 11,
                            fill: "#94a3b8",
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 11,
                            fill: "#94a3b8",
                          }}
                        />

                        <RechartsTooltip
                          content={<ChartTooltip theme={theme} />}
                        />

                        <Area
                          type='monotone'
                          dataKey='safe'
                          name='Safe'
                          stroke={COLORS.safe}
                          fill='url(#safeGradient)'
                          strokeWidth={2.5}
                        />

                        <Area
                          type='monotone'
                          dataKey='detected'
                          name='Contaminated'
                          stroke={COLORS.contaminated}
                          fill='url(#contaminatedGradient)'
                          strokeWidth={2.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState
                      theme={theme}
                      message='No collection trend data available.'
                    />
                  )}
                </div>
              </Surface>

              {/* Risk Status */}
              <Surface theme={theme} className='overflow-hidden'>
                <div className='px-4 sm:px-5 pt-5'>
                  <SectionHeading
                    theme={theme}
                    title='Sample Risk Status'
                    subtitle='Current distribution of sample outcomes.'
                  />
                </div>

                <div className='px-4 pb-5'>
                  {riskData.length ? (
                    <>
                      <div className='relative h-[245px]'>
                        <ResponsiveContainer width='100%' height='100%'>
                          <PieChart>
                            <Pie
                              data={riskData}
                              dataKey='value'
                              nameKey='name'
                              cx='50%'
                              cy='48%'
                              innerRadius={68}
                              outerRadius={92}
                              paddingAngle={3}
                              stroke='none'
                            >
                              {riskData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>

                            <RechartsTooltip
                              content={<ChartTooltip theme={theme} />}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
                          <span className={`text-2xl font-bold ${theme.text}`}>
                            {formatNumber(analytics.total)}
                          </span>

                          <span className={`text-[11px] ${theme.textMuted}`}>
                            Total samples
                          </span>
                        </div>
                      </div>

                      <div className='space-y-2.5'>
                        {riskData.map((item) => {
                          const percentage =
                            analytics.total > 0
                              ? ((item.value / analytics.total) * 100).toFixed(
                                  1,
                                )
                              : "0.0";

                          return (
                            <div
                              key={item.name}
                              className='flex items-center justify-between'
                            >
                              <div className='flex items-center gap-2'>
                                <span
                                  className='w-2.5 h-2.5 rounded-full'
                                  style={{
                                    backgroundColor: item.color,
                                  }}
                                />

                                <span className={`text-xs ${theme.textMuted}`}>
                                  {item.name}
                                </span>
                              </div>

                              <span
                                className={`text-xs font-semibold ${theme.text}`}
                              >
                                {formatNumber(item.value)}{" "}
                                <span
                                  className={`font-normal ${theme.textMuted}`}
                                >
                                  ({percentage}%)
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      theme={theme}
                      message='No risk status data available.'
                    />
                  )}
                </div>
              </Surface>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* Geographic Intelligence                                      */}
            {/* ------------------------------------------------------------ */}

            <Surface theme={theme} className='overflow-hidden'>
              <div className='px-4 sm:px-5 pt-5'>
                <SectionHeading
                  theme={theme}
                  title='Sample Distribution / Geographic Intelligence'
                  subtitle='Understand where samples and contamination are concentrated.'
                />
              </div>

              {locationData.length ? (
                <div className='px-4 sm:px-5 pb-5'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                    {locationData.slice(0, 8).map((location, index) => {
                      const value = getValue(
                        location,
                        ["exposure", "count", "value"],
                        0,
                      );

                      const maxValue = Math.max(
                        ...locationData.map((item) =>
                          getValue(item, ["exposure", "count", "value"], 0),
                        ),
                        1,
                      );

                      const percentage = Math.min(
                        100,
                        (value / maxValue) * 100,
                      );

                      return (
                        <div
                          key={`${location.location}-${index}`}
                          className={`rounded-xl border ${theme.border} p-3.5`}
                        >
                          <div className='flex items-center justify-between gap-3'>
                            <div className='flex items-center gap-2 min-w-0'>
                              <div className='w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0'>
                                <Map className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                              </div>

                              <span
                                className={`text-sm font-medium truncate ${theme.text}`}
                              >
                                {location.location ||
                                  location.name ||
                                  "Unknown location"}
                              </span>
                            </div>

                            <span
                              className={`text-sm font-semibold ${theme.text}`}
                            >
                              {formatNumber(value)}
                            </span>
                          </div>

                          <div
                            className={`mt-3 h-1.5 rounded-full overflow-hidden ${
                              theme.name === "dark"
                                ? "bg-slate-800"
                                : "bg-slate-100"
                            }`}
                          >
                            <div
                              className='h-full rounded-full bg-emerald-500'
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className='px-4 sm:px-5 pb-5'>
                  <div className={`rounded-xl border ${theme.border} p-5`}>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center'>
                        <Map className='w-5 h-5 text-emerald-600 dark:text-emerald-400' />
                      </div>

                      <div>
                        <p className={`text-sm font-medium ${theme.text}`}>
                          Geographic intelligence
                        </p>

                        <p className={`mt-0.5 text-xs ${theme.textMuted}`}>
                          Location distribution will appear here as sample
                          location data becomes available.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Surface>

            {/* ------------------------------------------------------------ */}
            {/* Recent Samples + Quick Actions                               */}
            {/* ------------------------------------------------------------ */}

            <section className='grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4'>
              {/* Recent Samples */}
              <Surface theme={theme} className='overflow-hidden'>
                <div className='px-4 sm:px-5 pt-5 flex items-start justify-between gap-3'>
                  <SectionHeading
                    theme={theme}
                    title='Recent Samples'
                    subtitle='Latest sample activity requiring attention.'
                  />

                  <button
                    type='button'
                    className={`hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline`}
                  >
                    View all
                    <ArrowUpRight className='w-3.5 h-3.5' />
                  </button>
                </div>

                <div className='px-4 sm:px-5 pb-5'>
                  {recentSamples.length ? (
                    <div className='space-y-2'>
                      {recentSamples.slice(0, 5).map((sample, index) => (
                        <div
                          key={sample.id || sample.sampleId || index}
                          className={`flex items-center justify-between gap-3 rounded-xl border ${theme.border} px-3.5 py-3`}
                        >
                          <div className='flex items-center gap-3 min-w-0'>
                            <div className='w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0'>
                              <Database
                                className={`w-4 h-4 ${theme.textMuted}`}
                              />
                            </div>

                            <div className='min-w-0'>
                              <p
                                className={`text-sm font-medium truncate ${theme.text}`}
                              >
                                {sample.sampleCode ||
                                  sample.code ||
                                  sample.name ||
                                  "Sample"}
                              </p>

                              <p
                                className={`mt-0.5 text-[11px] ${theme.textMuted}`}
                              >
                                {sample.productName ||
                                  sample.productVariantName ||
                                  "Sample record"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[11px] px-2 py-1 rounded-full ${theme.textMuted}`}
                          >
                            {sample.status || "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`rounded-xl border ${theme.border} p-8 text-center`}
                    >
                      <Database
                        className={`w-7 h-7 mx-auto opacity-40 ${theme.textMuted}`}
                      />

                      <p className={`mt-3 text-sm font-medium ${theme.text}`}>
                        No recent samples
                      </p>

                      <p className={`mt-1 text-xs ${theme.textMuted}`}>
                        Recent sample records will appear here once they are
                        available.
                      </p>
                    </div>
                  )}
                </div>
              </Surface>

              {/* Quick Actions */}
              <Surface theme={theme} className='overflow-hidden'>
                <div className='px-4 sm:px-5 pt-5'>
                  <SectionHeading
                    theme={theme}
                    title='Quick Actions'
                    subtitle='Jump directly into frequently used tools.'
                  />
                </div>

                <div className='px-4 sm:px-5 pb-5 space-y-2.5'>
                  <button
                    type='button'
                    onClick={() => (window.location.href = "/database")}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl border ${theme.border} p-3.5 text-left hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-colors group`}
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center'>
                        <Database className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                      </div>

                      <div>
                        <p className={`text-sm font-medium ${theme.text}`}>
                          View Database
                        </p>

                        <p className={`text-[11px] mt-0.5 ${theme.textMuted}`}>
                          Browse collected samples
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight
                      className={`w-4 h-4 ${theme.textMuted} group-hover:text-emerald-500`}
                    />
                  </button>

                  <button
                    type='button'
                    onClick={() => (window.location.href = "/map")}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl border ${theme.border} p-3.5 text-left hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-colors group`}
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center'>
                        <Map className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                      </div>

                      <div>
                        <p className={`text-sm font-medium ${theme.text}`}>
                          View Map
                        </p>

                        <p className={`text-[11px] mt-0.5 ${theme.textMuted}`}>
                          Explore geographic distribution
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight
                      className={`w-4 h-4 ${theme.textMuted} group-hover:text-emerald-500`}
                    />
                  </button>

                  <button
                    type='button'
                    onClick={() => (window.location.href = "/reports")}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl border ${theme.border} p-3.5 text-left hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-colors group`}
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center'>
                        <FileText className='w-4 h-4 text-violet-600 dark:text-violet-400' />
                      </div>

                      <div>
                        <p className={`text-sm font-medium ${theme.text}`}>
                          Reports
                        </p>

                        <p className={`text-[11px] mt-0.5 ${theme.textMuted}`}>
                          Review analytical reports
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight
                      className={`w-4 h-4 ${theme.textMuted} group-hover:text-emerald-500`}
                    />
                  </button>
                </div>
              </Surface>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* Footer status                                                 */}
            {/* ------------------------------------------------------------ */}

            <div
              className={`flex flex-wrap items-center justify-between gap-3 px-1 text-xs ${theme.textMuted}`}
            >
              <div className='flex items-center gap-2'>
                <CheckCircle2 className='w-3.5 h-3.5 text-emerald-500' />
                <span>
                  Dashboard reflects the latest available sample statistics.
                </span>
              </div>

              <span>Period: Last 6 months</span>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
