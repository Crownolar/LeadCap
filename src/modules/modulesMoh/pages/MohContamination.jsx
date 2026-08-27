import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Filter,
  MapPinned,
  Package,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { BtnPrimary, TD } from "../utils/MohUI";
import { WhiteCard } from "../components/WhiteCard";
import { RateBadge } from "../components/RateBadge";
import { getContaminationSummary } from "../../../services/mohReportService";
import { useTheme } from "../../../context/ThemeContext";
import { useStates } from "../hooks/useStates";

const Contamination = () => {
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const { theme } = useTheme();
  const { states, loadingStates, statesError } = useStates();

  const [filters, setFilters] = useState({
    stateId: "",
    dateFrom: "2026-03-13",
    dateTo: "2026-03-14",
  });

  const [loading, setLoading] = useState(false);
  const [hotspotLoading, setHotspotLoading] = useState(false);
  const [error, setError] = useState("");
  const [summaryData, setSummaryData] = useState(null);

  const selectedState = states.find((state) => state.id === filters.stateId);
  const selectedStateName = selectedState?.name || "All regions";

  const handleLoadSummary = async (e) => {
    e?.preventDefault();

    if (!filters.dateFrom || !filters.dateTo) {
      setError("Please select both date range fields.");
      return;
    }

    if (filters.dateFrom > filters.dateTo) {
      setError("'From' date cannot be later than 'To' date.");
      return;
    }

    if (!filters.stateId) {
      setError("Please select a state.");
      return;
    }

    try {
      setLoading(true);
      setHotspotLoading(true);
      setError("");

      const payload = {
        state: filters.stateId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      };

      console.log("CONTAMINATION FILTERS:", payload);

      const data = await getContaminationSummary(payload);

      console.log("Contamination summary response:", data);

      setSummaryData(data?.data || data || null);
    } catch (err) {
      console.error("Failed to fetch contamination summary:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load contamination summary.";

      setError(message);
      setSummaryData(null);
    } finally {
      setLoading(false);
      setHotspotLoading(false);
    }
  };

  useEffect(() => {
    if (filters.stateId) {
      handleLoadSummary();
    }
  }, [filters.stateId]);

  const summary = summaryData?.summary || {};
  const contaminationBreakdown = summary?.contaminationBreakdown || {};
  const byLGA = summaryData?.byLGA || {};
  const byProductType = summaryData?.byProductType || {};
  const highRiskSamples = summaryData?.highRiskSamples || [];
  const registrationStatus = summaryData?.registrationStatus || {};
  const vendorType = summaryData?.vendorType || {};
  const recommendations = summaryData?.recommendations || [];

  const totalSamples = Number(summary.totalSamples ?? 0);
  const contaminated = Number(
    contaminationBreakdown.CONTAMINATED ?? 0
  );
  const safe = Number(contaminationBreakdown.SAFE ?? 0);
  const moderate = Number(contaminationBreakdown.MODERATE ?? 0);
  const pending = Number(contaminationBreakdown.PENDING ?? 0);
  const failed = Number(contaminationBreakdown.FAILED ?? 0);

  const testedSamples = Math.max(totalSamples - pending, 0);

  const contaminationRate =
    summary.percentageContaminated != null
      ? Number(summary.percentageContaminated)
      : testedSamples > 0
        ? Number(((contaminated / testedSamples) * 100).toFixed(1))
        : 0;

  const lgaRows = useMemo(() => {
    return Object.entries(byLGA)
      .map(([lgaName, stats]) => {
        const total = stats?.total ?? 0;
        const contaminatedCount = stats?.contaminated ?? 0;
        const pendingCount = stats?.pending ?? 0;
        const tested = total - pendingCount;

        const rate =
          tested > 0
            ? `${((contaminatedCount / tested) * 100).toFixed(1)}%`
            : "N/A";

        return {
          lgaName,
          total,
          contaminated: contaminatedCount,
          rate,
          numericRate:
            tested > 0 ? (contaminatedCount / tested) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [byLGA]);

  const productRows = useMemo(() => {
    return Object.entries(byProductType)
      .map(([productType, stats]) => {
        const total = stats?.total ?? 0;
        const contaminatedCount = stats?.contaminated ?? 0;
        const pendingCount = stats?.pending ?? 0;
        const tested = total - pendingCount;

        const rate =
          tested > 0
            ? `${((contaminatedCount / tested) * 100).toFixed(1)}%`
            : "N/A";

        return {
          productType,
          total,
          contaminated: contaminatedCount,
          rate,
          numericRate:
            tested > 0 ? (contaminatedCount / tested) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [byProductType]);

  const hotspotRows = useMemo(() => {
    return Object.entries(byLGA)
      .map(([lgaName, stats]) => {
        const total = stats?.total ?? 0;
        const contaminatedCount = stats?.contaminated ?? 0;

        const riskScore =
          total > 0
            ? Number(((contaminatedCount / total) * 10).toFixed(1))
            : 0;

        return {
          name: lgaName,
          riskScore,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
  }, [byLGA]);

  useEffect(() => {
    if (!window.Chart || !chartRef.current) return;

    chartInst.current?.destroy();

    if (!hotspotRows.length) return;

    chartInst.current = new window.Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: hotspotRows.map((item) => item.name),
        datasets: [
          {
            label: "Risk score",
            data: hotspotRows.map((item) => item.riskScore),
            backgroundColor: hotspotRows.map((item) =>
              item.riskScore >= 7
                ? "#dc2626"
                : item.riskScore >= 5
                  ? "#d97706"
                  : "#059669"
            ),
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                ` Risk score: ${context.raw}/10`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 10,
            ticks: {
              precision: 0,
            },
            grid: {
              color: "#f3f4f6",
            },
          },
          y: {
            grid: {
              display: false,
            },
          },
        },
      },
    });

    return () => chartInst.current?.destroy();
  }, [hotspotRows]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const statusCards = [
    {
      label: "Total samples",
      value: totalSamples,
      description: "Samples collected",
      icon: ClipboardList,
      iconClass:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    },
    {
      label: "Contaminated",
      value: contaminated,
      description: `${contaminationRate}% contamination rate`,
      icon: ShieldAlert,
      iconClass:
        "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
    {
      label: "Safe",
      value: safe,
      description: "Within acceptable limits",
      icon: ShieldCheck,
      iconClass:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    {
      label: "Moderate",
      value: moderate,
      description: "Requires monitoring",
      icon: AlertTriangle,
      iconClass:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },
    {
      label: "Pending",
      value: pending,
      description: "Awaiting analysis",
      icon: Activity,
      iconClass:
        "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      label: "High risk",
      value: highRiskSamples.length,
      description: "Priority samples",
      icon: AlertCircle,
      iconClass:
        "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    },
  ];

  const registered = Number(registrationStatus.registered ?? 0);
  const unregistered = Number(registrationStatus.unregistered ?? 0);
  const informal = Number(vendorType.informal ?? 0);

  return (
    <div className={`min-h-full ${theme.text}`}>
      {/* ================================================================
          PAGE HEADER
      ================================================================= */}
      <div className="mb-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <BarChart3 className="h-5 w-5" />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                Environmental Intelligence
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Contamination Analysis
            </h1>

            <p
              className={`mt-2 max-w-2xl text-sm leading-6 ${theme.textMuted}`}
            >
              Monitor lead contamination patterns, identify geographic
              hotspots, and prioritize samples requiring regulatory attention.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`hidden rounded-xl border px-3 py-2 text-xs sm:block ${theme.border} ${theme.card}`}
            >
              <span className={theme.textMuted}>Scope</span>
              <span className={`ml-2 font-semibold ${theme.text}`}>
                {selectedStateName}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLoadSummary}
              disabled={loading || !filters.stateId}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${theme.border} ${theme.card}`}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================
          FILTER PANEL
      ================================================================= */}
      <WhiteCard className="mb-6 overflow-hidden">
        <div
          className={`flex flex-col gap-4 border-b p-4 sm:p-5 lg:flex-row lg:items-end ${theme.border}`}
        >
          <div className="flex items-center gap-2 lg:mr-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Filter className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold">Analysis filters</p>
              <p className={`text-[11px] ${theme.textMuted}`}>
                Define the intelligence window
              </p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label
                className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-wide ${theme.textMuted}`}
              >
                State
              </label>

              <select
                value={filters.stateId}
                onChange={(e) => updateFilter("stateId", e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 ${theme.input} ${theme.border}`}
              >
                <option value="">
                  {loadingStates ? "Loading states..." : "Select state"}
                </option>

                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name || state.displayName || "Unknown State"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-wide ${theme.textMuted}`}
              >
                Date from
              </label>

              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 ${theme.input} ${theme.border}`}
              />
            </div>

            <div>
              <label
                className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-wide ${theme.textMuted}`}
              >
                Date to
              </label>

              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 ${theme.input} ${theme.border}`}
              />
            </div>
          </div>

          <BtnPrimary onClick={handleLoadSummary} disabled={loading}>
            <span className="inline-flex items-center gap-2">
              {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Analysing..." : "Run analysis"}
            </span>
          </BtnPrimary>
        </div>

        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] ${theme.textMuted}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Analysis period
          </span>

          <span className="text-xs font-semibold">
            {filters.dateFrom} — {filters.dateTo}
          </span>

          {filters.stateId && (
            <>
              <span className={theme.textMuted}>•</span>
              <span className="text-xs font-semibold">
                {selectedStateName}
              </span>
            </>
          )}
        </div>
      </WhiteCard>

      {/* ================================================================
          ALERTS
      ================================================================= */}
      {statesError && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{statesError}</span>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />

          <div>
            <p className="font-semibold">Analysis could not be loaded</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {pending > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-900/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Activity className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Laboratory results pending
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {pending} sample{pending === 1 ? "" : "s"} still awaiting
              laboratory analysis.
            </p>
          </div>
        </div>
      )}

      {/* ================================================================
          KPI GRID
      ================================================================= */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {statusCards.map((card) => {
          const Icon = card.icon;

          return (
            <WhiteCard
              key={card.label}
              className="group p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconClass}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <p
                className={`mt-4 text-[11px] font-semibold uppercase tracking-wide ${theme.textMuted}`}
              >
                {card.label}
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight">
                {card.value.toLocaleString()}
              </p>

              <p className={`mt-1 text-[10px] ${theme.textMuted}`}>
                {card.description}
              </p>
            </WhiteCard>
          );
        })}
      </div>

      {/* ================================================================
          PRIMARY INTELLIGENCE ROW
      ================================================================= */}
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Contamination overview */}
        <WhiteCard className="xl:col-span-2">
          <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-bold">Contamination overview</h2>
              </div>

              <p className={`mt-1 text-xs ${theme.textMuted}`}>
                Laboratory outcome distribution for the selected analysis
                period.
              </p>
            </div>

            <div className="rounded-xl bg-red-50 px-3 py-2 text-right dark:bg-red-900/20">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                Contamination rate
              </p>
              <p className="mt-0.5 text-xl font-bold text-red-700 dark:text-red-300">
                {contaminationRate}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            {[
              {
                label: "Safe",
                value: safe,
                icon: CheckCircle2,
                className: "text-emerald-600 bg-emerald-50",
              },
              {
                label: "Moderate",
                value: moderate,
                icon: Activity,
                className: "text-amber-600 bg-amber-50",
              },
              {
                label: "Contaminated",
                value: contaminated,
                icon: ShieldAlert,
                className: "text-red-600 bg-red-50",
              },
              {
                label: "Pending",
                value: pending,
                icon: AlertTriangle,
                className: "text-blue-600 bg-blue-50",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-4 ${theme.border}`}
                >
                  <div
                    className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${item.className}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <p className={`text-xs ${theme.textMuted}`}>
                    {item.label}
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {item.value.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>

          <div className={`border-t p-5 ${theme.border}`}>
            <div className="mb-2 flex items-center justify-between">
              <span className={`text-xs ${theme.textMuted}`}>
                Tested samples
              </span>
              <span className="text-xs font-bold">
                {testedSamples.toLocaleString()}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-700"
                style={{
                  width: `${Math.min(contaminationRate, 100)}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[10px]">
              <span className={theme.textMuted}>0%</span>
              <span className="font-semibold text-red-600">
                {contaminationRate}% contaminated
              </span>
              <span className={theme.textMuted}>100%</span>
            </div>
          </div>
        </WhiteCard>

        {/* Regulatory / vendor intelligence */}
        <WhiteCard>
          <div className={`border-b p-5 ${theme.border}`}>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold">Source intelligence</h2>
            </div>

            <p className={`mt-1 text-xs ${theme.textMuted}`}>
              Registration and vendor profile signals.
            </p>
          </div>

          <div className="space-y-3 p-5">
            <div
              className={`flex items-center justify-between rounded-xl border p-3 ${theme.border}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium">Registered</span>
              </div>

              <span className="text-lg font-bold">{registered}</span>
            </div>

            <div
              className={`flex items-center justify-between rounded-xl border p-3 ${theme.border}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Package className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium">Unregistered</span>
              </div>

              <span className="text-lg font-bold">{unregistered}</span>
            </div>

            <div
              className={`flex items-center justify-between rounded-xl border p-3 ${theme.border}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Users className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium">Informal vendors</span>
              </div>

              <span className="text-lg font-bold">{informal}</span>
            </div>
          </div>
        </WhiteCard>
      </div>

      {/* ================================================================
          GEOGRAPHIC INTELLIGENCE
      ================================================================= */}
      <WhiteCard className="mb-6 overflow-hidden">
        <div className={`border-b p-5 ${theme.border}`}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
              <MapPinned className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold">
                Geographic contamination intelligence
              </h2>

              <p className={`mt-1 text-xs ${theme.textMuted}`}>
                Areas ranked by contamination burden and calculated risk
                score.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2">
          {/* Chart */}
          <div className={`border-b p-5 xl:border-b-0 xl:border-r ${theme.border}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold">Risk hotspots</p>
                <p className={`mt-1 text-[11px] ${theme.textMuted}`}>
                  Top 10 LGAs
                </p>
              </div>

              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Scale 0–10
              </span>
            </div>

            {hotspotRows.length === 0 ? (
              <div
                className={`flex h-[320px] items-center justify-center rounded-2xl border border-dashed ${theme.border}`}
              >
                <div className="text-center">
                  <MapPinned
                    className={`mx-auto h-7 w-7 ${theme.textMuted}`}
                  />
                  <p className={`mt-2 text-sm ${theme.textMuted}`}>
                    No hotspot data available.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative h-[320px] w-full">
                <canvas ref={chartRef} />
              </div>
            )}
          </div>

          {/* LGA table */}
          <div className="p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold">LGA breakdown</p>
              <p className={`mt-1 text-[11px] ${theme.textMuted}`}>
                Samples and contamination rate by location.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[480px] text-left">
                <thead>
                  <tr
                    className={`border-b bg-gray-50 dark:bg-gray-800/50 ${theme.border}`}
                  >
                    {["LGA", "Samples", "Contaminated", "Rate"].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {lgaRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className={`px-4 py-10 text-center text-xs ${theme.textMuted}`}
                      >
                        No LGA data available.
                      </td>
                    </tr>
                  ) : (
                    lgaRows.slice(0, 8).map((row) => (
                      <tr
                        key={row.lgaName}
                        className={`border-b last:border-b-0 ${theme.border} ${theme.hover}`}
                      >
                        <td className={`${TD} font-medium`}>
                          {row.lgaName}
                        </td>

                        <td className={TD}>{row.total}</td>

                        <td className={TD}>
                          <span className="font-semibold text-red-600">
                            {row.contaminated}
                          </span>
                        </td>

                        <td className={TD}>
                          <RateBadge rate={row.rate} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </WhiteCard>

      {/* ================================================================
          PRODUCT + HIGH RISK
      ================================================================= */}
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Product type */}
        <WhiteCard className="overflow-hidden">
          <div className={`border-b p-5 ${theme.border}`}>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold">Product-type risk</h2>
            </div>

            <p className={`mt-1 text-xs ${theme.textMuted}`}>
              Contamination distribution across sampled product categories.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr
                  className={`border-b bg-gray-50 dark:bg-gray-800/50 ${theme.border}`}
                >
                  {["Category", "Samples", "Contaminated", "Rate"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {productRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className={`px-5 py-10 text-center text-xs ${theme.textMuted}`}
                    >
                      No product type data available.
                    </td>
                  </tr>
                ) : (
                  productRows.map((row) => (
                    <tr
                      key={row.productType}
                      className={`border-b last:border-b-0 ${theme.border} ${theme.hover}`}
                    >
                      <td className={`${TD} font-medium`}>
                        {row.productType || "-"}
                      </td>

                      <td className={TD}>{row.total}</td>

                      <td className={TD}>
                        <span className="font-semibold text-red-600">
                          {row.contaminated}
                        </span>
                      </td>

                      <td className={TD}>
                        <RateBadge rate={row.rate} />
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </WhiteCard>

        {/* High risk samples */}
        <WhiteCard className="overflow-hidden">
          <div className={`border-b p-5 ${theme.border}`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <h2 className="text-sm font-bold">High-risk samples</h2>
            </div>

            <p className={`mt-1 text-xs ${theme.textMuted}`}>
              Samples requiring priority regulatory or laboratory attention.
            </p>
          </div>

          <div className="divide-y">
            {highRiskSamples.length === 0 ? (
              <div
                className={`px-5 py-12 text-center text-xs ${theme.textMuted}`}
              >
                No high-risk samples available.
              </div>
            ) : (
              highRiskSamples.slice(0, 8).map((item, index) => {
                const label =
                  item.label ||
                  `${item.state || "Unknown"} — ${
                    item.productName ||
                    item.sampleCode ||
                    item.sampleName ||
                    `Sample ${index + 1}`
                  }`;

                const metal =
                  item.contaminatedMetals?.[0]?.metal || "Lead";

                const reading =
                  item.contaminatedMetals?.[0]?.concentration ??
                  item.reading ??
                  item.leadLevel ??
                  "-";

                const numericReading = Number(
                  item.leadLevel ?? item.reading ?? 0
                );

                const isCritical = numericReading >= 3;

                return (
                  <div
                    key={`${label}-${index}`}
                    className={`flex items-center justify-between gap-4 px-5 py-4 ${theme.hover}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                          isCritical
                            ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {label}
                        </p>

                        <p
                          className={`mt-1 text-[10px] ${theme.textMuted}`}
                        >
                          {metal} contamination
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <p
                        className={`text-sm font-bold ${
                          isCritical
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {reading}
                      </p>

                      <p className={`text-[9px] ${theme.textMuted}`}>
                        ppm
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </WhiteCard>
      </div>

      {/* ================================================================
          RECOMMENDATIONS
      ================================================================= */}
      <WhiteCard className="mb-6 overflow-hidden">
        <div
          className={`border-b bg-gradient-to-r from-emerald-50/80 to-transparent p-5 dark:from-emerald-900/10 ${theme.border}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold">
                Intelligence recommendations
              </h2>

              <p className={`mt-1 text-xs ${theme.textMuted}`}>
                Recommended follow-up actions derived from the current
                contamination analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
          {recommendations.length === 0 ? (
            <div
              className={`col-span-full rounded-xl border border-dashed p-8 text-center text-xs ${theme.border} ${theme.textMuted}`}
            >
              No recommendations available.
            </div>
          ) : (
            recommendations.map((item, index) => {
              if (typeof item === "string") {
                return (
                  <div
                    key={index}
                    className={`rounded-2xl border p-4 ${theme.border}`}
                  >
                    <div className="flex gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {index + 1}
                      </span>

                      <p className="text-xs leading-5">{item}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className={`rounded-2xl border p-4 ${theme.border}`}
                >
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {index + 1}
                    </span>

                    <div className="min-w-0 space-y-2 text-xs">
                      <p className="font-semibold">
                        {item?.recommendation ||
                          item?.finding ||
                          "Recommendation"}
                      </p>

                      {item?.category && (
                        <p className={theme.textMuted}>
                          <span className="font-semibold">Category:</span>{" "}
                          {item.category}
                        </p>
                      )}

                      {item?.priority && (
                        <p className={theme.textMuted}>
                          <span className="font-semibold">Priority:</span>{" "}
                          {item.priority}
                        </p>
                      )}

                      {item?.finding && (
                        <p className={theme.textMuted}>
                          <span className="font-semibold">Finding:</span>{" "}
                          {item.finding}
                        </p>
                      )}

                      {item?.action && (
                        <p className={theme.textMuted}>
                          <span className="font-semibold">Action:</span>{" "}
                          {item.action}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </WhiteCard>

      {/* ================================================================
          FOOTER STATUS
      ================================================================= */}
      <div
        className={`flex flex-col gap-2 border-t pt-4 text-[10px] sm:flex-row sm:items-center sm:justify-between ${theme.border} ${theme.textMuted}`}
      >
        <span>
          Contamination intelligence · {selectedStateName}
        </span>

        <span>
          {totalSamples.toLocaleString()} samples ·{" "}
          {testedSamples.toLocaleString()} tested
          {failed > 0 ? ` · ${failed} failed` : ""}
        </span>
      </div>
    </div>
  );
};

export default Contamination;