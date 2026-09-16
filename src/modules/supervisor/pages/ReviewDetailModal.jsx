import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X,
  MapPin,
  User,
  Package,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Loader2,
  ShieldAlert,
  FileText,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

import api from "../../../utils/api";
import { useTheme } from "../../../context/ThemeContext";
import XRFReadingForm from "../components/XRFReadingForm";

const STATUS_CONFIG = {
  PENDING_REVIEW: {
    label: "Pending Review",
    tone: "amber",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  APPROVED_FOR_XRF: {
    label: "Approved for XRF",
    tone: "blue",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  XRF_IN_PROGRESS: {
    label: "XRF In Progress",
    tone: "violet",
    badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  XRF_COMPLETED: {
    label: "XRF Completed",
    tone: "cyan",
    badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
  },
  APPROVED_FOR_AAS: {
    label: "Approved for AAS",
    tone: "purple",
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  COMPLETED: {
    label: "Completed",
    tone: "emerald",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    tone: "red",
    badge: "bg-red-500/10 text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  FLAGGED: {
    label: "Flagged",
    tone: "orange",
    badge: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
};

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

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    label: status?.replace(/_/g, " ") || "Unknown",
    badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    dot: "bg-slate-500",
  };

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatValue = (value) =>
  value === null || value === undefined || value === "" ? "N/A" : value;

export default function ReviewDetailModal({ sampleId, onClose, onRefresh }) {
  const { theme } = useTheme();

  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const [showDecisionForm, setShowDecisionForm] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [comments, setComments] = useState("");
  const [issues, setIssues] = useState([]);
  const [requestedChanges, setRequestedChanges] = useState("");
  const [showXRFForm, setShowXRFForm] = useState(false);

  const fetchReviewDetail = useCallback(async () => {
    if (!sampleId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/reviews/${sampleId}`);
      setReviewData(response.data?.data || response.data);
    } catch (err) {
      console.error("Failed to fetch review detail:", err);
      setError(
        err?.response?.data?.message || "Failed to load sample review details.",
      );
    } finally {
      setLoading(false);
    }
  }, [sampleId]);

  useEffect(() => {
    fetchReviewDetail();
  }, [fetchReviewDetail]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const sample = reviewData?.sample;
  const reviewStatus =
    reviewData?.status ||
    reviewData?.review?.status ||
    sample?.review?.status ||
    "PENDING_REVIEW";

  const status = getStatusConfig(reviewStatus);

  const readings = useMemo(
    () =>
      Array.isArray(reviewData?.heavyMetalReadings)
        ? reviewData.heavyMetalReadings
        : Array.isArray(sample?.heavyMetalReadings)
          ? sample.heavyMetalReadings
          : [],
    [reviewData, sample],
  );

  const canRecordXRF =
    reviewStatus === "APPROVED_FOR_XRF" || reviewStatus === "XRF_IN_PROGRESS";

  const handleOpenDecision = (action) => {
    setSelectedAction(action);
    setComments("");
    setIssues([]);
    setRequestedChanges("");
    setShowDecisionForm(true);
  };

  const handleCloseDecision = () => {
    setShowDecisionForm(false);
    setSelectedAction(null);
    setComments("");
    setIssues([]);
    setRequestedChanges("");
  };

  const handleReviewAction = async () => {
    if (!selectedAction || !reviewData?.sample?.id) return;

    const action = selectedAction;
    const trimmedComments = comments.trim();
    const trimmedRequestedChanges = requestedChanges.trim();

    if (
      (action === "REJECTED" || action === "FLAGGED") &&
      !trimmedComments &&
      !trimmedRequestedChanges &&
      issues.length === 0
    ) {
      setError(
        "A reason is required for flagged or rejected samples. Add a comment, requested change, or issue.",
      );
      return;
    }

    try {
      setActionLoading(action);
      setError(null);

      await api.post(`/reviews/${reviewData.sample.id}`, {
        action,
        comments: trimmedComments,
        issues,
        requestedChanges: trimmedRequestedChanges,
      });

      handleCloseDecision();

      if (onRefresh) await onRefresh();
      await fetchReviewDetail();

      if (action === "APPROVED_FOR_XRF") {
        setShowXRFForm(true);
      }
    } catch (err) {
      console.error("Review action failed:", err);
      setError(
        err?.response?.data?.message || "Unable to complete the review action.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleXRFSuccess = async () => {
    setShowXRFForm(false);
    await fetchReviewDetail();
    if (onRefresh) await onRefresh();
  };

  const toggleIssue = (issue) => {
    setIssues((prev) =>
      prev.includes(issue)
        ? prev.filter((item) => item !== issue)
        : [...prev, issue],
    );
  };

  if (!sampleId) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      <button
        type="button"
        aria-label="Close sample review"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-slate-950/60 backdrop-blur-sm"
      />

      <div className="relative flex h-full w-full items-start justify-center overflow-y-auto p-2 pt-[125px] sm:p-4 sm:pt-4 lg:p-20">
        <div
          className={`relative flex h-[calc(100dvh-125px)] max-h-[960px] w-full min-h-0 flex-col overflow-hidden rounded-2xl border shadow-2xl sm:h-[calc(100dvh-2rem)] lg:h-[calc(100dvh-6rem)] sm:max-w-6xl sm:rounded-3xl ${theme.border} ${theme.card}`}
        >
          {/* Fixed, non-scrolling header. The body below owns the scroll. */}
          <header
            className={`relative z-20 shrink-0 border-b px-4 py-3 sm:px-6 sm:py-4 ${theme.border} ${theme.card}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 sm:flex">
                  <ClipboardCheck size={19} className={theme.emeraldText} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-[10px] font-mono uppercase tracking-[0.16em] ${theme.textMuted}`}
                    >
                      Sample Review
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.badge}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </span>
                  </div>

                  <h2
                    className={`mt-0.5 truncate text-base font-bold sm:text-lg ${theme.text}`}
                  >
                    {sample?.productName || "Loading sample..."}
                  </h2>

                  {sample?.code && (
                    <p
                      className={`truncate font-mono text-[10px] ${theme.textMuted}`}
                    >
                      {sample.code}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {canRecordXRF && (
                  <button
                    type="button"
                    onClick={() => setShowXRFForm((value) => !value)}
                    className="hidden items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 sm:inline-flex"
                  >
                    <FlaskConical size={15} />
                    {showXRFForm ? "Close XRF" : "Record XRF"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${theme.hover} ${theme.textMuted}`}
                  aria-label="Close"
                >
                  <X size={19} />
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable body — header remains fully visible. */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {loading && (
              <div className="flex min-h-[55vh] flex-col items-center justify-center">
                <Loader2
                  size={30}
                  className={`animate-spin ${theme.emeraldText}`}
                />
                <p className={`mt-3 text-sm ${theme.textMuted}`}>
                  Loading sample details...
                </p>
              </div>
            )}

            {!loading && error && !reviewData && (
              <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
                <AlertTriangle size={30} className="text-red-500" />
                <p className={`mt-3 max-w-md text-sm ${theme.text}`}>{error}</p>
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={fetchReviewDetail}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className={`rounded-xl border px-4 py-2 text-sm ${theme.border} ${theme.text}`}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {!loading && reviewData && (
              <div className="p-4 sm:p-6">
                {error && (
                  <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Top summary */}
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                  <section
                    className={`rounded-2xl border p-4 sm:p-5 ${theme.border} ${theme.bg}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`text-[10px] font-mono uppercase tracking-[0.14em] ${theme.textMuted}`}
                        >
                          Product record
                        </p>
                        <h3 className={`mt-1 text-lg font-bold ${theme.text}`}>
                          {formatValue(sample?.productName)}
                        </h3>
                        <p className={`mt-1 text-xs ${theme.textMuted}`}>
                          {formatValue(sample?.productVariant?.displayName)}
                        </p>
                      </div>

                      <div className="hidden rounded-xl bg-emerald-500/10 p-2.5 sm:block">
                        <Package size={18} className={theme.emeraldText} />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      <MiniInfo
                        label="Brand"
                        value={sample?.brandName}
                        theme={theme}
                      />
                      <MiniInfo
                        label="Category"
                        value={sample?.productVariant?.category?.name}
                        theme={theme}
                      />
                      <MiniInfo
                        label="Batch"
                        value={sample?.batchNumber}
                        theme={theme}
                      />
                      <MiniInfo
                        label="Manufacturer"
                        value={sample?.manufacturerName}
                        theme={theme}
                      />
                      <MiniInfo
                        label="Vendor"
                        value={sample?.vendorType?.replace(/_/g, " ")}
                        theme={theme}
                      />
                      <MiniInfo
                        label="Collected"
                        value={formatDate(sample?.createdAt)}
                        theme={theme}
                      />
                    </div>
                  </section>

                  <section
                    className={`rounded-2xl border p-4 sm:p-5 ${theme.border} ${theme.card}`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className={theme.emeraldText} />
                      <h3 className={`text-sm font-semibold ${theme.text}`}>
                        Collection location
                      </h3>
                    </div>

                    <div className="mt-4 space-y-2">
                      <LocationRow
                        label="State"
                        value={sample?.state?.name}
                        theme={theme}
                      />
                      <LocationRow
                        label="LGA"
                        value={sample?.lga?.name}
                        theme={theme}
                      />
                      <LocationRow
                        label="Market"
                        value={sample?.market?.name}
                        theme={theme}
                      />
                    </div>

                    <div className={`mt-4 border-t pt-4 ${theme.border}`}>
                      <div className="flex items-center gap-2">
                        <User size={15} className={theme.emeraldText} />
                        <span className={`text-xs font-semibold ${theme.text}`}>
                          {formatValue(sample?.creator?.fullName)}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>

                {/* XRF workspace */}
                {showXRFForm && sample && (
                  <section
                    className={`mt-5 rounded-2xl border p-4 sm:p-5 ${theme.border}`}
                  >
                    <XRFReadingForm
                      sample={sample}
                      onCancel={() => setShowXRFForm(false)}
                      onSuccess={handleXRFSuccess}
                    />
                  </section>
                )}

                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-5">
                    {/* Readings */}
                    <section
                      className={`rounded-2xl border p-4 sm:p-5 ${theme.border} ${theme.card}`}
                    >
                      <SectionTitle
                        icon={<FlaskConical size={16} />}
                        title="Heavy Metal Readings"
                        theme={theme}
                      />
                      {readings.length === 0 ? (
                        <EmptyState
                          icon={<FlaskConical size={22} />}
                          text={
                            canRecordXRF
                              ? "No XRF readings recorded yet."
                              : "No heavy metal readings available."
                          }
                          theme={theme}
                        />
                      ) : (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {readings.map((reading, index) => (
                            <HeavyMetalCard
                              key={
                                reading.id || `${reading.heavyMetal}-${index}`
                              }
                              reading={reading}
                              theme={theme}
                            />
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Notes / feedback */}
                    {(sample?.notes ||
                      reviewData?.comments ||
                      reviewData?.issues?.length ||
                      reviewData?.requestedChanges) && (
                      <section
                        className={`rounded-2xl border p-4 sm:p-5 ${theme.border} ${theme.card}`}
                      >
                        <SectionTitle
                          icon={<FileText size={16} />}
                          title="Notes & Review Feedback"
                          theme={theme}
                        />

                        <div className="mt-4 space-y-4">
                          {sample?.notes && (
                            <FeedbackBlock
                              label="Collector Notes"
                              value={sample.notes}
                              theme={theme}
                            />
                          )}
                          {reviewData?.comments && (
                            <FeedbackBlock
                              label="Review Comments"
                              value={reviewData.comments}
                              theme={theme}
                            />
                          )}
                          {reviewData?.requestedChanges && (
                            <FeedbackBlock
                              label="Requested Changes"
                              value={reviewData.requestedChanges}
                              theme={theme}
                            />
                          )}
                          {reviewData?.issues?.length > 0 && (
                            <div>
                              <Label theme={theme}>Issues Identified</Label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {reviewData.issues.map((issue) => (
                                  <span
                                    key={issue}
                                    className="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-[10px] font-medium text-red-700 dark:text-red-300"
                                  >
                                    {issue}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Workflow rail */}
                  <aside className="lg:sticky lg:top-0 lg:self-start">
                    <section
                      className={`rounded-2xl border p-4 sm:p-5 ${theme.border} ${theme.bg}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p
                            className={`text-[10px] font-mono uppercase tracking-[0.14em] ${theme.textMuted}`}
                          >
                            Workflow
                          </p>
                          <h3
                            className={`mt-1 text-sm font-bold ${theme.text}`}
                          >
                            Review decision
                          </h3>
                        </div>
                        <div className={`rounded-xl p-2 ${theme.bg}`}>
                          <ShieldAlert
                            size={17}
                            className={theme.emeraldText}
                          />
                        </div>
                      </div>

                      <div
                        className={`mt-4 rounded-xl border p-3 ${theme.border} ${theme.card}`}
                      >
                        <p
                          className={`text-[10px] uppercase tracking-wider ${theme.textMuted}`}
                        >
                          Current status
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${status.dot}`}
                          />
                          <span
                            className={`text-sm font-semibold ${theme.text}`}
                          >
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        {!showDecisionForm && !showXRFForm && (
                          <ReviewActions
                            status={reviewStatus}
                            onAction={handleOpenDecision}
                            onOpenXRF={() => setShowXRFForm(true)}
                          />
                        )}
                      </div>
                    </section>

                    <div
                      className={`mt-3 flex items-start gap-2 rounded-xl border p-3 ${theme.border} ${theme.bg}`}
                    >
                      <CalendarDays
                        size={14}
                        className={`mt-0.5 shrink-0 ${theme.textMuted}`}
                      />
                      <div>
                        <p
                          className={`text-[10px] uppercase tracking-wider ${theme.textMuted}`}
                        >
                          Collected
                        </p>
                        <p
                          className={`mt-0.5 text-xs font-medium ${theme.text}`}
                        >
                          {formatDate(sample?.createdAt)}
                        </p>
                      </div>
                    </div>
                  </aside>
                </div>

                {showDecisionForm && (
                  <section
                    className={`mt-5 rounded-2xl border p-4 sm:p-5 ${theme.border} ${theme.bg}`}
                  >
                    <ReviewDecisionForm
                      selectedAction={selectedAction}
                      comments={comments}
                      setComments={setComments}
                      issues={issues}
                      toggleIssue={toggleIssue}
                      requestedChanges={requestedChanges}
                      setRequestedChanges={setRequestedChanges}
                      onCancel={handleCloseDecision}
                      onSubmit={handleReviewAction}
                      loading={actionLoading}
                      theme={theme}
                    />
                  </section>
                )}
              </div>
            )}
          </div>

          {/* Mobile action bar */}
          {!loading && reviewData && !showDecisionForm && !showXRFForm && (
            <div
              className={`shrink-0 border-t p-3 sm:hidden ${theme.border} ${theme.card}`}
            >
              <ReviewActions
                status={reviewStatus}
                onAction={handleOpenDecision}
                onOpenXRF={() => setShowXRFForm(true)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, theme }) {
  return (
    <div className="flex items-center gap-2">
      <span className={theme.emeraldText}>{icon}</span>
      <h3 className={`text-sm font-semibold ${theme.text}`}>{title}</h3>
    </div>
  );
}

function Label({ children, theme }) {
  return (
    <p
      className={`text-[10px] font-mono uppercase tracking-[0.1em] ${theme.textMuted}`}
    >
      {children}
    </p>
  );
}

function MiniInfo({ label, value, theme }) {
  return (
    <div
      className={`min-w-0 rounded-xl border px-3 py-2.5 ${theme.border} ${theme.card}`}
    >
      <Label theme={theme}>{label}</Label>
      <p
        className={`mt-1 truncate text-xs font-semibold ${theme.text}`}
        title={String(formatValue(value))}
      >
        {formatValue(value)}
      </p>
    </div>
  );
}

function LocationRow({ label, value, theme }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${theme.border} ${theme.card}`}
    >
      <span
        className={`text-[10px] uppercase tracking-wider ${theme.textMuted}`}
      >
        {label}
      </span>
      <span
        className={`flex min-w-0 items-center gap-1 text-xs font-semibold ${theme.text}`}
      >
        <span className="truncate">{formatValue(value)}</span>
        <ChevronRight size={13} className={theme.textMuted} />
      </span>
    </div>
  );
}

function FeedbackBlock({ label, value, theme }) {
  return (
    <div>
      <Label theme={theme}>{label}</Label>
      <p
        className={`mt-1.5 whitespace-pre-wrap text-sm leading-relaxed ${theme.text}`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ icon, text, theme }) {
  return (
    <div
      className={`mt-4 rounded-xl border border-dashed p-7 text-center ${theme.border}`}
    >
      <span className={`mx-auto flex w-fit ${theme.textMuted}`}>{icon}</span>
      <p className={`mt-2 text-xs ${theme.textMuted}`}>{text}</p>
    </div>
  );
}

function HeavyMetalCard({ reading, theme }) {
  const status = String(
    reading?.status || reading?.finalStatus || "PENDING",
  ).toUpperCase();

  const statusClass =
    {
      SAFE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      PASS: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",

      MODERATE: "bg-amber-500/10 text-amber-700 dark:text-amber-300",

      CONTAMINATED: "bg-red-500/10 text-red-700 dark:text-red-300",
      FAIL: "bg-red-500/10 text-red-700 dark:text-red-300",
      FAILED: "bg-red-500/10 text-red-700 dark:text-red-300",

      PENDING: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    }[status] || "bg-slate-500/10 text-slate-600 dark:text-slate-300";

  const result = reading?.xrfResult
    ? String(reading.xrfResult).toUpperCase()
    : null;

  const resultClass =
    {
      PASS: "text-emerald-600 dark:text-emerald-400",
      SAFE: "text-emerald-600 dark:text-emerald-400",

      FAIL: "text-red-600 dark:text-red-400",
      FAILED: "text-red-600 dark:text-red-400",
      CONTAMINATED: "text-red-600 dark:text-red-400",

      MODERATE: "text-amber-600 dark:text-amber-400",
      PENDING: "text-slate-500 dark:text-slate-400",
    }[result] || theme.text;

  return (
    <div className={`rounded-xl border p-3.5 ${theme.border} ${theme.bg}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-xs font-bold ${theme.text}`}>
          {String(reading?.heavyMetal || reading?.metal || "Unknown").replace(
            /_/g,
            " ",
          )}
        </p>

        <span
          className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusClass}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <Label theme={theme}>XRF Reading</Label>
          <p className={`mt-1 text-sm font-bold ${theme.text}`}>
            {formatValue(reading?.xrfReading)}
          </p>
        </div>

        <div>
          <Label theme={theme}>AAS Reading</Label>
          <p className={`mt-1 text-sm font-bold ${theme.text}`}>
            {formatValue(reading?.aasReading)}
          </p>
        </div>
      </div>

      {reading?.xrfResult && (
        <div className={`mt-3 border-t pt-3 ${theme.border}`}>
          <Label theme={theme}>XRF Result</Label>

          <p className={`mt-1 text-xs font-semibold ${resultClass}`}>
            {reading.xrfResult}
          </p>
        </div>
      )}

      {reading?.xrfNotes && (
        <p className={`mt-3 text-xs leading-relaxed ${theme.textMuted}`}>
          {reading.xrfNotes}
        </p>
      )}
    </div>
  );
}

function ReviewActions({ status, onAction, onOpenXRF }) {
  if (status === "PENDING_REVIEW") {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onAction("APPROVED_FOR_XRF")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
        >
          <CheckCircle2 size={15} />
          Approve for XRF
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onAction("FLAGGED")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 px-3 py-2.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-500/10 dark:text-amber-300"
          >
            <AlertTriangle size={14} />
            Flag
          </button>
          <button
            type="button"
            onClick={() => onAction("REJECTED")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 px-3 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-500/10 dark:text-red-300"
          >
            <X size={14} />
            Reject
          </button>
        </div>
      </div>
    );
  }

  if (status === "APPROVED_FOR_XRF" || status === "XRF_IN_PROGRESS") {
    return (
      <button
        type="button"
        onClick={onOpenXRF}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
      >
        <FlaskConical size={15} />
        Record XRF Readings
      </button>
    );
  }

  if (status === "XRF_COMPLETED") {
    return (
      <button
        type="button"
        onClick={() => onAction("APPROVED_FOR_AAS")}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-purple-700"
      >
        <FlaskConical size={15} />
        Approve for AAS
      </button>
    );
  }

  if (status === "APPROVED_FOR_AAS") {
    return (
      <button
        type="button"
        onClick={() => onAction("COMPLETED")}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
      >
        <CheckCircle2 size={15} />
        Complete Review
      </button>
    );
  }

  return null;
}

function ReviewDecisionForm({
  selectedAction,
  comments,
  setComments,
  issues,
  toggleIssue,
  requestedChanges,
  setRequestedChanges,
  onCancel,
  onSubmit,
  loading,
  theme,
}) {
  const requiresReason =
    selectedAction === "FLAGGED" || selectedAction === "REJECTED";

  const titleMap = {
    APPROVED_FOR_XRF: "Approve Sample for XRF",
    APPROVED_FOR_AAS: "Approve Sample for AAS",
    FLAGGED: "Flag Sample",
    REJECTED: "Reject Sample",
    COMPLETED: "Complete Sample Review",
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-[10px] font-mono uppercase tracking-[0.14em] ${theme.textMuted}`}
          >
            Decision
          </p>
          <h3 className={`mt-1 text-base font-bold ${theme.text}`}>
            {titleMap[selectedAction] || "Review Action"}
          </h3>
        </div>
        <ShieldAlert size={18} className={theme.emeraldText} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <Label theme={theme}>Comments</Label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            placeholder="Add review comments..."
            className={`mt-1.5 w-full resize-none rounded-xl border px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 ${theme.border} ${theme.card} ${theme.text}`}
          />
        </div>

        <div>
          {requiresReason ? (
            <>
              <Label theme={theme}>Issues Identified</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {ISSUE_OPTIONS.map((issue) => {
                  const selected = issues.includes(issue);
                  return (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => toggleIssue(issue)}
                      className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition ${
                        selected
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : `${theme.border} ${theme.textMuted} ${theme.hover}`
                      }`}
                    >
                      {issue}
                    </button>
                  );
                })}
              </div>

              <Label theme={theme}>Requested Changes</Label>
              <textarea
                value={requestedChanges}
                onChange={(e) => setRequestedChanges(e.target.value)}
                rows={3}
                placeholder="Describe what needs to be corrected..."
                className={`mt-2 w-full resize-none rounded-xl border px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 ${theme.border} ${theme.card} ${theme.text}`}
              />
            </>
          ) : (
            <div
              className={`h-full rounded-xl border border-dashed p-4 ${theme.border}`}
            >
              <p className={`text-xs leading-relaxed ${theme.textMuted}`}>
                This action does not require an issue checklist. You can still
                add comments on the left before confirming.
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className={`mt-4 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end ${theme.border}`}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={!!loading}
          className={`rounded-xl border px-4 py-2.5 text-xs font-semibold ${theme.border} ${theme.text} ${theme.hover}`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!!loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Confirm Action
        </button>
      </div>
    </div>
  );
}
