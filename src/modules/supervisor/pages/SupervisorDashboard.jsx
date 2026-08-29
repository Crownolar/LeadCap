/**
 * SupervisorDashboard.jsx
 * ────────────────────────
 * Supervisor operational dashboard.
 *
 * Data is provided by useSupervisorDashboard.
 * UI remains presentation-focused; navigation uses the existing routes.
 */

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  Flag,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import { useTheme } from "../../../context/ThemeContext";
import { useSupervisorDashboard } from "../hooks/useSupervisorDashboard";
import { REVIEW_CHART_COLORS } from "../constants/supervisor.constants";

import SurfaceCard from "../components/ui/SurfaceCard";
import StatusBadge from "../components/ui/StatusBadge";

const SupervisorDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { stats, collectors, loading, error } = useSupervisorDashboard();
  const [activeRange, setActiveRange] = useState("This month");

  const reviewChartData = useMemo(
    () => [
      { name: "Pending", value: stats?.pendingReviews || 0 },
      { name: "Approved", value: stats?.approvedSamples || 0 },
      { name: "Rejected", value: stats?.reviewBreakdown?.rejected || 0 },
      { name: "Flagged", value: stats?.flaggedSamples || 0 },
    ],
    [stats]
  );

  const totalReviewItems = reviewChartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const activeCollectors = collectors.filter((collector) => collector.isActive);
  const inactiveCollectors = collectors.length - activeCollectors.length;

  const topCollectors = [...collectors]
    .sort((a, b) => (b.totalSamples || 0) - (a.totalSamples || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className={`min-h-[70vh] ${theme.text}`}>
        <SurfaceCard className="flex min-h-[420px] items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-4 h-11 w-11 animate-spin rounded-full border-2 ${theme.emerald} border-t-transparent`}
            />
            <p className="text-base font-semibold">Loading supervisor dashboard</p>
            <p className={`mt-1 text-sm ${theme.textMuted}`}>
              Preparing your operational insights…
            </p>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-5 ${theme.text}`}>
        <SurfaceCard className="border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Unable to load dashboard</p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  const kpis = [
    {
      label: "Data Collectors",
      value: stats?.totalCollectors || 0,
      detail: `${activeCollectors.length} active`,
      icon: Users,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      valueClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Samples",
      value: stats?.totalSamples || 0,
      detail: "All assigned collection activity",
      icon: FileText,
      iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      valueClass: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Samples This Month",
      value: stats?.samplesThisMonth ?? 0,
      detail: "Current reporting period",
      icon: CalendarDays,
      iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      valueClass: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Pending Review",
      value: stats?.pendingReviews || 0,
      detail: "Items requiring attention",
      icon: Clock3,
      iconClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      valueClass: "text-orange-600 dark:text-orange-400",
    },
  ];

  const reviewRows = [
    {
      label: "Pending Review",
      value: stats?.pendingReviews || 0,
      icon: Clock3,
      className:
        "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    {
      label: "Approved",
      value: stats?.approvedSamples || 0,
      icon: CheckCircle2,
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Rejected",
      value: stats?.reviewBreakdown?.rejected || 0,
      icon: XCircle,
      className: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
      label: "Flagged",
      value: stats?.flaggedSamples || 0,
      icon: Flag,
      className:
        "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className={`space-y-6 pb-8 ${theme.text}`}>
      {/* ─────────────────────────────────────────────────────────────
          Header / hero
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-gray-900 dark:to-teal-950/30 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-gray-900/70 dark:text-emerald-300">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Supervisor workspace
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Operational overview
            </h1>

            <p className={`mt-3 max-w-2xl text-sm leading-6 md:text-base ${theme.textMuted}`}>
              Monitor your field collectors, sample submissions, and review
              workload from one place.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${theme.border} ${theme.card}`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {activeCollectors.length} active collectors
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${theme.border} ${theme.card}`}
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                {stats?.pendingReviews || 0} awaiting review
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row xl:flex-col xl:items-end">
            <div className={`inline-flex rounded-xl border p-1 ${theme.border} ${theme.card}`}>
              {["This month", "All time"].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setActiveRange(range)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    activeRange === range
                      ? "bg-emerald-600 text-white shadow-sm"
                      : theme.textMuted
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate("/sample-review")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <ClipboardCheck className="h-4 w-4" />
                Review samples
              </button>

              <button
                type="button"
                onClick={() => navigate("/collectors")}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50 dark:hover:bg-gray-800 ${theme.border} ${theme.card}`}
              >
                <Users className="h-4 w-4" />
                Collectors
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          KPI cards
      ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;

          return (
            <SurfaceCard
              key={item.label}
              className="group relative overflow-hidden p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.1em] ${theme.textMuted}`}
                  >
                    {item.label}
                  </p>
                  <p className={`mt-2 text-3xl font-bold tracking-tight ${item.valueClass}`}>
                    {item.value}
                  </p>
                  <p className={`mt-1.5 text-xs ${theme.textMuted}`}>
                    {item.detail}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-1 w-0 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
            </SurfaceCard>
          );
        })}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          Review analytics
      ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SurfaceCard className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b px-5 py-5 md:px-6 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <h2 className="font-bold">Review workload</h2>
              </div>
              <p className={`mt-1.5 text-xs ${theme.textMuted}`}>
                Current sample review pipeline and outcomes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/sample-review")}
              className="hidden items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 sm:flex"
            >
              Open queue
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
            <div className="flex min-h-[250px] items-center justify-center">
              {totalReviewItems > 0 ? (
                <div className="relative h-[245px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reviewChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {reviewChartData.map((_, index) => (
                          <Cell
                            key={`review-cell-${index}`}
                            fill={
                              REVIEW_CHART_COLORS[
                                index % REVIEW_CHART_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div
                              className={`rounded-xl border px-3 py-2 text-xs shadow-lg ${theme.card} ${theme.border}`}
                            >
                              <span className="font-semibold">
                                {payload[0].name}
                              </span>
                              <span className={`ml-2 ${theme.textMuted}`}>
                                {payload[0].value}
                              </span>
                            </div>
                          ) : null
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">
                      {totalReviewItems}
                    </span>
                    <span className={`text-xs ${theme.textMuted}`}>
                      review items
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`text-center text-sm ${theme.textMuted}`}>
                  <ShieldCheck className="mx-auto mb-2 h-8 w-8" />
                  No review activity yet
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center gap-2.5">
              {reviewRows.map((row) => {
                const Icon = row.icon;

                return (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between rounded-2xl border px-3.5 py-3 ${theme.border} ${theme.bg}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${row.className}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="truncate text-sm font-medium">
                        {row.label}
                      </span>
                    </div>
                    <span className="ml-3 text-base font-bold">
                      {row.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </SurfaceCard>

        {/* Quick actions */}
        <SurfaceCard className="p-0">
          <div className="border-b px-5 py-5 md:px-6 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-bold">Quick actions</h2>
                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Common supervisor tasks.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 p-5 md:p-6">
            {[
              {
                label: "Review submitted samples",
                description: "Open pending and completed reviews",
                icon: ClipboardCheck,
                route: "/sample-review",
              },
              {
                label: "Manage collectors",
                description: "View your assigned field team",
                icon: Users,
                route: "/collectors",
              },
              {
                label: "View collection activity",
                description: "Inspect recent operational activity",
                icon: Activity,
                route: "/sample-review",
              },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.route)}
                  className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${theme.border} ${theme.bg}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className={`mt-0.5 text-xs ${theme.textMuted}`}>
                      {action.description}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        </SurfaceCard>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          Collector performance
      ───────────────────────────────────────────────────────────── */}
      <SurfaceCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="h-4 w-4" />
              </div>
              <h2 className="font-bold">Collector performance</h2>
            </div>
            <p className={`mt-1.5 text-xs ${theme.textMuted}`}>
              Your highest-volume assigned collectors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {inactiveCollectors > 0 && (
              <StatusBadge type="neutral">
                {inactiveCollectors} inactive
              </StatusBadge>
            )}
            <StatusBadge type="safe">
              {collectors.length} total
            </StatusBadge>
            <button
              type="button"
              onClick={() => navigate("/collectors")}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {topCollectors.length === 0 ? (
          <div className={`px-6 py-14 text-center ${theme.textMuted}`}>
            <Users className="mx-auto mb-3 h-9 w-9" />
            <p className="text-sm font-semibold">No collectors assigned yet</p>
            <p className="mt-1 text-xs">
              Assigned field collectors will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className={`border-b ${theme.border}`}>
                    <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                      Collector
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">
                      Total samples
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">
                      This month
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider">
                      States
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {topCollectors.map((collector, index) => {
                    const states = collector.samplesByState
                      ? Object.keys(collector.samplesByState).length
                      : 0;

                    return (
                      <tr
                        key={collector.id}
                        className={`border-b transition-colors last:border-0 hover:bg-gray-50/70 dark:hover:bg-gray-800/30 ${theme.border}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              {index + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold">
                                {collector.name}
                              </p>
                              <p className={`mt-0.5 truncate text-xs ${theme.textMuted}`}>
                                {collector.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center font-bold">
                          {collector.totalSamples || 0}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex min-w-10 justify-center rounded-lg bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                            {collector.samplesThisMonth || 0}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className={`text-xs font-semibold ${theme.textMuted}`}>
                            {states}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <StatusBadge
                            type={collector.isActive ? "safe" : "danger"}
                          >
                            {collector.isActive ? "Active" : "Inactive"}
                          </StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y md:hidden">
              {topCollectors.map((collector) => {
                const states = collector.samplesByState
                  ? Object.keys(collector.samplesByState).length
                  : 0;

                return (
                  <button
                    key={collector.id}
                    type="button"
                    onClick={() => navigate("/collectors")}
                    className={`flex w-full items-center gap-3 px-5 py-4 text-left ${theme.border}`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Users className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {collector.name}
                      </p>
                      <p className={`mt-1 text-xs ${theme.textMuted}`}>
                        {collector.totalSamples || 0} samples ·{" "}
                        {collector.samplesThisMonth || 0} this month ·{" "}
                        {states} states
                      </p>
                    </div>

                    <StatusBadge
                      type={collector.isActive ? "safe" : "danger"}
                    >
                      {collector.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </SurfaceCard>
    </div>
  );
};

export default SupervisorDashboard;