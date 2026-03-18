import { useEffect, useRef, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { FilterSep, BtnPrimary, TH, TD } from "../utils/MohUI";
import { MetricCard } from "../components/MetricCard";
import { Pagination } from "../components/Pagination";
import { SectionLabel } from "../components/SectionLabel";
import { WhiteCard } from "../components/WhiteCard";
import { StatusBadge } from "../components/StatusBadge";
import api from "../../../utils/api";

const STATUS_TABS = ["All", "Verified", "Failed", "Pending"];

const statusMap = {
  All: "",
  Verified: "",
  Failed: "",
  Pending: "",
};

const Verification = () => {
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

  const filteredLogs = logs.filter((row) => {
    const status = row.status || row.verificationStatus || row.result;

    if (activeTab === "Verified") return status === "VERIFIED";
    if (activeTab === "Failed") return status === "VERIFIED_FAKE";
    if (activeTab === "Pending") return status === "UNVERIFIED";

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

      if (statusMap[activeTab]) {
        params.status = statusMap[activeTab];
      }

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
  }, [activeTab, page, pageSize]);

  console.log("activeTab:", activeTab);
  console.log("mapped status:", statusMap[activeTab]);

  useEffect(() => {
    if (!window.Chart || !chartRef.current) return;

    chartInst.current?.destroy();

    chartInst.current = new window.Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: [
          "Jun 1",
          "Jun 2",
          "Jun 3",
          "Jun 4",
          "Jun 5",
          "Jun 6",
          "Jun 7",
          "Jun 8",
          "Jun 9",
          "Jun 10",
        ],
        datasets: [
          {
            label: "Verified",
            data: [412, 389, 445, 520, 398, 461, 503, 489, 412, 531],
            backgroundColor: "#059669",
          },
          {
            label: "Failed",
            data: [42, 38, 55, 61, 49, 52, 48, 63, 44, 57],
            backgroundColor: "#dc2626",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { size: 11 }, padding: 10 },
          },
        },
        scales: {
          x: { stacked: false, grid: { display: false } },
          y: { grid: { color: "#f3f4f6" } },
        },
      },
    });

    return () => chartInst.current?.destroy();
  }, []);

  // const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  // const endItem = Math.min(page * pageSize, totalCount);

  const verifiedCount = logs.filter(
    (row) =>
      (row.status || row.verificationStatus || row.result) === "VERIFIED",
  ).length;

  const failedCount = logs.filter(
    (row) =>
      (row.status || row.verificationStatus || row.result) === "VERIFIED_FAKE",
  ).length;

  const pendingCount = logs.filter(
    (row) =>
      (row.status || row.verificationStatus || row.result) === "UNVERIFIED",
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
      <div className="grid grid-cols-4 gap-3 mb-5">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <WhiteCard className="mb-4">
        <SectionLabel>Daily verifications — June 2025</SectionLabel>
        <div className="relative w-full" style={{ height: 160 }}>
          <canvas ref={chartRef} />
        </div>
      </WhiteCard>

      <FilterBar>
        <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
        />

        <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
        />

        <FilterSep />

        <label className="text-xs text-gray-500">State</label>
        <select className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500">
          <option>All States</option>
          <option>Lagos</option>
          <option>Kano</option>
        </select>

        <BtnPrimary
          onClick={() => {
            setPage(1);
            if (page === 1) {
              fetchVerificationLogs();
            }
          }}
        >
          Apply
        </BtnPrimary>
      </FilterBar>

      <div className="flex gap-1 mb-4">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveTab(t);
              setPage(1);
            }}
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">
              Verification log
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              Read-only · No verify/re-verify actions
            </div>
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
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
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Loading verification logs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No verification logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((row, index) => {
                  console.log("rendering row:", row);

                  return (
                    <tr
                      key={row.id || row.sampleId || row._id || index}
                      className="hover:bg-gray-50"
                    >
                      <td className={`${TD} font-mono text-xs text-green-700`}>
                        {row.id ||
                          row.sampleId ||
                          row.sampleCode ||
                          row.code ||
                          "—"}
                      </td>

                      <td className={`${TD} font-medium`}>
                        {row.product ||
                          row.productName ||
                          row.name ||
                          row.product_name ||
                          "—"}
                      </td>

                      <td className={TD}>
                        {row.brand || row.brandName || row.manufacturer || "—"}
                      </td>

                      <td className={`${TD} font-mono text-xs`}>
                        {row.nafdac ||
                          row.nafdacNo ||
                          row.nafdacNumber ||
                          row.nafdac_number ||
                          "—"}
                      </td>

                      <td className={TD}>
                        {row.state || row.stateName || row.locationState || "—"}
                      </td>

                      <td className={TD}>
                        {row.lga || row.lgaName || row.locationLga || "—"}
                      </td>

                      <td className={TD}>
                        {row.category || row.productCategory || "—"}
                      </td>

                      <td className={TD}>
                        <StatusBadge
                          status={
                            row.status ||
                            row.verificationStatus ||
                            row.result ||
                            "UNKNOWN"
                          }
                        />
                      </td>

                      <td className={`${TD} text-gray-400`}>
                        {row.date ||
                        row.createdAt ||
                        row.created_at ||
                        row.updatedAt
                          ? new Date(
                              row.date ||
                                row.createdAt ||
                                row.created_at ||
                                row.updatedAt,
                            ).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })
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
