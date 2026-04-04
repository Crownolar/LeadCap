import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../../../../context/ThemeContext";
import api from "../../../../utils/api";
import toast from "react-hot-toast";
import {
  CheckCircle,
  FlaskConical,
  MapPin,
  Package,
  User,
  ShieldCheck,
  ClipboardList,
  ArrowRight,
  AlertCircle,
  ImageIcon,
  ChevronRight,
} from "lucide-react";

import SurfaceCard from "../components/ui/SurfaceCard";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import ActionButton from "../components/ui/ActionButton";
import EmptyState from "../components/ui/EmptyState";
import InfoTile from "../components/ui/InfoTile";
import PanelHeader from "../components/ui/PanelHeader";

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
      const res = await api.get("/supervisor/stats");

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

      const params = {
        status: filterStatus,
        page,
        pageSize,
      };

      if (collectorId) {
        params.collectorId = collectorId;
      }

      const res = await api.get("/supervisor/samples", { params });
      const payload = res.data?.data ?? res.data;

      const extractedSamples =
        payload?.samples ||
        payload?.items ||
        payload?.rows ||
        payload?.results ||
        payload?.data ||
        (Array.isArray(payload) ? payload : []);

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

  const getVerificationBadgeType = (status) => {
    if (status === "VERIFIED_ORIGINAL") return "safe";
    if (status === "VERIFIED_FAKE") return "danger";
    return "neutral";
  };

  const getReadingStatusType = (status) => {
    if (status === "SAFE") return "safe";
    if (status === "CONTAMINATED" || status === "FAILED") return "danger";
    if (status === "MODERATE") return "moderate";
    return "neutral";
  };

  const getTabCardClass = (status, isActive) => {
    if (isActive) {
      if (status === "PENDING") {
        return "bg-amber-500 text-white border-amber-500 shadow-sm";
      }
      if (status === "APPROVED") {
        return "bg-emerald-600 text-white border-emerald-600 shadow-sm";
      }
      if (status === "REJECTED") {
        return "bg-red-600 text-white border-red-600 shadow-sm";
      }
      return "bg-violet-600 text-white border-violet-600 shadow-sm";
    }

    return `${theme.card} ${theme.border} hover:shadow-md hover:-translate-y-[1px]`;
  };

  if (loading && !samples.length) {
    return (
      <SurfaceCard className="p-10 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <div>
            <p className={`text-base font-semibold ${theme.text}`}>
              Loading samples
            </p>
            <p className={`text-sm ${theme.textMuted}`}>
              Please wait while review records are being prepared.
            </p>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <div className={`${theme.text} space-y-6`}>
      <SurfaceCard className="relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${theme.card}`} />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border ${theme.emeraldBorder} ${theme.emerald} px-3 py-1 text-xs font-semibold ${theme.emeraldText} `}>
              <ClipboardList className="h-3.5 w-3.5" />
              Sample Review Workspace
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Review, approve, reject, and flag submitted samples
            </h1>

            <p className={`mt-3 text-sm md:text-base ${theme.textMuted}`}>
              Manage incoming sample records, inspect product details and heavy
              metal readings, then take the appropriate review action.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            {STATUS_TABS.map((status) => {
              const count = statusCounts[status] ?? 0;
              const isActive = filterStatus === status;

              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`rounded-2xl border p-4 text-left transition-all duration-200 ${getTabCardClass(
                    status,
                    isActive,
                  )}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                    {status}
                  </p>
                  <p className="mt-2 text-2xl font-bold">{count}</p>
                  <p className="mt-1 text-[11px] opacity-80">
                    {status === "PENDING"
                      ? "Awaiting action"
                      : status === "APPROVED"
                        ? "Approved items"
                        : status === "REJECTED"
                          ? "Returned items"
                          : "Needs attention"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </SurfaceCard>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          Error: {error}
        </div>
      )}

      {bulkSelection.size > 0 && (
        <SurfaceCard className="flex flex-col items-start justify-between gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold sm:text-base">
                {bulkSelection.size} sample(s) selected
              </p>
              <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
                Apply a bulk action to the selected records.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-2 lg:w-auto">
            <ActionButton
              onClick={() => handleBulkAction("APPROVED")}
              disabled={bulkProcessing}
              className="flex-1 lg:flex-none"
            >
              Approve
            </ActionButton>

            <ActionButton
              onClick={() => handleBulkAction("FLAGGED")}
              disabled={bulkProcessing}
              variant="secondary"
              className="flex-1 lg:flex-none bg-amber-600 border-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:text-white dark:border-amber-600"
            >
              Flag
            </ActionButton>

            <ActionButton
              onClick={() => setBulkSelection(new Set())}
              disabled={bulkProcessing}
              variant="secondary"
              className="flex-1 lg:flex-none"
            >
              Clear
            </ActionButton>
          </div>
        </SurfaceCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SurfaceCard className="p-5 sm:p-6">
          <SectionHeader
            title={filterStatus}
            subtitle={`Page ${page} of ${totalPages}`}
            badge={<StatusBadge type="safe">{totalCount}</StatusBadge>}
            action={
              samples.length > 0 ? (
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium sm:text-sm">
                  <input
                    type="checkbox"
                    checked={
                      samples.length > 0 && bulkSelection.size === samples.length
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                  <span>Select all</span>
                </label>
              ) : null
            }
          />

          <div className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {loading ? (
              <EmptyState
                title="Refreshing..."
                description="Please wait while records reload."
                minHeight="min-h-[220px]"
              />
            ) : samples.length === 0 ? (
              <EmptyState
                icon={<AlertCircle className="h-5 w-5 text-gray-500" />}
                title={`No ${filterStatus.toLowerCase()} samples`}
                description="There are no records in this category right now."
                minHeight="min-h-[220px]"
              />
            ) : (
              samples.map((sample) => (
                <div
                  key={sample.id}
                  className={`rounded-2xl border transition-all duration-200 ${
                    selectedSample?.id === sample.id
                      ? `${theme.emeraldBorder} ${theme.emerald} shadow-sm`
                      : `${theme.border} hover:-translate-y-[1px] hover:shadow-md`
                  }`}
                >
                  <div className="flex items-start gap-3 p-4">
                    <input
                      type="checkbox"
                      checked={bulkSelection.has(sample.id)}
                      onChange={() => handleToggleBulkSelection(sample.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 h-4 w-4 flex-shrink-0 rounded text-emerald-600"
                    />

                    <button
                      onClick={() => handleSelectSample(sample)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {sample.productName || "Unnamed product"}
                          </p>
                          <p className={`mt-1 truncate text-xs ${theme.textMuted}`}>
                            {sample.sampleId || "No Sample ID"}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge
                            type={getVerificationBadgeType(
                              sample.verificationStatus,
                            )}
                            className="text-[10px]"
                          >
                            {sample.verificationStatus || "UNVERIFIED"}
                          </StatusBadge>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <StatusBadge type="info" className="text-[11px]">
                          {sample.state?.name || "No state"}
                        </StatusBadge>

                        {sample.lga?.name && (
                          <StatusBadge type="moderate" className="text-[11px]">
                            {sample.lga.name}
                          </StatusBadge>
                        )}
                      </div>

                      <p className={`mt-3 truncate text-xs ${theme.textMuted}`}>
                        by {sample.creator?.fullName || "Unknown collector"}
                      </p>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={`mt-5 border-t pt-4 ${theme.border}`}>
            <div className="flex items-center justify-between gap-2">
              <ActionButton
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || loading}
                variant="secondary"
                className="px-3 py-2"
              >
                Prev
              </ActionButton>

              <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
                {totalCount} total • {statsLoading ? "updating..." : "live count"}
              </p>

              <ActionButton
                onClick={() => {
                  if (page < totalPages) {
                    setPage((prev) => prev + 1);
                  }
                }}
                disabled={page >= totalPages || loading || totalPages <= 1}
                variant="secondary"
                className="px-3 py-2"
              >
                Next
              </ActionButton>
            </div>
          </div>
        </SurfaceCard>

        <div className="lg:col-span-2">
          {selectedSample ? (
            <SurfaceCard className="space-y-6 p-5 sm:p-6">
              {totalInCurrentPage > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-sm ${theme.textMuted}`}>
                    Sample {currentSampleIndex} of {totalInCurrentPage} on this page
                  </p>

                  <StatusBadge
                    type={getVerificationBadgeType(
                      selectedSample.verificationStatus,
                    )}
                  >
                    {selectedSample.verificationStatus || "UNVERIFIED"}
                  </StatusBadge>
                </div>
              )}

              <PanelHeader title="Sample Details" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <InfoTile
                  icon={<Package size={16} className="text-emerald-600" />}
                  label="Product"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedSample.productName || "—"}
                  </p>
                  <p className={`mt-2 text-xs ${theme.textMuted}`}>
                    Brand: {selectedSample.brandName || "—"}
                  </p>
                  <p className={`mt-1 text-xs ${theme.textMuted}`}>
                    Batch: {selectedSample.batchNumber || "—"}
                  </p>
                </InfoTile>

                <InfoTile
                  icon={<User size={16} className="text-emerald-600" />}
                  label="Collector"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedSample.creator?.fullName || "—"}
                  </p>
                  <p className={`mt-2 text-xs ${theme.textMuted}`}>
                    Sample ID: {selectedSample.sampleId || "—"}
                  </p>
                  <p className={`mt-1 text-xs ${theme.textMuted}`}>
                    Review status: {getReviewStatus(selectedSample)}
                  </p>
                </InfoTile>

                <InfoTile
                  icon={<MapPin size={16} className="text-emerald-600" />}
                  label="Location"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
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
                </InfoTile>
              </div>

              <SurfaceCard className={`overflow-hidden ${theme.bg}`} padding="p-0">
                <div className="flex items-center justify-between border-b border-gray-200 bg-white/60 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/20">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-emerald-500" />
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${theme.emeraldText}`}>
                      Product Photo
                    </span>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider ${theme.textMuted}`}>
                    Field Capture
                  </span>
                </div>

                {productPhotoSrc && !imageFailed ? (
                  <div className="flex justify-center p-5">
                    <img
                      src={productPhotoSrc}
                      alt="Product Photo"
                      className="max-h-72 w-auto rounded-xl object-contain shadow-sm"
                      onError={() => setImageFailed(true)}
                    />
                  </div>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center gap-3 text-gray-500">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <p className="text-sm">
                      {selectedSample?.productPhotoUrl
                        ? "Product photo could not be loaded"
                        : "No product photo captured"}
                    </p>
                  </div>
                )}
              </SurfaceCard>

              <div>
                <SectionHeader
                  title="Heavy Metal Readings"
                  icon={<FlaskConical size={16} className="text-emerald-600" />}
                />

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {normalizedReadings.map((reading) => (
                    <SurfaceCard
                      key={reading.id}
                      className={`${theme.bg}`}
                      padding="p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold ${theme.text}`}>
                          {reading.heavyMetal}
                        </p>

                        <StatusBadge type={getReadingStatusType(reading.status)}>
                          {reading.status}
                        </StatusBadge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className={theme.textMuted}>XRF</span>
                          <span className="font-semibold">{reading.xrfReading}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className={theme.textMuted}>AAS</span>
                          <span className="font-semibold">{reading.aasReading}</span>
                        </div>
                      </div>
                    </SurfaceCard>
                  ))}
                </div>

                {(!selectedSample.heavyMetalReadings ||
                  selectedSample.heavyMetalReadings.length === 0) && (
                  <p className={`mt-3 text-xs ${theme.textMuted}`}>
                    No heavy metal readings were returned for this sample, so
                    fallback values are displayed for better visibility.
                  </p>
                )}
              </div>

              <div className={`border-t pt-5 ${theme.border}`}>
                <SectionHeader
                  title="Review Sample"
                  subtitle="Select a decision, flag issues if necessary, and add notes."
                />

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-semibold sm:text-sm">
                    Decision
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {["APPROVED", "REJECTED", "FLAGGED"].map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          setReviewForm((prev) => ({ ...prev, status }))
                        }
                        className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                          reviewForm.status === status
                            ? status === "APPROVED"
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : status === "REJECTED"
                                ? "border-red-600 bg-red-600 text-white"
                                : "border-amber-500 bg-amber-500 text-white"
                            : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/40"
                        }`}
                      >
                        {status.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-semibold sm:text-sm">
                    Flag Issues
                  </label>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {ISSUE_OPTIONS.map((issue) => (
                      <label
                        key={issue}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/40 sm:text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={reviewForm.issues.includes(issue)}
                          onChange={() => handleIssueToggle(issue)}
                          className="h-4 w-4 flex-shrink-0 rounded text-emerald-600"
                        />
                        <span>{issue}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-semibold sm:text-sm">
                    Comments
                    {reviewForm.status === "REJECTED" && (
                      <span className="ml-1 text-red-600 dark:text-red-400">
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
                    rows="4"
                    placeholder={
                      reviewForm.status === "REJECTED"
                        ? "Provide a reason for rejection..."
                        : "Add notes or observations..."
                    }
                    className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-base ${theme.border} ${theme.card}`}
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <ActionButton
                    onClick={handleSubmitReview}
                    disabled={reviewing}
                    className="flex-1"
                  >
                    {reviewing ? "Submitting..." : "Submit Review"}
                  </ActionButton>

                  {totalInCurrentPage > 1 && (
                    <ActionButton
                      type="button"
                      onClick={goToNextSample}
                      variant="ghost"
                    >
                      Next sample
                      <ArrowRight className="h-4 w-4" />
                    </ActionButton>
                  )}
                </div>
              </div>
            </SurfaceCard>
          ) : (
            <SurfaceCard className={samples.length === 0 ? "bg-transparent" : ""}>
              <EmptyState
                icon={<ClipboardList className="h-5 w-5 text-gray-500" />}
                title={
                  samples.length === 0
                    ? "No sample selected because this page has no records"
                    : "Select a sample to review"
                }
                description={
                  samples.length === 0
                    ? "When records are available, sample details will appear here."
                    : "Detailed product, reading, and review information will appear here."
                }
                minHeight="min-h-[260px]"
              />
            </SurfaceCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default SampleReview;