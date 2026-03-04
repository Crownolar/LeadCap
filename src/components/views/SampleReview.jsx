import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { CheckCircle } from "lucide-react";

const STATUS_TABS = ["PENDING", "APPROVED", "REJECTED", "FLAGGED"];

const SampleReview = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const collectorIdFromUrl = searchParams.get("collectorId") || null;
  const [allSamples, setAllSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [reviewing, setReviewing] = useState(false);
  const [bulkSelection, setBulkSelection] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: "APPROVED",
    comments: "",
    issues: [],
    requestedChanges: "",
  });

  const getReviewStatus = (s) => s.review?.status ?? "PENDING";

  const filteredSamples = useMemo(
    () => allSamples.filter((s) => getReviewStatus(s) === filterStatus),
    [allSamples, filterStatus]
  );

  const statusCounts = useMemo(() => {
    const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0, FLAGGED: 0 };
    allSamples.forEach((s) => {
      const status = getReviewStatus(s);
      if (counts[status] !== undefined) counts[status]++;
    });
    return counts;
  }, [allSamples]);

  const fetchSamples = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { status: "ALL" };
      if (collectorIdFromUrl) params.collectorId = collectorIdFromUrl;
      const res = await api.get("/supervisor/samples", { params });
      if (res.data.success) setAllSamples(res.data.data || []);
    } catch (err) {
      console.error("Error fetching samples:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [collectorIdFromUrl]);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

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

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setReviewForm({
      status: sample.review?.status || "APPROVED",
      comments: sample.review?.comments || "",
      issues: sample.review?.issues || [],
      requestedChanges: sample.review?.requestedChanges || "",
    });
  };

  const handleIssueToggle = (issue) => {
    setReviewForm((prev) => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter((i) => i !== issue)
        : [...prev.issues, issue],
    }));
  };

  const handleSubmitReview = async () => {
    if (!selectedSample) return;

    // Decision friction: reject requires a reason (comments or at least one issue)
    if (reviewForm.status === "REJECTED") {
      const hasReason =
        (reviewForm.comments && reviewForm.comments.trim()) ||
        (reviewForm.requestedChanges && reviewForm.requestedChanges.trim()) ||
        (reviewForm.issues && reviewForm.issues.length > 0);
      if (!hasReason) {
        toast.error("Rejection reason is required. Add comments or select at least one issue.");
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
        }
      );

      if (response.data.success) {
        toast.success(`Sample ${reviewForm.status.toLowerCase()}!`);
        await fetchSamples();
        const currentIndex = filteredSamples.findIndex((s) => s.id === selectedSample.id);
        const nextSample =
          currentIndex >= 0 && currentIndex < filteredSamples.length - 1
            ? filteredSamples[currentIndex + 1]
            : null;
        setSelectedSample(null);
        setReviewForm({ status: "APPROVED", comments: "", issues: [], requestedChanges: "" });
        if (nextSample) {
          setSelectedSample(nextSample);
          setReviewForm({
            status: nextSample.review?.status || "APPROVED",
            comments: nextSample.review?.comments || "",
            issues: nextSample.review?.issues || [],
            requestedChanges: nextSample.review?.requestedChanges || "",
          });
        }
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Failed to submit review: " + (err.response?.data?.message || err.message));
    } finally {
      setReviewing(false);
    }
  };

  const currentSampleIndex =
    selectedSample && filteredSamples.length
      ? filteredSamples.findIndex((s) => s.id === selectedSample.id) + 1
      : 0;
  const totalInFilter = filteredSamples.length;
  const goToNextSample = () => {
    if (!selectedSample || totalInFilter === 0) return;
    const idx = filteredSamples.findIndex((s) => s.id === selectedSample.id);
    if (idx >= 0 && idx < totalInFilter - 1) {
      const next = filteredSamples[idx + 1];
      handleSelectSample(next);
    } else {
      setSelectedSample(null);
    }
  };

  const handleToggleBulkSelection = (sampleId) => {
    const newSelection = new Set(bulkSelection);
    if (newSelection.has(sampleId)) {
      newSelection.delete(sampleId);
    } else {
      newSelection.add(sampleId);
    }
    setBulkSelection(newSelection);
  };

  const handleSelectAll = () => {
    if (bulkSelection.size === filteredSamples.length) {
      setBulkSelection(new Set());
    } else {
      setBulkSelection(new Set(filteredSamples.map((s) => s.id)));
    }
  };

  const handleBulkAction = async (status) => {
    if (bulkSelection.size === 0) {
      toast.error("Please select at least one sample");
      return;
    }

    if (status === "REJECTED") {
      toast.error("Rejection requires a reason. Please review and reject samples individually.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to mark ${bulkSelection.size} sample(s) as ${status}?`
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
          total === 1 ? "1 sample marked successfully." : `${total} samples marked successfully.`
        );
      } else if (successCount > 0) {
        toast(
          `Updated ${successCount} of ${total} samples. ${errorCount} could not be updated.`,
          { icon: "⚠️" }
        );
      } else {
        toast.error("Could not update the selected samples. Please try again.");
      }
      setBulkSelection(new Set());
      fetchSamples();
    } catch (err) {
      console.error("Error in bulk action:", err);
      toast.error("Error processing bulk action");
    } finally {
      setBulkProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={`${theme?.card} rounded-lg p-6 sm:p-8 text-center`}>
        <p className={`text-sm sm:text-base ${theme?.textMuted}`}>Loading samples...</p>
      </div>
    );
  }

  return (
    <div className={`${theme?.text} space-y-4 sm:space-y-6`}>
      <div className="mb-2">
        <h1 className="text-xl sm:text-2xl font-bold">Review samples</h1>
        <p className={`text-sm ${theme?.textMuted} mt-1`}>
          Review and approve samples from your collectors
        </p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm">
          Error: {error}
        </div>
      )}

      {/* Filter Tabs with badge counts & Bulk Actions */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((status) => {
            const count = statusCounts[status] ?? 0;
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : `${theme?.card} border ${theme?.border} hover:bg-opacity-50`
                }`}
              >
                <span>{status}</span>
                <span
                  className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bulk Actions Bar */}
        {bulkSelection.size > 0 && (
          <div
            className={`${theme?.card} border ${theme?.border} rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle size={18} className="text-emerald-600 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base font-semibold">
                {bulkSelection.size} sample(s) selected
              </span>
            </div>
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              <button
                onClick={() => handleBulkAction("APPROVED")}
                disabled={bulkProcessing}
                className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => handleBulkAction("REJECTED")}
                disabled={bulkProcessing}
                className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm"
              >
                ✗ Reject
              </button>
              <button
                onClick={() => handleBulkAction("FLAGGED")}
                disabled={bulkProcessing}
                className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm"
              >
                ⚠ Flag
              </button>
              <button
                onClick={() => setBulkSelection(new Set())}
                disabled={bulkProcessing}
                className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Samples List */}
        <div
          className={`${theme?.card} rounded-lg p-4 sm:p-6 border ${theme?.border}`}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold inline-flex items-center gap-2">
              {filterStatus}
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {filteredSamples.length}
              </span>
            </h3>
            {filteredSamples.length > 0 && (
              <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulkSelection.size === filteredSamples.length}
                  onChange={handleSelectAll}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-emerald-600"
                />
                <span className="whitespace-nowrap">Select All</span>
              </label>
            )}
          </div>
          <div className="space-y-2 max-h-[400px] sm:max-h-96 overflow-y-auto">
            {filteredSamples.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                <p className={`text-sm font-medium ${theme?.text} mb-1`}>
                  No {filterStatus.toLowerCase()} samples
                </p>
                <p className={`text-xs ${theme?.textMuted}`}>
                  Switch to another tab or wait for new submissions
                </p>
              </div>
            ) : (
              filteredSamples.map((sample) => (
                <div
                  key={sample.id}
                  className={`flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-colors ${
                    selectedSample?.id === sample.id
                      ? `${theme?.card} border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20`
                      : `border ${theme?.border} hover:bg-opacity-50`
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={bulkSelection.has(sample.id)}
                    onChange={() => handleToggleBulkSelection(sample.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-emerald-600 mt-0.5 sm:mt-1 flex-shrink-0"
                  />
                  <button
                    onClick={() => handleSelectSample(sample)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="font-semibold text-xs sm:text-sm truncate">
                      {sample.productName}
                    </p>
                    <p className={`text-xs ${theme?.textMuted} truncate`}>
                      {sample.sampleId}
                    </p>
                    <div className="flex gap-1 mt-1.5 sm:mt-2 flex-wrap">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded">
                        {sample.state?.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          sample.verificationStatus === "VERIFIED_ORIGINAL"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : sample.verificationStatus === "VERIFIED_FAKE"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                            : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {sample.verificationStatus}
                      </span>
                    </div>
                    <p className={`text-xs ${theme?.textMuted} mt-1.5 sm:mt-2 truncate`}>
                      by {sample.creator?.fullName}
                    </p>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sample Details & Review Form */}
        <div className="lg:col-span-2">
          {selectedSample ? (
            <div
              className={`${theme?.card} rounded-lg p-4 sm:p-6 border ${theme?.border} space-y-4 sm:space-y-6`}
            >
              {/* Progress: "Sample 3 of 12" */}
              {totalInFilter > 0 && (
                <p className={`text-sm ${theme?.textMuted}`}>
                  Sample {currentSampleIndex} of {totalInFilter}
                </p>
              )}
              {/* Sample Details */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Sample Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="min-w-0">
                    <p className={theme?.textMuted}>Sample ID</p>
                    <p className="font-semibold truncate">{selectedSample.sampleId}</p>
                  </div>
                  <div className="min-w-0">
                    <p className={theme?.textMuted}>Product</p>
                    <p className="font-semibold truncate">
                      {selectedSample.productName}
                    </p>
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <p className={theme?.textMuted}>Location</p>
                    <p className="font-semibold truncate">
                      {selectedSample.state?.name} - {selectedSample.lga?.name}{" "}
                      - {selectedSample.market?.name}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className={theme?.textMuted}>Collected By</p>
                    <p className="font-semibold truncate">
                      {selectedSample.creator?.fullName}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className={theme?.textMuted}>Brand</p>
                    <p className="font-semibold truncate">
                      {selectedSample.brandName || "-"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className={theme?.textMuted}>Batch Number</p>
                    <p className="font-semibold truncate">
                      {selectedSample.batchNumber || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Heavy Metals Readings */}
              {selectedSample.heavyMetalReadings &&
                selectedSample.heavyMetalReadings.length > 0 && (
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold mb-2">Heavy Metal Readings</h4>
                    <div className="space-y-2">
                      {selectedSample.heavyMetalReadings.map((reading, idx) => {
                        const status = reading.finalStatus ?? reading.status;
                        return (
                          <div
                            key={reading.id ?? idx}
                            className={`border ${theme?.border} rounded p-2 sm:p-3 text-xs sm:text-sm`}
                          >
                            <p className="font-semibold">{reading.heavyMetal}</p>
                            <p className={theme?.textMuted}>
                              XRF: {reading.xrfReading ?? "-"} | AAS:{" "}
                              {reading.aasReading ?? "-"}
                            </p>
                            <p
                              className={`text-xs ${
                                status === "SAFE"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              Status: {status ?? "PENDING"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Review Form */}
              <div className={`border-t ${theme?.border} pt-4`}>
                <h4 className="text-sm sm:text-base font-semibold mb-3">Review Sample</h4>

                {/* Status */}
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-semibold mb-2">
                    Decision
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "APPROVED",
                      "REJECTED",
                      "FLAGGED",
                      "CORRECTION_REQUESTED",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          setReviewForm((prev) => ({ ...prev, status }))
                        }
                        className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg font-semibold text-xs sm:text-sm transition-colors ${
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

                {/* Issues */}
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-semibold mb-2">
                    Flag Issues (if any)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ISSUE_OPTIONS.map((issue) => (
                      <label
                        key={issue}
                        className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={reviewForm.issues.includes(issue)}
                          onChange={() => handleIssueToggle(issue)}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-emerald-600 flex-shrink-0"
                        />
                        <span className="break-words">{issue}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Comments - required when rejecting */}
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-semibold mb-2">
                    Comments
                    {reviewForm.status === "REJECTED" && (
                      <span className="text-red-600 dark:text-red-400 ml-1" title="Required for rejection">
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
                    rows="3"
                    placeholder={
                      reviewForm.status === "REJECTED"
                        ? "Provide a reason for rejection..."
                        : "Add notes or observations..."
                    }
                    className={`w-full px-3 py-2 text-sm sm:text-base border ${theme?.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme?.card}`}
                  />
                </div>

                {/* Requested Changes */}
                {reviewForm.status === "CORRECTION_REQUESTED" && (
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-semibold mb-2">
                      What needs to be corrected?
                    </label>
                    <textarea
                      value={reviewForm.requestedChanges}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          requestedChanges: e.target.value,
                        }))
                      }
                      rows="3"
                      placeholder="Describe what the collector needs to fix..."
                      className={`w-full px-3 py-2 text-sm sm:text-base border ${theme?.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${theme?.card}`}
                    />
                  </div>
                )}

                {/* Submit and Next */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-2 sm:py-2.5 px-4 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    {reviewing ? "Submitting..." : "Submit Review"}
                  </button>
                  {totalInFilter > 1 && (
                    <button
                      type="button"
                      onClick={goToNextSample}
                      className="px-4 py-2 sm:py-2.5 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg font-semibold text-sm sm:text-base transition-colors"
                    >
                      Next sample
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-lg p-6 sm:p-8 border ${theme?.border} text-center min-h-[200px] flex flex-col items-center justify-center ${
                filteredSamples.length === 0
                  ? "bg-transparent border-dashed"
                  : theme?.card
              }`}
            >
              <p className={`text-sm sm:text-base ${theme?.textMuted}`}>
                {filteredSamples.length === 0
                  ? "Select a status tab to see samples"
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