import { useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  MapPin,
  Package,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";

import { FilterBar } from "../../../../components/FilterBar";
import { RateBadge } from "../../../../components/RateBadge";
import { FilterSep, BtnPrimary } from "../../../../utils/MohUI";

import { getStateSummaryReport } from "../../../../../../services/mohReportService";

import {
  exportStateSummaryExcel,
  exportStateSummaryPdf,
} from "../../../../utils/reportExport";

import ReportHeader from "./ReportHeader";

import { useTheme } from "../../../../../../context/ThemeContext";
import { useStates } from "../../../../hooks/useStates";
import { SectionLabel } from "../../../../components/SectionLabel";

/* ============================================================================
   Small local UI helpers
============================================================================ */

const MetricCard = ({
  label,
  value,
  description,
  icon: Icon,
  tone = "neutral",
  theme,
}) => {
  const tones = {
    neutral: {
      icon: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
      value: theme.text,
      accent: "bg-gray-400",
    },
    safe: {
      icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
      value: "text-emerald-700 dark:text-emerald-300",
      accent: "bg-emerald-500",
    },
    warning: {
      icon: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
      value: "text-amber-700 dark:text-amber-300",
      accent: "bg-amber-500",
    },
    danger: {
      icon: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300",
      value: "text-red-700 dark:text-red-300",
      accent: "bg-red-500",
    },
    info: {
      icon: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300",
      value: "text-blue-700 dark:text-blue-300",
      accent: "bg-blue-500",
    },
  };

  const t = tones[tone] || tones.neutral;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${theme.border} ${theme.card} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${t.accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted}`}
        >
          MOH
        </span>
      </div>

      <div className="mt-4">
        <p className={`text-xs font-medium ${theme.textMuted}`}>{label}</p>

        <p className={`mt-1 text-2xl font-bold tracking-tight ${t.value}`}>
          {value}
        </p>

        {description && (
          <p className={`mt-1 text-[11px] ${theme.textMuted}`}>{description}</p>
        )}
      </div>
    </div>
  );
};

const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
  theme,
}) => (
  <section
    className={`overflow-hidden rounded-2xl border ${theme.border} ${theme.card} ${className}`}
  >
    <div
      className={`flex flex-col gap-2 border-b ${theme.border} px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.emerald}`}
          >
            <Icon className={`h-4 w-4 ${theme.emeraldText}`} />
          </div>
        )}

        <div>
          <h2 className={`text-sm font-bold ${theme.text}`}>{title}</h2>

          {subtitle && (
            <p className={`mt-0.5 text-xs ${theme.textMuted}`}>{subtitle}</p>
          )}
        </div>
      </div>
    </div>

    {children}
  </section>
);

const EmptyReport = ({ title, description, theme }) => (
  <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-full ${theme.bg}`}
    >
      <BarChart3 className={`h-5 w-5 ${theme.textMuted}`} />
    </div>

    <p className={`mt-3 text-sm font-semibold ${theme.text}`}>{title}</p>

    <p className={`mt-1 max-w-md text-xs ${theme.textMuted}`}>{description}</p>
  </div>
);

const StatusRow = ({ label, value, tone = "neutral", theme }) => {
  const colors = {
    neutral: theme.text,
    safe: "text-emerald-600 dark:text-emerald-300",
    warning: "text-amber-600 dark:text-amber-300",
    danger: "text-red-600 dark:text-red-300",
    info: "text-blue-600 dark:text-blue-300",
  };

  return (
    <div
      className={`flex items-center justify-between gap-4 border-b ${theme.border} py-3 last:border-b-0`}
    >
      <span className={`text-sm ${theme.textMuted}`}>{label}</span>

      <span className={`text-sm font-bold ${colors[tone]}`}>{value}</span>
    </div>
  );
};

/* ============================================================================
   Main component
============================================================================ */

