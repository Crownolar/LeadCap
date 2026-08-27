import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  MapPin,
  Package,
  RefreshCw,
  ShieldAlert,
  Skull,
  Target,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import { getRiskAssessmentReport } from "../../../../../../services/mohReportService";
import {
  exportRiskAssessmentExcel,
  exportRiskAssessmentPdf,
} from "../../../../utils/reportExport";
import { useTheme } from "../../../../../../context/ThemeContext";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const value = (item, fallback = "—") => {
  if (item === null || item === undefined || item === "") return fallback;
  return item;
};

const textValue = (item, fallback = "—") => {
  if (typeof item === "string" || typeof item === "number") return item;
  if (item && typeof item === "object") {
    return (
      item.action ||
      item.title ||
      item.finding ||
      item.recommendation ||
      item.name ||
      fallback
    );
  }
  return fallback;
};

const riskClass = (risk) => {
  const normalized = String(risk || "").toLowerCase();

  if (
    normalized.includes("critical") ||
    normalized.includes("severe")
  ) {
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50";
  }

  if (
    normalized.includes("high") ||
    normalized.includes("danger")
  ) {
    return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-900/50";
  }

  if (
    normalized.includes("moderate") ||
    normalized.includes("medium")
  ) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50";
  }

  return "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
};

const getRiskLabel = (item) =>
  item?.riskLevel || item?.risk || item?.status || "—";

const getAreaName = (item) =>
  item?.area ||
  item?.location ||
  item?.market ||
  item?.name ||
  "Unknown area";

const getStateName = (item) =>
  item?.state || item?.stateName || "—";

const getSampleName = (item) =>
  item?.sampleId ||
  item?.sampleCode ||
  item?.sampleName ||
  "Unknown sample";

const getProductName = (item) =>
  item?.productName ||
  item?.product ||
  item?.name ||
  "Unknown product";

const getLeadLevel = (item) =>
  item?.leadLevel ??
  item?.reading ??
  item?.lead ??
  "—";

/* -------------------------------------------------------------------------- */
/* Small UI primitives                                                        */
/* -------------------------------------------------------------------------- */

const Card = ({ children, className = "", theme }) => (
  <div
    className={`rounded-2xl border ${theme.border} ${theme.card} shadow-sm ${className}`}
  >
    {children}
  </div>
);

const SectionTitle = ({
  icon: Icon,
  title,
  subtitle,
  action,
  theme,
}) => (
  <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-start gap-3">
      {Icon && (
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
          <Icon className="h-4 w-4" />
        </div>
      )}

      <div className="min-w-0">
        <h2 className={`text-sm font-bold ${theme.text}`}>{title}</h2>
        {subtitle && (
          <p className={`mt-1 text-xs ${theme.textMuted}`}>{subtitle}</p>
        )}
      </div>
    </div>

    {action}
  </div>
);

