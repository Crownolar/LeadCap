import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../../context/ThemeContext";
import {
  fetchSamples,
  fetchSampleStats,
} from "../../../redux/slice/samplesSlice";
import PolicyAlertPanel from "../components/PolicyAlertPanel";
import PolicyFilterBar from "../components/PolicyFilterBar";
import PolicyFooterSummary from "../components/PolicyFooterSummary";
import PolicyHeroStats from "../components/PolicyHeroStats";
import PolicyMapPreview from "../components/PolicyMapPreview";
import PolicyProductRiskTable from "../components/PolicyProductRiskTable";
import PolicyRecommendationCard from "../components/PolicyRecommendationCard";
import PolicyRiskHotspots from "../components/PolicyRiskHotspots";
import PolicyTrendCard from "../components/PolicyTrendCard";
import usePolicyData from "../hooks/usePolicyData";

const normalizeRole = (role) => {
  if (!role) return "";
  return role.toLowerCase().replace(/[\s_.-]/g, "");
};

const policyRoleMeta = {
  policymakerson: {
    title: "SON",
    subtitle: "Standards Organisation of Nigeria decision support dashboard",
  },
  policymakeruniversity: {
    title: "University",
    subtitle: "University policy and research decision support dashboard",
  },
  policymakerresolve: {
    title: "Resolve",
    subtitle: "Resolve decision support dashboard",
  },
};

const PolicyDashboard = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const { currentUser } = useSelector((state) => state.auth);
  const {
    samples,
    loading,
    error,
    errorCode,
    hasFetched,
    pagination,
    stats,
  } = useSelector((state) => state.samples);

  const totalSamples =
    stats?.totalSamples ?? pagination?.totalCount ?? samples.length;

  const [states, setStates] = useState([]);
  const [filterState, setFilterState] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const normalizedRole = normalizeRole(currentUser?.role);

  const currentPolicyMeta = useMemo(() => {
    return (
      policyRoleMeta[normalizedRole] || {
        title: "Policy Dashboard",
        subtitle: "National contamination overview and priority actions",
      }
    );
  }, [normalizedRole]);

  useEffect(() => {
    dispatch(
      fetchSampleStats({
        ...(filterState !== "all" && { stateId: filterState }),
        ...(fromDate && { dateFrom: fromDate }),
        ...(toDate && { dateTo: toDate }),
      }),
    );
  }, [dispatch, filterState, fromDate, toDate]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const api = await import("../../../utils/api").then((m) => m.default);
        const response = await api.get("/management/states", {
          params: { activeOnly: "true" },
        });
        setStates(response.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch states:", err);
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchSamples({ page: 1, limit: 5000 }));
    }
  }, [dispatch, hasFetched]);

  const {
    pending,
    contaminationRateText,
    highRiskStates,
    hotspotStates,
    trendData,
    productRiskRows,
    alerts,
    recommendations,
    executiveSummary,
  } = usePolicyData({
    samples: samples || [],
    filterState,
    filterStatus,
    fromDate,
    toDate,
  });

  const handleReset = () => {
    setFilterState("all");
    setFilterStatus("all");
    setFromDate("");
    setToDate("");
  };

  if (error) {
    return (
      <div className="w-full flex justify-center mt-8 px-4">
        <div
          className={`border-l-4 ${
            errorCode === 401
              ? "border-red-600 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              : "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
          } p-4 rounded shadow max-w-xl w-full`}
        >
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <AlertTriangle size={18} />
            {errorCode === 401 ? "Authentication Error" : "Server Error"}
          </h2>
          <p className="mt-1 text-sm">{error}</p>
          {errorCode === 401 && (
            <button
              onClick={() => (window.location.href = "/login")}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
            >
              Login Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <p className={`text-center mt-10 text-lg animate-pulse ${theme.text}`}>
        Loading policy dashboard...
      </p>
    );
  }

  if (!samples || samples.length === 0) {
    return (
      <p className={`text-center mt-10 text-lg ${theme.text}`}>
        No policy data available.
      </p>
    );
  }

  return (
    <div className={`space-y-6 px-3 sm:px-4 md:px-6 lg:px-10 ${theme.text}`}>
      <div
        className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {currentPolicyMeta.title}
            </h1>
            <p className={`text-sm mt-1 ${theme.textMuted}`}>
              {currentPolicyMeta.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              Live Monitoring
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs border ${theme.border} ${theme.textMuted}`}
            >
              Decision Support View
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
        onReset={handleReset}
      />

      <PolicyHeroStats
        theme={theme}
        total={totalSamples}
        contaminationRateText={
          stats?.contaminationRate != null
            ? `${Number(stats.contaminationRate).toFixed(1)}%`
            : contaminationRateText
        }
        highRiskStates={stats?.highRiskStates ?? highRiskStates}
        pending={stats?.pending ?? pending}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PolicyAlertPanel theme={theme} alerts={alerts} />
        <PolicyRecommendationCard
          theme={theme}
          recommendations={recommendations}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PolicyTrendCard theme={theme} trendData={trendData} />
        <PolicyRiskHotspots theme={theme} hotspots={hotspotStates} />
      </div>

      <PolicyProductRiskTable theme={theme} rows={productRiskRows} />

      <PolicyMapPreview
        theme={theme}
        hotspotCount={highRiskStates}
        totalStates={states.length}
      />

      <PolicyFooterSummary theme={theme} summary={executiveSummary} />
    </div>
  );
};

export default PolicyDashboard;
