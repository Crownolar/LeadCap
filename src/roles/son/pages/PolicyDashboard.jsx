import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
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
import api from "../../../utils/api";

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
  const { theme } = useTheme();
  const { currentUser } = useSelector((state) => state.auth);

  const [states, setStates] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statesLoading, setStatesLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState(null);

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
    const fetchStates = async () => {
      try {
        setStatesLoading(true);
        const response = await api.get("/management/states", {
          params: { activeOnly: "true" },
        });
        setStates(response.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch states:", err);
      } finally {
        setStatesLoading(false);
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    const fetchPolicySummary = async () => {
      try {
        setLoading(true);
        setError("");
        setErrorCode(null);

        const response = await api.get("/samples/policy-dashboard-summary");

        const payload = response?.data?.data || null;
        console.log("payload:", payload);
        console.log("productRiskRows:", payload?.productRiskRows);
        setSummaryData(payload);
      } catch (err) {
        console.error("Failed to fetch policy dashboard summary:", err);
        setError(
          err?.response?.data?.message ||
            "Failed to load policy dashboard summary."
        );
        setErrorCode(err?.response?.status || 500);
        setSummaryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicySummary();
  }, []);

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

  if (!summaryData) {
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

      <PolicyHeroStats
        theme={theme}
        total={summaryData.totalSamples ?? 0}
        contaminationRateText={`${Number(summaryData.contaminationRate ?? 0).toFixed(1)}%`}
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

      <PolicyMapPreview
        theme={theme}
        hotspotCount={summaryData.highRiskStates ?? 0}
        totalStates={states.length}
      />

      <PolicyFooterSummary
        theme={theme}
        summary={summaryData.executiveSummary || ""}
      />
    </div>
  );
};

export default PolicyDashboard;