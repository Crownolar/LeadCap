import { useEffect, useMemo, useState } from "react";
import { FilterBar } from "../../../../components/FilterBar";
import { SectionLabel } from "../../../../components/SectionLabel";
import { FilterSep, BtnPrimary, TH, TD } from "../../../../utils/MohUI";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Globe2,
  Package,
  ShieldAlert,
  Sparkles,
  Tags,
  XCircle,
} from "lucide-react";

import { getProductTypeReport } from "../../../../../../services/mohReportService";
import {
  exportProductTypeExcel,
  exportProductTypePdf,
} from "../../../../utils/reportExport";
import ReportHeader from "./ReportHeader";
import api from "../../../../../../utils/api";
import { useTheme } from "../../../../../../context/ThemeContext";

const STATES_CACHE_KEY = "moh_report_states_cache_v1";

const ProductTypeReport = () => {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);
  const [states, setStates] = useState([]);

  const { theme } = useTheme();

  const [filters, setFilters] = useState({
    stateId: "",
    dateFrom: "2026-03-13",
    dateTo: "2026-03-14",
  });

  const selectedState = states.find((s) => s.id === filters.stateId);
  const selectedStateName = selectedState?.name || "All States";

  const normalizeStates = (payload) => {
    const rows = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.states)
        ? payload.states
        : Array.isArray(payload?.data?.states)
          ? payload.data.states
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload)
              ? payload
              : [];

    return rows
      .map((state) => ({
        id: state?.id || state?.stateId || state?.value || "",
        name: state?.name || state?.stateName || state?.label || "",
        code: state?.code || "",
        isActive: state?.isActive,
      }))
      .filter((state) => state.id && state.name)
      .filter((state) => state.isActive !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const fetchStates = async () => {
    try {
      const cached = sessionStorage.getItem(STATES_CACHE_KEY);

      if (cached) {
        setStates(JSON.parse(cached));
        return;
      }

      setStatesLoading(true);

      const res = await api.get("/management/states", {
        params: {
          page: 1,
          pageSize: 100,
        },
      });

      const normalized = normalizeStates(res.data);

      setStates(normalized);
      sessionStorage.setItem(
        STATES_CACHE_KEY,
        JSON.stringify(normalized)
      );
    } catch (err) {
      console.error(
        "Failed to fetch product type report states:",
        err
      );
      setStates([]);
    } finally {
      setStatesLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

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

      const data = await getProductTypeReport({
        stateId: filters.stateId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });

      console.log("Product type report response:", data);

      setReportData(data?.data || data);
      setGenerated(true);
    } catch (err) {
      console.error(
        "Failed to fetch product type report:",
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to generate product type report.";

      setError(message);
      setReportData(null);
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const generatedAt = reportData?.generatedAt
    ? new Date(reportData.generatedAt).toLocaleString()
    : "";

  const summary = reportData?.summary || {};
  const recommendations = reportData?.recommendations || [];
  const byProductType = reportData?.byProductType || {};

  const rows = useMemo(() => {
    return Object.entries(byProductType)
      .map(([productType, stats]) => ({
        productType,
        totalSamples: stats?.totalSamples || 0,
        registered: stats?.registered || 0,
        unregistered: stats?.unregistered || 0,
        verifiedOriginal:
          stats?.verifications?.VERIFIED_ORIGINAL || 0,
        verifiedFake:
          stats?.verifications?.VERIFIED_FAKE || 0,
        unverified:
          stats?.verifications?.UNVERIFIED || 0,
        verificationPending:
          stats?.verifications?.VERIFICATION_PENDING || 0,
        local: stats?.origins?.LOCAL || 0,
        imported: stats?.origins?.IMPORTED || 0,
      }))
      .sort((a, b) => b.totalSamples - a.totalSamples);
  }, [byProductType]);

  const totalSamples = summary.totalSamples ?? 0;
  const totalProductTypes = summary.totalProductTypes ?? rows.length;

  const totalRegistered = rows.reduce(
    (sum, row) => sum + row.registered,
    0
  );

  const totalUnregistered = rows.reduce(
    (sum, row) => sum + row.unregistered,
    0
  );

  const totalVerifiedOriginal = rows.reduce(
    (sum, row) => sum + row.verifiedOriginal,
    0
  );

  const totalVerifiedFake = rows.reduce(
    (sum, row) => sum + row.verifiedFake,
    0
  );

  const totalImported = rows.reduce(
    (sum, row) => sum + row.imported,
    0
  );

  const totalLocal = rows.reduce(
    (sum, row) => sum + row.local,
    0
  );

  const handleExportExcel = () => {
    exportProductTypeExcel({
      fileName: `product-type-report-${selectedStateName || "all-states"}-${filters.dateFrom}-${filters.dateTo}.xlsx`,
      generatedAt,
      state: filters.state,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      summary,
      rows,
      recommendations,
    });
  };

  const handleExportPdf = () => {
    exportProductTypePdf({
      fileName: `product-type-report-${filters.state || "all-states"}-${filters.dateFrom}-${filters.dateTo}.pdf`,
      generatedAt,
      state: filters.state,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      summary,
      rows,
      recommendations,
    });
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    description,
    tone = "emerald",
  }) => {
    const tones = {
      emerald: {
        icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
        value: "text-emerald-700 dark:text-emerald-300",
      },
      blue: {
        icon: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300",
        value: "text-blue-700 dark:text-blue-300",
      },
      amber: {
        icon: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
        value: "text-amber-700 dark:text-amber-300",
      },
      red: {
        icon: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300",
        value: "text-red-700 dark:text-red-300",
      },
    };

    const selected = tones[tone];

    return (
      <div
        className={`group rounded-2xl border ${theme.border} ${theme.card} p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className={`text-[11px] font-semibold uppercase tracking-wider ${theme.textMuted}`}
            >
              {label}
            </p>

            <p
              className={`mt-2 text-2xl font-bold tracking-tight ${selected.value}`}
            >
              {value.toLocaleString()}
            </p>

            <p
              className={`mt-1 text-[11px] ${theme.textMuted}`}
            >
              {description}
            </p>
          </div>

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected.icon}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-5 ${theme.text}`}>
      {/* ============================================================
          FILTER / CONTROL BAR
      ============================================================ */}
      <FilterBar>
        <div className="flex w-full flex-col gap-1 sm:w-auto">
          <label
            className={`text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted}`}
          >
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
            disabled={statesLoading}
            className={`min-w-[220px] rounded-lg border px-3 py-2 text-xs ${theme.border} ${theme.input} outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <option value="">
              {statesLoading ? "Loading states..." : "All States"}
            </option>

            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <FilterSep />

        <div className="flex w-full flex-col gap-1 sm:w-auto">
          <label
            className={`text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted}`}
          >
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
            className={`rounded-lg border px-3 py-2 text-xs ${theme.border} ${theme.input} outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10`}
          />
        </div>

        <div className="flex w-full flex-col gap-1 sm:w-auto">
          <label
            className={`text-[10px] font-semibold uppercase tracking-wider ${theme.textMuted}`}
          >
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
            className={`rounded-lg border px-3 py-2 text-xs ${theme.border} ${theme.input} outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10`}
          />
        </div>

        <FilterSep />

        <BtnPrimary
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Generating...
            </>
          ) : (
            <>
              <BarChart3 className="mr-1.5 h-4 w-4" />
              Generate report
            </>
          )}
        </BtnPrimary>
      </FilterBar>

      {/* ============================================================
          ERROR
      ============================================================ */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">
              Report generation failed
            </p>

            <p className="mt-0.5 text-xs opacity-90">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================
          EMPTY STATE
      ============================================================ */}
      {!generated && !loading && !error && (
        <div
          className={`overflow-hidden rounded-3xl border ${theme.border} ${theme.card}`}
        >
          <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-blue-500/[0.04]" />

            <div className="relative mx-auto flex max-w-xl flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                <Package className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-xl font-bold tracking-tight">
                Product Type Intelligence
              </h2>

              <p
                className={`mt-2 max-w-lg text-sm leading-6 ${theme.textMuted}`}
              >
                Generate a product-type report to analyse sample
                volumes, registration status, verification outcomes,
                and local versus imported product origins.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span
                  className={`rounded-full border ${theme.border} px-3 py-1.5 text-[11px] ${theme.textMuted}`}
                >
                  <Tags className="mr-1 inline h-3.5 w-3.5" />
                  Product classification
                </span>

                <span
                  className={`rounded-full border ${theme.border} px-3 py-1.5 text-[11px] ${theme.textMuted}`}
                >
                  <ShieldAlert className="mr-1 inline h-3.5 w-3.5" />
                  Verification intelligence
                </span>

                <span
                  className={`rounded-full border ${theme.border} px-3 py-1.5 text-[11px] ${theme.textMuted}`}
                >
                  <Globe2 className="mr-1 inline h-3.5 w-3.5" />
                  Origin analysis
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          REPORT
      ============================================================ */}
      {generated && reportData && (
        <div className="space-y-5">
          {/* Report identity */}
          <div
            className={`relative overflow-hidden rounded-3xl border ${theme.border} ${theme.card}`}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/[0.08] via-transparent to-blue-500/[0.06]" />

            <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                    <Sparkles className="h-3 w-3" />
                    MOH Intelligence Report
                  </span>

                  <span
                    className={`rounded-full border ${theme.border} px-3 py-1 text-[10px] font-medium ${theme.textMuted}`}
                  >
                    {selectedStateName}
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Product Type Report
                </h1>

                <p
                  className={`mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${theme.textMuted}`}
                >
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {filters.dateFrom}
                  </span>

                  <ChevronRight className="h-3 w-3 opacity-50" />

                  <span>{filters.dateTo}</span>

                  {generatedAt && (
                    <>
                      <span className="hidden opacity-40 sm:inline">
                        •
                      </span>
                      <span className="hidden sm:inline">
                        Generated {generatedAt}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportPdf}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border ${theme.border} px-4 py-2.5 text-xs font-semibold transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20`}
                >
                  <FileText className="h-4 w-4" />
                  Export PDF
                </button>

                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Excel
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================
              KPI CARDS
          ======================================================== */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Package}
              label="Total samples"
              value={totalSamples}
              description="Samples in this report"
              tone="emerald"
            />

            <StatCard
              icon={Tags}
              label="Product types"
              value={totalProductTypes}
              description="Distinct product classifications"
              tone="blue"
            />

            <StatCard
              icon={CheckCircle2}
              label="Verified original"
              value={totalVerifiedOriginal}
              description={`${totalRegistered.toLocaleString()} registered samples`}
              tone="emerald"
            />

            <StatCard
              icon={XCircle}
              label="Verified fake"
              value={totalVerifiedFake}
              description={`${totalUnregistered.toLocaleString()} unregistered samples`}
              tone="red"
            />
          </div>

          {/* ========================================================
              SECONDARY INTELLIGENCE STRIP
          ======================================================== */}
          <div
            className={`grid grid-cols-1 overflow-hidden rounded-2xl border ${theme.border} ${theme.card} sm:grid-cols-3`}
          >
            <div className={`border-b p-4 sm:border-b-0 sm:border-r ${theme.border}`}>
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-blue-500" />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                >
                  Local origin
                </span>
              </div>

              <p className="mt-2 text-lg font-bold">
                {totalLocal.toLocaleString()}
              </p>
            </div>

            <div className={`border-b p-4 sm:border-b-0 sm:border-r ${theme.border}`}>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-violet-500" />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                >
                  Imported
                </span>
              </div>

              <p className="mt-2 text-lg font-bold">
                {totalImported.toLocaleString()}
              </p>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                >
                  Recommendations
                </span>
              </div>

              <p className="mt-2 text-lg font-bold">
                {recommendations.length.toLocaleString()}
              </p>
            </div>
          </div>

          {/* ========================================================
              EXISTING REPORT HEADER / EXPORT ACTIONS
          ======================================================== */}
          <ReportHeader
            title="Product type report"
            subtitle={`Generated: ${generatedAt || "—"} · ${selectedStateName} · ${filters.dateFrom} to ${filters.dateTo}`}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
          />

          {/* ========================================================
              SUMMARY
          ======================================================== */}
          <div
            className={`overflow-hidden rounded-2xl border ${theme.border} ${theme.card}`}
          >
            <div className={`border-b px-5 py-4 ${theme.border}`}>
              <SectionLabel>Summary</SectionLabel>

              <p className={`mt-1 text-xs ${theme.textMuted}`}>
                High-level classification metrics for the selected
                reporting period.
              </p>
            </div>

            <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="p-5">
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                >
                  Total product types
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {totalProductTypes.toLocaleString()}
                </p>

                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Distinct product categories recorded
                </p>
              </div>

              <div className="p-5">
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                >
                  Total samples
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {totalSamples.toLocaleString()}
                </p>

                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Total samples included in analysis
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              PRODUCT TYPE TABLE
          ======================================================== */}
          <div
            className={`overflow-hidden rounded-2xl border ${theme.border} ${theme.card}`}
          >
            <div
              className={`flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${theme.border}`}
            >
              <div>
                <SectionLabel>Breakdown by product type</SectionLabel>

                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Registration, verification and origin intelligence.
                </p>
              </div>

              <span
                className={`inline-flex w-fit items-center rounded-full border ${theme.border} px-3 py-1 text-[10px] font-semibold ${theme.textMuted}`}
              >
                {rows.length} categories
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-xs">
                <thead>
                  <tr className={theme.bg}>
                    {[
                      "Product Type",
                      "Samples",
                      "Registered",
                      "Unregistered",
                      "Verified Original",
                      "Verified Fake",
                      "Unverified",
                      "Local",
                      "Imported",
                    ].map((header) => (
                      <th
                        key={header}
                        className={`${TH} whitespace-nowrap`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.length > 0 ? (
                    rows.map((item, index) => {
                      const fakeRate =
                        item.totalSamples > 0
                          ? Math.round(
                              (item.verifiedFake /
                                item.totalSamples) *
                                100
                            )
                          : 0;

                      return (
                        <tr
                          key={`${item.productType}-${index}`}
                          className={`border-t ${theme.border} transition hover:${theme.bg}`}
                        >
                          <td className={`${TD} font-semibold`}>
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                                <Package className="h-3.5 w-3.5" />
                              </span>

                              <div>
                                <p>{item.productType}</p>

                                {fakeRate > 0 && (
                                  <p className="mt-0.5 text-[10px] font-medium text-red-500">
                                    {fakeRate}% verified fake
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className={`${TD} font-semibold`}>
                            {item.totalSamples.toLocaleString()}
                          </td>

                          <td className={TD}>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" />
                              {item.registered}
                            </span>
                          </td>

                          <td className={TD}>
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
                              <XCircle className="h-3 w-3" />
                              {item.unregistered}
                            </span>
                          </td>

                          <td className={TD}>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {item.verifiedOriginal}
                            </span>
                          </td>

                          <td className={TD}>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              {item.verifiedFake}
                            </span>
                          </td>

                          <td className={TD}>
                            {item.unverified}
                          </td>

                          <td className={TD}>
                            <span className="inline-flex items-center gap-1">
                              <Globe2 className="h-3 w-3 text-blue-500" />
                              {item.local}
                            </span>
                          </td>

                          <td className={TD}>
                            <span className="inline-flex items-center gap-1">
                              <Download className="h-3 w-3 text-violet-500" />
                              {item.imported}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        className={`${TD} py-12 text-center`}
                        colSpan={9}
                      >
                        <div className="flex flex-col items-center">
                          <Package
                            className={`h-8 w-8 ${theme.textMuted}`}
                          />

                          <p className="mt-3 font-semibold">
                            No product type data available
                          </p>

                          <p
                            className={`mt-1 text-xs ${theme.textMuted}`}
                          >
                            Try a different state or reporting
                            period.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================
              RECOMMENDATIONS
          ======================================================== */}
          <div
            className={`overflow-hidden rounded-2xl border ${theme.border} ${theme.card}`}
          >
            <div
              className={`border-b px-5 py-4 ${theme.border}`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />

                <SectionLabel>
                  Recommendations
                </SectionLabel>
              </div>

              <p className={`mt-1 text-xs ${theme.textMuted}`}>
                Priority findings and suggested regulatory or
                operational actions.
              </p>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
              {recommendations.length > 0 ? (
                recommendations.map((item, index) => (
                  <div
                    key={index}
                    className={`relative overflow-hidden rounded-2xl border ${theme.border} p-4 transition hover:shadow-sm`}
                  >
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                        <span className="text-xs font-bold">
                          {index + 1}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-bold">
                              {item.productType ||
                                item.category ||
                                "Recommendation"}
                            </p>

                            {item.category &&
                              item.category !==
                                item.productType && (
                                <p
                                  className={`mt-0.5 text-xs ${theme.textMuted}`}
                                >
                                  {item.category}
                                </p>
                              )}
                          </div>

                          {item.priority && (
                            <span
                              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                String(item.priority)
                                  .toLowerCase()
                                  .includes("high")
                                  ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                              }`}
                            >
                              {item.priority}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 space-y-3">
                          {item.findings && (
                            <div>
                              <p
                                className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                              >
                                Findings
                              </p>

                              <p
                                className={`mt-1 text-xs leading-5 ${theme.textMuted}`}
                              >
                                {typeof item.findings ===
                                "string"
                                  ? item.findings
                                  : JSON.stringify(
                                      item.findings
                                    )}
                              </p>
                            </div>
                          )}

                          {item.finding && (
                            <div>
                              <p
                                className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                              >
                                Finding
                              </p>

                              <p
                                className={`mt-1 text-xs leading-5 ${theme.textMuted}`}
                              >
                                {typeof item.finding ===
                                "string"
                                  ? item.finding
                                  : JSON.stringify(
                                      item.finding
                                    )}
                              </p>
                            </div>
                          )}

                          {item.recommendation && (
                            <div>
                              <p
                                className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                              >
                                Recommendation
                              </p>

                              <p className="mt-1 text-xs font-medium leading-5">
                                {typeof item.recommendation ===
                                "string"
                                  ? item.recommendation
                                  : JSON.stringify(
                                      item.recommendation
                                    )}
                              </p>
                            </div>
                          )}

                          {item.action && (
                            <div
                              className={`rounded-xl border ${theme.border} ${theme.bg} p-3`}
                            >
                              <p
                                className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                              >
                                Recommended Action
                              </p>

                              <p className="mt-1 text-xs font-semibold leading-5">
                                {typeof item.action ===
                                "string"
                                  ? item.action
                                  : JSON.stringify(
                                      item.action
                                    )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={`rounded-xl border border-dashed ${theme.border} px-5 py-10 text-center`}
                >
                  <Sparkles
                    className={`mx-auto h-7 w-7 ${theme.textMuted}`}
                  />

                  <p className="mt-3 text-sm font-semibold">
                    No recommendations available
                  </p>

                  <p
                    className={`mt-1 text-xs ${theme.textMuted}`}
                  >
                    Recommendations will appear when the report
                    provides actionable findings.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTypeReport;