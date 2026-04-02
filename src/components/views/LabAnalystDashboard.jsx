import React, { useEffect, useState } from "react";
import {
  Beaker,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import StatCard from "../common/StatCard";
// import { useSelector } from "react-redux";
import api from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const LabAnalystDashboard = () => {
  const { theme } = useTheme();

  const [samplesRequiringConfirmation, setSamplesRequiringConfirmation] =
    useState([]);
  const [labStats, setLabStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const navigate = useNavigate();

  const handleFetchMore = async () => {
    if (isLoadingMore) return;
    const newSkip = skip + 20;
    const noMore = skip + take >= (totalItems || 1);
    if (noMore) return;
    try {
      setIsLoadingMore(true);
      setSkip(newSkip);
      const res = await api.get("/lab/samples-requiring-confirmation", {
        params: { take, skip: newSkip },
      });
      if (res.data?.data) {
        setSamplesRequiringConfirmation((prev) => [...prev, ...res.data.data]);
      }
    } catch (err) {
      console.error("Failed to load more samples:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchLabData = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          console.error("❌ [LabAnalystDashboard] No access token found");
          setError("Access token not found. Please log in again.");
          setLoading(false);
          return;
        }
        setLoading(true);
        const samplesRes = await api.get(
          "/lab/samples-requiring-confirmation",
          {
            params: { take: 20, skip: 0 },
          },
        );
        setSamplesRequiringConfirmation((prev) => [
          ...prev,
          ...(samplesRes.data.data || []),
        ]);
        setTotalItems(samplesRes.data.pagination.total || 1);
        const statsRes = await api.get("/lab/my-workload");
        setLabStats(statsRes.data.data);
        setError(null);
      } catch (err) {
        console.error(
          "❌ [LabAnalystDashboard] Failed to fetch lab data:",
          err,
        );
        console.error("   Error message:", err.message);
        setError(err.response?.data?.message || "Failed to load lab data");
      } finally {
        setLoading(false);
      }
    };

    fetchLabData();
  }, []);

  if (loading) {
    return (
      <p
        className={`text-center mt-6 sm:mt-10 text-base sm:text-lg animate-pulse ${theme?.text} px-4`}
      >
        Loading lab dashboard...
      </p>
    );
  }

  if (error) {
    return (
      <div className='w-full flex justify-center mt-6 sm:mt-10 px-3 sm:px-4'>
        <div
          className={`border-l-4 border-red-600 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 sm:p-4 rounded shadow max-w-xl w-full`}
        >
          <h2 className='font-semibold text-base sm:text-lg flex items-center gap-2'>
            <AlertTriangle size={18} className='sm:w-5 sm:h-5' /> Error
          </h2>
          <p className='mt-1 text-sm'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 sm:space-y-6 px-3 sm:px-0'>
      {/* STATS */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4`}
      >
        <StatCard
          icon={Beaker}
          label='Pending Confirmations'
          value={labStats?.pendingCount || 0}
          color='bg-blue-600'
          theme={theme}
        />
        <StatCard
          icon={CheckCircle}
          label='Completed AAS Tests'
          value={labStats?.completedCount || 0}
          color='bg-green-600'
          theme={theme}
        />
        <StatCard
          icon={Clock}
          label='In Progress'
          value={labStats?.inProgressCount || 0}
          color='bg-yellow-500'
          theme={theme}
        />
        <StatCard
          icon={TrendingUp}
          label='Accuracy Rate'
          value={
            labStats?.completedCount === 0
              ? "N/A"
              : `${(labStats?.accuracyRate ?? 0).toFixed(1)}%`
          }
          color='bg-purple-600'
          theme={theme}
        />
      </div>

      {/* PENDING CONFIRMATIONS TABLE/CARDS */}
      <div
        className={`${theme?.card} ${theme.text} rounded-lg shadow-md border ${theme?.border} p-4 sm:p-6`}
      >
        <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4 inline-flex items-center gap-2'>
          Samples Requiring Lab Confirmation
          <span className='inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'>
            {samplesRequiringConfirmation.length}
          </span>
        </h3>

        {/* Desktop Table View */}
        <div className='hidden lg:block overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className={theme?.bg}>
              <tr>
                <th className='px-4 py-2 text-left font-semibold'>Sample ID</th>
                <th className='px-4 py-2 text-left font-semibold'>Product</th>
                <th className='px-4 py-2 text-left font-semibold'>
                  Heavy Metals
                </th>
                <th className='px-4 py-2 text-left font-semibold'>
                  XRF Status
                </th>
                <th className='px-4 py-2 text-left font-semibold'>
                  Date Screened
                </th>
                <th className='px-4 py-2 text-left font-semibold'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
              {samplesRequiringConfirmation.length > 0 ? (
                samplesRequiringConfirmation.map((sample) => (
                  <tr key={sample.id} className={theme?.hover}>
                    <td className='px-4 py-2 font-medium'>{sample.sampleId}</td>
                    <td className='px-4 py-2'>
                      {sample.product?.variantName || "N/A"}
                    </td>
                    <td className='px-4 py-2'>
                      <div className='flex flex-wrap gap-1'>
                        {sample.readings
                          ?.filter((r) => r.requiresLabConfirmation)
                          .map((r) => (
                            <span
                              key={r.readingId}
                              className='px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs rounded'
                            >
                              {r.heavyMetal}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className='px-4 py-2'>
                      <span className='px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded font-semibold'>
                        Pending AAS
                      </span>
                    </td>
                    <td className='px-4 py-2 text-xs text-gray-500 dark:text-gray-400'>
                      {sample.createdAt
                        ? new Date(sample.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className='px-4 py-2'>
                      <button
                        type='button'
                        onClick={() => {
                          console.log(
                            "🟡 [LabAnalystDashboard] Record AAS clicked",
                          );
                          console.log("   sample.sampleId:", sample.sampleId);
                          navigate(`/record-reading/${sample.sampleId}`);
                        }}
                        className='text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold text-sm'
                      >
                        Record AAS
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='6' className='px-4 py-8 text-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <p className={`text-sm font-medium ${theme?.text} mb-1`}>
                        No samples pending lab confirmation
                      </p>
                      <p className={`text-xs ${theme?.textMuted}`}>
                        Samples with Lead XRF results requiring AAS will appear
                        here
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              <div className='py-3 flex justify-center'>
                <button
                  onClick={handleFetchMore}
                  disabled={isLoadingMore || skip + take >= (totalItems || 1)}
                  className={`px-4 py-2 rounded-lg text-sm text-white ${isLoadingMore || skip + take >= (totalItems || 0) ? "bg-gray-400 opacity-60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
                >
                  {isLoadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className='lg:hidden space-y-3'>
          {samplesRequiringConfirmation.length > 0 ? (
            <>
              {samplesRequiringConfirmation.map((sample) => (
                <div
                  key={sample.id}
                  className={`border ${theme?.border} rounded-lg p-3 sm:p-4 space-y-3 ${theme?.hover}`}
                >
                  {/* Sample ID & Status */}
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                    <div className='flex-1 min-w-0'>
                      <p
                        className={`text-xs ${theme?.textMuted} font-semibold uppercase`}
                      >
                        Sample ID
                      </p>
                      <p className='font-bold text-sm sm:text-base truncate'>
                        {sample.sampleId}
                      </p>
                    </div>
                    <span className='self-start sm:self-auto px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded font-semibold whitespace-nowrap'>
                      Pending AAS
                    </span>
                  </div>

                  {/* Product */}
                  <div>
                    <p
                      className={`text-xs ${theme?.textMuted} font-semibold uppercase mb-1`}
                    >
                      Product
                    </p>
                    <p className='text-sm font-medium'>
                      {sample.product?.variantName || "N/A"}
                    </p>
                  </div>

                  {/* Heavy Metals */}
                  <div>
                    <p
                      className={`text-xs ${theme?.textMuted} font-semibold uppercase mb-1.5`}
                    >
                      Heavy Metals Requiring Confirmation
                    </p>
                    <div className='flex flex-wrap gap-1.5'>
                      {sample.readings
                        ?.filter((r) => r.requiresLabConfirmation)
                        .map((r) => (
                          <span
                            key={r.readingId}
                            className='px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs rounded font-medium'
                          >
                            {r.heavyMetal}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Date & Action */}
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700'>
                    <div className='flex-1'>
                      <p
                        className={`text-xs ${theme?.textMuted} font-semibold uppercase`}
                      >
                        Date Screened
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
                        {sample.createdAt
                          ? new Date(sample.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => {
                        console.log(
                          "🟡 [LabAnalystDashboard] Record AAS clicked",
                        );
                        console.log("   sample.sampleId:", sample.sampleId);
                        navigate(`/record-reading/${sample.sampleId}`);
                      }}
                      className='w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors'
                    >
                      Record AAS Reading
                    </button>
                  </div>
                </div>
              ))}

              {/* Load more button for mobile/tablet */}
              <div className='py-3 flex justify-center'>
                <button
                  onClick={handleFetchMore}
                  disabled={isLoadingMore || skip + take >= (totalItems || 1)}
                  className={`px-4 py-2 rounded-lg text-sm text-white ${isLoadingMore || skip + take >= (totalItems || 0) ? "bg-gray-400 opacity-60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
                >
                  {isLoadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            </>
          ) : (
            <div className='flex flex-col items-center justify-center py-10 text-center'>
              <p className={`text-sm font-medium ${theme?.text} mb-1`}>
                No samples pending lab confirmation
              </p>
              <p className={`text-xs ${theme?.textMuted}`}>
                Samples with Lead XRF results requiring AAS will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* COMPARISON INSIGHTS - show N/A when no AAS recorded yet */}
      {labStats?.comparisonMetrics && (
        <div
          className={`${theme?.card} ${theme.text} rounded-lg shadow-md border ${theme?.border} p-4 sm:p-6`}
        >
          <h3 className='text-base sm:text-lg font-semibold mb-3 sm:mb-4'>
            XRF vs AAS Agreement Analysis
          </h3>
          {labStats?.completedCount === 0 ? (
            <p className={`text-sm ${theme?.textMuted}`}>
              Record AAS readings to see agreement metrics.
            </p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
              <div className={`${theme?.bg} p-3 sm:p-4 rounded`}>
                <p className={`text-xs sm:text-sm ${theme?.textMuted} mb-1`}>
                  Full Agreement
                </p>
                <p className='text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400'>
                  {labStats.comparisonMetrics.fullAgreement}%
                </p>
              </div>
              <div className={`${theme?.bg} p-3 sm:p-4 rounded`}>
                <p className={`text-xs sm:text-sm ${theme?.textMuted} mb-1`}>
                  Partial Agreement
                </p>
                <p className='text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400'>
                  {labStats.comparisonMetrics.partialAgreement}%
                </p>
              </div>
              <div className={`${theme?.bg} p-3 sm:p-4 rounded`}>
                <p className={`text-xs sm:text-sm ${theme?.textMuted} mb-1`}>
                  Disagreement
                </p>
                <p className='text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400'>
                  {labStats.comparisonMetrics.disagreement}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LabAnalystDashboard;
