import { useEffect, useRef, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { FilterSep, BtnPrimary, TH, TD } from "../utils/MohUI";
import { MetricCard } from "../components/MetricCard";
import { Pagination } from "../components/Pagination";
import { SectionLabel } from "../components/SectionLabel";
import { WhiteCard } from "../components/WhiteCard";
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
          "Failed to fetch verification logs",
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

  const chartDataMap = filteredLogs.reduce((acc, row) => {
    const rawDate =
      row.createdAt || row.created_at || row.date || row.updatedAt;
    if (!rawDate) return acc;

    const dateObj = new Date(rawDate);
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
    ([a], [b]) => new Date(a) - new Date(b),
  );

  const chartLabels = sortedChartEntries.map(([, value]) => value.label);
  const verifiedSeries = sortedChartEntries.map(([, value]) => value.verified);
  const failedSeries = sortedChartEntries.map(([, value]) => value.failed);
  const pendingSeries = sortedChartEntries.map(([, value]) => value.pending);

  const sectionTitle =
    fromDate && toDate
      ? `Daily verifications — ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`
      : fromDate
        ? `Daily verifications — from ${new Date(fromDate).toLocaleDateString()}`
        : toDate
          ? `Daily verifications — up to ${new Date(toDate).toLocaleDateString()}`
          : "Daily verifications";

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
          },
          {
            label: "Failed",
            data: failedSeries,
            backgroundColor: "#dc2626",
          },
          {
            label: "Pending",
            data: pendingSeries,
            backgroundColor: "#d97706",
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
              font: { size: 11 },
              padding: 10,
            },
          },
        },
        scales: {
          x: {
            stacked: false,
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1,
            },
            grid: { color: "#f3f4f6" },
          },
        },
      },
    });

    return () => chartInst.current?.destroy();
  }, [chartLabels, verifiedSeries, failedSeries, pendingSeries]);

  const verifiedCount = logs.filter((row) =>
    ["VERIFIED", "VERIFIED_ORIGINAL"].includes(getRowStatus(row)),
  ).length;

  const failedCount = logs.filter((row) =>
    ["FAILED", "VERIFIED_FAKE"].includes(getRowStatus(row)),
  ).length;

  const pendingCount = logs.filter((row) =>
    ["UNVERIFIED", "PENDING"].includes(getRowStatus(row)),
  ).length;

  const metrics = [
    {
      label: "Total Verifications",
      value: totalCount.toLocaleString(),
      sub: "All records",
      color: "text-gray-900",
    },
    {
      label: "Verified",
      value: verifiedCount.toLocaleString(),
      sub: totalCount
        ? `${((verifiedCount / totalCount) * 100).toFixed(1)}%`
        : "0%",
      color: "text-green-700",
    },
    {
      label: "Failed",
      value: failedCount.toLocaleString(),
      sub: totalCount
        ? `${((failedCount / totalCount) * 100).toFixed(1)}%`
        : "0%",
      color: "text-red-600",
    },
    {
      label: "Pending",
      value: pendingCount.toLocaleString(),
      sub: totalCount
        ? `${((pendingCount / totalCount) * 100).toFixed(1)}%`
        : "0%",
      color: "text-amber-600",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <WhiteCard className="mb-4">
        <SectionLabel>{sectionTitle}</SectionLabel>

        {chartLabels.length === 0 ? (
          <div
            className={`h-40 flex items-center justify-center text-sm ${theme.textMuted}`}
          >
            No chart data available
          </div>
        ) : (
          <div className="relative w-full" style={{ height: 220 }}>
            <canvas ref={chartRef} />
          </div>
        )}
      </WhiteCard>

      <FilterBar>
        <label className={`text-xs ${theme.textMuted} whitespace-nowrap`}>
          From
        </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className={`w-full sm:w-auto text-xs px-2 py-1.5 border ${theme.border} ${theme.textMuted} rounded-md outline-none focus:border-green-500`}
        />

        <label className={`text-xs ${theme.textMuted} whitespace-nowrap`}>
          To
        </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className={`w-full sm:w-auto text-xs px-2 py-1.5 border ${theme.border} ${theme.textMuted} rounded-md outline-none focus:border-green-500`}
        />

        <FilterSep />

        <label className={`text-xs ${theme.textMuted}`}>State</label>
        <select
          className={`w-full sm:w-auto text-xs px-2 py-1.5 border ${theme.border} ${theme.textMuted} rounded-md outline-none focus:border-green-500`}
        >
          <option>All States</option>
          <option>Lagos</option>
          <option>Kano</option>
        </select>

        <BtnPrimary
          onClick={() => {
            setPage(1);
            if (page === 1) fetchVerificationLogs();
          }}
        >
          Apply
        </BtnPrimary>
      </FilterBar>

      <div className="flex flex-wrap gap-1 mb-4">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer border ${
              activeTab === t
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div
        className={`${theme.card} rounded-xl border ${theme.border} overflow-hidden`}
      >
        <div
          className={`px-4 py-3 border-b ${theme.border} flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div>
            <div className={`text-sm font-medium ${theme.text}`}>
              Verification log
            </div>
            <div className={`text-xs ${theme.textMuted} mt-0.5`}>
              Read-only · No verify/re-verify actions
            </div>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className={`w-full sm:w-auto text-xs px-2 py-1.5 border ${theme.border} ${theme.textMuted} rounded-md outline-none focus:border-green-500`}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-xs">
            <thead>
              <tr>
                {[
                  "Sample ID",
                  "Product",
                  "Brand",
                  "NAFDAC No.",
                  "State",
                  "LGA",
                  "Category",
                  "Status",
                  "Created at",
                ].map((h) => (
                  <th key={h} className={TH}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`${theme.textMuted} px-4 py-6 text-center`}
                  >
                    Loading verification logs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`${theme.textMuted} px-4 py-6 text-center text-red-600`}
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`${theme.textMuted} px-4 py-6 text-center`}
                  >
                    {activeTab === "All"
                      ? "No verification logs found"
                      : `No ${activeTab.toLowerCase()} status`}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((row, index) => (
                  <tr
                    key={row.id || row.sampleId || index}
                    className={theme.hover}
                  >
                    <td className={`${TD} font-mono text-xs text-green-700`}>
                      {row.sampleId || row.sampleCode || "—"}
                    </td>

                    <td className={`${TD} font-medium`}>
                      {row.product?.name ||
                        row.productName ||
                        row.name ||
                        row.product_name ||
                        "—"}
                    </td>

                    <td className={TD}>
                      {row.brand?.name ||
                        row.brandName ||
                        row.manufacturer ||
                        "—"}
                    </td>

                    <td className={`${TD} font-mono text-xs`}>
                      {row.nafdacNumber ||
                        row.nafdacNo ||
                        row.nafdac ||
                        row.nafdac_number ||
                        "—"}
                    </td>

                    <td className={TD}>
                      {row.state?.name ||
                        row.stateName ||
                        row.locationState ||
                        "—"}
                    </td>

                    <td className={TD}>
                      {row.lga?.name || row.lgaName || row.locationLga || "—"}
                    </td>

                    <td className={TD}>
                      {row.category?.displayName ||
                        row.category?.name ||
                        row.productCategory ||
                        "—"}
                    </td>

                    <td className={TD}>
                      <StatusBadge status={getRowStatus(row) || "UNKNOWN"} />
                    </td>

                    <td className={`${TD} text-gray-400`}>
                      {row.createdAt ||
                      row.created_at ||
                      row.date ||
                      row.updatedAt
                        ? new Date(
                            row.createdAt ||
                              row.created_at ||
                              row.date ||
                              row.updatedAt,
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default Verification;