const MetricCard = ({
  icon: Icon,
  label,
  value: metricValue,
  description,
  tone = "neutral",
  theme,
}) => {
  const tones = {
    red: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300",
    orange:
      "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300",
    neutral:
      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div className={`rounded-2xl border ${theme.border} ${theme.card} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <ArrowUpRight
          className={`h-4 w-4 ${theme.textMuted}`}
        />
      </div>

      <p className={`mt-4 text-xs font-medium ${theme.textMuted}`}>
        {label}
      </p>

      <p className={`mt-1 text-2xl font-bold tracking-tight ${theme.text}`}>
        {metricValue}
      </p>

      {description && (
        <p className={`mt-1 text-[11px] ${theme.textMuted}`}>
          {description}
        </p>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

const RiskAssessmentReport = () => {
  const { theme } = useTheme();

  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);

  const [filters, setFilters] = useState({
    minLeadLevel: "",
    dateFrom: "2026-03-13",
    dateTo: "2026-03-14",
  });

  const summary = reportData?.summary || {};
  const topRiskAreas = reportData?.topRiskAreas || [];
  const criticalSamples = reportData?.criticalSamples || [];
  const unregisteredHighRisk = reportData?.unregisteredHighRisk || [];
  const counterfeitsHighRisk = reportData?.counterfeitsHighRisk || [];
  const riskByProductType = reportData?.riskByProductType || [];
  const actionItems = reportData?.actionItems || [];

  const generatedAt = reportData?.generatedAt
    ? new Date(reportData.generatedAt).toLocaleString()
    : "";

  const hasAnyData =
    topRiskAreas.length > 0 ||
    criticalSamples.length > 0 ||
    unregisteredHighRisk.length > 0 ||
    counterfeitsHighRisk.length > 0 ||
    riskByProductType.length > 0 ||
    actionItems.length > 0;

  /* ------------------------------------------------------------------------ */
  /* Generate                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleGenerateReport = async () => {
    if (!filters.dateFrom || !filters.dateTo) {
      setError("Please select both date range fields.");
      return;
    }

    if (filters.dateFrom > filters.dateTo) {
      setError("'From' date cannot be later than 'To' date.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setGenerated(false);

      const data = await getRiskAssessmentReport({
        minLeadLevel: filters.minLeadLevel || undefined,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });

      setReportData(data?.data || data);
      setGenerated(true);
    } catch (err) {
      console.error("Failed to fetch risk assessment report:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to generate risk assessment report.";

      setError(message);
      setReportData(null);
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Exports                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleExportExcel = () => {
    exportRiskAssessmentExcel({
      fileName: `risk-assessment-${filters.dateFrom}-${filters.dateTo}.xlsx`,
      generatedAt,
      minLeadLevel: filters.minLeadLevel,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      summary,
      topRiskAreas,
      criticalSamples,
      unregisteredHighRisk,
      counterfeitsHighRisk,
      riskByProductType,
      actionItems,
    });
  };

  const handleExportPdf = () => {
    exportRiskAssessmentPdf({
      fileName: `risk-assessment-${filters.dateFrom}-${filters.dateTo}.pdf`,
      generatedAt,
      minLeadLevel: filters.minLeadLevel,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      summary,
      topRiskAreas,
      criticalSamples,
      unregisteredHighRisk,
      counterfeitsHighRisk,
      riskByProductType,
      actionItems,
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className={`${theme.text} space-y-6`}>
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div
        className={`overflow-hidden rounded-3xl border ${theme.border} ${theme.card} shadow-sm`}
      >
        <div className="relative overflow-hidden px-5 py-6 sm:px-7 sm:py-7">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-red-500/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-emerald-500/5 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Risk Intelligence
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Risk Assessment
                </h1>

                <p className={`mt-2 max-w-2xl text-sm ${theme.textMuted}`}>
                  Identify high-risk samples, geographic hotspots,
                  counterfeit products, and priority regulatory actions.
                </p>
              </div>

              {generated && reportData && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </button>

                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </button>
                </div>
              )}
            </div>

            {/* Filters */}
            <div
              className={`mt-6 rounded-2xl border ${theme.border} ${theme.bg} p-4`}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
                <div>
                  <label
                    className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-wide ${theme.textMuted}`}
                  >
                    Minimum lead level
                  </label>

                  <div className="relative">
                    <Target
                      className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`}
                    />

                    <input
                      type="number"
                      value={filters.minLeadLevel}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          minLeadLevel: e.target.value,
                        }))
                      }
                      placeholder="0.0"
                      className={`w-full rounded-xl border ${theme.border} ${theme.input} py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10`}
                    />
                  </div>

                  <p className={`mt-1 text-[10px] ${theme.textMuted}`}>
                    Threshold in ppm
                  </p>
                </div>

                <div>
                  <label
                    className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-wide ${theme.textMuted}`}
                  >
                    From
                  </label>

                  <div className="relative">
                    <CalendarDays
                      className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`}
                    />

                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          dateFrom: e.target.value,
                        }))
                      }
                      className={`w-full rounded-xl border ${theme.border} ${theme.input} py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-wide ${theme.textMuted}`}
                  >
                    To
                  </label>

                  <div className="relative">
                    <CalendarDays
                      className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`}
                    />

                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          dateTo: e.target.value,
                        }))
                      }
                      className={`w-full rounded-xl border ${theme.border} ${theme.input} py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500`}
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4" />
                        Generate report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {generated && reportData && (
              <div className={`mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] ${theme.textMuted}`}>
                <span>
                  Generated: <strong className={theme.text}>{generatedAt || "—"}</strong>
                </span>

                <span>
                  Lead threshold:{" "}
                  <strong className={theme.text}>
                    {filters.minLeadLevel || "Not specified"} ppm
                  </strong>
                </span>

                <span>
                  Period:{" "}
                  <strong className={theme.text}>
                    {filters.dateFrom} → {filters.dateTo}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Error                                                               */}
      {/* ------------------------------------------------------------------ */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Empty state before generation                                      */}
      {/* ------------------------------------------------------------------ */}

      {!generated && !loading && !error && (
        <Card theme={theme} className="p-10">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
              <ShieldAlert className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-lg font-bold">
              Generate a risk assessment
            </h2>

            <p className={`mt-2 text-sm leading-6 ${theme.textMuted}`}>
              Select the reporting period and optional lead threshold above.
              The system will assemble geographic, product, sample, and
              regulatory risk intelligence.
            </p>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Loading                                                             */}
      {/* ------------------------------------------------------------------ */}

      {loading && (
        <Card theme={theme} className="p-10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <p className="mt-4 text-sm font-semibold">
              Building risk assessment
            </p>
            <p className={`mt-1 text-xs ${theme.textMuted}`}>
              Analysing samples, locations, products and risk indicators…
            </p>
          </div>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Report                                                             */}
      {/* ------------------------------------------------------------------ */}

      {generated && reportData && (
        <div className="space-y-6">
          {/* Summary */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Risk overview</h2>
                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Executive summary for the selected assessment period.
                </p>
              </div>

              <span
                className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold sm:inline-flex ${riskClass(
                  "HIGH"
                )}`}
              >
                <TriangleAlert className="h-3 w-3" />
                Intelligence Report
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                icon={Skull}
                label="Total high-risk samples"
                value={summary.totalHighRiskSamples ?? 0}
                description="Samples requiring attention"
                tone="red"
                theme={theme}
              />

              <MetricCard
                icon={AlertTriangle}
                label="Critical samples"
                value={summary.criticalSamplesCount ?? 0}
                description="Highest-priority records"
                tone="red"
                theme={theme}
              />

              <MetricCard
                icon={MapPin}
                label="High-risk areas"
                value={summary.highRiskAreasCount ?? 0}
                description="Geographic hotspots"
                tone="orange"
                theme={theme}
              />

              <MetricCard
                icon={Package}
                label="Unregistered high-risk"
                value={summary.unregisteredHighRiskCount ?? 0}
                description="Products needing attention"
                tone="amber"
                theme={theme}
              />

              <MetricCard
                icon={ShieldAlert}
                label="Counterfeit high-risk"
                value={summary.counterfeitsHighRiskCount ?? 0}
                description="Verified or suspected fakes"
                tone="violet"
                theme={theme}
              />
            </div>
          </div>

          {!hasAnyData ? (
            <Card theme={theme} className="p-10">
              <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />

                <h3 className="mt-4 text-base font-bold">
                  No risk indicators found
                </h3>

                <p className={`mt-2 text-sm ${theme.textMuted}`}>
                  No risk assessment records are available for the selected
                  filters.
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* ---------------------------------------------------------- */}
              {/* Top risk areas + risk by product type                     */}
              {/* ---------------------------------------------------------- */}

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Card theme={theme} className="overflow-hidden">
                  <SectionTitle
                    icon={MapPin}
                    title="Top risk areas"
                    subtitle="Locations with the highest concentration of risk."
                    theme={theme}
                  />

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left">
                      <thead>
                        <tr className={`border-b ${theme.border}`}>
                          <th className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                            Area
                          </th>
                          <th className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                            State
                          </th>
                          <th className={`px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                            Cases
                          </th>
                          <th className={`px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                            Risk
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {topRiskAreas.length ? (
                          topRiskAreas.map((item, index) => (
                            <tr
                              key={`${getAreaName(item)}-${index}`}
                              className={`border-b last:border-b-0 ${theme.border} transition hover:bg-gray-50/70 dark:hover:bg-gray-800/30`}
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[10px] font-bold text-red-600 dark:bg-red-950/30 dark:text-red-300">
                                    {index + 1}
                                  </span>

                                  <span className="text-xs font-semibold">
                                    {getAreaName(item)}
                                  </span>
                                </div>
                              </td>

                              <td className={`px-5 py-3.5 text-xs ${theme.textMuted}`}>
                                {getStateName(item)}
                              </td>

                              <td className="px-5 py-3.5 text-right text-xs font-bold">
                                {value(item.count ?? item.total, 0)}
                              </td>

                              <td className="px-5 py-3.5 text-right">
                                <span
                                  className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${riskClass(
                                    getRiskLabel(item)
                                  )}`}
                                >
                                  {getRiskLabel(item)}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className={`px-5 py-10 text-center text-xs ${theme.textMuted}`}
                            >
                              No top risk areas available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card theme={theme} className="overflow-hidden">
                  <SectionTitle
                    icon={Package}
                    title="Risk by product type"
                    subtitle="Product categories contributing to the risk profile."
                    theme={theme}
                  />

                  <div className="divide-y">
                    {riskByProductType.length ? (
                      riskByProductType.map((item, index) => {
                        const label =
                          item.productType ||
                          item.type ||
                          item.name ||
                          "Unknown";

                        const count = item.count ?? item.total ?? 0;

                        return (
                          <div
                            key={`${label}-${index}`}
                            className={`px-5 py-4 ${theme.border}`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold">
                                  {label}
                                </p>

                                <p className={`mt-1 text-[10px] ${theme.textMuted}`}>
                                  {count} high-risk record
                                  {Number(count) === 1 ? "" : "s"}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${riskClass(
                                  getRiskLabel(item)
                                )}`}
                              >
                                {getRiskLabel(item)}
                              </span>
                            </div>

                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                              <div
                                className="h-full rounded-full bg-red-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      5,
                                      Number(count) * 8
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        className={`px-5 py-10 text-center text-xs ${theme.textMuted}`}
                      >
                        No product risk data available.
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* Critical samples                                           */}
              {/* ---------------------------------------------------------- */}

              <Card theme={theme} className="overflow-hidden">
                <SectionTitle
                  icon={Skull}
                  title="Critical samples"
                  subtitle="Samples requiring the highest level of regulatory or laboratory attention."
                  theme={theme}
                  action={
                    <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                      {criticalSamples.length} records
                    </span>
                  }
                />

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className={`border-b ${theme.border}`}>
                        <th className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                          Sample
                        </th>
                        <th className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                          State
                        </th>
                        <th className={`px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                          Lead level
                        </th>
                        <th className={`px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {criticalSamples.length ? (
                        criticalSamples.map((item, index) => (
                          <tr
                            key={`${getSampleName(item)}-${index}`}
                            className={`border-b last:border-b-0 ${theme.border} hover:bg-red-50/30 dark:hover:bg-red-950/10`}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300">
                                  <AlertTriangle className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold">
                                    {getSampleName(item)}
                                  </p>

                                  {item.productName && (
                                    <p className={`mt-1 truncate text-[10px] ${theme.textMuted}`}>
                                      {item.productName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className={`px-5 py-4 text-xs ${theme.textMuted}`}>
                              {getStateName(item)}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                {getLeadLevel(item)}
                              </span>
                              <span className={`ml-1 text-[10px] ${theme.textMuted}`}>
                                ppm
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${riskClass(
                                  getRiskLabel(item)
                                )}`}
                              >
                                {getRiskLabel(item)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className={`px-5 py-10 text-center text-xs ${theme.textMuted}`}
                          >
                            No critical samples available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* ---------------------------------------------------------- */}
              {/* Unregistered + counterfeit                                */}
              {/* ---------------------------------------------------------- */}

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Card theme={theme} className="overflow-hidden">
                  <SectionTitle
                    icon={Package}
                    title="Unregistered high-risk"
                    subtitle="High-risk products without expected registration status."
                    theme={theme}
                  />

                  <div className="divide-y">
                    {unregisteredHighRisk.length ? (
                      unregisteredHighRisk.map((item, index) => (
                        <div
                          key={`${getProductName(item)}-${index}`}
                          className={`px-5 py-4 ${theme.border}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
                                <Package className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold">
                                  {getProductName(item)}
                                </p>

                                <p className={`mt-1 text-[10px] ${theme.textMuted}`}>
                                  {item.sampleId ||
                                    item.sampleCode ||
                                    "Sample not specified"}
                                </p>
                              </div>
                            </div>

                            <span className="shrink-0 text-sm font-bold text-red-600 dark:text-red-400">
                              {getLeadLevel(item)}
                              <span className={`ml-1 text-[9px] font-normal ${theme.textMuted}`}>
                                ppm
                              </span>
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] ${theme.border} ${theme.textMuted}`}>
                              <MapPin className="h-3 w-3" />
                              {getStateName(item)}
                            </span>

                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${riskClass(
                                "HIGH"
                              )}`}
                            >
                              HIGH RISK
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        className={`px-5 py-10 text-center text-xs ${theme.textMuted}`}
                      >
                        No unregistered high-risk products available.
                      </div>
                    )}
                  </div>
                </Card>

                <Card theme={theme} className="overflow-hidden">
                  <SectionTitle
                    icon={ShieldAlert}
                    title="Counterfeit high-risk"
                    subtitle="Products presenting counterfeit or verification-related risk."
                    theme={theme}
                  />

                  <div className="divide-y">
                    {counterfeitsHighRisk.length ? (
                      counterfeitsHighRisk.map((item, index) => (
                        <div
                          key={`${getProductName(item)}-${index}`}
                          className={`px-5 py-4 ${theme.border}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300">
                                <ShieldAlert className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold">
                                  {getProductName(item)}
                                </p>

                                <p className={`mt-1 text-[10px] ${theme.textMuted}`}>
                                  {item.sampleId ||
                                    item.sampleCode ||
                                    "Sample not specified"}
                                </p>
                              </div>
                            </div>

                            <span className="shrink-0 text-sm font-bold text-red-600 dark:text-red-400">
                              {getLeadLevel(item)}
                              <span className={`ml-1 text-[9px] font-normal ${theme.textMuted}`}>
                                ppm
                              </span>
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] ${theme.border} ${theme.textMuted}`}>
                              <MapPin className="h-3 w-3" />
                              {getStateName(item)}
                            </span>

                            <span
                              className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${riskClass(
                                "CRITICAL"
                              )}`}
                            >
                              HIGH RISK
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        className={`px-5 py-10 text-center text-xs ${theme.textMuted}`}
                      >
                        No counterfeit high-risk products available.
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* Action items                                               */}
              {/* ---------------------------------------------------------- */}

              <Card theme={theme} className="overflow-hidden">
                <SectionTitle
                  icon={TrendingUp}
                  title="Priority action items"
                  subtitle="Recommended operational responses derived from the assessment."
                  theme={theme}
                />

                <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
                  {actionItems.length ? (
                    actionItems.map((item, index) => {
                      const isObject =
                        item &&
                        typeof item === "object" &&
                        !Array.isArray(item);

                      return (
                        <div
                          key={index}
                          className={`rounded-2xl border ${theme.border} ${theme.bg} p-4`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                                  Action {index + 1}
                                </span>

                                {isObject && item.priority && (
                                  <span
                                    className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${riskClass(
                                      item.priority
                                    )}`}
                                  >
                                    {item.priority}
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-xs font-semibold leading-5">
                                {textValue(item)}
                              </p>

                              {isObject && item.category && (
                                <p className={`mt-2 text-[10px] ${theme.textMuted}`}>
                                  Category: {textValue(item.category)}
                                </p>
                              )}

                              {isObject && item.finding && (
                                <p className={`mt-2 text-[11px] leading-5 ${theme.textMuted}`}>
                                  {textValue(item.finding)}
                                </p>
                              )}

                              {isObject && item.recommendation && (
                                <p className={`mt-2 text-[11px] leading-5 ${theme.textMuted}`}>
                                  Recommendation:{" "}
                                  {textValue(item.recommendation)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      className={`md:col-span-2 rounded-2xl border ${theme.border} p-8 text-center text-xs ${theme.textMuted}`}
                    >
                      No action items available.
                    </div>
                  )}
                </div>
              </Card>

              {/* ---------------------------------------------------------- */}
              {/* Footer                                                     */}
              {/* ---------------------------------------------------------- */}

              <div
                className={`flex flex-col gap-2 border-t pt-4 text-[10px] ${theme.border} ${theme.textMuted} sm:flex-row sm:items-center sm:justify-between`}
              >
                <span>
                  Risk Assessment • {filters.dateFrom} to {filters.dateTo}
                </span>

                <span>
                  Lead threshold:{" "}
                  {filters.minLeadLevel || "Not specified"} ppm
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentReport;