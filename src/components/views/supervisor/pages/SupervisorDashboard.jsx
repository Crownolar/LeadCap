import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
import api from "../../../../utils/api";
import {
  Users,
  FileText,
  CalendarRange,
  Clock3,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Flag,
  BarChart3,
  ArrowRight,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import SurfaceCard from "../components/ui/SurfaceCard";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import ActionButton from "../components/ui/ActionButton";
import EmptyState from "../components/ui/EmptyState";
import MetricTile from "../components/ui/MetricTile";
import QuickActionCard from "../components/ui/QuickActionCard";

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

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

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

  const COLORS = ["#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

  const reviewChartData = stats
    ? [
        { name: "Pending", value: stats.pendingReviews || 0 },
        { name: "Approved", value: stats.approvedSamples || 0 },
        { name: "Rejected", value: stats.reviewBreakdown?.rejected || 0 },
        { name: "Flagged", value: stats.flaggedSamples || 0 },
      ]
    : [];

  if (loading) {
    return (
      <SurfaceCard className="p-10 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className={`h-10 w-10 rounded-full border-2 ${theme.emerald} border-t-transparent animate-spin`} />
          <div>
            <p className={`text-base font-semibold ${theme.text}`}>
              Loading dashboard
            </p>
            <p className={`text-sm ${theme.textMuted}`}>
              Please wait while supervisor insights are being prepared.
            </p>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`${theme.text} space-y-6`}>
      {/* Hero */}
      <SurfaceCard className="relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className={`pointer-events-none absolute inset-0 ${theme.card}`} />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border ${theme.emeraldBorder} ${theme.emerald} px-3 py-1 text-xs font-semibold ${theme.emeraldText} `}>
              <LayoutDashboard className="h-3.5 w-3.5" />
              Supervisor Dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Monitor collectors, reviews, and field activity at a glance
            </h1>

            <p className={`mt-3 text-sm md:text-base ${theme.textMuted}`}>
              This dashboard gives you a clear operational view of your assigned
              collectors, submitted samples, and pending review workload.
            </p>
          </div> 

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[420px]">
            <QuickActionCard
              label="View Collectors"
              sub="See your assigned field team"
              icon={
                <Users className={`h-4 w-4 ${theme.emeraldText}`} />
              }
              onClick={() => navigate("/collectors")}
            />

            <QuickActionCard
              label="Review Samples"
              sub="Open pending and completed reviews"
              icon={
                <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              }
              onClick={() => navigate("/sample-review")}
            />

            <QuickActionCard
              label="Open Workflow"
              sub="Go to the main review process"
              icon={
                <ArrowRight className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              }
              onClick={() => navigate("/sample-review")}
            />
          </div>
        </div>
      </SurfaceCard>

      {/* Top metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          icon={<Users className={`h-4 w-4 ${theme.emeraldText} dark:text-emerald-400`} />}
          label="Data Collectors"
          value={stats?.totalCollectors || 0}
          valueClass="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
        />

        <MetricTile
          icon={<FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          label="Total Samples"
          value={stats?.totalSamples || 0}
          valueClass="text-2xl font-bold text-blue-600 dark:text-blue-400"
        />

        <MetricTile
          icon={<CalendarRange className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
          label="This Month"
          value={stats?.samplesThisMonth ?? 0}
          valueClass="text-2xl font-bold text-violet-600 dark:text-violet-400"
        />

        <MetricTile
          icon={<Clock3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
          label="Pending Review"
          value={stats?.pendingReviews || 0}
          valueClass="text-2xl font-bold text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Review overview */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SurfaceCard>
          <SectionHeader
            title="Sample Review Status"
            subtitle="Current breakdown of review outcomes."
            icon={<BarChart3 className="h-5 w-5" />}
          />

          {stats && (
            <div className="mt-5 space-y-3">
              <div className={`flex items-center justify-between rounded-xl border ${theme.border} ${theme.bg} px-4 py-3`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${theme.textMuted}`}>
                    Pending Review
                  </span>
                </div>
                <span className="text-base font-semibold">
                  {stats.pendingReviews || 0}
                </span>
              </div>

              <div className={`flex items-center justify-between rounded-xl border ${theme.border} ${theme.bg} px-4 py-3`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${theme.textMuted}`}>
                    Approved
                  </span>
                </div>
                <span className="text-base font-semibold">
                  {stats.approvedSamples || 0}
                </span>
              </div>

              <div className={`flex items-center justify-between rounded-xl border ${theme.border} ${theme.bg} px-4 py-3`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${theme.textMuted}`}>
                    Rejected
                  </span>
                </div>
                <span className="text-base font-semibold">
                  {stats.reviewBreakdown?.rejected || 0}
                </span>
              </div>

              <div className={`flex items-center justify-between rounded-xl border ${theme.border} ${theme.bg} px-4 py-3`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                    <Flag className="h-4 w-4" />
                  </div>
                  <span className={`text-sm font-medium ${theme.textMuted}`}>
                    Flagged
                  </span>
                </div>
                <span className="text-base font-semibold">
                  {stats.flaggedSamples || 0}
                </span>
              </div>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader
            title="Review Distribution"
            subtitle="Visual distribution of all review states."
            icon={<AlertTriangle className="h-5 w-5" />}
          />

          {reviewChartData.length > 0 && (
            <div className="mt-5">
              <ResponsiveContainer width="100%" height={290}>
                <PieChart>
                  <Pie
                    data={reviewChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 68 : 88}
                    innerRadius={isMobile ? 38 : 48}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
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
                          className={`rounded-xl border px-3 py-2 text-sm shadow-sm ${theme.card} ${theme.border}`}
                        >
                          <span className="font-medium">{payload[0].name}</span>:{" "}
                          {payload[0].value}
                        </div>
                      ) : null
                    }
                  />

                  <Legend
                    layout="vertical"
                    align={isMobile ? "center" : "right"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    wrapperStyle={{
                      fontSize: "13px",
                      lineHeight: "20px",
                    }}
                    formatter={(value, entry) => (
                      <span className={theme.text}>
                        {value}: {entry.payload?.value ?? 0}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SurfaceCard>
      </div>

      {/* Collectors section */}
      <SurfaceCard>
        <SectionHeader
          title="Your Data Collectors"
          subtitle="Overview of assigned collectors and their activity."
          icon={<Users className="h-5 w-5" />}
          badge={<StatusBadge type="safe">{collectors.length}</StatusBadge>}
          action={
            <ActionButton onClick={() => navigate("/collectors")}>
              View all collectors
              <ArrowRight className="h-4 w-4" />
            </ActionButton>
          }
        />

        {collectors.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={<Users className="h-5 w-5 text-gray-500" />}
              title="No data collectors assigned yet"
              description="Collectors in your assigned states will appear here."
              minHeight="min-h-[220px]"
            />
          </div>
        ) : (
          <>
            <div className="mt-5 hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className={`border-b ${theme.border}`}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Email
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                      Total Samples
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                      This Month
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                      States Covered
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {collectors.map((collector) => (
                    <tr
                      key={collector.id}
                      className={`border-b ${theme.border} transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40`}
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {collector.name}
                        </div>
                      </td>

                      <td className={`px-4 py-4 text-xs ${theme.textMuted}`}>
                        {collector.email}
                      </td>

                      <td className="px-4 py-4 text-center font-semibold">
                        {collector.totalSamples || 0}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <StatusBadge type="info">
                          {collector.samplesThisMonth || 0}
                        </StatusBadge>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <StatusBadge type="neutral">
                          {collector.samplesByState
                            ? Object.keys(collector.samplesByState).length
                            : 0}{" "}
                          states
                        </StatusBadge>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <StatusBadge type={collector.isActive ? "safe" : "danger"}>
                          {collector.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:hidden">
              {collectors.map((collector) => (
                <SurfaceCard
                  key={collector.id}
                  className="bg-gray-50 dark:bg-gray-800/40"
                  padding="p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {collector.name}
                      </p>
                      <p className={`mt-1 break-all text-xs ${theme.textMuted}`}>
                        {collector.email}
                      </p>
                    </div>

                    <StatusBadge type={collector.isActive ? "safe" : "danger"}>
                      {collector.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <MetricTile
                      icon={null}
                      label="Total"
                      value={collector.totalSamples || 0}
                      valueClass="text-sm font-bold text-blue-600 dark:text-blue-400"
                    />
                    <MetricTile
                      icon={null}
                      label="Month"
                      value={collector.samplesThisMonth || 0}
                      valueClass="text-sm font-bold text-violet-600 dark:text-violet-400"
                    />
                    <MetricTile
                      icon={null}
                      label="States"
                      value={
                        collector.samplesByState
                          ? Object.keys(collector.samplesByState).length
                          : 0
                      }
                      valueClass="text-sm font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </>
        )}
      </SurfaceCard>
    </div>
  );
};

export default SupervisorDashboard;