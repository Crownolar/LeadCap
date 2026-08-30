import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  Download,
  Filter,
  FlaskConical,
  MapPin,
  Package,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { FilterBar } from "../../../../components/FilterBar";
import { RateBadge } from "../../../../components/RateBadge";
import {
  FilterSep,
  BtnPrimary,
  TH,
  TD,
} from "../../../../utils/MohUI";

import { getContaminationAnalysisReport } from "../../../../../../services/mohReportService";

import {
  exportContaminationAnalysisExcel,
  exportContaminationAnalysisPdf,
} from "../../../../utils/reportExport";

import ReportHeader from "./ReportHeader";
import { useTheme } from "../../../../../../context/ThemeContext";
import { useStates } from "../../../../hooks/useStates";


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const safe = (value, fallback = 0) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value;

const getRateNumber = (rate) => {
  if (typeof rate === "number") return rate;

  const parsed = Number.parseFloat(String(rate || "0").replace("%", ""));

  return Number.isFinite(parsed) ? parsed : 0;
};

const getStatusStyle = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "SAFE":
      return {
        icon: CheckCircle2,
        wrapper:
          "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20",
        iconBox:
          "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
        text: "text-emerald-700 dark:text-emerald-300",
      };

    case "CONTAMINATED":
      return {
        icon: XCircle,
        wrapper:
          "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20",
        iconBox:
          "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
        text: "text-red-700 dark:text-red-300",
      };

    case "MODERATE":
      return {
        icon: AlertTriangle,
        wrapper:
          "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20",
        iconBox:
          "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
        text: "text-amber-700 dark:text-amber-300",
      };

    default:
      return {
        icon: Database,
        wrapper:
          "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30",
        iconBox:
          "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
        text: "text-slate-600 dark:text-slate-300",
      };
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// Small UI components
// ─────────────────────────────────────────────────────────────────────────────

