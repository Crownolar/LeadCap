import React, { useEffect, useMemo, useState } from "react";
import { Globe2, AlertTriangle, RotateCcw } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import PolicyAlertPanel from "../../son/components/PolicyAlertPanel";
import PolicyFooterSummary from "../../son/components/PolicyFooterSummary";
import PolicyHeroStats from "../../son/components/PolicyHeroStats";
import PolicyProductRiskTable from "../../son/components/PolicyProductRiskTable";
import PolicyRecommendationCard from "../../son/components/PolicyRecommendationCard";
import PolicyRiskHotspots from "../../son/components/PolicyRiskHotspots";
import PolicyTrendCard from "../../son/components/PolicyTrendCard";
import PolicyFilterBar from "../../son/components/PolicyFilterBar";
import api from "../../../utils/api";

const RtslDashboard = () => {
  const { theme } = useTheme();
  const [states, setStates] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const params = useMemo(
    () => ({
      ...(filterState !== "all" ? { stateId: filterState } : {}),
      ...(filterStatus !== "all" ? { status: filterStatus } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
    }),
    [filterState, filterStatus, fromDate, toDate],
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statesResponse, summaryResponse] = await Promise.all([
        api.get("/management/states", { params: { activeOnly: "true" } }),
        api.get("/samples/policy-dashboard-summary", { params }),
      ]);

      setStates(statesResponse.data?.data || []);
      setSummaryData(summaryResponse.data?.data || null);
    } catch (err) {
      console.error("Failed to load RTSL strategic dashboard:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load cross-region strategic intelligence.",
      );
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  const resetFilters = () => {
    setFilterState("all");
    setFilterStatus("all");
    setFromDate("");
    setToDate("");
  };

  if (loading) {
    return (
      <p className={`text-center mt-10 text-lg animate-pulse ${theme.text}`}>
        Loading cross-region intelligence...
      </p>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center mt-8 px-4">
        <div
          className={`border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 p-4 rounded shadow max-w-xl w-full`}
        >
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <AlertTriangle size={18} />
            Strategic Intelligence Unavailable
          </h2>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={fetchData}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition text-sm"
          >
            <RotateCcw size={15} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <p className={`text-center mt-10 text-lg ${theme.text}`}>
        No cross-region intelligence is available for the selected filters.
      </p>
    );
  }

  return (
    <div className={`space-y-6 px-3 sm:px-4 md:px-6 lg:px-10 ${theme.text}`}>
      <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe2 className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                RTSL
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Cross-Region Strategic Intelligence
            </h1>
            <p className={`text-sm mt-1 ${theme.textMuted}`}>
              Compare regional contamination signals and identify strategic
              priorities across Nigeria.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              Strategic View
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs border ${theme.border} ${theme.textMuted}`}
            >
              Cross-Region Analytics
            </span>
          </div>
        </div>
      </div>

      <PolicyFilterBar
        theme={theme}
        states={states}
        filterState={filterState}
        setFilterState={setFilterState}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onReset={resetFilters}
      />

      <PolicyHeroStats
        theme={theme}
        total={summaryData.totalSamples ?? 0}
        contaminationRateText={`${Number(
          summaryData.contaminationRate ?? 0,
        ).toFixed(1)}%`}
        highRiskStates={summaryData.highRiskStates ?? 0}
        pending={summaryData.pending ?? 0}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PolicyAlertPanel theme={theme} alerts={summaryData.alerts || []} />
        <PolicyRecommendationCard
          theme={theme}
          recommendations={summaryData.recommendations || []}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PolicyTrendCard
          theme={theme}
          trendData={summaryData.trendData || []}
        />
        <PolicyRiskHotspots
          theme={theme}
          hotspots={summaryData.hotspots || []}
        />
      </div>

      <PolicyProductRiskTable
        theme={theme}
        rows={summaryData.productRiskRows || []}
      />

      <PolicyFooterSummary
        theme={theme}
        summary={
          summaryData.executiveSummary ||
          "Use regional comparisons to identify strategic priorities and coordinate cross-region interventions."
        }
      />
    </div>
  );
};

export default RtslDashboard;
