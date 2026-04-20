import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../../context/ThemeContext";
import NafdacFlaggedProducts from "../components/NafdacFlaggedProducts";
import NafdacHeroStats from "../components/NafdacHeroStats";
import NafdacQuickActions from "../components/NafdacQuickActions";
import NafdacRiskCategories from "../components/NafdacRiskCategories";
import NafdacTrendCard from "../components/NafdacTrendCard";
import NafdacVerificationSummary from "../components/NafdacVerificationSummary";
// import useNafdacDashboardData from "../hooks/useNafdacDashboardData";
import api from "../../../utils/api";

export const deriveRiskCategories = (stats = {}) => {
  const grouped = {
    category: "Unknown",
    registeredProductCount: stats?.registeredProductCount,
    fakeRecordsCount: stats?.fakeRecordsCount,
    fakeRecordsRate:
      (stats?.fakeRecordsCount / stats?.registeredProductCount) * 100,
    riskLevel:
      stats?.registeredProductCount &&
      stats?.fakeRecordsCount / stats?.registeredProductCount >= 0.35
        ? "High"
        : stats?.registeredProductCount &&
            stats?.fakeRecordsCount / stats?.registeredProductCount >= 0.15
          ? "Medium"
          : "Low",
  };
  return [grouped];
};

const NafdacDashboard = () => {
  const { theme } = useTheme();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    api
      .get("/nafdac/verification/stats")
      .then((res) => {
        console.log(res.data);
        setStats(res.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className='w-full flex justify-center mt-8 px-4'>
        <div
          className={`border-l-4 ${
            errorCode === 401
              ? "border-red-600 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              : "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
          } p-4 rounded shadow max-w-xl w-full`}
        >
          <h2 className='font-semibold text-lg flex items-center gap-2'>
            <AlertTriangle size={18} />
            Something went wrong.Try refreshing
          </h2>
          <p className='mt-1 text-sm'>{error}</p>
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

  return (
    <div className={`space-y-6 px-3 sm:px-4 md:px-6 lg:px-10 ${theme.text}`}>
      <div
        className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}
      >
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
          <div>
            <h1 className='text-xl sm:text-2xl font-bold'>NAFDAC</h1>
            <p className={`text-sm mt-1 ${theme.textMuted}`}>
              Registry and verification oversight dashboard
            </p>
          </div>

          <div className='flex items-center gap-2 flex-wrap'>
            <span className='px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700'>
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
        registeredProducts={stats?.registeredProductCount ?? 0}
        verifiedMatches={stats?.verifiedMatchesCount ?? 0}
        flaggedRecords={stats?.fakeRecordsCount ?? 0}
        pendingReviews={stats?.pendingReviewsCount ?? 0}
      />

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <NafdacTrendCard theme={theme} trendData={stats?.monthlyAnalysis} />
        <NafdacVerificationSummary
          theme={theme}
          data={
            stats.verifiedMatchesCount &&
            stats.fakeRecordsCount &&
            stats.pendingVerificationsCount
              ? [
                  { name: "Matched", value: 60 },
                  { name: "Flagged", value: 20 },
                  { name: "Pending", value: stats.pendingVerificationsCount },
                ]
              : [{ name: "Unknown", value: 100 }]
          }
        />
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <NafdacRiskCategories
          theme={theme}
          categories={deriveRiskCategories(stats)}
        />
        <NafdacFlaggedProducts
          theme={theme}
          rows={stats?.recentDetectedFakeSamples}
        />
      </div>

      <NafdacQuickActions theme={theme} />
    </div>
  );
};

export default NafdacDashboard;
