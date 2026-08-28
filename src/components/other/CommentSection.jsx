import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Loader,
  Lock,
  MapPin,
  Hash,
  Calendar,
  Tag,
  ShoppingBag,
  Beaker,
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  FlaskConical,
  Info,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import { Toaster, toast } from "react-hot-toast";
import Comments from "./Comments";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { useTheme } from "../../context/ThemeContext";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const fmt = (value, decimals = 6) =>
  value !== null && value !== undefined && value !== ""
    ? Number(value).toFixed(decimals)
    : "—";

const REVIEW_CONFIG = {
  PENDING: {
    label: "Pending review",
    tone: "pending",
    Icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    tone: "safe",
    Icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    tone: "danger",
    Icon: AlertTriangle,
  },
};

const CONTAMINATION_CONFIG = {
  SAFE: {
    label: "Safe",
    tone: "safe",
    Icon: CheckCircle,
  },
  CONTAMINATED: {
    label: "Contaminated",
    tone: "danger",
    Icon: AlertTriangle,
  },
};

const TONE_STYLES = {
  safe: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 " +
      "dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },

  danger: {
    badge:
      "border-red-200 bg-red-50 text-red-700 " +
      "dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
    dot: "bg-red-500",
  },

  pending: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 " +
      "dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
    dot: "bg-amber-500",
  },

  neutral: {
    badge:
      "border-slate-200 bg-slate-50 text-slate-700 " +
      "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-slate-400",
  },
};

