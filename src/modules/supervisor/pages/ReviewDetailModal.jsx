import { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Building2,
  User,
  Calendar,
  Package,
  Tag,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  Loader2,
  ShieldAlert,
  FileText,
} from "lucide-react";

import api from "../../../utils/api";
import { useTheme } from "../../../context/ThemeContext";

const STATUS_CONFIG = {
  PENDING_REVIEW: {
    label: "Pending Review",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },

  APPROVED_FOR_XRF: {
    label: "Approved for XRF",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },

  XRF_IN_PROGRESS: {
    label: "XRF In Progress",
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
  },

  XRF_COMPLETED: {
    label: "XRF Completed",
    badge: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    dot: "bg-cyan-500",
  },

  APPROVED_FOR_AAS: {
    label: "Approved for AAS",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
  },

  COMPLETED: {
    label: "Completed",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },

  REJECTED: {
    label: "Rejected",
    badge: "bg-red-500/10 text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },

  FLAGGED: {
    label: "Flagged",
    badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    label: status?.replace(/_/g, " ") || "Unknown",
    badge: "bg-slate-500/10 text-slate-600",
    dot: "bg-slate-500",
  };

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return value;
};

export default function ReviewDetailModal({
  sampleId,
  onClose,
  onRefresh,
  onOpenXRF,
}) {
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

  const canRecordXRF =
  review?.status === "APPROVED_FOR_XRF" ||
  review?.status === "XRF_IN_PROGRESS";

  useEffect(() => {
    if (!sampleId) return;

    const fetchReviewDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/reviews/${sampleId}`);

        setReviewData(response.data?.data || response.data);
      } catch (err) {
        console.error("Failed to fetch review detail:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load sample review details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetail();
  }, [sampleId]);

  const handleOpenDecision = (action) => {
    setSelectedAction(action);
    setComments("");
    setIssues([]);
    setRequestedChanges("");
    setShowDecisionForm(true);
  };

  const handleReviewAction = async () => {
    if (!selectedAction || !reviewData?.sample?.id) return;

    try {
      setActionLoading(selectedAction);

      await api.post(`/reviews/${reviewData.sample.id}`, {
        action: selectedAction,
        comments,
        issues,
        requestedChanges,
      });

      setShowDecisionForm(false);

      if (onRefresh) {
        await onRefresh();
      }

      if (selectedAction === "APPROVED_FOR_XRF") {
        if (onOpenXRF) {
          onOpenXRF(reviewData.sample);
        }
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Review action failed:", err);

      alert(
        err?.response?.data?.message ||
          "Unable to complete review action."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const toggleIssue = (issue) => {
    setIssues((prev) =>
      prev.includes(issue)
        ? prev.filter((item) => item !== issue)
        : [...prev, issue]
    );
  };

  if (!sampleId) return null;

  const sample = reviewData?.sample;
  const status = getStatusConfig(reviewData?.status);

  const readings = sample?.heavyMetalReadings || [];

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative z-10
          w-full
          sm:max-w-4xl
          max-h-[94vh]
          overflow-hidden
          rounded-t-2xl sm:rounded-2xl
          border
          ${theme.border}
          ${theme.card}
          shadow-2xl
        `}
      >
        {/* Header */}
        <div
          className={`
            flex items-start justify-between
            px-5 py-4
            border-b
            ${theme.border}
          `}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <ClipboardCheck
                  size={18}
                  className={theme.emeraldText}
                />
              </div>

              <div>
                <p
                  className={`
                    text-[10px]
                    uppercase
                    tracking-[0.14em]
                    font-mono
                    ${theme.textMuted}
                  `}
                >
                  Sample Review
                </p>

                <h2
                  className={`
                    text-base sm:text-lg
                    font-semibold
                    truncate
                    ${theme.text}
                  `}
                >
                  {sample?.productName || "Loading sample..."}
                </h2>
              </div>
            </div>

            {sample?.code && (
              <p
                className={`
                  ml-11
                  text-[11px]
                  font-mono
                  ${theme.textMuted}
                `}
              >
                {sample.code}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className={`
              p-2
              rounded-lg
              transition-colors
              ${theme.hover}
              ${theme.textMuted}
            `}
          >
            <X size={19} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(94vh-72px)]">
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2
                size={28}
                className={`animate-spin ${theme.emeraldText}`}
              />

              <p
                className={`
                  mt-3
                  text-sm
                  ${theme.textMuted}
                `}
              >
                Loading review details...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="p-8 text-center">
              <AlertTriangle
                size={28}
                className="mx-auto text-red-500"
              />

              <p className={`mt-3 text-sm ${theme.text}`}>
                {error}
              </p>

              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm"
              >
                Close
              </button>
            </div>
          )}

          {!loading && !error && reviewData && (
            <>
              {/* Status */}
              <div
                className={`
                  px-5 py-3
                  border-b
                  ${theme.border}
                  flex flex-wrap
                  items-center
                  justify-between
                  gap-3
                `}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`
                      w-2 h-2 rounded-full
                      ${status.dot}
                    `}
                  />

                  <span
                    className={`
                      text-xs
                      font-semibold
                      ${theme.text}
                    `}
                  >
                    {status.label}
                  </span>
                </div>

                <span
                  className={`
                    px-2.5 py-1
                    rounded-md
                    text-[10px]
                    font-mono
                    font-semibold
                    ${status.badge}
                  `}
                >
                  REVIEW WORKFLOW
                </span>
              </div>

              <div className="p-5 space-y-6">
                {/* Sample overview */}
                <section>
                  <SectionTitle
                    icon={<Package size={16} />}
                    title="Sample Overview"
                    theme={theme}
                  />

                  <div
                    className={`
                      mt-3
                      grid
                      grid-cols-1 sm:grid-cols-2
                      gap-3
                    `}
                  >
                    <InfoCard
                      label="Product"
                      value={sample?.productName}
                      theme={theme}
                    />

                    <InfoCard
                      label="Brand"
                      value={sample?.brandName}
                      theme={theme}
                    />

                    <InfoCard
                      label="Batch Number"
                      value={sample?.batchNumber}
                      theme={theme}
                    />

                    <InfoCard
                      label="Manufacturer"
                      value={sample?.manufacturerName}
                      theme={theme}
                    />

                    <InfoCard
                      label="Category"
                      value={
                        sample?.productVariant?.category?.name
                      }
                      theme={theme}
                    />

                    <InfoCard
                      label="Variant"
                      value={
                        sample?.productVariant?.displayName
                      }
                      theme={theme}
                    />
                  </div>
                </section>

                {/* Location */}
                <section>
                  <SectionTitle
                    icon={<MapPin size={16} />}
                    title="Collection Location"
                    theme={theme}
                  />

                  <div
                    className={`
                      mt-3
                      grid
                      grid-cols-1 sm:grid-cols-3
                      gap-3
                    `}
                  >
                    <InfoCard
                      label="State"
                      value={sample?.state?.name}
                      theme={theme}
                    />

                    <InfoCard
                      label="LGA"
                      value={sample?.lga?.name}
                      theme={theme}
                    />

                    <InfoCard
                      label="Market"
                      value={sample?.market?.name}
                      theme={theme}
                    />
                  </div>
                </section>

                {/* Collection information */}
                <section>
                  <SectionTitle
                    icon={<User size={16} />}
                    title="Collection Information"
                    theme={theme}
                  />

                  <div
                    className={`
                      mt-3
                      grid
                      grid-cols-1 sm:grid-cols-3
                      gap-3
                    `}
                  >
                    <InfoCard
                      label="Collected By"
                      value={sample?.creator?.fullName}
                      theme={theme}
                    />

                    <InfoCard
                      label="Vendor Type"
                      value={sample?.vendorType?.replace(/_/g, " ")}
                      theme={theme}
                    />

                    <InfoCard
                      label="Collected"
                      value={formatDate(sample?.createdAt)}
                      theme={theme}
                    />
                  </div>
                </section>

                {/* Notes */}
                {sample?.notes && (
                  <section>
                    <SectionTitle
                      icon={<FileText size={16} />}
                      title="Collector Notes"
                      theme={theme}
                    />

                    <div
                      className={`
                        mt-3
                        rounded-xl
                        border
                        p-4
                        text-sm
                        leading-relaxed
                        ${theme.border}
                        ${theme.bg}
                        ${theme.text}
                      `}
                    >
                      {sample.notes}
                    </div>
                  </section>
                )}

                {/* Existing review feedback */}
                {(reviewData?.comments ||
                  reviewData?.issues?.length > 0 ||
                  reviewData?.requestedChanges) && (
                  <section>
                    <SectionTitle
                      icon={<ClipboardCheck size={16} />}
                      title="Review Feedback"
                      theme={theme}
                    />

                    <div
                      className={`
                        mt-3
                        rounded-xl
                        border
                        p-4
                        space-y-3
                        ${theme.border}
                        ${theme.bg}
                      `}
                    >
                      {reviewData?.comments && (
                        <div>
                          <Label theme={theme}>
                            Comments
                          </Label>

                          <p
                            className={`
                              text-sm
                              ${theme.text}
                            `}
                          >
                            {reviewData.comments}
                          </p>
                        </div>
                      )}

                      {reviewData?.issues?.length > 0 && (
                        <div>
                          <Label theme={theme}>
                            Issues Identified
                          </Label>

                          <div className="flex flex-wrap gap-2">
                            {reviewData.issues.map((issue) => (
                              <span
                                key={issue}
                                className="
                                  px-2 py-1
                                  rounded-md
                                  text-[10px]
                                  font-medium
                                  bg-red-500/10
                                  text-red-600
                                  dark:text-red-400
                                "
                              >
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {reviewData?.requestedChanges && (
                        <div>
                          <Label theme={theme}>
                            Requested Changes
                          </Label>

                          <p
                            className={`
                              text-sm
                              ${theme.text}
                            `}
                          >
                            {reviewData.requestedChanges}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Heavy metal readings */}
                <section>
                  <SectionTitle
                    icon={<FlaskConical size={16} />}
                    title="Heavy Metal Readings"
                    theme={theme}
                  />

                  {readings.length === 0 ? (
                    <div
                      className={`
                        mt-3
                        border
                        border-dashed
                        rounded-xl
                        p-6
                        text-center
                        ${theme.border}
                      `}
                    >
                      <FlaskConical
                        size={22}
                        className={`mx-auto ${theme.textMuted}`}
                      />

                      <p
                        className={`
                          mt-2
                          text-sm
                          ${theme.textMuted}
                        `}
                      >
                        No XRF readings recorded yet.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="
                        mt-3
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        gap-3
                      "
                    >
                      {readings.map((reading) => (
                        <HeavyMetalCard
                          key={reading.id}
                          reading={reading}
                          theme={theme}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Decision Form */}
                {showDecisionForm && (
                  <ReviewDecisionForm
                    selectedAction={selectedAction}
                    comments={comments}
                    setComments={setComments}
                    issues={issues}
                    toggleIssue={toggleIssue}
                    requestedChanges={requestedChanges}
                    setRequestedChanges={setRequestedChanges}
                    onCancel={() => {
                      setShowDecisionForm(false);
                      setSelectedAction(null);
                    }}
                    onSubmit={handleReviewAction}
                    loading={actionLoading}
                    theme={theme}
                  />
                )}
              </div>

              {/* Actions */}
              {!showDecisionForm && (
                <div
                  className={`
                    sticky bottom-0
                    p-4
                    border-t
                    ${theme.border}
                    ${theme.card}
                  `}
                >
                  <ReviewActions
                    status={reviewData.status}
                    onAction={handleOpenDecision}
                    onOpenXRF={() =>
                      onOpenXRF?.(sample)
                    }
                    theme={theme}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SUB COMPONENTS                                */
/* -------------------------------------------------------------------------- */

function SectionTitle({ icon, title, theme }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          ${theme.emeraldText}
        `}
      >
        {icon}
      </div>

      <h3
        className={`
          text-sm
          font-semibold
          ${theme.text}
        `}
      >
        {title}
      </h3>
    </div>
  );
}

function Label({ children, theme }) {
  return (
    <p
      className={`
        text-[10px]
        uppercase
        tracking-[0.1em]
        font-mono
        mb-1
        ${theme.textMuted}
      `}
    >
      {children}
    </p>
  );
}

function InfoCard({ label, value, theme }) {
  return (
    <div
      className={`
        rounded-xl
        border
        px-3.5
        py-3
        ${theme.border}
        ${theme.bg}
      `}
    >
      <Label theme={theme}>{label}</Label>

      <p
        className={`
          text-sm
          font-medium
          truncate
          ${theme.text}
        `}
        title={formatValue(value)}
      >
        {formatValue(value)}
      </p>
    </div>
  );
}

function HeavyMetalCard({ reading, theme }) {
  const status = reading?.status || "PENDING";

  const styles = {
    SAFE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    MODERATE: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    CONTAMINATED: "bg-red-500/10 text-red-600 dark:text-red-400",
    PENDING: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  };

  return (
    <div
      className={`
        rounded-xl
        border
        p-3.5
        ${theme.border}
        ${theme.bg}
      `}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={`
            text-xs
            font-semibold
            ${theme.text}
          `}
        >
          {reading?.heavyMetal?.replace(/_/g, " ")}
        </p>

        <span
          className={`
            px-2 py-0.5
            rounded-md
            text-[9px]
            font-semibold
            ${styles[status] || styles.PENDING}
          `}
        >
          {status}
        </span>
      </div>

      <div className="mt-3">
        <Label theme={theme}>XRF Reading</Label>

        <p
          className={`
            text-lg
            font-semibold
            ${theme.text}
          `}
        >
          {formatValue(reading?.xrfReading)}
        </p>
      </div>

      {reading?.xrfNotes && (
        <p
          className={`
            mt-2
            text-xs
            leading-relaxed
            ${theme.textMuted}
          `}
        >
          {reading.xrfNotes}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               REVIEW ACTIONS                               */
/* -------------------------------------------------------------------------- */

function ReviewActions({
  status,
  onAction,
  onOpenXRF,
  theme,
}) {
  if (status === "PENDING_REVIEW") {
    return (
      <div className="flex flex-col sm:flex-row gap-2 justify-end">
        <button
          onClick={() => onAction("FLAGGED")}
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-2.5
            rounded-lg
            text-sm
            font-medium
            border
            border-amber-500/30
            text-amber-600
            hover:bg-amber-500/10
            transition-colors
          "
        >
          <AlertTriangle size={16} />
          Flag Sample
        </button>

        <button
          onClick={() => onAction("REJECTED")}
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-2.5
            rounded-lg
            text-sm
            font-medium
            border
            border-red-500/30
            text-red-600
            hover:bg-red-500/10
            transition-colors
          "
        >
          <X size={16} />
          Reject
        </button>

        <button
          onClick={() => onAction("APPROVED_FOR_XRF")}
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-2.5
            rounded-lg
            text-sm
            font-semibold
            bg-emerald-600
            text-white
            hover:bg-emerald-700
            transition-colors
          "
        >
          <CheckCircle2 size={16} />
          Approve for XRF
        </button>
      </div>
    );
  }

  if (
    status === "APPROVED_FOR_XRF" ||
    status === "XRF_IN_PROGRESS"
  ) {
    return (
      <div className="flex justify-end">
        <button
          onClick={onOpenXRF}
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-2.5
            rounded-lg
            text-sm
            font-semibold
            bg-emerald-600
            text-white
            hover:bg-emerald-700
            transition-colors
          "
        >
          <FlaskConical size={16} />
          Record XRF Readings
        </button>
      </div>
    );
  }

  if (status === "XRF_COMPLETED") {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => onAction("APPROVED_FOR_AAS")}
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-2.5
            rounded-lg
            text-sm
            font-semibold
            bg-emerald-600
            text-white
            hover:bg-emerald-700
            transition-colors
          "
        >
          <FlaskConical size={16} />
          Approve for AAS
        </button>
      </div>
    );
  }

  if (status === "APPROVED_FOR_AAS") {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => onAction("COMPLETED")}
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-2.5
            rounded-lg
            text-sm
            font-semibold
            bg-emerald-600
            text-white
            hover:bg-emerald-700
            transition-colors
          "
        >
          <CheckCircle2 size={16} />
          Complete Review
        </button>
      </div>
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                            DECISION FORM                                   */
/* -------------------------------------------------------------------------- */

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
  const requiresIssues =
    selectedAction === "FLAGGED" ||
    selectedAction === "REJECTED";

  const titleMap = {
    APPROVED_FOR_XRF: "Approve Sample for XRF",
    APPROVED_FOR_AAS: "Approve Sample for AAS",
    FLAGGED: "Flag Sample",
    REJECTED: "Reject Sample",
    COMPLETED: "Complete Sample Review",
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

  return (
    <section
      className={`
        rounded-xl
        border
        p-4
        ${theme.border}
        ${theme.bg}
      `}
    >
      <div className="flex items-center gap-2">
        <ShieldAlert
          size={17}
          className={theme.emeraldText}
        />

        <h3
          className={`
            text-sm
            font-semibold
            ${theme.text}
          `}
        >
          {titleMap[selectedAction]}
        </h3>
      </div>

      <div className="mt-4 space-y-4">
        {/* Comments */}
        <div>
          <Label theme={theme}>Comments</Label>

          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder="Add review comments..."
            className={`
              w-full
              resize-none
              rounded-lg
              border
              px-3
              py-2.5
              text-sm
              outline-none
              focus:ring-2
              focus:ring-emerald-500/20
              ${theme.border}
              ${theme.card}
              ${theme.text}
            `}
          />
        </div>

        {/* Issues */}
        {requiresIssues && (
          <div>
            <Label theme={theme}>Issues Identified</Label>

            <div className="flex flex-wrap gap-2">
              {ISSUE_OPTIONS.map((issue) => {
                const selected = issues.includes(issue);

                return (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => toggleIssue(issue)}
                    className={`
                      px-2.5
                      py-1.5
                      rounded-lg
                      border
                      text-[11px]
                      transition-colors
                      ${
                        selected
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : `${theme.border} ${theme.textMuted}`
                      }
                    `}
                  >
                    {issue}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Requested changes */}
        {requiresIssues && (
          <div>
            <Label theme={theme}>Requested Changes</Label>

            <textarea
              value={requestedChanges}
              onChange={(e) =>
                setRequestedChanges(e.target.value)
              }
              rows={2}
              placeholder="Describe what needs to be corrected..."
              className={`
                w-full
                resize-none
                rounded-lg
                border
                px-3
                py-2.5
                text-sm
                outline-none
                focus:ring-2
                focus:ring-emerald-500/20
                ${theme.border}
                ${theme.card}
                ${theme.text}
              `}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={!!loading}
            className={`
              px-4 py-2
              rounded-lg
              text-sm
              border
              transition-colors
              ${theme.border}
              ${theme.textMuted}
              ${theme.hover}
            `}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!!loading}
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-lg
              text-sm
              font-semibold
              bg-emerald-600
              text-white
              hover:bg-emerald-700
              disabled:opacity-60
            "
          >
            {loading && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            Confirm Action
          </button>
        </div>
      </div>
    </section>
  );
}