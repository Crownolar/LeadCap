import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  CheckCircle,
  FlaskConical,
  MapPin,
  Package,
  User,
  ShieldCheck,
} from "lucide-react";

const STATUS_TABS = ["PENDING", "APPROVED", "REJECTED", "FLAGGED"];

const SampleReview = () => {
  const { theme } = useTheme();
  const { collectorId } = useParams();

  const [samples, setSamples] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState("PENDING");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [reviewing, setReviewing] = useState(false);
  const [bulkSelection, setBulkSelection] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    status: "APPROVED",
    comments: "",
    issues: [],
    requestedChanges: "",
  });

  const [imageFailed, setImageFailed] = useState(false);

  const ISSUE_OPTIONS = [
    "Incomplete GPS location",
    "Missing product photo",
    "Invalid batch number",
    "Incorrect vendor type",
    "Suspicious pricing",
    "Poor data quality",
    "Missing heavy metal readings",
    "Other",
  ];

  const getReviewStatus = (sample) =>
    sample.review?.status ?? sample.reviewStatus ?? "PENDING";

  const statusCounts = useMemo(() => {
    return {
      PENDING: stats?.pendingReviews ?? 0,
      APPROVED: stats?.approvedSamples ?? 0,
      REJECTED: stats?.reviewBreakdown?.rejected ?? 0,
      FLAGGED: stats?.flaggedSamples ?? 0,
    };
  }, [stats]);

  const fetchReviewMeta = useCallback(async () => {
    try {
      setStatsLoading(true);
      console.log("fetchReviewMeta called");

      const res = await api.get("/supervisor/stats");
      console.log("Supervisor stats response:", res.data);

      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching supervisor stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchSamples = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("fetchSamples called", {
        filterStatus,
        page,
        pageSize,
        collectorId,
      });

      const params = {
        status: filterStatus,
        page,
        pageSize,
      };

      if (collectorId) {
        params.collectorId = collectorId;
      }

      const res = await api.get("/supervisor/samples", { params });
      console.log("Supervisor samples raw response:", res.data);

      const payload = res.data?.data ?? res.data;

      const extractedSamples =
        payload?.samples ||
        payload?.items ||
        payload?.rows ||
        payload?.results ||
        payload?.data ||
        (Array.isArray(payload) ? payload : []);

      console.log("Extracted samples:", extractedSamples);

      setSamples(extractedSamples);
    } catch (err) {
      console.error("Error fetching samples:", err);
      setError(err.response?.data?.message || err.message);
      setSamples([]);
    } finally {
      setLoading(false);
    }
  }, [collectorId, filterStatus, page, pageSize]);

  useEffect(() => {
    console.log("SampleReview mounted");
  }, []);

  useEffect(() => {
    fetchReviewMeta();
  }, [fetchReviewMeta]);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  useEffect(() => {
    setPage(1);
    setBulkSelection(new Set());
    setSelectedSample(null);
  }, [filterStatus]);

  useEffect(() => {
    setSelectedSample(samples[0] || null);
  }, [samples]);

  useEffect(() => {
    setImageFailed(false);
  }, [selectedSample]);

  useEffect(() => {
    const derivedTotalCount = statusCounts[filterStatus] ?? 0;
    const derivedTotalPages = Math.max(
      1,
      Math.ceil(derivedTotalCount / pageSize),
    );

    console.log("Derived totalCount from stats:", derivedTotalCount);
    console.log("Derived totalPages from stats:", derivedTotalPages);

    setTotalCount(derivedTotalCount);
    setTotalPages(derivedTotalPages);
  }, [filterStatus, statusCounts, pageSize]);

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setReviewForm({
      status:
        getReviewStatus(sample) === "PENDING"
          ? "APPROVED"
          : getReviewStatus(sample),
      comments: sample.review?.comments || "",
      issues: sample.review?.issues || [],
      requestedChanges: sample.review?.requestedChanges || "",
    });
  };

  const getProductPhotoSrc = (photoUrl) => {
    if (!photoUrl) return null;

    const baseUrl =
      import.meta.env.VITE_BACKEND_URL || "https://api.leadcap.ng";

    if (photoUrl.startsWith("https//")) {
      return photoUrl.replace("https//", "https://");
    }

    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
      return photoUrl;
    }

    return `${baseUrl.replace(/\/$/, "")}/${photoUrl.replace(/^\/+/, "")}`;
  };

  const productPhotoSrc = getProductPhotoSrc(selectedSample?.productPhotoUrl);

  const normalizedReadings = useMemo(() => {
    const rawReadings = Array.isArray(selectedSample?.heavyMetalReadings)
      ? selectedSample.heavyMetalReadings
      : [];

    if (rawReadings.length > 0) {
      return rawReadings.map((reading, index) => ({
        id:
          reading.id ||
          `${reading.heavyMetal || reading.metal || "METAL"}-${index}`,
        heavyMetal:
          reading.heavyMetal || reading.metal || `Metal ${index + 1}`,
        xrfReading: reading.xrfReading ?? reading.xrf?.reading ?? 0,
        aasReading: reading.aasReading ?? reading.aas?.reading ?? 0,
        status: reading.finalStatus ?? reading.status ?? "PENDING",
      }));
    }

    return [
      {
        id: "LEAD",
        heavyMetal: "LEAD",
        xrfReading: selectedSample?.leadLevel ?? 0,
        aasReading: 0,
        status: selectedSample?.contaminationStatus || "PENDING",
      },
    ];
  }, [selectedSample]);

  const handleIssueToggle = (issue) => {
    setReviewForm((prev) => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter((i) => i !== issue)
        : [...prev.issues, issue],
    }));
  };

  const refreshAll = async () => {
    await Promise.all([fetchReviewMeta(), fetchSamples()]);
  };

  const handleSubmitReview = async () => {
    if (!selectedSample) return;

    if (reviewForm.status === "REJECTED") {
      const hasReason =
        (reviewForm.comments && reviewForm.comments.trim()) ||
        (reviewForm.requestedChanges && reviewForm.requestedChanges.trim()) ||
        (reviewForm.issues && reviewForm.issues.length > 0);

      if (!hasReason) {
        toast.error(
          "Rejection reason is required. Add comments or select at least one issue.",
        );
        return;
      }
    }

    try {
      setReviewing(true);

      const response = await api.post(
        `/supervisor/samples/${selectedSample.id}/review`,
        {
          status: reviewForm.status,
          comments: reviewForm.requestedChanges || reviewForm.comments,
          issues: reviewForm.issues,
        },
      );

      if (response.data?.success) {
        toast.success(`Sample ${reviewForm.status.toLowerCase()} successfully.`);
        await refreshAll();
        setBulkSelection(new Set());
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(
        "Failed to submit review: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setReviewing(false);
    }
  };

  const handleToggleBulkSelection = (sampleId) => {
    setBulkSelection((prev) => {
      const next = new Set(prev);
      if (next.has(sampleId)) {
        next.delete(sampleId);
      } else {
        next.add(sampleId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (bulkSelection.size === samples.length) {
      setBulkSelection(new Set());
    } else {
      setBulkSelection(new Set(samples.map((sample) => sample.id)));
    }
  };

  const handleBulkAction = async (status) => {
    if (bulkSelection.size === 0) {
      toast.error("Please select at least one sample");
      return;
    }

    if (status === "REJECTED") {
      toast.error(
        "Rejection requires a reason. Please review and reject samples individually.",
      );
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to mark ${bulkSelection.size} sample(s) as ${status}?`,
      )
    ) {
      return;
    }

    try {
      setBulkProcessing(true);

      let successCount = 0;
      let errorCount = 0;

      for (const sampleId of bulkSelection) {
        try {
          await api.post(`/supervisor/samples/${sampleId}/review`, {
            status,
            comments: "",
            issues: [],
          });
          successCount++;
        } catch (err) {
          errorCount++;
        }
      }

      const total = bulkSelection.size;

      if (errorCount === 0) {
        toast.success(
          total === 1
            ? "1 sample updated successfully."
            : `${total} samples updated successfully.`,
        );
      } else if (successCount > 0) {
        toast(
          `Updated ${successCount} of ${total} samples. ${errorCount} failed.`,
          { icon: "⚠️" },
        );
      } else {
        toast.error("Could not update selected samples. Please try again.");
      }

      setBulkSelection(new Set());
      await refreshAll();
    } catch (err) {
      console.error("Error in bulk action:", err);
      toast.error("Error processing bulk action");
    } finally {
      setBulkProcessing(false);
    }
  };

  const currentSampleIndex =
    selectedSample && samples.length
      ? samples.findIndex((sample) => sample.id === selectedSample.id) + 1
      : 0;

  const totalInCurrentPage = samples.length;

  const goToNextSample = () => {
    if (!selectedSample || totalInCurrentPage === 0) return;

    const idx = samples.findIndex((sample) => sample.id === selectedSample.id);

    if (idx >= 0 && idx < totalInCurrentPage - 1) {
      handleSelectSample(samples[idx + 1]);
    } else {
      setSelectedSample(null);
    }
  };

  const getVerificationBadgeClass = (status) => {
    if (status === "VERIFIED_ORIGINAL") {
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    }
    if (status === "VERIFIED_FAKE") {
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
    }
    return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300";
  };

  const getReadingStatusClass = (status) => {
    if (status === "SAFE") {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    }
    if (status === "CONTAMINATED" || status === "FAILED") {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    }
    if (status === "MODERATE") {
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    }
    return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
  };

  if (loading && !samples.length) {
    return (
      <div className={`${theme?.card} rounded-lg p-6 sm:p-8 text-center`}>
        <p className={`text-sm sm:text-base ${theme?.textMuted}`}>
          Loading samples...
        </p>
      </div>
    );
  }

  return (
    <div className={`${theme?.text} space-y-4 sm:space-y-6`}>
      <div className='space-y-1'>
        <h1 className='text-xl sm:text-2xl font-bold'>Review samples</h1>
        <p className={`text-sm ${theme?.textMuted}`}>
          Review and approve samples from your collectors
        </p>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm'>
          Error: {error}
        </div>
      )}

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {STATUS_TABS.map((status) => {
          const count = statusCounts[status] ?? 0;
          const isActive = filterStatus === status;

          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : `${theme?.card} ${theme?.border} hover:shadow-sm`
              }`}
            >
              <p className='text-xs sm:text-sm font-medium opacity-90'>
                {status}
              </p>
              <p className='text-xl sm:text-2xl font-bold mt-1'>{count}</p>
              <p className='text-[11px] sm:text-xs mt-1 opacity-80'>
                {status === "PENDING"
                  ? "Awaiting supervisor action"
                  : status === "APPROVED"
                    ? "Already approved"
                    : status === "REJECTED"
                      ? "Returned or rejected"
                      : "Needs attention"}
              </p>
            </button>
          );
        })}
      </div>

      <div className='space-y-3 sm:space-y-4'>
        {bulkSelection.size > 0 && (
          <div
            className={`${theme?.card} border ${theme?.border} rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
          >
            <div className='flex items-center gap-2 sm:gap-3'>
              <CheckCircle
                size={18}
                className='text-emerald-600 sm:w-5 sm:h-5 flex-shrink-0'
              />
              <span className='text-sm sm:text-base font-semibold'>
                {bulkSelection.size} sample(s) selected
              </span>
            </div>

            <div className='flex gap-2 flex-wrap w-full sm:w-auto'>
              <button
                onClick={() => handleBulkAction("APPROVED")}
                disabled={bulkProcessing}
                className='flex-1 sm:flex-none px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm'
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction("FLAGGED")}
                disabled={bulkProcessing}
                className='flex-1 sm:flex-none px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm'
              >
                Flag
              </button>
              <button
                onClick={() => setBulkSelection(new Set())}
                disabled={bulkProcessing}
                className='flex-1 sm:flex-none px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm'
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
        <div
          className={`${theme?.card} rounded-xl p-4 sm:p-5 border ${theme?.border}`}
        >
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h3 className='text-base sm:text-lg font-semibold inline-flex items-center gap-2'>
                {filterStatus}
                <span className='inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'>
                  {totalCount}
                </span>
              </h3>
              <p className={`text-xs mt-1 ${theme?.textMuted}`}>
                Page {page} of {totalPages}
              </p>
            </div>

            {samples.length > 0 && (
              <label className='flex items-center gap-2 text-xs sm:text-sm cursor-pointer'>
                <input
                  type='checkbox'
                  checked={
                    samples.length > 0 && bulkSelection.size === samples.length
                  }
                  onChange={handleSelectAll}
                  className='w-4 h-4 rounded text-emerald-600'
                />
                <span>Select all</span>
              </label>
            )}
          </div>

          <div className='space-y-2 max-h-[480px] overflow-y-auto pr-1'>
            {loading ? (
              <div className='flex flex-col items-center justify-center py-10 text-center'>
                <p className={`text-sm ${theme?.textMuted}`}>Refreshing...</p>
              </div>
            ) : samples.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-10 text-center'>
                <p className={`text-sm font-medium ${theme?.text} mb-1`}>
                  No {filterStatus.toLowerCase()} samples
                </p>
                <p className={`text-xs ${theme?.textMuted}`}>
                  There are no records in this category right now
                </p>
              </div>
            ) : (
              samples.map((sample) => (
                <div
                  key={sample.id}
                  className={`rounded-xl border transition-all ${
                    selectedSample?.id === sample.id
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : `${theme?.border} hover:shadow-sm`
                  }`}
                >
                  <div className='flex items-start gap-3 p-3'>
                    <input
                      type='checkbox'
                      checked={bulkSelection.has(sample.id)}
                      onChange={() => handleToggleBulkSelection(sample.id)}
                      onClick={(e) => e.stopPropagation()}
                      className='w-4 h-4 rounded text-emerald-600 mt-1 flex-shrink-0'
                    />

                    <button
                      onClick={() => handleSelectSample(sample)}
                      className='flex-1 text-left min-w-0'
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <p className='font-semibold text-sm truncate'>
                          {sample.productName || "Unnamed product"}
                        </p>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-semibold whitespace-nowrap ${getVerificationBadgeClass(
                            sample.verificationStatus,
                          )}`}
                        >
                          {sample.verificationStatus || "UNVERIFIED"}
                        </span>
                      </div>

                      <p className={`text-xs mt-1 ${theme?.textMuted} truncate`}>
                        {sample.sampleId || "No Sample ID"}
                      </p>

                      <div className='flex flex-wrap gap-1.5 mt-2'>
                        <span className='text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'>
                          {sample.state?.name || "No state"}
                        </span>
                        {sample.lga?.name && (
                          <span className='text-[11px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'>
                            {sample.lga.name}
                          </span>
                        )}
                      </div>

                      <p className={`text-xs mt-2 ${theme?.textMuted} truncate`}>
                        by {sample.creator?.fullName || "Unknown collector"}
                      </p>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={`pt-4 mt-4 border-t ${theme?.border}`}>
            <div className='flex items-center justify-between gap-2'>
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || loading}
                className='px-3 py-2 rounded-lg border disabled:opacity-50 text-sm'
              >
                Prev
              </button>

              <p className={`text-xs sm:text-sm ${theme?.textMuted}`}>
                {totalCount} total • {statsLoading ? "updating..." : "live count"}
              </p>

              <button
                onClick={() => {
                  if (page < totalPages) {
                    setPage((prev) => prev + 1);
                  }
                }}
                disabled={page >= totalPages || loading || totalPages <= 1}
                className='px-3 py-2 rounded-lg border disabled:opacity-50 text-sm'
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className='lg:col-span-2'>
          {selectedSample ? (
            <div
              className={`${theme?.card} rounded-xl p-4 sm:p-6 border ${theme?.border} space-y-5`}
            >
              {totalInCurrentPage > 0 && (
                <p className={`text-sm ${theme?.textMuted}`}>
                  Sample {currentSampleIndex} of {totalInCurrentPage} on this page
                </p>
              )}

              <div className='flex items-center gap-2 pb-2 border-b border-emerald-800/30'>
                <div className='w-1 h-5 rounded-full bg-emerald-500' />
                <h3 className='text-sm font-semibold uppercase tracking-widest text-emerald-500'>
                  Sample Details
                </h3>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
                <div className='rounded-xl border p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Package size={16} className='text-emerald-600' />
                    <p className='text-xs font-semibold uppercase tracking-wider'>
                      Product
                    </p>
                  </div>
                  <p className='text-sm font-semibold'>
                    {selectedSample.productName || "—"}
                  </p>
                  <p className={`text-xs mt-1 ${theme?.textMuted}`}>
                    Brand: {selectedSample.brandName || "—"}
                  </p>
                  <p className={`text-xs mt-1 ${theme?.textMuted}`}>
                    Batch: {selectedSample.batchNumber || "—"}
                  </p>
                </div>

                <div className='rounded-xl border p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <User size={16} className='text-emerald-600' />
                    <p className='text-xs font-semibold uppercase tracking-wider'>
                      Collector
                    </p>
                  </div>
                  <p className='text-sm font-semibold'>
                    {selectedSample.creator?.fullName || "—"}
                  </p>
                  <p className={`text-xs mt-1 ${theme?.textMuted}`}>
                    Sample ID: {selectedSample.sampleId || "—"}
                  </p>
                  <p className={`text-xs mt-1 ${theme?.textMuted}`}>
                    Review status: {getReviewStatus(selectedSample)}
                  </p>
                </div>

                <div className='rounded-xl border p-4 sm:col-span-2 xl:col-span-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <MapPin size={16} className='text-emerald-600' />
                    <p className='text-xs font-semibold uppercase tracking-wider'>
                      Location
                    </p>
                  </div>
                  <p className='text-sm font-semibold'>
                    {selectedSample.state?.name || "—"}
                    {selectedSample.lga?.name
                      ? ` › ${selectedSample.lga.name}`
                      : ""}
                    {selectedSample.market?.name
                      ? ` › ${selectedSample.market.name}`
                      : selectedSample.marketName
                        ? ` › ${selectedSample.marketName}`
                        : ""}
                  </p>
                </div>
              </div>

              <div className='rounded-xl border overflow-hidden bg-black/5'>
                <div className='flex items-center justify-between px-3 py-2 border-b bg-emerald-950/10'>
                  <div className='flex items-center gap-2'>
                    <ShieldCheck size={15} className='text-emerald-500' />
                    <span className='text-[11px] uppercase tracking-wider font-semibold text-emerald-500'>
                      Product Photo
                    </span>
                  </div>
                  <span className='text-[10px] text-gray-500 uppercase tracking-wider'>
                    Field Capture
                  </span>
                </div>

                {productPhotoSrc && !imageFailed ? (
                  <div className='flex justify-center p-4'>
                    <img
                      src={productPhotoSrc}
                      alt='Product Photo'
                      className='max-h-64 w-auto rounded-lg object-contain'
                      onError={() => setImageFailed(true)}
                    />
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center h-40 gap-2 text-gray-500'>
                    <p className='text-sm'>
                      {selectedSample?.productPhotoUrl
                        ? "Product photo could not be loaded"
                        : "No product photo captured"}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className='flex items-center gap-2 mb-3'>
                  <FlaskConical size={16} className='text-emerald-600' />
                  <h4 className='text-sm sm:text-base font-semibold'>
                    Heavy Metal Readings
                  </h4>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {normalizedReadings.map((reading) => (
                    <div
                      key={reading.id}
                      className={`rounded-xl border ${theme?.border} p-4`}
                    >
                      <div className='flex items-center justify-between gap-2 mb-3'>
                        <p className='font-semibold text-sm'>
                          {reading.heavyMetal}
                        </p>
                        <span
                          className={`text-[11px] px-2 py-1 rounded-full font-semibold ${getReadingStatusClass(
                            reading.status,
                          )}`}
                        >
                          {reading.status}
                        </span>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className={theme?.textMuted}>XRF</span>
                          <span className='font-semibold'>
                            {reading.xrfReading}
                          </span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className={theme?.textMuted}>AAS</span>
                          <span className='font-semibold'>
                            {reading.aasReading}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(!selectedSample.heavyMetalReadings ||
                  selectedSample.heavyMetalReadings.length === 0) && (
                  <p className={`text-xs mt-3 ${theme?.textMuted}`}>
                    No heavy metal readings were returned for this sample, so
                    fallback values are displayed for better visibility.
                  </p>
                )}
              </div>

              <div className={`border-t ${theme?.border} pt-4`}>
                <h4 className='text-sm sm:text-base font-semibold mb-3'>
                  Review Sample
                </h4>

                <div className='mb-4'>
                  <label className='block text-xs sm:text-sm font-semibold mb-2'>
                    Decision
                  </label>
                  <div className='grid grid-cols-3 gap-2'>
                    {["APPROVED", "REJECTED", "FLAGGED"].map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          setReviewForm((prev) => ({ ...prev, status }))
                        }
                        className={`py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm transition-colors ${
                          reviewForm.status === status
                            ? "bg-emerald-600 text-white"
                            : `border ${theme?.border} hover:bg-opacity-50`
                        }`}
                      >
                        {status.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='mb-4'>
                  <label className='block text-xs sm:text-sm font-semibold mb-2'>
                    Flag Issues
                  </label>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {ISSUE_OPTIONS.map((issue) => (
                      <label
                        key={issue}
                        className='flex items-center gap-2 text-xs sm:text-sm cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={reviewForm.issues.includes(issue)}
                          onChange={() => handleIssueToggle(issue)}
                          className='w-4 h-4 rounded text-emerald-600 flex-shrink-0'
                        />
                        <span>{issue}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className='mb-4'>
                  <label className='block text-xs sm:text-sm font-semibold mb-2'>
                    Comments
                    {reviewForm.status === "REJECTED" && (
                      <span className='text-red-600 dark:text-red-400 ml-1'>
                        (required for reject)
                      </span>
                    )}
                  </label>
                  <textarea
                    value={reviewForm.comments}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comments: e.target.value,
                      }))
                    }
                    rows='4'
                    placeholder={
                      reviewForm.status === "REJECTED"
                        ? "Provide a reason for rejection..."
                        : "Add notes or observations..."
                    }
                    className={`w-full px-3 py-2 text-sm sm:text-base border ${theme?.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme?.card}`}
                  />
                </div>

                <div className='flex flex-col sm:flex-row gap-2'>
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewing}
                    className='flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm sm:text-base'
                  >
                    {reviewing ? "Submitting..." : "Submit Review"}
                  </button>

                  {totalInCurrentPage > 1 && (
                    <button
                      type='button'
                      onClick={goToNextSample}
                      className='px-4 py-2.5 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg font-semibold text-sm sm:text-base transition-colors'
                    >
                      Next sample
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-xl p-6 sm:p-8 border ${theme?.border} text-center min-h-[220px] flex flex-col items-center justify-center ${
                samples.length === 0
                  ? "bg-transparent border-dashed"
                  : theme?.card
              }`}
            >
              <p className={`text-sm sm:text-base ${theme?.textMuted}`}>
                {samples.length === 0
                  ? "No sample selected because this page has no records"
                  : "Select a sample to review"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SampleReview;