function StatusBadge({ status, configMap }) {
  const config = configMap?.[status] || {
    label: status || "Unknown",
    tone: "neutral",
    Icon: Info,
  };

  const styles = TONE_STYLES[config.tone] || TONE_STYLES.neutral;

  const Icon = config.Icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full border
        px-2.5 py-1
        text-[9px] font-bold uppercase
        tracking-wide
        ${styles.badge}
      `}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Heavy metal readings                                                       */
/* -------------------------------------------------------------------------- */

function MetalReadings({ readings }) {
  const { theme } = useTheme();

  if (!Array.isArray(readings) || readings.length === 0) {
    return null;
  }

  const safeCount = readings.filter(
    (reading) => reading?.finalStatus === "SAFE",
  ).length;

  const total = readings.length;

  const percentage = Math.round((safeCount / total) * 100);

  const allSafe = safeCount === total;

  return (
    <div
      className={`
        rounded-xl border p-3
        ${theme.border}
        ${theme.bg}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical size={13} className={theme.emeraldText} />

          <span
            className={`
              text-[9px] font-bold uppercase
              tracking-[0.1em]
              ${theme.text}
            `}
          >
            Heavy metal readings
          </span>
        </div>

        <span
          className={`
            text-[10px] font-bold
            ${
              allSafe
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }
          `}
        >
          {safeCount}/{total} safe
        </span>
      </div>

      <div className="mt-3 flex gap-1">
        {readings.map((reading, index) => (
          <div
            key={reading?.id || index}
            title={`Reading ${index + 1}: ${reading?.finalStatus || "Unknown"}`}
            className={`
              h-1.5 flex-1 rounded-full
              ${
                reading?.finalStatus === "SAFE"
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }
            `}
          />
        ))}
      </div>

      <div
        className={`
          mt-2 h-1 overflow-hidden rounded-full
          ${theme.card}
        `}
      >
        <div
          className={`
            h-full rounded-full
            transition-all duration-700
            ${allSafe ? "bg-emerald-500" : "bg-red-500"}
          `}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Metadata field                                                             */
/* -------------------------------------------------------------------------- */

function MetaField({ icon, label, value, mono = false }) {
  const { theme } = useTheme();

  return (
    <div className="min-w-0">
      <div
        className={`
          mb-1.5 flex items-center gap-1.5
          ${theme.textMuted}
        `}
      >
        {icon}

        <span
          className="
            text-[9px] font-bold uppercase
            tracking-[0.1em]
          "
        >
          {label}
        </span>
      </div>

      <p
        className={`
          truncate text-[11px] font-semibold
          ${mono ? "font-mono" : ""}
          ${theme.text}
        `}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

function CommentSection({ commentSectionView, setCommentSectionView }) {
  const { sample } = commentSectionView;

  const { currentUser } = useSelector((state) => state.auth);

  const { theme } = useTheme();

  const COMMENT_ROLES = [
    "SUPER_ADMIN",
    "HEAD_RESEARCHER",
    "SUPERVISOR",
    "POLICY_MAKER_SON",
    "POLICY_MAKER_NAFDAC",
    "POLICY_MAKER_RESOLVE",
    "POLICY_MAKER_UNIVERSITY",
  ];

  const canComment = COMMENT_ROLES.includes(currentUser?.role);

  const [fetchedComments, setFetchedComments] = useState([]);

  const [loading, setLoading] = useState(false);

  const [writtenComment, setWrittenComment] = useState("");

  const [isFocused, setIsFocused] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* Fetch comments                                                        */
  /* ---------------------------------------------------------------------- */

  const fetchComments = async () => {
    if (!sample?.id) return;

    setLoading(true);

    try {
      const result = await api.get(`/samples/${sample.id}/comments`);

      setFetchedComments(
        Array.isArray(result?.data?.data) ? result.data.data : [],
      );
    } catch (error) {
      console.error("Failed to load comments:", error);

      toast.error("Failed to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [sample?.id]);

  /* ---------------------------------------------------------------------- */
  /* Submit comment                                                        */
  /* ---------------------------------------------------------------------- */

  const handleSubmitComment = async () => {
    const trimmed = writtenComment.trim();

    if (!trimmed || submitting) return;

    setSubmitting(true);

    try {
      await api.post(`/samples/${sample.id}/comments`, {
        commentText: trimmed,
      });

      setWrittenComment("");

      toast.success("Comment posted successfully.");

      await fetchComments();
    } catch (error) {
      console.error("Failed to post comment:", error);

      toast.error("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Derived information                                                   */
  /* ---------------------------------------------------------------------- */

  const locationStr = sample?.lga?.name
    ? `${sample.lga.name}${sample?.state?.name ? `, ${sample.state.name}` : ""}`
    : sample?.state?.name || "—";

  const contaminationStatus = sample?.contaminationStatus;

  const reviewStatus = sample?.review?.status;

  const isContaminated = contaminationStatus === "CONTAMINATED";

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: "13px",
            borderRadius: "12px",
          },
        }}
      />

      <div
        className={`
          min-h-screen
          ${theme.bg}
          ${theme.text}
          transition-colors duration-300
        `}
      >
        {/* ================================================================= */}
        {/* Navigation                                                        */}
        {/* ================================================================= */}

        <header
          className={`
            sticky top-0 z-30
            border-b backdrop-blur-xl
            ${theme.card}
            ${theme.border}
          `}
        >
          <div
            className="
              mx-auto flex h-14 max-w-4xl
              items-center gap-3
              px-4 sm:px-6
            "
          >
            <button
              type="button"
              onClick={() =>
                setCommentSectionView({
                  isOpen: false,
                  sample: null,
                })
              }
              className={`
                group flex items-center gap-2
                rounded-lg px-1.5 py-1
                text-sm font-medium
                transition-colors
                ${theme.textMuted}
                hover:${theme.text}
              `}
            >
              <span
                className={`
                  flex h-7 w-7 items-center
                  justify-center rounded-lg
                  border
                  ${theme.border}
                  ${theme.bg}
                `}
              >
                <ArrowLeft size={14} />
              </span>

              <span className="hidden sm:inline">Back to samples</span>
            </button>

            <div
              className={`
                hidden h-5 w-px sm:block
                ${theme.border}
              `}
            />

            <span
              className={`
                hidden truncate font-mono
                text-[10px] sm:block
                ${theme.textMuted}
              `}
            >
              {sample?.sampleId ? `${sample.sampleId.slice(0, 12)}…` : "Sample"}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <StatusBadge status={reviewStatus} configMap={REVIEW_CONFIG} />
            </div>
          </div>
        </header>

        {/* ================================================================= */}
        {/* Main                                                              */}
        {/* ================================================================= */}

        <main
          className="
            mx-auto max-w-4xl
            space-y-4
            px-4 py-6
            sm:px-6 sm:py-7
          "
        >
          {/* ================================================================= */}
          {/* Sample overview                                                   */}
          {/* ================================================================= */}

          <section
            className={`
              overflow-hidden rounded-2xl
              border shadow-sm
              ${theme.card}
              ${theme.border}
            `}
          >
            {/* Section heading */}

            <div
              className={`
                flex items-center justify-between
                gap-3 border-b
                px-5 py-4
                ${theme.border}
              `}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`
                    flex h-8 w-8 items-center
                    justify-center rounded-lg
                    ${theme.emerald}
                  `}
                >
                  <Beaker size={15} className={theme.emeraldText} />
                </div>

                <div>
                  <h1
                    className={`
                      text-sm font-bold
                      ${theme.text}
                    `}
                  >
                    Sample overview
                  </h1>

                  <p
                    className={`
                      mt-0.5 text-[10px]
                      ${theme.textMuted}
                    `}
                  >
                    Field collection record
                  </p>
                </div>
              </div>

              <StatusBadge
                status={contaminationStatus}
                configMap={CONTAMINATION_CONFIG}
              />
            </div>

            {/* Product identity */}

            <div
              className={`
                border-b px-5 py-5
                ${theme.border}
              `}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className={`
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl border
                    ${theme.border}
                    ${theme.bg}
                  `}
                >
                  {isContaminated ? (
                    <ShieldAlert size={20} className="text-red-500" />
                  ) : (
                    <ShieldCheck size={20} className={theme.emeraldText} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    className={`
                      text-base font-bold
                      leading-tight
                      ${theme.text}
                    `}
                  >
                    {sample?.productName || "Unnamed product"}
                  </h2>

                  <p
                    className={`
                      mt-1 text-xs
                      ${theme.textMuted}
                    `}
                  >
                    {sample?.productVariant?.displayName ||
                      sample?.productVariant?.name ||
                      "Product variant not specified"}
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {sample?.marketType && (
                      <span
                        className={`
                          rounded-md border
                          px-2 py-1
                          text-[9px] font-semibold
                          ${theme.border}
                          ${theme.bg}
                          ${theme.textMuted}
                        `}
                      >
                        {sample.marketType}
                      </span>
                    )}

                    {sample?.marketName && (
                      <span
                        className={`
                          rounded-md border
                          px-2 py-1
                          text-[9px] font-semibold
                          ${theme.border}
                          ${theme.bg}
                          ${theme.textMuted}
                        `}
                      >
                        {sample.marketName}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="
                    shrink-0
                    sm:min-w-[90px]
                    sm:text-right
                  "
                >
                  <p
                    className={`
                      text-[9px] font-bold
                      uppercase tracking-[0.1em]
                      ${theme.textMuted}
                    `}
                  >
                    Price
                  </p>

                  <p
                    className={`
                      mt-1 text-sm font-bold
                      ${theme.text}
                    `}
                  >
                    {sample?.price !== null && sample?.price !== undefined
                      ? `₦${Number(sample.price).toLocaleString()}`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata */}

            <div className="grid grid-cols-2 gap-x-6 gap-y-5 p-5 sm:grid-cols-3">
              <MetaField
                icon={<Hash size={12} />}
                label="Sample ID"
                value={sample?.sampleId}
                mono
              />

              <MetaField
                icon={<Tag size={12} />}
                label="Code"
                value={sample?.code}
                mono
              />

              <MetaField
                icon={<MapPin size={12} />}
                label="Location"
                value={locationStr}
              />

              <MetaField
                icon={<Calendar size={12} />}
                label="Collected"
                value={
                  sample?.createdAt
                    ? new Date(sample.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"
                }
              />

              <MetaField
                icon={<MapPin size={12} />}
                label="GPS"
                value={
                  sample?.gpsLatitude && sample?.gpsLongitude
                    ? `${fmt(sample.gpsLatitude)}, ${fmt(sample.gpsLongitude)}`
                    : "—"
                }
                mono
              />

              <MetaField
                icon={<Thermometer size={12} />}
                label="Lead level"
                value={
                  sample?.leadLevel !== null && sample?.leadLevel !== undefined
                    ? `${sample.leadLevel} µg/dL`
                    : "—"
                }
                mono
              />

              <div className="col-span-2 sm:col-span-3">
                <MetalReadings readings={sample?.heavyMetalReadings} />
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* Comments                                                          */}
          {/* ================================================================= */}

          <section
            className={`
              overflow-hidden rounded-2xl
              border shadow-sm
              ${theme.card}
              ${theme.border}
            `}
          >
            {/* Header */}

            <div
              className={`
                flex items-center justify-between
                border-b px-5 py-4
                ${theme.border}
              `}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`
                    flex h-8 w-8 items-center
                    justify-center rounded-lg
                    ${theme.emerald}
                  `}
                >
                  <MessageSquare size={15} className={theme.emeraldText} />
                </div>

                <div>
                  <h2
                    className={`
                      text-sm font-bold
                      ${theme.text}
                    `}
                  >
                    Comments & remarks
                  </h2>

                  <p
                    className={`
                      mt-0.5 text-[10px]
                      ${theme.textMuted}
                    `}
                  >
                    Review discussion and observations
                  </p>
                </div>
              </div>

              <span
                className={`
                  rounded-full border
                  px-2.5 py-1
                  text-[9px] font-bold
                  ${theme.border}
                  ${theme.bg}
                  ${theme.textMuted}
                `}
              >
                {fetchedComments.length}{" "}
                {fetchedComments.length === 1 ? "comment" : "comments"}
              </span>
            </div>

            {/* Comment list */}

            <div
              className="
                max-h-[430px]
                min-h-[180px]
                overflow-y-auto
                px-5 py-4
              "
            >
              {loading && (
                <div className="flex flex-col items-center justify-center gap-3 py-14">
                  <Loader
                    size={19}
                    className={`
                      animate-spin
                      ${theme.emeraldText}
                    `}
                  />

                  <p
                    className={`
                      text-xs
                      ${theme.textMuted}
                    `}
                  >
                    Loading comments…
                  </p>
                </div>
              )}

              {!loading && fetchedComments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div
                    className={`
                        flex h-11 w-11
                        items-center justify-center
                        rounded-full
                        ${theme.bg}
                        border
                        ${theme.border}
                      `}
                  >
                    <MessageSquare size={18} className={theme.textMuted} />
                  </div>

                  <p
                    className={`
                        mt-3 text-sm font-semibold
                        ${theme.text}
                      `}
                  >
                    No comments yet
                  </p>

                  <p
                    className={`
                        mt-1 text-xs
                        ${theme.textMuted}
                      `}
                  >
                    Add the first remark for this sample.
                  </p>
                </div>
              )}

              {!loading && fetchedComments.length > 0 && (
                <div className="space-y-2">
                  {fetchedComments.map((comment) => (
                    <Comments
                      key={comment.id}
                      comment={comment}
                      fetchComments={fetchComments}
                      toast={toast}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Composer */}

            <div
              className={`
                border-t px-5 pb-5 pt-4
                ${theme.border}
              `}
            >
              {!canComment ? (
                <div
                  className={`
                    flex items-start gap-3
                    rounded-xl border
                    p-3.5
                    ${theme.border}
                    ${theme.bg}
                  `}
                >
                  <Lock
                    size={15}
                    className={`
                      mt-0.5 shrink-0
                      ${theme.textMuted}
                    `}
                  />

                  <div>
                    <p
                      className={`
                        text-xs font-semibold
                        ${theme.text}
                      `}
                    >
                      Comments restricted
                    </p>

                    <p
                      className={`
                        mt-1 text-[10px] leading-relaxed
                        ${theme.textMuted}
                      `}
                    >
                      Only supervisors, researchers, and policy makers can add
                      comments.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <label
                    className={`
                      block text-[9px]
                      font-bold uppercase
                      tracking-[0.1em]
                      ${theme.textMuted}
                    `}
                  >
                    Add remark
                  </label>

                  <div
                    className={`
                      flex items-end gap-2
                      rounded-xl border
                      p-2.5
                      transition-all
                      ${theme.border}
                      ${theme.bg}
                      ${isFocused ? "ring-2 ring-emerald-500/20" : ""}
                    `}
                  >
                    <textarea
                      rows={2}
                      value={writtenComment}
                      placeholder="Write your comment or observation…"
                      onChange={(event) =>
                        setWrittenComment(event.target.value)
                      }
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          writtenComment.trim()
                        ) {
                          event.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                      className={`
                        min-h-[48px]
                        flex-1 resize-none
                        bg-transparent
                        text-sm
                        leading-relaxed
                        outline-none
                        ${theme.text}
                        placeholder:${theme.textMuted}
                      `}
                    />

                    <button
                      type="button"
                      onClick={handleSubmitComment}
                      disabled={!writtenComment.trim() || submitting}
                      className={`
                        flex h-9 w-9
                        shrink-0 items-center
                        justify-center
                        rounded-lg
                        transition-all
                        ${
                          !writtenComment.trim() || submitting
                            ? "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800"
                            : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                        }
                      `}
                    >
                      {submitting ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                    </button>
                  </div>

                  <p
                    className={`
                      text-[9px]
                      ${theme.textMuted}
                    `}
                  >
                    Enter to submit · Shift+Enter for a new line
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default CommentSection;
