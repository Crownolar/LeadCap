/**
 * useSampleReview.js
 * ───────────────────
 * Owns every piece of data logic for the SampleReview page:
 *   • fetch supervisor stats (for tab counts)
 *   • fetch paginated samples by status / collectorId
 *   • submit single review
 *   • bulk approve / flag
 *
 * Returns a single stable API object. The page and its panels
 * never call api.get / api.post directly.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../utils/api";
import { DEFAULT_PAGE_SIZE } from "../constants/supervisor.constants";
import { useSupervisorScope } from "./useSupervisorScope";

const INITIAL_REVIEW_FORM = {
  action: "APPROVED",
  comments: "",
  issues: [],
  requestedChanges: "",
};

export const useSampleReview = () => {
  const { collectorId } = useParams();
  const {
    loading: scopeLoading,
    error: scopeError,
    hasCollector,
  } = useSupervisorScope();
  const hasRequestedCollector = !collectorId || hasCollector(collectorId);

  // ── Data ─────────────────────────────────────────────────────────────────
  const [samples, setSamples] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);

  // ── Loading / error ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [error, setError] = useState(null);

  // ── Filter / pagination ───────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ── Review form ───────────────────────────────────────────────────────────
  const [reviewForm, setReviewForm] = useState(INITIAL_REVIEW_FORM);

  // ── Bulk selection ────────────────────────────────────────────────────────
  const [bulkSelection, setBulkSelection] = useState(new Set());

  // ── Image failed flag ─────────────────────────────────────────────────────
  const [imageFailed, setImageFailed] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const statusCounts = useMemo(
    () => ({
      PENDING: stats?.reviewBreakdown?.PENDING_REVIEW ?? 0,
      "APPROVED FOR XRF": stats?.reviewBreakdown?.APPROVED_FOR_XRF ?? 0,
      "XRF COMPLETED": stats?.reviewBreakdown?.XRF_COMPLETED ?? 0,
      "APPROVED FOR AAS": stats?.reviewBreakdown?.XRF_COMPLETED ?? 0,
      "AAS COMPLETED": stats?.reviewBreakdown?.XRF_COMPLETED ?? 0,
      COMPLETED: stats?.reviewBreakdown?.COMPLETED ?? 0,
      REJECTED: stats?.reviewBreakdown?.REJECTED ?? 0,
      FLAGGED: stats?.reviewBreakdown?.FLAGGED ?? 0,
    }),
    [stats],
  );

  const getReviewStatus = (sample) =>
    sample.review?.status ?? sample.reviewStatus ?? "PENDING";

  const normalizedReadings = useMemo(() => {
    const rawReadings = Array.isArray(selectedSample?.heavyMetalReadings)
      ? selectedSample.heavyMetalReadings
      : [];

    if (rawReadings.length > 0) {
      return rawReadings.map((reading, index) => ({
        id: reading.id || `${reading.heavyMetal || "METAL"}-${index}`,
        heavyMetal: reading.heavyMetal || reading.metal || `Metal ${index + 1}`,
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

  const getProductPhotoSrc = useCallback((photoUrl) => {
    if (!photoUrl) return null;
    const baseUrl =
      import.meta.env.VITE_BACKEND_URL || "https://api.leadcap.ng";
    if (photoUrl.startsWith("https//"))
      return photoUrl.replace("https//", "https://");
    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://"))
      return photoUrl;
    return `${baseUrl.replace(/\/$/, "")}/${photoUrl.replace(/^\/+/, "")}`;
  }, []);

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchReviewMeta = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.get("/supervisor/stats");
      if (res.data?.success) setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching supervisor stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch samples ─────────────────────────────────────────────────────────
  const fetchSamples = useCallback(async () => {
    if (scopeLoading || !hasRequestedCollector) return;

    try {
      setLoading(true);
      setError(null);

      const params = {
        status: filterStatus.replaceAll(" ", "_"),
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      };
      if (collectorId) params.collectorId = collectorId;

      const res = await api.get("/supervisor/samples", { params });
      const payload = res.data?.data ?? res.data;
      const samples = Array.isArray(payload) ? payload : [];

      setSamples(samples);
    } catch (err) {
      console.error("Error fetching samples:", err);
      setError(err.response?.data?.message || err.message);
      setSamples([]);
    } finally {
      setLoading(false);
    }
  }, [collectorId, filterStatus, page, scopeLoading, hasRequestedCollector]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchReviewMeta(), fetchSamples()]);
  }, [fetchReviewMeta, fetchSamples]);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!scopeLoading) fetchReviewMeta();
  }, [fetchReviewMeta, scopeLoading]);
  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  useEffect(() => {
    if (!scopeLoading && collectorId && !hasRequestedCollector) {
      setSamples([]);
      setSelectedSample(null);
      setBulkSelection(new Set());
      setError(
        "This Data Collector is not assigned to you. Their samples are outside your review scope.",
      );
      setTotalCount(0);
      setTotalPages(1);
    }
  }, [collectorId, hasRequestedCollector, scopeLoading]);

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
    const derived = statusCounts[filterStatus] ?? 0;
    setTotalCount(derived);
    setTotalPages(Math.max(1, Math.ceil(derived / DEFAULT_PAGE_SIZE)));
  }, [filterStatus, statusCounts]);

  // ── Sample selection ──────────────────────────────────────────────────────
  const handleSelectSample = useCallback((sample) => {
    setSelectedSample(sample);
    setReviewForm({
      action: getReviewStatus(sample) ? getReviewStatus(sample) : "PENDING",
      comments: sample.review?.comments || "",
      issues: sample.review?.issues || [],
      requestedChanges: sample.review?.requestedChanges || "",
    });
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goToNextSample = useCallback(() => {
    if (!selectedSample || !samples.length) return;
    const idx = samples.findIndex((s) => s.id === selectedSample.id);
    if (idx >= 0 && idx < samples.length - 1) {
      handleSelectSample(samples[idx + 1]);
    } else {
      setSelectedSample(null);
    }
  }, [selectedSample, samples, handleSelectSample]);

  const currentSampleIndex =
    selectedSample && samples.length
      ? samples.findIndex((s) => s.id === selectedSample.id) + 1
      : 0;

  // ── Review form helpers ───────────────────────────────────────────────────
  const setReviewStatus = (status) =>
    setReviewForm((prev) => ({ ...prev, status }));

  const setReviewComments = (comments) =>
    setReviewForm((prev) => ({ ...prev, comments }));

  const toggleIssue = (issue) =>
    setReviewForm((prev) => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter((i) => i !== issue)
        : [...prev.issues, issue],
    }));

  // ── Submit single review ──────────────────────────────────────────────────
  const handleSubmitReview = async () => {
    if (!selectedSample || scopeLoading) return;

    if (collectorId && !hasRequestedCollector) {
      toast.error(
        "You are not authorized to review samples for this Data Collector.",
      );
      return;
    }

    if (status === "REJECTED") {
      const hasReason =
        reviewForm.comments?.trim() ||
        reviewForm.requestedChanges?.trim() ||
        reviewForm.issues?.length > 0;

      if (!hasReason) {
        toast.error(
          "Rejection reason required. Add comments or select an issue.",
        );
        return;
      }
    }

    try {
      setReviewing(true);
      const body = {
        status: reviewForm.status,
        comments: reviewForm.requestedChanges || reviewForm.comments,
        issues: reviewForm.issues,
      };

      const response = await api.post(`/review/${selectedSample.id}/`, body);
      if (response.data?.success) {
        toast.success(`Sample has been ${status}.`);
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

  // ── Bulk selection helpers ────────────────────────────────────────────────
  const toggleBulkItem = (sampleId) => {
    setBulkSelection((prev) => {
      const next = new Set(prev);
      next.has(sampleId) ? next.delete(sampleId) : next.add(sampleId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setBulkSelection(
      bulkSelection.size === samples.length
        ? new Set()
        : new Set(samples.map((s) => s.id)),
    );
  };

  const clearBulkSelection = () => setBulkSelection(new Set());

  // ── Bulk submit ─────────────────────────────────────────────────────────
  const handleBulkAction = async (status) => {
    if (scopeLoading || (collectorId && !hasRequestedCollector)) {
      toast.error(
        "You are not authorized to process samples outside your assigned collector scope.",
      );
      return;
    }
    if (bulkSelection.size === 0) {
      toast.error("Please select at least one sample.");
      return;
    }
    if (status === "REJECTED") {
      toast.error(
        "Rejection requires a reason. Please reject samples individually.",
      );
      return;
    }
    if (!window.confirm(`Mark ${bulkSelection.size} sample(s) as ${status}?`))
      return;

    try {
      setBulkProcessing(true);
      let successCount = 0;
      let errorCount = 0;

      for (const sampleId of bulkSelection) {
        try {
          await api.post(`/reviews/${sampleId}`, {
            action: status,
            comments: "",
            issues: [],
          });
          successCount++;
        } catch {
          errorCount++;
        }
      }

      const total = bulkSelection.size;
      if (errorCount === 0) {
        toast.success(
          total === 1 ? "1 sample updated." : `${total} samples updated.`,
        );
      } else if (successCount > 0) {
        toast(`Updated ${successCount} of ${total}. ${errorCount} failed.`, {
          icon: "⚠️",
        });
      } else {
        toast.error("Could not update selected samples. Please try again.");
      }

      clearBulkSelection();
      await refreshAll();
    } catch (err) {
      console.error("Bulk action error:", err);
      toast.error("Error processing bulk action.");
    } finally {
      setBulkProcessing(false);
    }
  };

  return {
    samples,
    stats,
    selectedSample,
    normalizedReadings,
    statusCounts,
    loading: loading || scopeLoading,
    statsLoading,
    reviewing,
    bulkProcessing,
    error: error || scopeError,
    filterStatus,
    setFilterStatus,
    page,
    setPage,
    totalCount,
    totalPages,
    handleSelectSample,
    currentSampleIndex,
    goToNextSample,
    reviewForm,
    setReviewStatus,
    setReviewComments,
    toggleIssue,
    handleSubmitReview,
    bulkSelection,
    toggleBulkItem,
    toggleSelectAll,
    clearBulkSelection,
    handleBulkAction,
    imageFailed,
    setImageFailed,
    getProductPhotoSrc,
    refreshAll,
  };
};
