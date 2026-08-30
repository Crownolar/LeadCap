import { useEffect, useRef, useState } from "react";
import { RefreshCw, ShieldCheck, ShieldX, Clock3, Database, CalendarDays, Activity, Search } from "lucide-react";

import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import api from "../../../utils/api";
import { useTheme } from "../../../context/ThemeContext";

const STATUS_TABS = ["All", "Verified", "Failed", "Pending"];

const Verification = () => {
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const [activeTab, setActiveTab] = useState("All");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { theme } = useTheme();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const getRowStatus = (row) =>
    row.status || row.verificationStatus || row.result || "";

  const filteredLogs = logs.filter((row) => {
    const status = getRowStatus(row);

    if (activeTab === "Verified") {
      return ["VERIFIED", "VERIFIED_ORIGINAL"].includes(status);
    }

    if (activeTab === "Failed") {
      return ["FAILED", "VERIFIED_FAKE"].includes(status);
    }

    if (activeTab === "Pending") {
      return ["UNVERIFIED", "PENDING"].includes(status);
    }

    return true;
  });

  const fetchVerificationLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        pageSize,
      };

      if (fromDate) {
        params.from = new Date(fromDate).toISOString();
      }

      if (toDate) {
        params.to = new Date(toDate).toISOString();
      }

      const res = await api.get("/moh/verification-logs", { params });

      const items = res.data?.items || [];
      const total = res.data?.total || 0;
      const currentPage = res.data?.page || 1;
      const currentPageSize = res.data?.pageSize || pageSize;

      setLogs(items);
      setTotalCount(total);
      setPage(currentPage);
      setPageSize(currentPageSize);
      setTotalPages(Math.max(1, Math.ceil(total / currentPageSize)));
    } catch (err) {
      console.error("verification logs fetch error:", err);
      console.error("verification logs fetch error response:", err.response);
      console.error("verification logs fetch error data:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to fetch verification logs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationLogs();
    // Existing behaviour intentionally preserved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  /*
   * Chart data
   */
  const chartDataMap = filteredLogs.reduce((acc, row) => {
    const rawDate =
      row.createdAt || row.created_at || row.date || row.updatedAt;

    if (!rawDate) return acc;

    const dateObj = new Date(rawDate);

    if (Number.isNaN(dateObj.getTime())) return acc;

    const key = dateObj.toISOString().split("T")[0];

    const label = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const status = getRowStatus(row);

    if (!acc[key]) {
      acc[key] = {
        label,
        verified: 0,
        failed: 0,
        pending: 0,
      };
    }

    if (["VERIFIED", "VERIFIED_ORIGINAL"].includes(status)) {
      acc[key].verified += 1;
    } else if (["FAILED", "VERIFIED_FAKE"].includes(status)) {
      acc[key].failed += 1;
    } else if (["UNVERIFIED", "PENDING"].includes(status)) {
      acc[key].pending += 1;
    }

    return acc;
  }, {});

  const sortedChartEntries = Object.entries(chartDataMap).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  const chartLabels = sortedChartEntries.map(([, value]) => value.label);
  const verifiedSeries = sortedChartEntries.map(
    ([, value]) => value.verified
  );
  const failedSeries = sortedChartEntries.map(([, value]) => value.failed);
  const pendingSeries = sortedChartEntries.map(
    ([, value]) => value.pending
  );

  const sectionTitle =
    fromDate && toDate
      ? `Daily verifications — ${new Date(
          fromDate
        ).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`
      : fromDate
        ? `Daily verifications — from ${new Date(
            fromDate
          ).toLocaleDateString()}`
        : toDate
          ? `Daily verifications — up to ${new Date(
              toDate
            ).toLocaleDateString()}`
          : "Daily verifications";

  /*
   * Existing Chart.js behaviour preserved.
   */
  useEffect(() => {
    if (!window.Chart || !chartRef.current) return;

    chartInst.current?.destroy();

    if (chartLabels.length === 0) return;

    chartInst.current = new window.Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Verified",
            data: verifiedSeries,
            backgroundColor: "#059669",
            borderRadius: 6,
            maxBarThickness: 32,
          },
          {
            label: "Failed",
            data: failedSeries,
            backgroundColor: "#dc2626",
            borderRadius: 6,
            maxBarThickness: 32,
          },
          {
            label: "Pending",
            data: pendingSeries,
            backgroundColor: "#d97706",
            borderRadius: 6,
            maxBarThickness: 32,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: {
                size: 11,
              },
              padding: 16,
              usePointStyle: true,
            },
          },
        },
        scales: {
          x: {
            stacked: false,
            grid: {
              display: false,
            },
            ticks: {
              color: "#64748b",
              font: {
                size: 10,
              },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1,
              color: "#64748b",
              font: {
                size: 10,
              },
            },
            grid: {
              color: "#e5e7eb",
            },
          },
        },
      },
    });

    return () => {
      chartInst.current?.destroy();
      chartInst.current = null;
    };
  }, [
    chartLabels.join("|"),
    verifiedSeries.join("|"),
    failedSeries.join("|"),
    pendingSeries.join("|"),
  ]);

  /*
   * Summary counts for the current result set.
   */
  const verifiedCount = filteredLogs.filter((row) =>
    ["VERIFIED", "VERIFIED_ORIGINAL"].includes(getRowStatus(row))
  ).length;

  const failedCount = filteredLogs.filter((row) =>
    ["FAILED", "VERIFIED_FAKE"].includes(getRowStatus(row))
  ).length;

  const pendingCount = filteredLogs.filter((row) =>
    ["UNVERIFIED", "PENDING"].includes(getRowStatus(row))
  ).length;

  const getStatusTone = (status) => {
    if (["VERIFIED", "VERIFIED_ORIGINAL"].includes(status)) {
      return "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10";
    }

    if (["FAILED", "VERIFIED_FAKE"].includes(status)) {
      return "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10";
    }

    return "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10";
  };

  return (
    <main className={`min-h-full ${theme.text} transition-colors duration-300`}>
      <div className="mx-auto max-w-[1600px] space-y-5 px-3 py-4 sm:space-y-6 sm:px-5 sm:py-6 lg:px-8">

        {/* ================================================================
            PAGE HEADER
        ================================================================= */}
        <section
          className={`${theme.card} ${theme.border} overflow-hidden rounded-3xl border shadow-sm`}
        >
          <div className="relative p-5 sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-teal-500/5 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                      Ministry of Health
                    </p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      Product verification intelligence
                    </p>
                  </div>
                </div>

                <h1
                  className={`text-2xl font-bold tracking-tight sm:text-3xl ${theme.text}`}
                >
                  Verification Centre
                </h1>

                <p
                  className={`mt-2 max-w-2xl text-sm leading-6 ${theme.textMuted}`}
                >
                  Monitor product verification activity, identify failed
                  verifications and track pending records across submitted
                  samples.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchVerificationLogs}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Refreshing..." : "Refresh data"}
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================
            ERROR
        ================================================================= */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
            <div className="flex items-start gap-3">
              <ShieldX className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-300" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  Verification data could not be loaded
                </p>
                <p className="mt-1 text-xs text-red-600/80 dark:text-red-300/70">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            KPI STRIP
        ================================================================= */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div
            className={`${theme.card} ${theme.border} rounded-2xl border p-4 shadow-sm sm:p-5`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs font-medium ${theme.textMuted}`}>
                  Total records
                </p>
                <p className={`mt-2 text-2xl font-bold ${theme.text}`}>
                  {totalCount}
                </p>
                <p className={`mt-1 text-[11px] ${theme.textMuted}`}>
                  Verification log records
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                <Database className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            className={`${theme.card} border border-emerald-200 rounded-2xl p-4 shadow-sm dark:border-emerald-500/20 sm:p-5`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Verified
                </p>
                <p className={`mt-2 text-2xl font-bold ${theme.text}`}>
                  {verifiedCount}
                </p>
                <p className={`mt-1 text-[11px] ${theme.textMuted}`}>
                  Original products confirmed
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            className={`${theme.card} border border-red-200 rounded-2xl p-4 shadow-sm dark:border-red-500/20 sm:p-5`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                  Failed
                </p>
                <p className={`mt-2 text-2xl font-bold ${theme.text}`}>
                  {failedCount}
                </p>
                <p className={`mt-1 text-[11px] ${theme.textMuted}`}>
                  Failed or fake verification
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                <ShieldX className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            className={`${theme.card} border border-amber-200 rounded-2xl p-4 shadow-sm dark:border-amber-500/20 sm:p-5`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Pending
                </p>
                <p className={`mt-2 text-2xl font-bold ${theme.text}`}>
                  {pendingCount}
                </p>
                <p className={`mt-1 text-[11px] ${theme.textMuted}`}>
                  Awaiting verification
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            FILTER / STATUS NAVIGATION
        ================================================================= */}
        <section
          className={`${theme.card} ${theme.border} rounded-2xl border p-3 shadow-sm sm:p-4`}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="flex flex-wrap gap-2">
              {STATUS_TABS.map((tab) => {
                const active = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
                      active
                        ? "bg-emerald-500 text-white shadow-sm"
                        : `${theme.textMuted} hover:bg-gray-100 dark:hover:bg-gray-800`
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

              <label className="relative">
                <span className="sr-only">From date</span>
                <CalendarDays
                  className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`}
                />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={`${theme.card} ${theme.border} ${theme.text} h-10 rounded-xl border pl-9 pr-3 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`}
                />
              </label>

              <span className={`hidden text-xs sm:block ${theme.textMuted}`}>
                to
              </span>

              <label className="relative">
                <span className="sr-only">To date</span>
                <CalendarDays
                  className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`}
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={`${theme.card} ${theme.border} ${theme.text} h-10 rounded-xl border pl-9 pr-3 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setTimeout(fetchVerificationLogs, 0);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
              >
                <Search className="h-4 w-4" />
                Apply filters
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================
            ACTIVITY CHART
        ================================================================= */}
        <section
          className={`${theme.card} ${theme.border} overflow-hidden rounded-2xl border shadow-sm`}
        >
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Activity className="h-4 w-4" />
              </div>

              <div>
                <h2 className={`text-sm font-semibold sm:text-base ${theme.text}`}>
                  Verification activity
                </h2>
                <p className={`mt-0.5 text-xs ${theme.textMuted}`}>
                  {sectionTitle}
                </p>
              </div>
            </div>

            <span
              className={`text-xs ${theme.textMuted}`}
            >
              Current filtered result set
            </span>
          </div>

          <div className="p-3 sm:p-5">
            {chartLabels.length > 0 ? (
              <div className="h-[280px] sm:h-[340px]">
                <canvas ref={chartRef} />
              </div>
            ) : (
              <div className="flex h-[260px] flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <Activity className={`h-5 w-5 ${theme.textMuted}`} />
                </div>

                <p className={`mt-3 text-sm font-semibold ${theme.text}`}>
                  No activity data
                </p>

                <p className={`mt-1 max-w-sm text-xs ${theme.textMuted}`}>
                  There are no verification records available for the current
                  filter and date range.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================
            VERIFICATION LOG TABLE
        ================================================================= */}
        <section
          className={`${theme.card} ${theme.border} overflow-hidden rounded-2xl border shadow-sm`}
        >
          <div className="border-b border-gray-100 px-4 py-4 dark:border-gray-800 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={`text-base font-semibold ${theme.text}`}>
                  Verification logs
                </h2>

                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Page {page} of {totalPages} · {totalCount} total records
                </p>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${getStatusTone(
                  activeTab === "Verified"
                    ? "VERIFIED"
                    : activeTab === "Failed"
                      ? "FAILED"
                      : activeTab === "Pending"
                        ? "PENDING"
                        : "PENDING"
                )}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {activeTab} records
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[1050px] w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/40">
                  {[
                    "Sample ID",
                    "Product",
                    "Brand / Manufacturer",
                    "NAFDAC No.",
                    "State",
                    "LGA",
                    "Category",
                    "Status",
                    "Date",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
                        <p className={`mt-3 text-sm font-medium ${theme.text}`}>
                          Loading verification logs...
                        </p>
                        <p className={`mt-1 text-xs ${theme.textMuted}`}>
                          Retrieving the latest verification records.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className={`px-4 py-14 text-center ${theme.textMuted}`}
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <Database className="h-8 w-8 opacity-40" />
                        <p className={`mt-3 text-sm font-semibold ${theme.text}`}>
                          {activeTab === "All"
                            ? "No verification logs found"
                            : `No ${activeTab.toLowerCase()} records`}
                        </p>
                        <p className="mt-1 text-xs">
                          Try another status or date range.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((row, index) => (
                    <tr
                      key={row.id || row.sampleId || index}
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-gray-800/30`}
                    >
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-emerald-50 px-2 py-1 font-mono text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {row.sampleId || row.sampleCode || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <p className={`max-w-[190px] truncate text-sm font-semibold ${theme.text}`}>
                          {row.product?.name ||
                            row.productName ||
                            row.name ||
                            row.product_name ||
                            "—"}
                        </p>
                      </td>

                      <td className={`px-4 py-4 text-sm ${theme.textMuted}`}>
                        {row.brand?.name ||
                          row.brandName ||
                          row.manufacturer ||
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span className={`font-mono text-xs ${theme.text}`}>
                          {row.nafdacNumber ||
                            row.nafdacNo ||
                            row.nafdac ||
                            row.nafdac_number ||
                            "—"}
                        </span>
                      </td>

                      <td className={`px-4 py-4 text-sm ${theme.textMuted}`}>
                        {row.state?.name ||
                          row.stateName ||
                          row.locationState ||
                          "—"}
                      </td>

                      <td className={`px-4 py-4 text-sm ${theme.textMuted}`}>
                        {row.lga?.name ||
                          row.lgaName ||
                          row.locationLga ||
                          "—"}
                      </td>

                      <td className={`px-4 py-4 text-sm ${theme.textMuted}`}>
                        {row.category?.displayName ||
                          row.category?.name ||
                          row.productCategory ||
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={getRowStatus(row) || "UNKNOWN"} />
                      </td>

                      <td className={`whitespace-nowrap px-4 py-4 text-xs ${theme.textMuted}`}>
                        {row.createdAt ||
                        row.created_at ||
                        row.date ||
                        row.updatedAt
                          ? new Date(
                              row.createdAt ||
                                row.created_at ||
                                row.date ||
                                row.updatedAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-3 md:hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-14">
                <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
                <p className={`mt-3 text-sm font-medium ${theme.text}`}>
                  Loading verification logs...
                </p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <Database className={`h-7 w-7 ${theme.textMuted}`} />
                <p className={`mt-3 text-sm font-semibold ${theme.text}`}>
                  No verification records
                </p>
                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Try another filter.
                </p>
              </div>
            ) : (
              filteredLogs.map((row, index) => {
                const status = getRowStatus(row);

                return (
                  <article
                    key={row.id || row.sampleId || index}
                    className={`${theme.border} rounded-2xl border p-4`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {row.sampleId || row.sampleCode || "—"}
                        </span>

                        <h3 className={`mt-1 truncate text-sm font-semibold ${theme.text}`}>
                          {row.product?.name ||
                            row.productName ||
                            row.name ||
                            row.product_name ||
                            "Unnamed product"}
                        </h3>
                      </div>

                      <StatusBadge status={status || "UNKNOWN"} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className={`text-[10px] uppercase tracking-wide ${theme.textMuted}`}>
                          Brand
                        </p>
                        <p className={`mt-1 truncate text-xs font-medium ${theme.text}`}>
                          {row.brand?.name ||
                            row.brandName ||
                            row.manufacturer ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className={`text-[10px] uppercase tracking-wide ${theme.textMuted}`}>
                          NAFDAC
                        </p>
                        <p className={`mt-1 truncate font-mono text-xs font-medium ${theme.text}`}>
                          {row.nafdacNumber ||
                            row.nafdacNo ||
                            row.nafdac ||
                            row.nafdac_number ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className={`text-[10px] uppercase tracking-wide ${theme.textMuted}`}>
                          Location
                        </p>
                        <p className={`mt-1 truncate text-xs font-medium ${theme.text}`}>
                          {row.state?.name ||
                            row.stateName ||
                            row.locationState ||
                            "—"}
                        </p>
                      </div>

                      <div>
                        <p className={`text-[10px] uppercase tracking-wide ${theme.textMuted}`}>
                          LGA
                        </p>
                        <p className={`mt-1 truncate text-xs font-medium ${theme.text}`}>
                          {row.lga?.name ||
                            row.lgaName ||
                            row.locationLga ||
                            "—"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`mt-4 flex items-center justify-between border-t pt-3 ${theme.border}`}
                    >
                      <span className={`text-[11px] ${theme.textMuted}`}>
                        {row.category?.displayName ||
                          row.category?.name ||
                          row.productCategory ||
                          "No category"}
                      </span>

                      <span className={`text-[11px] ${theme.textMuted}`}>
                        {row.createdAt ||
                        row.created_at ||
                        row.date ||
                        row.updatedAt
                          ? new Date(
                              row.createdAt ||
                                row.created_at ||
                                row.date ||
                                row.updatedAt
                            ).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div
            className={`border-t px-4 py-4 ${theme.border} sm:px-5`}
          >
            <Pagination
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </div>
        </section>

        {/* ================================================================
            FOOTER INFORMATION
        ================================================================= */}
        <div className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-[11px] ${theme.textMuted}`}>
            Verification intelligence · Ministry of Health
          </p>

          <p className={`text-[11px] ${theme.textMuted}`}>
            Showing {filteredLogs.length} records on this page
          </p>
        </div>
      </div>
    </main>
  );
};

export default Verification;