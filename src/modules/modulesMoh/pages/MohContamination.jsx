import { useEffect, useMemo, useRef, useState } from "react";
import { BtnPrimary, TD } from "../utils/MohUI";
import { FilterBar } from "../components/FilterBar";
import { WhiteCard } from "../components/WhiteCard";
import { SectionLabel } from "../components/SectionLabel";
import { RateBadge } from "../components/RateBadge";
import { getContaminationSummary } from "../../../services/mohReportService";
import SummaryCards from "./reports/components/reports/SummaryCards";
import ReportTableSection from "./reports/components/reports/ReportTableSection";
import ReportListSection from "./reports/components/reports/ReportListSection";
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
    e.preventDefault();
    
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
        stateId: filters.stateId,
        state: selectedState?.name || "",
        // stateName: selectedState?.name || "",
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
    handleLoadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = summaryData?.summary || {};
  const contaminationBreakdown = summary?.contaminationBreakdown || {};
  const byLGA = summaryData?.byLGA || {};
  const byProductType = summaryData?.byProductType || {};
  console.log(byProductType);
  const highRiskSamples = summaryData?.highRiskSamples || [];
  console.log(highRiskSamples);
  const registrationStatus = summaryData?.registrationStatus || {};
  const vendorType = summaryData?.vendorType || {};
  const recommendations = summaryData?.recommendations || [];

  const summaryCards = [
    {
      label: "Total samples",
      value: summary.totalSamples ?? 0,
      color: "text-gray-900",
      subtext: `${filters.dateFrom} to ${filters.dateTo}`,
    },
    {
      label: "Contaminated",
      value: contaminationBreakdown.CONTAMINATED ?? 0,
      color: "text-red-600",
      subtext: `${summary.percentageContaminated ?? 0}% of all samples`,
    },
    {
      label: "High risk",
      value: highRiskSamples.length,
      color: "text-amber-600",
    },
    {
      label: "Registered",
      value: registrationStatus.registered ?? 0,
      color: "text-green-700",
    },
    {
      label: "Unregistered",
      value: registrationStatus.unregistered ?? 0,
      color: "text-gray-900",
    },
    {
      label: "Informal vendors",
      value: vendorType.informal ?? 0,
      color: "text-gray-900",
    },
  ];

  const lgaRows = useMemo(() => {
    return Object.entries(byLGA)
      .map(([lgaName, stats]) => {
        const total = stats?.total ?? 0;
        const contaminated = stats?.contaminated ?? 0;
        const rate =
          total > 0 ? `${((contaminated / total) * 100).toFixed(1)}%` : "0%";

        return {
          lgaName,
          total,
          contaminated,
          rate,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [byLGA]);

  const productRows = useMemo(() => {
    return Object.entries(byProductType)
      .map(([productType, stats]) => {
        const total = stats?.total ?? stats?.totalSamples ?? 0;
        const contaminated = stats?.contaminated ?? 0;
        const rate =
          stats?.contaminationRate ||
          (total > 0 ? `${((contaminated / total) * 100).toFixed(1)}%` : "0%");

        return {
          productType,
          total,
          contaminated,
          rate,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [byProductType]);

  const hotspotRows = useMemo(() => {
    return Object.entries(byLGA)
      .map(([lgaName, stats]) => {
        const total = stats?.total ?? 0;
        const contaminated = stats?.contaminated ?? 0;
        const riskScore =
          total > 0 ? Number(((contaminated / total) * 10).toFixed(1)) : 0;

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
                  : "#059669",
            ),
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: "#f3f4f6" },
          },
          y: {
            grid: { display: false },
          },
        },
      },
    });

    return () => chartInst.current?.destroy();
  }, [hotspotRows]);

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 ${theme.card} ${theme.textMuted} rounded-xl border ${theme.border} p-4`}
    >
      <div>
        <div className="mb-3">
          <div className={`text-sm font-medium ${theme.text}`}>
            Contamination summary
          </div>
          <div className={`text-xs ${theme.textMuted}`}>
            By state and date range
          </div>
        </div>

        <FilterBar>
          <label className={`text-xs ${theme.text}`}>State ( Required )</label>
          <select
            value={filters.stateId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, stateId: e.target.value }))
            }
            className={`w-full sm:w-auto text-xs px-2 py-1.5 ${theme.input} border ${theme.border} rounded-md outline-none focus:border-green-500`}
          >
            <option value="">
              {loadingStates ? "Loading states..." : "All States"}
            </option>

            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name || state.displayName || "Unknown State"}
              </option>
            ))}
          </select>

          <label className={`text-xs ${theme.textMuted} whitespace-nowrap`}>
            From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
            }
            className={`w-full sm:w-auto text-xs px-2 py-1.5 ${theme.input} border ${theme.border} rounded-md outline-none focus:border-green-500`}
          />

          <label className={`text-xs ${theme.textMuted} whitespace-nowrap`}>
            To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
            }
            className={`w-full sm:w-auto text-xs px-2 py-1.5 ${theme.input} border ${theme.border} rounded-md outline-none focus:border-green-500`}
          />

          <BtnPrimary onClick={handleLoadSummary} disabled={loading}>
            {loading ? "Loading..." : "Load"}
          </BtnPrimary>
        </FilterBar>

        {statesError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {statesError}
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-3">
          <SummaryCards items={summaryCards} />
        </div>

        <ReportTableSection
          title="Breakdown by LGA"
          headers={["LGA", "Samples", "Contaminated", "Rate"]}
          rows={lgaRows}
          emptyMessage="No LGA data available."
          className="mb-3"
          renderRow={(row) => (
            <tr key={row.lgaName} className={theme.hover}>
              <td className={TD}>{row.lgaName}</td>
              <td className={TD}>{row.total}</td>
              <td className={TD}>{row.contaminated}</td>
              <td className={TD}>
                <RateBadge rate={row.rate} />
              </td>
            </tr>
          )}
        />

        <ReportTableSection
          title="Breakdown by product type"
          headers={["Category", "Samples", "Contaminated", "Rate"]}
          rows={productRows}
          emptyMessage="No product type data available."
          renderRow={(row) => (
            <tr key={row.productType} className={theme.hover}>
              <td className={TD}>
                {row.productType?.displayName ||
                  row.productType?.name ||
                  row.productType ||
                  "—"}
              </td>
              <td className={TD}>{row.total}</td>
              <td className={TD}>{row.contaminated}</td>
              <td className={TD}>
                <RateBadge rate={row.rate} />
              </td>
            </tr>
          )}
        />
      </div>

      <div>
        <div className="mb-3">
          <div className={`text-sm font-medium ${theme.text}`}>
            Risk hotspot rankings
          </div>
          <div className={`text-xs ${theme.textMuted}`}>
            {filters.stateId ? selectedStateName : "All regions"} · derived from
            contamination rate
          </div>
        </div>

        <FilterBar>
          <label className={`text-xs ${theme.textMuted} whitespace-nowrap`}>
            From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
            }
            className={`w-full sm:w-auto text-xs px-2 py-1.5 ${theme.input} border ${theme.border} rounded-md outline-none focus:border-green-500`}
          />

          <label className={`text-xs ${theme.textMuted} whitespace-nowrap`}>
            To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
            }
            className={`w-full sm:w-auto text-xs px-2 py-1.5 ${theme.input} border ${theme.border} rounded-md outline-none focus:border-green-500`}
          />

          <BtnPrimary onClick={handleLoadSummary} disabled={hotspotLoading}>
            {hotspotLoading ? "Loading..." : "Load"}
          </BtnPrimary>
        </FilterBar>

        <WhiteCard className="mb-3">
          <SectionLabel>Risk scores by LGA</SectionLabel>
          {hotspotRows.length === 0 ? (
            <div
              className={`h-[260px] flex items-center justify-center text-sm ${theme.textMuted}`}
            >
              No hotspot data available.
            </div>
          ) : (
            <div className="relative w-full" style={{ height: 260 }}>
              <canvas ref={chartRef} />
            </div>
          )}
        </WhiteCard>

        <ReportListSection
          title="High-risk samples"
          items={highRiskSamples}
          emptyMessage="No high-risk samples available."
          className="mb-3"
          renderItem={(item, index) => {
            const label =
              item.label ||
              `${item.state || "Unknown"} — ${
                item.productName ||
                item.sampleCode ||
                item.sampleName ||
                `Sample ${index + 1}`
              }`;

            const value =
              item.value ||
              `${item.contaminatedMetals[0].metal}: ${item.contaminatedMetals[0].concentration ?? item.reading ?? "-"} ppm`;

            const numericReading = Number(item.leadLevel ?? item.reading ?? 0);
            const color =
              numericReading >= 3 ? "text-red-600" : "text-amber-600";

            return (
              <div className="flex justify-between text-xs">
                <span className={theme.textMuted}>{label}</span>
                <span className={`font-medium ${color}`}>{value}</span>
              </div>
            );
          }}
        />

        <ReportListSection
          title="Recommendations"
          items={recommendations}
          emptyMessage="No recommendations available."
          renderItem={(item, index) => {
            if (typeof item === "string") {
              return (
                <div className={`text-xs ${theme.textMuted}`}>
                  {index + 1}. {item}
                </div>
              );
            }

            return (
              <div className="space-y-1 text-xs">
                <div className={`font-medium ${theme.text}`}>
                  {index + 1}.{" "}
                  {item?.recommendation || item?.finding || "Recommendation"}
                </div>

                {item?.category && (
                  <div className={theme.textMuted}>
                    <span className="font-medium">Category:</span>{" "}
                    {item.category}
                  </div>
                )}

                {item?.priority && (
                  <div className={theme.textMuted}>
                    <span className="font-medium">Priority:</span>{" "}
                    {item.priority}
                  </div>
                )}

                {item?.finding && (
                  <div className={theme.textMuted}>
                    <span className="font-medium">Finding:</span> {item.finding}
                  </div>
                )}

                {item?.action && (
                  <div className={theme.textMuted}>
                    <span className="font-medium">Action:</span> {item.action}
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default Contamination;