const StateSummaryReport = () => {
  const { theme } = useTheme();
  const { states, loadingStates, statesError } = useStates();

  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);

  const [filters, setFilters] = useState({
    stateId: "",
    dateFrom: "2026-01-01",
    dateTo: "2026-03-14",
  });

  const selectedState = states.find((state) => state.id === filters.stateId);

  const selectedStateName = selectedState?.name || "";

  /* --------------------------------------------------------------------------
     Generate report
  -------------------------------------------------------------------------- */

  const handleGenerateReport = async () => {
    if (!filters.stateId) {
      setError("Please select a state.");
      setGenerated(false);
      return;
    }

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

      const payload = {
        stateId: filters.stateId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      };

      const data = await getStateSummaryReport(payload);

      setReportData(data?.data || data);
      setGenerated(true);
    } catch (err) {
      console.error("Failed to fetch state summary report:", err);

      const message =
        err?.response?.status === 404
          ? "No data found for selected filters."
          : err?.response?.data?.error ||
            "Failed to generate state summary report.";

      setError(message);
      setReportData(null);
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------------------------
     Normalize report data
  -------------------------------------------------------------------------- */

  const generatedAt = reportData?.generatedAt
    ? new Date(reportData.generatedAt).toLocaleString()
    : "";

  const summary = reportData?.summary || {};

  const contaminationBreakdown = summary?.contaminationBreakdown || {};

  const verificationBreakdown = summary?.verificationBreakdown || {};

  const registrationStatus = reportData?.registrationStatus || {};

  const vendorType = reportData?.vendorType || {};

  const recommendations = reportData?.recommendations || [];

  const byLGA = reportData?.byLGA || {};

  const byProductType = reportData?.byProductType || {};

  /* --------------------------------------------------------------------------
     LGA rows
  -------------------------------------------------------------------------- */

  const topLgas = useMemo(() => {
    return Object.entries(byLGA)
      .map(([lgaName, stats]) => {
        const contaminated = stats?.contaminated || 0;
        const total = stats?.total || 0;

        const tested = total - (stats?.pending || 0);

        const rate =
          tested > 0 ? `${((contaminated / tested) * 100).toFixed(1)}%` : "N/A";

        return {
          lgaName,
          samples: total,
          contaminated,
          pending: stats?.pending || 0,
          safe: stats?.safe || 0,
          moderate: stats?.moderate || 0,
          rate,
        };
      })
      .sort((a, b) => b.samples - a.samples);
  }, [byLGA]);

  /* --------------------------------------------------------------------------
     Product type rows
  -------------------------------------------------------------------------- */

  const productRows = useMemo(() => {
    return Object.entries(byProductType)
      .map(([productType, stats]) => {
        const contaminated = stats?.contaminated || 0;
        const total = stats?.total || 0;
        const pending = stats?.pending || 0;

        const tested = total - pending;

        const rate =
          tested > 0 ? `${((contaminated / tested) * 100).toFixed(1)}%` : "N/A";

        return {
          productType,
          total,
          contaminated,
          pending,
          rate,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [byProductType]);

  /* --------------------------------------------------------------------------
     Export
  -------------------------------------------------------------------------- */

  const exportPayload = {
    generatedAt,
    state: summary.state?.name || selectedStateName,
    dateFrom: summary?.dateRange?.from || filters.dateFrom,
    dateTo: summary?.dateRange?.to || filters.dateTo,
    summary,
    contaminationBreakdown,
    registrationStatus,
    vendorType,
    verificationBreakdown,
    topLgas,
    recommendations,
  };

  const handleExportExcel = () => {
    exportStateSummaryExcel({
      fileName: `state-summary-${
        summary.state?.name || selectedStateName || "report"
      }-${summary?.dateRange?.from || filters.dateFrom}-${
        summary?.dateRange?.to || filters.dateTo
      }.xlsx`,
      ...exportPayload,
    });
  };

  const handleExportPdf = () => {
    exportStateSummaryPdf({
      fileName: `state-summary-${
        summary.state?.name || selectedStateName || "report"
      }-${summary?.dateRange?.from || filters.dateFrom}-${
        summary?.dateRange?.to || filters.dateTo
      }.pdf`,
      ...exportPayload,
    });
  };

  /* --------------------------------------------------------------------------
     Derived metrics
  -------------------------------------------------------------------------- */

  const totalSamples = summary?.totalSamples ?? 0;

  const contaminated = contaminationBreakdown?.CONTAMINATED ?? 0;

  const safe = contaminationBreakdown?.SAFE ?? 0;

  const moderate = contaminationBreakdown?.MODERATE ?? 0;

  const pending = contaminationBreakdown?.PENDING ?? 0;

  const contaminationRate = Number(summary?.percentageContaminated ?? 0);

  const verifiedOriginal = verificationBreakdown?.VERIFIED_ORIGINAL ?? 0;

  const verifiedFake = verificationBreakdown?.VERIFIED_FAKE ?? 0;

  const unverified = verificationBreakdown?.UNVERIFIED ?? 0;

  const verificationPending = verificationBreakdown?.VERIFICATION_PENDING ?? 0;

  return (
    <div className={`${theme.text} space-y-6`}>
      {/* =====================================================================
          PAGE HERO
      ====================================================================== */}

      <div
        className={`relative overflow-hidden rounded-3xl border ${theme.border} ${theme.card}`}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl ${theme.emerald}`}
          />

          <div
            className={`absolute -bottom-32 -left-20 h-56 w-56 rounded-full opacity-20 blur-3xl ${theme.emerald}`}
          />
        </div>

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div
                className={`mb-4 inline-flex items-center gap-2 rounded-full border ${theme.emeraldBorder} ${theme.emerald} px-3 py-1.5`}
              >
                <ShieldCheck className={`h-3.5 w-3.5 ${theme.emeraldText}`} />

                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${theme.emeraldText}`}
                >
                  Ministry of Health Intelligence
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                State Summary Report
              </h1>

              <p
                className={`mt-3 max-w-xl text-sm leading-6 ${theme.textMuted}`}
              >
                Consolidated lead exposure intelligence across samples,
                contamination status, verification, product categories, vendors
                and LGAs.
              </p>

              {generated && reportData && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border ${theme.border} px-2.5 py-1.5 text-xs ${theme.textMuted}`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {summary.state?.name || selectedStateName}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border ${theme.border} px-2.5 py-1.5 text-xs ${theme.textMuted}`}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    {summary?.dateRange?.from || filters.dateFrom}
                    {" → "}
                    {summary?.dateRange?.to || filters.dateTo}
                  </span>

                  {generatedAt && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border ${theme.border} px-2.5 py-1.5 text-xs ${theme.textMuted}`}
                    >
                      Generated {generatedAt}
                    </span>
                  )}
                </div>
              )}
            </div>

            {generated && reportData && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border ${theme.border} ${theme.card} px-4 py-2.5 text-xs font-semibold transition hover:shadow-sm`}
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          FILTER PANEL
      ====================================================================== */}

      <section
        className={`rounded-2xl border ${theme.border} ${theme.card} p-5`}
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.emerald}`}
          >
            <CalendarDays className={`h-4 w-4 ${theme.emeraldText}`} />
          </div>

          <div>
            <h2 className="text-sm font-bold">Report parameters</h2>

            <p className={`mt-0.5 text-xs ${theme.textMuted}`}>
              Select a state and analysis period to generate the latest
              intelligence report.
            </p>
          </div>
        </div>

        <FilterBar>
          <label className={`text-xs font-semibold ${theme.textMuted}`}>
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
            className={`w-full rounded-xl border ${theme.border} ${theme.input} px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 sm:w-auto sm:min-w-[230px] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <option value="">
              {loadingStates ? "Loading states..." : "Select a state"}
            </option>

            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>

          <FilterSep />

          <label className={`text-xs font-semibold ${theme.textMuted}`}>
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
            className={`w-full rounded-xl border ${theme.border} ${theme.input} px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 sm:w-auto`}
          />

          <label className={`text-xs font-semibold ${theme.textMuted}`}>
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
            className={`w-full rounded-xl border ${theme.border} ${theme.input} px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 sm:w-auto`}
          />

          <BtnPrimary onClick={handleGenerateReport} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="mr-1.5 inline h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <BarChart3 className="mr-1.5 inline h-3.5 w-3.5" />
                Generate report
              </>
            )}
          </BtnPrimary>
        </FilterBar>
      </section>

      {/* =====================================================================
          ALERTS
      ====================================================================== */}

      {statesError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{statesError}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Unable to generate report</p>
            <p className="mt-0.5 text-xs opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* =====================================================================
          LOADING
      ====================================================================== */}

      {loading && (
        <div
          className={`rounded-2xl border ${theme.border} ${theme.card} p-10`}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative h-11 w-11">
              <div
                className={`absolute inset-0 rounded-full border-2 ${theme.border}`}
              />

              <div className="absolute inset-0 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>

            <p className="mt-4 text-sm font-semibold">
              Generating state intelligence
            </p>

            <p className={`mt-1 text-xs ${theme.textMuted}`}>
              Collecting contamination, verification and geographic data...
            </p>
          </div>
        </div>
      )}

      {/* =====================================================================
          REPORT
      ====================================================================== */}

      {generated && reportData && !loading && (
        <div className="space-y-6">
          {/* -----------------------------------------------------------------
              KPI GRID
          ------------------------------------------------------------------ */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total samples"
              value={totalSamples}
              description={`${filters.dateFrom} → ${filters.dateTo}`}
              icon={Package}
              tone="info"
              theme={theme}
            />

            <MetricCard
              label="Safe samples"
              value={safe}
              description="Within acceptable limits"
              icon={CheckCircle2}
              tone="safe"
              theme={theme}
            />

            <MetricCard
              label="Contaminated"
              value={contaminated}
              description={`${contaminationRate}% contamination rate`}
              icon={ShieldAlert}
              tone="danger"
              theme={theme}
            />

            <MetricCard
              label="Pending analysis"
              value={pending}
              description="Awaiting laboratory result"
              icon={RefreshCw}
              tone="warning"
              theme={theme}
            />
          </div>

          {/* -----------------------------------------------------------------
              CONTAMINATION + VERIFICATION
          ------------------------------------------------------------------ */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SectionCard
              title="Contamination profile"
              subtitle="Sample outcome distribution"
              icon={ShieldAlert}
              theme={theme}
            >
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className={`rounded-xl ${theme.bg} p-4`}>
                    <p className={`text-xs ${theme.textMuted}`}>Safe</p>
                    <p className="mt-1 text-xl font-bold text-emerald-600">
                      {safe}
                    </p>
                  </div>

                  <div className={`rounded-xl ${theme.bg} p-4`}>
                    <p className={`text-xs ${theme.textMuted}`}>Moderate</p>
                    <p className="mt-1 text-xl font-bold text-amber-600">
                      {moderate}
                    </p>
                  </div>

                  <div className={`rounded-xl ${theme.bg} p-4`}>
                    <p className={`text-xs ${theme.textMuted}`}>Contaminated</p>
                    <p className="mt-1 text-xl font-bold text-red-600">
                      {contaminated}
                    </p>
                  </div>

                  <div className={`rounded-xl ${theme.bg} p-4`}>
                    <p className={`text-xs ${theme.textMuted}`}>Pending</p>
                    <p className="mt-1 text-xl font-bold text-amber-600">
                      {pending}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`text-xs ${theme.textMuted}`}>
                      Contamination rate
                    </span>

                    <span className="text-sm font-bold text-red-600">
                      {contaminationRate}%
                    </span>
                  </div>

                  <div
                    className={`h-2.5 overflow-hidden rounded-full ${theme.bg}`}
                  >
                    <div
                      className="h-full rounded-full bg-red-500 transition-all"
                      style={{
                        width: `${Math.min(contaminationRate, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Verification profile"
              subtitle="Product authenticity status"
              icon={ShieldCheck}
              theme={theme}
            >
              <div className="p-5">
                <StatusRow
                  label="Verified original"
                  value={verifiedOriginal}
                  tone="safe"
                  theme={theme}
                />

                <StatusRow
                  label="Verified fake"
                  value={verifiedFake}
                  tone="danger"
                  theme={theme}
                />

                <StatusRow
                  label="Unverified"
                  value={unverified}
                  tone="warning"
                  theme={theme}
                />

                <StatusRow
                  label="Verification pending"
                  value={verificationPending}
                  tone="info"
                  theme={theme}
                />
              </div>
            </SectionCard>
          </div>

          {/* -----------------------------------------------------------------
              REGISTRATION + VENDOR INTELLIGENCE
          ------------------------------------------------------------------ */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SectionCard
              title="Product registration"
              subtitle="Regulatory registration profile"
              icon={Package}
              theme={theme}
            >
              <div className="grid grid-cols-2 gap-4 p-5">
                <div className={`rounded-2xl border ${theme.border} p-4`}>
                  <p className={`text-xs ${theme.textMuted}`}>Registered</p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {registrationStatus.registered ?? 0}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Registered products
                  </div>
                </div>

                <div className={`rounded-2xl border ${theme.border} p-4`}>
                  <p className={`text-xs ${theme.textMuted}`}>Unregistered</p>

                  <p className="mt-2 text-2xl font-bold text-red-600">
                    {registrationStatus.unregistered ?? 0}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[11px] text-red-600">
                    <ShieldAlert className="h-3 w-3" />
                    Requires attention
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Vendor profile"
              subtitle="Market channel intelligence"
              icon={Store}
              theme={theme}
            >
              <div className="grid grid-cols-2 gap-4 p-5">
                <div className={`rounded-2xl border ${theme.border} p-4`}>
                  <p className={`text-xs ${theme.textMuted}`}>Formal vendors</p>

                  <p className="mt-2 text-2xl font-bold">
                    {vendorType.formal ?? 0}
                  </p>

                  <p className={`mt-2 text-[11px] ${theme.textMuted}`}>
                    Formal distribution channels
                  </p>
                </div>

                <div className={`rounded-2xl border ${theme.border} p-4`}>
                  <p className={`text-xs ${theme.textMuted}`}>
                    Informal vendors
                  </p>

                  <p className="mt-2 text-2xl font-bold text-amber-600">
                    {vendorType.informal ?? 0}
                  </p>

                  <p className={`mt-2 text-[11px] ${theme.textMuted}`}>
                    Informal market channels
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* -----------------------------------------------------------------
              LGA BREAKDOWN
          ------------------------------------------------------------------ */}

          <SectionCard
            title="Geographic risk — LGA breakdown"
            subtitle={`${topLgas.length} local government area(s) represented in this report`}
            icon={MapPin}
            theme={theme}
          >
            {topLgas.length === 0 ? (
              <EmptyReport
                title="No LGA data available"
                description="There are no geographic records for the selected state and period."
                theme={theme}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[720px] w-full">
                  <thead>
                    <tr className={`border-b ${theme.border}`}>
                      <th
                        className={`px-5 py-3 text-left ${theme.textMuted} text-[11px] font-bold uppercase tracking-wider`}
                      >
                        LGA
                      </th>

                      <th
                        className={`px-5 py-3 text-right ${theme.textMuted} text-[11px] font-bold uppercase tracking-wider`}
                      >
                        Samples
                      </th>

                      <th
                        className={`px-5 py-3 text-right ${theme.textMuted} text-[11px] font-bold uppercase tracking-wider`}
                      >
                        Contaminated
                      </th>

                      <th
                        className={`px-5 py-3 text-right ${theme.textMuted} text-[11px] font-bold uppercase tracking-wider`}
                      >
                        Pending
                      </th>

                      <th
                        className={`px-5 py-3 text-right ${theme.textMuted} text-[11px] font-bold uppercase tracking-wider`}
                      >
                        Rate
                      </th>

                      <th
                        className={`px-5 py-3 text-right ${theme.textMuted} text-[11px] font-bold uppercase tracking-wider`}
                      >
                        Risk
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {topLgas.map((row) => {
                      const numericRate = parseFloat(row.rate) || 0;

                      const riskTone =
                        numericRate >= 50
                          ? "danger"
                          : numericRate >= 25
                            ? "warning"
                            : "safe";

                      return (
                        <tr
                          key={row.lgaName}
                          className={`border-b ${theme.border} last:border-b-0 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.02]`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-emerald-500" />

                              <span className="text-sm font-semibold">
                                {row.lgaName}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right text-sm">
                            {row.samples}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <span className="font-semibold text-red-600">
                              {row.contaminated}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <span className="font-medium text-amber-600">
                              {row.pending}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <RateBadge rate={row.rate} />
                          </td>

                          <td className="px-5 py-4 text-right">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                                riskTone === "danger"
                                  ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                  : riskTone === "warning"
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                              }`}
                            >
                              {riskTone === "danger"
                                ? "High"
                                : riskTone === "warning"
                                  ? "Moderate"
                                  : "Lower"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* -----------------------------------------------------------------
              PRODUCT TYPE
          ------------------------------------------------------------------ */}

          <SectionCard
            title="Product category intelligence"
            subtitle="Contamination distribution across product types"
            icon={Package}
            theme={theme}
          >
            {productRows.length === 0 ? (
              <EmptyReport
                title="No product type data available"
                description="Product category statistics will appear here when records are available."
                theme={theme}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[680px] w-full">
                  <thead>
                    <tr className={`border-b ${theme.border}`}>
                      <th
                        className={`px-5 py-3 text-left ${theme.textMuted} text-[11px] font-bold uppercase tracking-wider`}
                      >
                        Product type
                      </th>

                      <th
                        className={`px-5 py-3 text-right ${theme.textMuted} text-[11px] font-bold uppercase tracking-wider`}
                      >
                        Samples
                      </th>

                      <th
                        className={`px-5 py-3 text-right ${theme.textMuted} text-[11px] font-bold uppercase tracking-wider`}
                      >
                        Contaminated
                      </th>

                      <th
                        className={`px-5 py-3 text-right ${theme.textMuted} text-[11px] font-bold uppercase tracking-wider`}
                      >
                        Pending
                      </th>

                      <th
                        className={`px-5 py-3 text-right ${theme.textMuted} text-[11px] font-bold uppercase tracking-wider`}
                      >
                        Rate
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {productRows.map((row) => (
                      <tr
                        key={row.productType}
                        className={`border-b ${theme.border} last:border-b-0 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.02]`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-emerald-500" />

                            <span className="text-sm font-semibold">
                              {row.productType || "Unknown"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right text-sm">
                          {row.total}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="font-semibold text-red-600">
                            {row.contaminated}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="font-medium text-amber-600">
                            {row.pending}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <RateBadge rate={row.rate} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* -----------------------------------------------------------------
              RECOMMENDATIONS
          ------------------------------------------------------------------ */}

          <div className="px-4 sm:px-5 py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <SectionLabel>Recommendations</SectionLabel>
                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Recommended actions based on the selected state's exposure
                  findings.
                </p>
              </div>

              {recommendations.length > 0 && (
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${theme.border} ${theme.textMuted}`}
                >
                  {recommendations.length} item
                  {recommendations.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((item, index) => {
                  // API may return either a string or an object.
                  if (typeof item === "string") {
                    return (
                      <div
                        key={index}
                        className={`rounded-xl border p-4 ${theme.border} ${theme.card}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-600">
                            {index + 1}
                          </span>

                          <p className={`text-sm leading-6 ${theme.text}`}>
                            {item}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const recommendation =
                    item?.recommendation || item?.finding || "Recommendation";

                  return (
                    <div
                      key={index}
                      className={`rounded-xl border p-4 ${theme.border} ${theme.card}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-600">
                          {index + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${theme.text}`}
                            >
                              {recommendation}
                            </p>

                            {item?.priority && (
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${theme.border} ${
                                  String(item.priority).toLowerCase() === "high"
                                    ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300"
                                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300"
                                }`}
                              >
                                {item.priority}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 space-y-2">
                            {item?.category && (
                              <div className="text-xs">
                                <span className={`font-semibold ${theme.text}`}>
                                  Category:
                                </span>{" "}
                                <span className={theme.textMuted}>
                                  {String(item.category)}
                                </span>
                              </div>
                            )}

                            {item?.finding && (
                              <div className="text-xs">
                                <span className={`font-semibold ${theme.text}`}>
                                  Finding:
                                </span>{" "}
                                <span className={theme.textMuted}>
                                  {String(item.finding)}
                                </span>
                              </div>
                            )}

                            {item?.action && (
                              <div className="text-xs">
                                <span className={`font-semibold ${theme.text}`}>
                                  Action:
                                </span>{" "}
                                <span className={theme.textMuted}>
                                  {String(item.action)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`rounded-xl border p-6 text-center text-sm ${theme.border} ${theme.textMuted}`}
              >
                No recommendations available.
              </div>
            )}
          </div>

          {/* -----------------------------------------------------------------
              REPORT FOOTER
          ------------------------------------------------------------------ */}

          <div
            className={`flex flex-col gap-3 rounded-2xl border ${theme.border} ${theme.bg} p-4 sm:flex-row sm:items-center sm:justify-between`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.card} border ${theme.border}`}
              >
                <Users className={`h-4 w-4 ${theme.textMuted}`} />
              </div>

              <div>
                <p className="text-xs font-semibold">
                  State intelligence report
                </p>

                <p className={`mt-0.5 text-[11px] ${theme.textMuted}`}>
                  Generated for Ministry of Health monitoring and regulatory
                  decision support.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
              >
                <Download className="h-3.5 w-3.5" />
                Download Excel
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 rounded-lg border ${theme.border} px-3 py-2 text-xs font-semibold transition hover:shadow-sm"
              >
                <FileText className="h-3.5 w-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          INITIAL EMPTY STATE
      ====================================================================== */}

      {!generated && !loading && !error && (
        <div
          className={`rounded-3xl border ${theme.border} ${theme.card} p-10`}
        >
          <div className="mx-auto flex max-w-lg flex-col items-center text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${theme.emerald}`}
            >
              <BarChart3 className={`h-7 w-7 ${theme.emeraldText}`} />
            </div>

            <h2 className="mt-5 text-lg font-bold">
              Generate a state intelligence report
            </h2>

            <p className={`mt-2 text-sm leading-6 ${theme.textMuted}`}>
              Choose a state and reporting period above. The generated report
              will consolidate contamination, verification, geographic, product
              and regulatory intelligence.
            </p>

            <div className="mt-5 grid w-full grid-cols-1 gap-2 text-left sm:grid-cols-3">
              <div className={`rounded-xl border ${theme.border} p-3`}>
                <MapPin className="h-4 w-4 text-emerald-500" />
                <p className="mt-2 text-xs font-semibold">Geographic</p>
                <p className={`mt-1 text-[10px] ${theme.textMuted}`}>
                  LGA risk distribution
                </p>
              </div>

              <div className={`rounded-xl border ${theme.border} p-3`}>
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <p className="mt-2 text-xs font-semibold">Contamination</p>
                <p className={`mt-1 text-[10px] ${theme.textMuted}`}>
                  Exposure and status profile
                </p>
              </div>

              <div className={`rounded-xl border ${theme.border} p-3`}>
                <Store className="h-4 w-4 text-amber-500" />
                <p className="mt-2 text-xs font-semibold">Regulation</p>
                <p className={`mt-1 text-[10px] ${theme.textMuted}`}>
                  Registration and vendors
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateSummaryReport;
