import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ShieldCheck, RefreshCw, Activity, ArrowUpRight,
  CalendarDays, Database, MapPinned, Sparkles
} from "lucide-react";
import { useSelector } from "react-redux";
import { useTheme } from "../../../context/ThemeContext";
import PolicyAlertPanel from "../components/PolicyAlertPanel";
import PolicyFooterSummary from "../components/PolicyFooterSummary";
import PolicyHeroStats from "../components/PolicyHeroStats";
import PolicyMapPreview from "../components/PolicyMapPreview";
import PolicyProductRiskTable from "../components/PolicyProductRiskTable";
import PolicyRecommendationCard from "../components/PolicyRecommendationCard";
import PolicyRiskHotspots from "../components/PolicyRiskHotspots";
import PolicyTrendCard from "../components/PolicyTrendCard";
import PolicyFilterBar from "../components/PolicyFilterBar";
import api from "../../../utils/api";

const normalizeRole = (role) => role ? role.toLowerCase().replace(/[\s_.-]/g, "") : "";

const PolicyDashboard = () => {
  const { theme } = useTheme();
  const { currentUser } = useSelector((state) => state.auth);
  const [states, setStates] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState(null);
  const [filterState, setFilterState] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const normalizedRole = normalizeRole(currentUser?.role);
  const title = normalizedRole === "policymakerson" ? "SON Regulatory Enforcement Intelligence" : "Regulatory Intelligence";
  const subtitle = normalizedRole === "policymakerson"
    ? "Turn contamination evidence into focused standards, surveillance, and enforcement decisions."
    : "National contamination and regulatory decision support.";

  const params = useMemo(() => ({
    ...(filterState !== "all" ? { stateId: filterState } : {}),
    ...(filterStatus !== "all" ? { status: filterStatus } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
  }), [filterState, filterStatus, fromDate, toDate]);

  const fetchPolicyData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(""); setErrorCode(null);
      const [statesResponse, summaryResponse] = await Promise.all([
        api.get("/management/states", { params: { activeOnly: "true" } }),
        api.get("/samples/policy-dashboard-summary", { params }),
      ]);
      setStates(statesResponse.data?.data || []);
      setSummaryData(summaryResponse.data?.data || null);
    } catch (err) {
      console.error("Failed to load SON regulatory dashboard:", err);
      setError(err?.response?.data?.message || "Failed to load regulatory intelligence.");
      setErrorCode(err?.response?.status || 500);
      if (!isRefresh) setSummaryData(null);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => { fetchPolicyData(); }, [params]);

  const resetFilters = () => {
    setFilterState("all"); setFilterStatus("all"); setFromDate(""); setToDate("");
  };

  if (loading) {
    return (
      <div className={`min-h-[520px] flex items-center justify-center px-4 ${theme.text}`}>
        <div className={`${theme.card} border ${theme.border} rounded-3xl p-10 text-center shadow-sm max-w-md w-full`}>
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Activity className="h-6 w-6 text-emerald-600 animate-pulse" />
          </div>
          <h2 className="font-bold text-lg">Loading regulatory intelligence</h2>
          <p className={`mt-2 text-sm ${theme.textMuted}`}>Preparing the latest contamination picture and enforcement signals.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`px-4 sm:px-6 lg:px-10 py-8 ${theme.text}`}>
        <div className={`${theme.card} border border-red-200 dark:border-red-900/50 rounded-3xl p-6 max-w-2xl shadow-sm`}>
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-bold">{errorCode === 401 ? "Authentication Error" : "Regulatory Intelligence Error"}</h2>
              <p className={`mt-1 text-sm ${theme.textMuted}`}>{error}</p>
              <button onClick={() => fetchPolicyData(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                <RefreshCw className="h-4 w-4" /> Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return <div className={`px-4 py-12 text-center ${theme.textMuted}`}>No regulatory intelligence is available for the selected filters.</div>;
  }

  const total = Number(summaryData.totalSamples ?? 0);
  const contaminationRate = Number(summaryData.contaminationRate ?? 0);
  const highRisk = Number(summaryData.highRiskStates ?? 0);
  const pending = Number(summaryData.pending ?? 0);

  return (
    <main className={`w-full px-3 pb-10 sm:px-5 lg:px-8 xl:px-10 ${theme.text}`}>
      <div className="space-y-5">
        <section className={`${theme.card} ${theme.border} border rounded-[28px] overflow-hidden shadow-sm relative`}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-blue-500/[0.05] pointer-events-none" />
          <div className="relative p-5 sm:p-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" /> SON • Policy Intelligence
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border ${theme.border} px-3 py-1.5 text-[11px] font-semibold ${theme.textMuted}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live data
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight">{title}</h1>
                <p className={`mt-3 max-w-2xl text-sm sm:text-base leading-6 ${theme.textMuted}`}>{subtitle}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:min-w-[360px]">
                {[
                  [Database, total, "Samples"],
                  [AlertTriangle, `${contaminationRate.toFixed(1)}%`, "Contamination"],
                  [MapPinned, highRisk, "High-risk states"],
                ].map(([Icon, value, label]) => (
                  <div key={label} className={`${theme.bg} ${theme.border} border rounded-2xl p-3 sm:p-4`}>
                    <Icon className="h-4 w-4 text-emerald-600" />
                    <p className="mt-2 text-lg sm:text-xl font-black">{value}</p>
                    <p className={`text-[10px] sm:text-xs ${theme.textMuted}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <PolicyFilterBar {...{theme, states, filterState, setFilterState, filterStatus, setFilterStatus, fromDate, setFromDate, toDate, setToDate}} onReset={resetFilters} />

        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-sm font-bold">National risk picture</p>
            <p className={`text-xs ${theme.textMuted}`}>Evidence-led signals for regulatory prioritisation</p>
          </div>
          <button disabled={refreshing} onClick={() => fetchPolicyData(true)} className={`${theme.card} ${theme.border} border rounded-xl px-3 py-2 text-xs font-semibold inline-flex items-center gap-2 hover:shadow-sm disabled:opacity-60`}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <PolicyHeroStats theme={theme} total={total} contaminationRateText={`${contaminationRate.toFixed(1)}%`} highRiskStates={highRisk} pending={pending} />

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <PolicyAlertPanel theme={theme} alerts={summaryData.alerts || []} />
          <PolicyRecommendationCard theme={theme} recommendations={summaryData.recommendations || []} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <PolicyTrendCard theme={theme} trendData={summaryData.trendData || []} />
          <PolicyRiskHotspots theme={theme} hotspots={summaryData.hotspots || []} />
        </div>

        <PolicyProductRiskTable theme={theme} rows={summaryData.productRiskRows || []} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2"><PolicyMapPreview theme={theme} hotspotCount={highRisk} totalStates={states.length} /></div>
          <div className={`${theme.card} ${theme.border} border rounded-2xl p-5 shadow-sm`}>
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-600" /><h3 className="font-bold text-sm">Decision focus</h3></div>
            <p className={`mt-3 text-sm leading-6 ${theme.textMuted}`}>Use hotspots, product risk, and trend movement together before prioritising inspections or market interventions.</p>
            <div className={`mt-5 rounded-xl ${theme.bg} ${theme.border} border p-4`}>
              <div className="flex justify-between text-xs"><span className={theme.textMuted}>Pending action</span><span className="font-bold">{pending}</span></div>
              <div className={`mt-3 h-2 rounded-full ${theme.border} border overflow-hidden`}><div className="h-full bg-amber-500 rounded-full" style={{width:`${Math.min(total ? pending/total*100 : 0,100)}%`}} /></div>
            </div>
          </div>
        </div>

        <PolicyFooterSummary theme={theme} summary={summaryData.executiveSummary || ""} />
      </div>
    </main>
  );
};

export default PolicyDashboard;
