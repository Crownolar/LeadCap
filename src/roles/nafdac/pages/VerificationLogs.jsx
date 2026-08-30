import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, ShieldCheck, ShieldAlert, Clock3, Activity, CalendarDays, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import api from "../../../utils/api";
import { useTheme } from "../../../context/ThemeContext";

const STATUS_TABS = ["All", "Verified", "Failed", "Pending"];

const VerificationLogs = () => {
  const { theme } = useTheme();
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  const [activeTab, setActiveTab] = useState("All");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const getRowStatus = (row) =>
    row?.status || row?.verificationStatus || row?.result || "UNKNOWN";

  const statusGroup = (status) => {
    if (["VERIFIED", "VERIFIED_ORIGINAL"].includes(status)) return "Verified";
    if (["FAILED", "VERIFIED_FAKE"].includes(status)) return "Failed";
    if (["UNVERIFIED", "PENDING"].includes(status)) return "Pending";
    return "Other";
  };

  const filteredLogs = useMemo(
    () => logs.filter((row) => activeTab === "All" || statusGroup(getRowStatus(row)) === activeTab),
    [logs, activeTab]
  );

  const fetchVerificationLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = { page, pageSize };
      if (fromDate) params.from = new Date(fromDate).toISOString();
      if (toDate) params.to = new Date(toDate).toISOString();

      const res = await api.get("/moh/verification-logs", { params });
      const items = res.data?.items || [];
      const total = res.data?.total || 0;
      const currentPage = res.data?.page || page;
      const currentPageSize = res.data?.pageSize || pageSize;

      setLogs(items);
      setTotalCount(total);
      setPage(currentPage);
      setPageSize(currentPageSize);
      setTotalPages(Math.max(1, Math.ceil(total / currentPageSize)));
    } catch (err) {
      console.error("verification logs fetch error:", err);
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
  }, [page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const counts = useMemo(() => {
    const result = { All: totalCount, Verified: 0, Failed: 0, Pending: 0 };
    logs.forEach((row) => {
      const group = statusGroup(getRowStatus(row));
      if (group in result) result[group] += 1;
    });
    return result;
  }, [logs, totalCount]);

  const chartEntries = useMemo(() => {
    const grouped = {};
    filteredLogs.forEach((row) => {
      const raw = row.createdAt || row.created_at || row.date || row.updatedAt;
      if (!raw) return;
      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      if (!grouped[key]) {
        grouped[key] = {
          label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          verified: 0,
          failed: 0,
          pending: 0,
        };
      }
      const group = statusGroup(getRowStatus(row));
      if (group === "Verified") grouped[key].verified += 1;
      if (group === "Failed") grouped[key].failed += 1;
      if (group === "Pending") grouped[key].pending += 1;
    });
    return Object.entries(grouped).sort(([a], [b]) => new Date(a) - new Date(b));
  }, [filteredLogs]);

  const verifiedCount = logs.filter((r) => statusGroup(getRowStatus(r)) === "Verified").length;
  const failedCount = logs.filter((r) => statusGroup(getRowStatus(r)) === "Failed").length;
  const pendingCount = logs.filter((r) => statusGroup(getRowStatus(r)) === "Pending").length;

  const metrics = [
    { label: "Total verifications", value: totalCount.toLocaleString(), sub: "All records", color: "text-gray-900 dark:text-white" },
    { label: "Verified", value: verifiedCount.toLocaleString(), sub: totalCount ? `${((verifiedCount / totalCount) * 100).toFixed(1)}% of total` : "0%", color: "text-emerald-700 dark:text-emerald-400" },
    { label: "Failed", value: failedCount.toLocaleString(), sub: totalCount ? `${((failedCount / totalCount) * 100).toFixed(1)}% of total` : "0%", color: "text-red-600 dark:text-red-400" },
    { label: "Pending", value: pendingCount.toLocaleString(), sub: totalCount ? `${((pendingCount / totalCount) * 100).toFixed(1)}% of total` : "0%", color: "text-amber-600 dark:text-amber-400" },
  ];

  useEffect(() => {
    if (!window.Chart || !chartRef.current) return;

    chartInst.current?.destroy();
    if (!chartEntries.length) return;

    chartInst.current = new window.Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: chartEntries.map(([, v]) => v.label),
        datasets: [
          { label: "Verified", data: chartEntries.map(([, v]) => v.verified), backgroundColor: "#059669", borderRadius: 6 },
          { label: "Failed", data: chartEntries.map(([, v]) => v.failed), backgroundColor: "#dc2626", borderRadius: 6 },
          { label: "Pending", data: chartEntries.map(([, v]) => v.pending), backgroundColor: "#d97706", borderRadius: 6 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true, padding: 16 } } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 }, grid: { color: "#e5e7eb" } },
        },
      },
    });

    return () => chartInst.current?.destroy();
  }, [chartEntries]);

  const inputClass = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 ${theme.input || theme.card} ${theme.border} ${theme.text}`;

  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "object") return value.displayName || value.name || value.label || value.value || "—";
    return String(value);
  };

  return (
    <div className={`space-y-6 ${theme.text}`}>
      <section className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 ${theme.card} ${theme.border}`}>
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              NAFDAC oversight
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Verification Logs</h1>
            <p className={`mt-2 max-w-xl text-sm leading-6 ${theme.textMuted}`}>
              Read-only visibility into product verification outcomes across the registry.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchVerificationLogs}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh logs"}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div><p className="font-semibold">Unable to load verification logs</p><p className="mt-1">{error}</p></div>
        </div>
      )}

      <section className={`overflow-hidden rounded-3xl border ${theme.card} ${theme.border}`}>
        <div className={`border-b p-5 md:p-6 ${theme.border}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold">Verification activity</h2>
              </div>
              <p className={`mt-1 text-sm ${theme.textMuted}`}>
                {fromDate || toDate ? "Filtered verification activity" : "Daily verification outcomes"}
              </p>
            </div>
            <div className={`flex flex-wrap gap-1 rounded-2xl p-1 ${theme.bg}`}>
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    activeTab === tab
                      ? "bg-emerald-600 text-white shadow-sm"
                      : `${theme.textMuted} hover:bg-white/70 dark:hover:bg-gray-800`
                  }`}
                >
                  {tab}
                  <span className="ml-1.5 opacity-75">
                    {tab === "All" ? counts.All : counts[tab]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`border-b px-5 py-4 md:px-6 ${theme.border}`}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
            <div>
              <label className={`mb-1.5 flex items-center gap-1.5 text-xs font-semibold ${theme.textMuted}`}>
                <Filter className="h-3.5 w-3.5" /> Date range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setPage(1); if (page === 1) fetchVerificationLogs(); }}
              className="rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Apply filters
            </button>
            <button
              type="button"
              onClick={() => { setFromDate(""); setToDate(""); setPage(1); }}
              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${theme.border} ${theme.textMuted} hover:bg-black/5 dark:hover:bg-white/5`}
            >
              Clear
            </button>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className={inputClass}
              aria-label="Rows per page"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        <div className={`border-b px-5 py-4 md:px-6 ${theme.border}`}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">{activeTab} verification trend</h3>
              <p className={`mt-0.5 text-xs ${theme.textMuted}`}>Based on the currently loaded records.</p>
            </div>
            <CalendarDays className={`h-4 w-4 ${theme.textMuted}`} />
          </div>
          {chartEntries.length === 0 ? (
            <div className={`flex h-48 items-center justify-center rounded-2xl border border-dashed ${theme.border} text-sm ${theme.textMuted}`}>
              No chart data available for this selection.
            </div>
          ) : (
            <div className="relative h-56 w-full">
              <canvas ref={chartRef} />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className={`${theme.bg}`}>
                {["Sample ID", "Product", "Brand", "NAFDAC No.", "State", "LGA", "Category", "Status", "Created"].map((heading) => (
                  <th key={heading} className={`px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className={`px-5 py-14 text-center ${theme.textMuted}`}>Loading verification records...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={9} className={`px-5 py-14 text-center ${theme.textMuted}`}>No {activeTab.toLowerCase()} verification records found.</td></tr>
              ) : (
                filteredLogs.map((row, index) => {
                  const status = getRowStatus(row);
                  const created = row.createdAt || row.created_at || row.date || row.updatedAt;
                  return (
                    <tr key={row.id || row.sampleId || index} className={`border-t ${theme.border} transition hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10`}>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">{displayValue(row.sampleId || row.sampleCode)}</td>
                      <td className={`px-5 py-4 font-semibold ${theme.text}`}>{displayValue(row.product?.name || row.productName || row.name || row.product_name)}</td>
                      <td className={`px-5 py-4 ${theme.textMuted}`}>{displayValue(row.brand?.name || row.brandName || row.manufacturer)}</td>
                      <td className="px-5 py-4 font-mono text-xs">{displayValue(row.nafdacNumber || row.nafdacNo || row.nafdac || row.nafdac_number)}</td>
                      <td className={`px-5 py-4 ${theme.textMuted}`}>{displayValue(row.state?.name || row.stateName || row.locationState)}</td>
                      <td className={`px-5 py-4 ${theme.textMuted}`}>{displayValue(row.lga?.name || row.lgaName || row.locationLga)}</td>
                      <td className={`px-5 py-4 ${theme.textMuted}`}>{displayValue(row.category?.displayName || row.category?.name || row.productCategory)}</td>
                      <td className="px-5 py-4"><StatusBadge status={status} /></td>
                      <td className={`px-5 py-4 text-xs ${theme.textMuted}`}>{created && !Number.isNaN(new Date(created).getTime()) ? new Date(created).toLocaleDateString() : "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className={`flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${theme.border}`}>
          <p className={`text-xs ${theme.textMuted}`}>
            Showing {filteredLogs.length} loaded record{filteredLogs.length === 1 ? "" : "s"} · {totalCount.toLocaleString()} total
          </p>
          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
};

export default VerificationLogs;
