import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FlaskConical,
  MapPin,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../../../../context/ThemeContext";
import { useDashboard } from "./useDashboard";
import DonutChart from "./charts/DonutChart";
import TrendChart from "./charts/TrendChart";

const MohDashboard = () => {
  const { theme, darkMode } = useTheme();
  const { metrics, hotspots, trend, loading } = useDashboard();
  const navigate = useNavigate();

  const goToPage = (page) => {
    const routeMap = {
      samples: "/moh/samples",
      contamination: "/moh/contamination",
      verification: "/moh/verification",
      reports: "/moh/reports",
    };

    if (routeMap[page]) {
      navigate(routeMap[page]);
    }
  };

  const total = Number(metrics?.totalSamples) || 0;
  const contaminated = Number(metrics?.contaminated) || 0;
  const pending = Number(metrics?.pendingResults) || 0;
  const withResults = Number(metrics?.withResults) || 0;
  const safe = Number(metrics?.safe) || 0;
  const moderate = Number(metrics?.moderate) || 0;

  const contaminationRate =
    total > 0 ? ((contaminated / total) * 100).toFixed(1) : "0.0";

  const resultCoverage =
    total > 0 ? ((withResults / total) * 100).toFixed(1) : "0.0";

  const formattedHotspots = Array.isArray(hotspots)
    ? hotspots
        .map((item) => {
          const score = Number(item?.riskScore) || 0;

          return {
            name: item?.state || item?.name || "Unknown",
            score,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
    : [];

  const metricsCards = [
    {
      label: "Total Samples",
      value: total.toLocaleString(),
      description: "Collected nationwide",
      icon: FlaskConical,
      iconClass:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
      valueClass: theme.text,
      action: "samples",
    },
    {
      label: "Pending Results",
      value: pending.toLocaleString(),
      description: "Awaiting laboratory results",
      icon: Clock3,
      iconClass:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
      valueClass: "text-amber-600 dark:text-amber-300",
      action: "samples",
    },
    {
      label: "Samples With Results",
      value: withResults.toLocaleString(),
      description: `${resultCoverage}% result coverage`,
      icon: CheckCircle2,
      iconClass:
        "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300",
      valueClass: "text-blue-600 dark:text-blue-300",
      action: "samples",
    },
    {
      label: "Contaminated",
      value: contaminated.toLocaleString(),
      description: `${contaminationRate}% contamination rate`,
      icon: AlertTriangle,
      iconClass:
        "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300",
      valueClass: "text-red-600 dark:text-red-300",
      action: "contamination",
    },
  ];

  if (loading) {
    return (
      <div className={`space-y-6 ${theme.text}`}>
        <div
          className={`${theme.card} ${theme.border} border rounded-3xl p-6`}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-emerald-100 dark:bg-emerald-900/30" />
            <div className="space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-72 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className={`${theme.card} ${theme.border} h-36 animate-pulse rounded-2xl border`}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className={`${theme.card} ${theme.border} h-80 animate-pulse rounded-2xl border`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${theme.text}`}>
      {/* ================================================================
          HEADER
      ================================================================ */}
      <section
        className={`relative overflow-hidden rounded-3xl border ${theme.border} ${theme.card} p-6 md:p-7`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Ministry of Health
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Environmental Lead Intelligence
            </h1>

            <p className={`mt-2 max-w-2xl text-sm ${theme.textMuted}`}>
              Monitor sample collection, laboratory results, contamination
              patterns, and regional risk across the LeadCap surveillance
              network.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.location.reload()}
              className={`inline-flex items-center gap-2 rounded-xl border ${theme.border} ${theme.card} px-4 py-2.5 text-xs font-semibold transition hover:border-emerald-400 hover:text-emerald-600`}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={() => goToPage("reports")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              View Reports
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================
          KPI CARDS
      ================================================================ */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricsCards.map((metric) => {
          const Icon = metric.icon;

          return (
            <button
              key={metric.label}
              onClick={() => goToPage(metric.action)}
              className={`group ${theme.card} ${theme.border} border rounded-2xl p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}
                  >
                    {metric.label}
                  </p>

                  <p
                    className={`mt-3 text-3xl font-bold tracking-tight ${metric.valueClass}`}
                  >
                    {metric.value}
                  </p>

                  <p className={`mt-2 text-xs ${theme.textMuted}`}>
                    {metric.description}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${metric.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div
                className={`mt-4 flex items-center gap-1 text-[11px] font-semibold ${theme.textMuted} transition group-hover:text-emerald-600`}
              >
                Open details
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </section>

      {/* ================================================================
          OVERVIEW STRIP
      ================================================================ */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          className={`${theme.card} ${theme.border} rounded-2xl border p-5`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-semibold ${theme.textMuted}`}>
                Safe Samples
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                {safe.toLocaleString()}
              </p>
            </div>

            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width: `${total ? Math.min((safe / total) * 100, 100) : 0}%`,
              }}
            />
          </div>
        </div>

        <div
          className={`${theme.card} ${theme.border} rounded-2xl border p-5`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-semibold ${theme.textMuted}`}>
                Moderate Risk
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-300">
                {moderate.toLocaleString()}
              </p>
            </div>

            <Activity className="h-5 w-5 text-amber-500" />
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{
                width: `${total ? Math.min((moderate / total) * 100, 100) : 0}%`,
              }}
            />
          </div>
        </div>

        <div
          className={`${theme.card} ${theme.border} rounded-2xl border p-5`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-semibold ${theme.textMuted}`}>
                Contamination Rate
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-300">
                {contaminationRate}%
              </p>
            </div>

            <TrendingUp className="h-5 w-5 text-red-500" />
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-red-500"
              style={{
                width: `${Math.min(Number(contaminationRate), 100)}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          CHARTS
      ================================================================ */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div
          className={`${theme.card} ${theme.border} xl:col-span-2 rounded-2xl border p-5 shadow-sm`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Sample Risk Distribution</p>
              <p className={`mt-1 text-xs ${theme.textMuted}`}>
                Current status across monitored samples
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
              <Activity className="h-4 w-4" />
            </div>
          </div>

          <DonutChart metrics={metrics} />
        </div>

        <div
          className={`${theme.card} ${theme.border} xl:col-span-3 rounded-2xl border p-5 shadow-sm`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Monthly Sample Trend</p>
              <p className={`mt-1 text-xs ${theme.textMuted}`}>
                Safe, moderate, contaminated and pending results
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <TrendChart trend={trend} />
        </div>
      </section>

      {/* ================================================================
          RISK INTELLIGENCE
      ================================================================ */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div
          className={`${theme.card} ${theme.border} rounded-2xl border p-5 shadow-sm`}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300">
                <MapPin className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold">Top Risk Hotspots</p>
                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Regional risk scores derived from contamination activity
                </p>
              </div>
            </div>

            <button
              onClick={() => goToPage("contamination")}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              View all
            </button>
          </div>

          {formattedHotspots.length === 0 ? (
            <div
              className={`flex h-48 items-center justify-center rounded-xl ${theme.bg} text-sm ${theme.textMuted}`}
            >
              No hotspot data available.
            </div>
          ) : (
            <div className="space-y-4">
              {formattedHotspots.map((hotspot, index) => {
                const score = Math.min(hotspot.score, 10);

                const riskClass =
                  score >= 7
                    ? "bg-red-500"
                    : score >= 5
                      ? "bg-amber-500"
                      : "bg-emerald-500";

                const textClass =
                  score >= 7
                    ? "text-red-600 dark:text-red-300"
                    : score >= 5
                      ? "text-amber-600 dark:text-amber-300"
                      : "text-emerald-600 dark:text-emerald-300";

                return (
                  <div key={`${hotspot.name}-${index}`}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${theme.bg}`}
                        >
                          {index + 1}
                        </span>

                        <span className="truncate text-xs font-semibold">
                          {hotspot.name}
                        </span>
                      </div>

                      <span className={`text-xs font-bold ${textClass}`}>
                        {hotspot.score.toFixed(1)}
                      </span>
                    </div>

                    <div className="ml-8 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className={`h-full rounded-full transition-all ${riskClass}`}
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div
          className={`${theme.card} ${theme.border} rounded-2xl border p-5 shadow-sm`}
        >
          <div className="mb-5">
            <p className="text-sm font-bold">MOH Operations</p>
            <p className={`mt-1 text-xs ${theme.textMuted}`}>
              Quick access to the main surveillance workflows
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => goToPage("samples")}
              className={`group flex items-center gap-3 rounded-2xl border ${theme.border} p-4 text-left transition hover:border-emerald-400 hover:shadow-sm`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                <FlaskConical className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">Sample Database</p>
                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Browse collected samples
                </p>
              </div>

              <ArrowRight className="ml-auto h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-500" />
            </button>

            <button
              onClick={() => goToPage("contamination")}
              className={`group flex items-center gap-3 rounded-2xl border ${theme.border} p-4 text-left transition hover:border-red-400 hover:shadow-sm`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">Contamination</p>
                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Investigate contamination
                </p>
              </div>

              <ArrowRight className="ml-auto h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-red-500" />
            </button>

            <button
              onClick={() => goToPage("verification")}
              className={`group flex items-center gap-3 rounded-2xl border ${theme.border} p-4 text-left transition hover:border-blue-400 hover:shadow-sm`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">Verification</p>
                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Review verification activity
                </p>
              </div>

              <ArrowRight className="ml-auto h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-500" />
            </button>

            <button
              onClick={() => goToPage("reports")}
              className={`group flex items-center gap-3 rounded-2xl border ${theme.border} p-4 text-left transition hover:border-violet-400 hover:shadow-sm`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-300">
                <TrendingUp className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">Reports</p>
                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Generate intelligence reports
                </p>
              </div>

              <ArrowRight className="ml-auto h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-violet-500" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MohDashboard;