const MetricCard = ({
  icon: Icon,
  label,
  value,
  description,
  tone = "emerald",
}) => {
  const tones = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300",
      accent: "bg-emerald-500",
    },
    red: {
      icon: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300",
      accent: "bg-red-500",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300",
      accent: "bg-amber-500",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300",
      accent: "bg-blue-500",
    },
  };

  const style = tones[tone] || tones.emerald;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div
        className={`absolute inset-x-0 top-0 h-0.5 ${style.accent}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className={`rounded-xl p-2.5 ${style.icon}`}>
          <Icon className="h-5 w-5" />
        </div>

        {description && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
            {description}
          </span>
        )}
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};


const SectionCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  className = "",
}) => {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="mt-0.5 rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
              <Icon className="h-4 w-4" />
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {children}
    </section>
  );
};


const EmptyTable = ({ colSpan, children }) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-5 py-12 text-center text-xs text-gray-500 dark:text-gray-400"
    >
      {children}
    </td>
  </tr>
);


// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const ContaminationAnalysisReport = () => {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);

  const { theme } = useTheme();
  const {
    states,
    loadingStates,
    statesError,
  } = useStates();

  const [filters, setFilters] = useState({
    stateId: "",
    productVariantIds: "",
    dateFrom: "2026-01-01",
    dateTo: "2026-03-14",
  });

  const selectedState = states.find(
    (state) => state.id === filters.stateId
  );

  const selectedStateName = selectedState?.name || "";


  // ───────────────────────────────────────────────────────────────────────────
  // Report generation
  // ───────────────────────────────────────────────────────────────────────────

  const handleGenerateReport = async () => {
    if (!filters.dateFrom || !filters.dateTo) {
      setError("Please select both date range fields.");
      setGenerated(false);
      return;
    }

    if (filters.dateFrom > filters.dateTo) {
      setError("'From' date cannot be later than 'To' date.");
      setGenerated(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setGenerated(false);

      const parsedProductVariantIds = filters.productVariantIds
        ? filters.productVariantIds
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : [];

      const payload = {
        stateIds: filters.stateId ? [filters.stateId] : [],
        stateName: selectedStateName,
        productVariantIds: parsedProductVariantIds,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      };

      const data = await getContaminationAnalysisReport(payload);

      setReportData(data?.data || data);
      setGenerated(true);
    } catch (err) {
      console.error(
        "Failed to fetch contamination analysis report:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to generate contamination analysis report.";

      setError(message);
      setReportData(null);
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };


  // ───────────────────────────────────────────────────────────────────────────
  // Normalized report data
  // ───────────────────────────────────────────────────────────────────────────

  const generatedAt = reportData?.generatedAt
    ? new Date(reportData.generatedAt).toLocaleString()
    : "";

  const summary = reportData?.summary || {};
  const distribution = reportData?.distribution || {};
  const byState = reportData?.byState || {};
  const byProductType = reportData?.byProductType || {};
  const topContaminated = reportData?.topContaminated || [];
  const trendAnalysis = reportData?.trendAnalysis || {};


  const stateRows = useMemo(() => {
    return Object.entries(byState)
      .map(([stateName, stats]) => ({
        stateName,
        count: stats?.count || 0,
        contaminationRate:
          stats?.contaminationRate || "0%",
        safe: stats?.statuses?.SAFE || 0,
        moderate: stats?.statuses?.MODERATE || 0,
        contaminated:
          stats?.statuses?.CONTAMINATED || 0,
        pending: stats?.statuses?.PENDING || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [byState]);


  const productTypeRows = useMemo(() => {
    return Object.entries(byProductType)
      .map(([productType, stats]) => ({
        productType,
        count: stats?.count || 0,
        contaminationRate:
          stats?.contaminationRate || "0%",
        safe: stats?.statuses?.SAFE || 0,
        moderate: stats?.statuses?.MODERATE || 0,
        contaminated:
          stats?.statuses?.CONTAMINATED || 0,
        pending: stats?.statuses?.PENDING || 0,
        unverified:
          stats?.verifications?.UNVERIFIED || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [byProductType]);


  const trendRows = useMemo(() => {
    return Object.entries(trendAnalysis)
      .map(([period, stats]) => ({
        period,
        count: stats?.count || 0,
        contaminationRate:
          stats?.contaminationRate || "0%",
      }))
      .sort((a, b) =>
        a.period.localeCompare(b.period)
      );
  }, [trendAnalysis]);


  const hasData =
    Number(summary?.totalSamples || 0) > 0;


  // ───────────────────────────────────────────────────────────────────────────
  // Export handlers
  // ───────────────────────────────────────────────────────────────────────────

  const handleExportExcel = () => {
    exportContaminationAnalysisExcel({
      fileName: `contamination-analysis-${
        selectedStateName || "all-states"
      }-${filters.dateFrom}-${filters.dateTo}.xlsx`,
      generatedAt,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      states: selectedStateName,
      productVariantIds: filters.productVariantIds,
      summary,
      distribution,
      stateRows,
      productTypeRows,
      trendRows,
      topContaminated,
    });
  };


  const handleExportPdf = () => {
    exportContaminationAnalysisPdf({
      fileName: `contamination-analysis-${
        selectedStateName || "all-states"
      }-${filters.dateFrom}-${filters.dateTo}.pdf`,
      generatedAt,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      states: selectedStateName,
      productVariantIds: filters.productVariantIds,
      summary,
      distribution,
      stateRows,
      productTypeRows,
      trendRows,
      topContaminated,
    });
  };


  // ───────────────────────────────────────────────────────────────────────────
  // Derived values
  // ───────────────────────────────────────────────────────────────────────────

  const totalSamples = safe(summary.totalSamples);
  const totalReadings = safe(summary.totalReadings);

  const contaminationRate =
    summary.overallContaminationRate || "0%";

  const safeCount = safe(distribution.safe);
  const moderateCount = safe(distribution.moderate);
  const contaminatedCount = safe(distribution.contaminated);
  const pendingCount = safe(distribution.pending);

  const contaminationRateNumber =
    getRateNumber(contaminationRate);


  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className={`space-y-5 ${theme.text}`}>

      {/* ───────────────────── Page hero ───────────────────── */}

      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-5 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/30 dark:via-gray-900 dark:to-gray-950 sm:p-7">

        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                <FlaskConical className="h-3.5 w-3.5" />
                MOH Intelligence Report
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
                Contamination Analysis
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                Analyze environmental lead exposure across samples,
                states, product categories, and reporting periods.
              </p>
            </div>

            {generated && reportData && (
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-xs shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
                <CalendarDays className="h-4 w-4 text-emerald-600" />

                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">
                    Reporting period
                  </p>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {filters.dateFrom} → {filters.dateTo}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>


      {/* ───────────────────── Filters ───────────────────── */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <Filter className="h-4 w-4 text-emerald-600" />

          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Report filters
            </p>

            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Define the scope before generating the analysis.
            </p>
          </div>
        </div>

        <FilterBar>

          <label className={`text-xs ${theme.textMuted}`}>
            State
          </label>

          <select
            value={filters.stateId}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                stateId: e.target.value,
              }))
            }
            disabled={loadingStates}
            className={`w-full rounded-lg border px-3 py-2 text-xs outline-none transition focus:border-emerald-500 sm:w-auto sm:min-w-[220px] ${theme.border} ${theme.input}`}
          >
            <option value="">
              {loadingStates
                ? "Loading states..."
                : "All states"}
            </option>

            {states.map((state) => (
              <option
                key={state.id}
                value={state.id}
              >
                {state.name}
              </option>
            ))}
          </select>


          <label className={`text-xs ${theme.textMuted}`}>
            Product variant IDs
          </label>

          <input
            type="text"
            value={filters.productVariantIds}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                productVariantIds: e.target.value,
              }))
            }
            placeholder="Optional, comma-separated"
            className={`w-full rounded-lg border px-3 py-2 text-xs outline-none transition focus:border-emerald-500 sm:w-auto sm:min-w-[230px] ${theme.border} ${theme.input}`}
          />


          <FilterSep />


          <label className={`text-xs ${theme.textMuted}`}>
            From
          </label>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                dateFrom: e.target.value,
              }))
            }
            className={`w-full rounded-lg border px-3 py-2 text-xs outline-none transition focus:border-emerald-500 sm:w-auto ${theme.border} ${theme.input}`}
          />


          <label className={`text-xs ${theme.textMuted}`}>
            To
          </label>

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                dateTo: e.target.value,
              }))
            }
            className={`w-full rounded-lg border px-3 py-2 text-xs outline-none transition focus:border-emerald-500 sm:w-auto ${theme.border} ${theme.input}`}
          />


          <FilterSep />


          <BtnPrimary
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                Generate report
              </>
            )}
          </BtnPrimary>

        </FilterBar>
      </div>


      {/* ───────────────────── Errors ───────────────────── */}

      {statesError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{statesError}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}


      {/* ───────────────────── Generated report ───────────────────── */}

      {generated && reportData && (
        <div className="space-y-5">

          <ReportHeader
            title="Contamination analysis"
            subtitle={`Generated: ${
              generatedAt || "—"
            } · ${filters.dateFrom} to ${
              filters.dateTo
            }${
              selectedStateName
                ? ` · State: ${selectedStateName}`
                : ""
            }${
              filters.productVariantIds
                ? ` · Variants: ${filters.productVariantIds}`
                : ""
            }`}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
          />


          {/* ───────────── KPI row ───────────── */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <MetricCard
              icon={Database}
              label="Total samples"
              value={totalSamples}
              description="Sample records"
              tone="blue"
            />

            <MetricCard
              icon={FlaskConical}
              label="Total readings"
              value={totalReadings}
              description="Lab readings"
              tone="emerald"
            />

            <MetricCard
              icon={ShieldAlert}
              label="Contaminated"
              value={contaminatedCount}
              description={`${contaminationRate} overall`}
              tone="red"
            />

            <MetricCard
              icon={TrendingUp}
              label="Contamination rate"
              value={contaminationRate}
              description="Overall"
              tone={
                contaminationRateNumber >= 50
                  ? "red"
                  : contaminationRateNumber >= 20
                    ? "amber"
                    : "emerald"
              }
            />

          </div>


          {!hasData ? (

            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center dark:border-gray-700 dark:bg-gray-900">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800">
                <Database className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                No contamination data available
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gray-500 dark:text-gray-400">
                No samples were returned for the selected reporting
                period and filters.
              </p>

            </div>

          ) : (

            <>
              {/* ───────────── Status overview ───────────── */}

              <SectionCard
                icon={ShieldCheck}
                title="Contamination status overview"
                subtitle="Distribution of samples across the current reporting scope."
              >
                <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 dark:divide-gray-800 sm:grid-cols-4 sm:divide-y-0">

                  {[
                    {
                      label: "Safe",
                      value: safeCount,
                      status: "SAFE",
                    },
                    {
                      label: "Moderate",
                      value: moderateCount,
                      status: "MODERATE",
                    },
                    {
                      label: "Contaminated",
                      value: contaminatedCount,
                      status: "CONTAMINATED",
                    },
                    {
                      label: "Pending",
                      value: pendingCount,
                      status: "PENDING",
                    },
                  ].map((item) => {
                    const style = getStatusStyle(item.status);
                    const Icon = style.icon;

                    return (
                      <div
                        key={item.status}
                        className="p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.iconBox}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <span
                            className={`text-2xl font-bold ${style.text}`}
                          >
                            {item.value}
                          </span>
                        </div>

                        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {item.label}
                        </p>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className={`h-full rounded-full ${
                              item.status === "SAFE"
                                ? "bg-emerald-500"
                                : item.status === "MODERATE"
                                  ? "bg-amber-500"
                                  : item.status === "CONTAMINATED"
                                    ? "bg-red-500"
                                    : "bg-gray-400"
                            }`}
                            style={{
                              width: `${
                                totalSamples
                                  ? Math.min(
                                      100,
                                      (Number(item.value) /
                                        Number(totalSamples)) *
                                        100
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}

                </div>
              </SectionCard>


              {/* ───────────── State + Product intelligence ───────────── */}

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                <SectionCard
                  icon={MapPin}
                  title="State-level contamination"
                  subtitle="Compare sample volume and contamination rates by state."
                >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] border-collapse text-xs">
                      <thead>
                        <tr>
                          {[
                            "State",
                            "Samples",
                            "Safe",
                            "Moderate",
                            "Contaminated",
                            "Rate",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className={TH}
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {stateRows.length ? (
                          stateRows.map((row) => (
                            <tr
                              key={row.stateName}
                              className={`border-b last:border-b-0 ${theme.border} ${theme.hover}`}
                            >
                              <td className={`${TD} font-semibold`}>
                                {row.stateName}
                              </td>

                              <td className={TD}>
                                {row.count}
                              </td>

                              <td className={`${TD} text-emerald-600`}>
                                {row.safe}
                              </td>

                              <td className={`${TD} text-amber-600`}>
                                {row.moderate}
                              </td>

                              <td className={`${TD} font-semibold text-red-600`}>
                                {row.contaminated}
                              </td>

                              <td className={TD}>
                                <RateBadge
                                  rate={row.contaminationRate}
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <EmptyTable colSpan={6}>
                            No state breakdown available.
                          </EmptyTable>
                        )}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>


                <SectionCard
                  icon={Package}
                  title="Product-type intelligence"
                  subtitle="Identify product categories with elevated contamination."
                >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] border-collapse text-xs">
                      <thead>
                        <tr>
                          {[
                            "Product type",
                            "Samples",
                            "Safe",
                            "Moderate",
                            "Contaminated",
                            "Rate",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className={TH}
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {productTypeRows.length ? (
                          productTypeRows.map((row) => (
                            <tr
                              key={row.productType}
                              className={`border-b last:border-b-0 ${theme.border} ${theme.hover}`}
                            >
                              <td className={`${TD} font-semibold`}>
                                {row.productType || "Unknown"}
                              </td>

                              <td className={TD}>
                                {row.count}
                              </td>

                              <td className={`${TD} text-emerald-600`}>
                                {row.safe}
                              </td>

                              <td className={`${TD} text-amber-600`}>
                                {row.moderate}
                              </td>

                              <td className={`${TD} font-semibold text-red-600`}>
                                {row.contaminated}
                              </td>

                              <td className={TD}>
                                <RateBadge
                                  rate={row.contaminationRate}
                                />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <EmptyTable colSpan={6}>
                            No product-type breakdown available.
                          </EmptyTable>
                        )}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>

              </div>


              {/* ───────────── Trend ───────────── */}

              <SectionCard
                icon={TrendingUp}
                title="Contamination trend"
                subtitle="Reporting-period movement in sample volume and contamination rate."
              >
                <div className="p-5">

                  {trendRows.length ? (
                    <div className="space-y-4">

                      <div className="flex items-end gap-2 overflow-x-auto pb-2">
                        {trendRows.map((item) => {
                          const rate = getRateNumber(
                            item.contaminationRate
                          );

                          const height = Math.max(
                            12,
                            Math.min(100, rate)
                          );

                          return (
                            <div
                              key={item.period}
                              className="flex min-w-[72px] flex-1 flex-col items-center gap-2"
                            >
                              <div className="flex h-32 w-full items-end justify-center rounded-xl bg-gray-50 p-2 dark:bg-gray-950/50">
                                <div
                                  className="w-full max-w-[36px] rounded-lg bg-gradient-to-t from-red-500 to-amber-400 transition-all"
                                  style={{
                                    height: `${height}%`,
                                  }}
                                  title={`${item.contaminationRate} contamination rate`}
                                />
                              </div>

                              <span className="max-w-[80px] truncate text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                {item.period}
                              </span>

                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                {item.contaminationRate}
                              </span>
                            </div>
                          );
                        })}
                      </div>


                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[400px] border-collapse text-xs">
                          <thead>
                            <tr>
                              {["Period", "Samples", "Rate"].map(
                                (heading) => (
                                  <th
                                    key={heading}
                                    className={TH}
                                  >
                                    {heading}
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>

                          <tbody>
                            {trendRows.map((item, index) => (
                              <tr
                                key={`${item.period}-${index}`}
                                className={`border-b last:border-b-0 ${theme.border} ${theme.hover}`}
                              >
                                <td className={`${TD} font-medium`}>
                                  {item.period}
                                </td>

                                <td className={TD}>
                                  {item.count}
                                </td>

                                <td className={TD}>
                                  <RateBadge
                                    rate={item.contaminationRate}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  ) : (
                    <div className="py-10 text-center text-xs text-gray-500 dark:text-gray-400">
                      No trend analysis available.
                    </div>
                  )}

                </div>
              </SectionCard>


              {/* ───────────── Top contaminated samples ───────────── */}

              <SectionCard
                icon={ShieldAlert}
                title="Priority contaminated samples"
                subtitle="Samples requiring closer laboratory, regulatory, or field attention."
              >
                {topContaminated.length ? (

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse text-xs">
                      <thead>
                        <tr>
                          {[
                            "Sample",
                            "State",
                            "Heavy metal",
                            "Reading",
                            "Status",
                            "",
                          ].map((heading, index) => (
                            <th
                              key={`${heading}-${index}`}
                              className={TH}
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {topContaminated.map((item, index) => {
                          const firstMetal =
                            Array.isArray(
                              item.contaminatedMetals
                            )
                              ? item.contaminatedMetals[0]
                              : null;

                          const sampleName =
                            item.code ||
                            item.sampleId ||
                            item.sampleCode ||
                            item.sampleName ||
                            `Sample ${index + 1}`;

                          const metal =
                            item.heavyMetal ||
                            firstMetal?.metal ||
                            "—";

                          const reading =
                            item.reading ??
                            firstMetal?.concentration ??
                            "—";

                          const status =
                            item.status ||
                            item.verificationStatus ||
                            "CONTAMINATED";

                          return (
                            <tr
                              key={`${sampleName}-${index}`}
                              className={`border-b last:border-b-0 ${theme.border} ${theme.hover}`}
                            >
                              <td className={`${TD} font-semibold`}>
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300">
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                  </div>

                                  <span>
                                    {sampleName}
                                  </span>
                                </div>
                              </td>

                              <td className={TD}>
                                {item.state || "—"}
                              </td>

                              <td className={`${TD} font-medium`}>
                                {metal}
                              </td>

                              <td className={`${TD} font-semibold text-red-600`}>
                                {reading}
                              </td>

                              <td className={TD}>
                                <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                                  {status}
                                </span>
                              </td>

                              <td className={TD}>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                ) : (

                  <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                      No priority contaminated samples
                    </h3>

                    <p className="mt-1 max-w-md text-xs leading-5 text-gray-500 dark:text-gray-400">
                      No contaminated samples were returned for the selected filters.
                    </p>
                  </div>

                )}
              </SectionCard>


              {/* ───────────── Report metadata ───────────── */}

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/40">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-white p-2 text-emerald-600 shadow-sm dark:bg-gray-900 dark:text-emerald-300">
                      <ClipboardList className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        Report scope
                      </p>

                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        {selectedStateName || "All states"} ·{" "}
                        {filters.dateFrom} →{" "}
                        {filters.dateTo}
                      </p>
                    </div>
                  </div>


                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>

                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Excel
                    </button>

                  </div>

                </div>
              </div>

            </>
          )}

        </div>
      )}
    </div>
  );
};

export default ContaminationAnalysisReport;