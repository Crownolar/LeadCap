import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../../context/ThemeContext";
import { fetchSamples } from "../../../redux/slice/samplesSlice";
import NafdacFlaggedProducts from "../components/NafdacFlaggedProducts";
import NafdacHeroStats from "../components/NafdacHeroStats";
import NafdacQuickActions from "../components/NafdacQuickActions";
import NafdacRiskCategories from "../components/NafdacRiskCategories";
import NafdacTrendCard from "../components/NafdacTrendCard";
import NafdacVerificationSummary from "../components/NafdacVerificationSummary";
import useNafdacDashboardData from "../hooks/useNafdacDashboardData";

const NafdacDashboard = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const { samples, loading, error, errorCode, hasFetched } = useSelector(
    (state) => state.samples
  );

  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchSamples({ page: 1, limit: 5000 }));
    }
  }, [dispatch, hasFetched]);

  const {
    registeredProducts,
    verifiedMatches,
    flaggedRecords,
    pendingReviews,
    verificationSummary,
    trendData,
    riskCategories,
    flaggedProducts,
  } = useNafdacDashboardData({
    samples: samples || [],
  });

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
        Loading NAFDAC dashboard...
      </p>
    );
  }

  if (!samples || samples.length === 0) {
    return (
      <p className={`text-center mt-10 text-lg ${theme.text}`}>
        No NAFDAC dashboard data available.
      </p>
    );
  }

  return (
    <div className={`space-y-6 px-3 sm:px-4 md:px-6 lg:px-10 ${theme.text}`}>
      <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">NAFDAC</h1>
            <p className={`text-sm mt-1 ${theme.textMuted}`}>
              Registry and verification oversight dashboard
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              Regulatory Monitoring
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs border ${theme.border} ${theme.textMuted}`}
            >
              Compliance View
            </span>
          </div>
        </div>
      </div>

      <NafdacHeroStats
        theme={theme}
        registeredProducts={stats?.registeredProducts ?? registeredProducts}
        verifiedMatches={stats?.verifiedMatches ?? verifiedMatches}
        flaggedRecords={stats?.flaggedRecords ?? flaggedRecords}
        pendingReviews={stats?.pendingReviews ?? pendingReviews}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <NafdacTrendCard
          theme={theme}
          trendData={stats?.trendData ?? trendData}
        />
        <NafdacVerificationSummary
          theme={theme}
          data={stats?.verificationSummary ?? verificationSummary}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <NafdacRiskCategories
          theme={theme}
          categories={stats?.riskCategories ?? riskCategories}
        />
        <NafdacFlaggedProducts
          theme={theme}
          rows={stats?.flaggedProducts ?? flaggedProducts}
        />
      </div>

      <NafdacQuickActions theme={theme} />
    </div>
  );
};

export default NafdacDashboard;