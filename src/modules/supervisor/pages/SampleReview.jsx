import { useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FlaskConical,
  CheckCircle2,
  Flag,
  XCircle,
  Microscope,
  Loader2,
} from "lucide-react";

import useSampleReviews from "../hooks/useSampleReview";

import {
  STATUS_TABS,
  STATUS_TAB_META,
  DEFAULT_PAGE_SIZE,
} from "../constants/supervisor.constants";

import {
  getSampleReviewStatus,
  formatReviewStatus,
  formatDate,
  getSampleLocation,
  getSampleVariant,
} from "../utils/review.utils";

import { useTheme } from "../../../context/ThemeContext";

// Adjust this path based on where you create the modal
import ReviewDetailModal from "../components/ReviewDetailModal";

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────

function ReviewStatCard({
  label,
  value,
  icon: Icon,
  active,
  onClick,
  loading,
  theme,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl border p-4 text-left
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
        ${theme.border}
        ${theme.card}
        ${active ? "ring-2 ring-emerald-500/40" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`
              text-[10px] font-semibold uppercase tracking-[0.12em]
              ${theme.textMuted}
            `}
          >
            {label}
          </p>

          <div className="mt-2 flex items-end gap-2">
            {loading ? (
              <Loader2
                size={20}
                className="animate-spin text-emerald-500"
              />
            ) : (
              <span className={`text-2xl font-bold ${theme.text}`}>
                {value ?? 0}
              </span>
            )}
          </div>
        </div>

        <div
          className="
            flex h-9 w-9 items-center justify-center
            rounded-lg bg-emerald-500/10
            text-emerald-600 dark:text-emerald-400
          "
        >
          <Icon size={18} />
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS TAB
// ─────────────────────────────────────────────────────────────────────────────

function StatusTab({
  status,
  active,
  count,
  onClick,
  theme,
}) {
  const meta = STATUS_TAB_META[status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative min-w-max px-4 py-3 text-left
        transition-colors border-b-2
        ${
          active
            ? "border-emerald-500"
            : `border-transparent ${theme.hover}`
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span
          className={`
            text-xs font-semibold
            ${
              active
                ? "text-emerald-600 dark:text-emerald-400"
                : theme.text
            }
          `}
        >
          {meta?.label || formatReviewStatus(status)}
        </span>

        {count !== undefined && (
          <span
            className={`
              rounded-full px-1.5 py-0.5
              text-[9px] font-bold font-mono
              ${
                active
                  ? "bg-emerald-500/10 text-emerald-600"
                  : theme.bg
              }
            `}
          >
            {count}
          </span>
        )}
      </div>

      {meta?.sub && (
        <p className={`mt-1 text-[10px] ${theme.textMuted}`}>
          {meta.sub}
        </p>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SAMPLE ROW
// ─────────────────────────────────────────────────────────────────────────────

function SampleRow({
  sample,
  selected,
  onClick,
  theme,
}) {
  const status = getSampleReviewStatus(sample);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full border-b px-4 py-4 text-left
        transition-colors
        ${theme.border}
        ${theme.hover}
        ${selected ? "bg-emerald-500/5" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={`truncate text-sm font-semibold ${theme.text}`}>
              {sample.productName || "Unnamed product"}
            </p>

            {selected && (
              <span
                className="
                  h-1.5 w-1.5 flex-shrink-0
                  rounded-full bg-emerald-500
                "
              />
            )}
          </div>

          <p className={`mt-1 truncate text-[11px] ${theme.textMuted}`}>
            {getSampleVariant(sample)}
          </p>

          <div
            className={`
              mt-2 flex flex-wrap items-center gap-x-3 gap-y-1
              text-[10px] ${theme.textMuted}
            `}
          >
            <span>{sample.code || "No code"}</span>

            <span>•</span>

            <span>
              {getSampleLocation(sample)}
            </span>

            <span>•</span>

            <span>
              {formatDate(sample.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className="
              rounded-md bg-slate-500/10 px-2 py-1
              text-[9px] font-semibold uppercase tracking-wide
              text-slate-600 dark:text-slate-300
            "
          >
            {formatReviewStatus(status)}
          </span>

          <span className={`text-[10px] ${theme.textMuted}`}>
            {sample.creator?.fullName || "Unknown collector"}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function SampleReview() {
  const { theme } = useTheme();

  const {
    reviews,
    stats,
    selectedSample,
    reviewDetail,
    pagination,

    loading,
    statsLoading,
    detailLoading,
    error,

    fetchReviews,
    selectSample,
    setSelectedSample,
    fetchStats,
  } = useSampleReviews();

  // ─── Local UI state ───────────────────────────────────────────────────────

  const [activeStatus, setActiveStatus] =
    useState("PENDING_REVIEW");

  const [search, setSearch] =
    useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [isDetailOpen, setIsDetailOpen] =
    useState(false);

  // ─── Search debounce ──────────────────────────────────────────────────────

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // ─── Fetch reviews when filters change ────────────────────────────────────

  useEffect(() => {
    fetchReviews({
      status: activeStatus,
      page: 1,
      take: DEFAULT_PAGE_SIZE,
      search: debouncedSearch,
    });
  }, [
    activeStatus,
    debouncedSearch,
    fetchReviews,
  ]);

  // ─── Status counts ────────────────────────────────────────────────────────

  const statusCounts = useMemo(() => {
    return {
      PENDING_REVIEW: stats?.pending ?? 0,

      APPROVED_FOR_XRF:
        stats?.approvedForXRF ?? 0,

      XRF_COMPLETED:
        stats?.xrfCompleted ?? 0,

      APPROVED_FOR_AAS:
        stats?.approvedForAAS ?? 0,

      COMPLETED:
        stats?.completed ?? 0,

      REJECTED:
        stats?.rejected ?? 0,

      FLAGGED:
        stats?.flagged ?? 0,
    };
  }, [stats]);

  // ─── Stats cards ──────────────────────────────────────────────────────────

  const statCards = [
    {
      label: "Pending Review",
      value: stats?.pending,
      icon: ClipboardCheck,
      status: "PENDING_REVIEW",
    },
    {
      label: "Approved for XRF",
      value: stats?.approvedForXRF,
      icon: FlaskConical,
      status: "APPROVED_FOR_XRF",
    },
    {
      label: "XRF Completed",
      value: stats?.xrfCompleted,
      icon: Microscope,
      status: "XRF_COMPLETED",
    },
    {
      label: "Approved for AAS",
      value: stats?.approvedForAAS,
      icon: FlaskConical,
      status: "APPROVED_FOR_AAS",
    },
    {
      label: "Completed",
      value: stats?.completed,
      icon: CheckCircle2,
      status: "COMPLETED",
    },
    {
      label: "Flagged",
      value: stats?.flagged,
      icon: Flag,
      status: "FLAGGED",
    },
    {
      label: "Rejected",
      value: stats?.rejected,
      icon: XCircle,
      status: "REJECTED",
    },
  ];

  // ─── Select sample and fetch full review detail ───────────────────────────

  const handleSelectSample = async (sample) => {
    if (!sample?.id) return;

    // Open immediately so user gets loading feedback
    setIsDetailOpen(true);

    try {
      // This should call GET /reviews/:sampleId inside the hook
      await selectSample(sample);
    } catch (error) {
      console.error(
        "Failed to load sample review detail:",
        error
      );
    }
  };

  // ─── Close detail modal ───────────────────────────────────────────────────

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedSample(null);
  };

  // ─── Refresh ──────────────────────────────────────────────────────────────

  const handleRefresh = async () => {
    await Promise.all([
      fetchStats(),

      fetchReviews({
        status: activeStatus,
        page: pagination.page,
        take: pagination.take,
        search: debouncedSearch,
      }),
    ]);
  };

  // ─── Pagination ───────────────────────────────────────────────────────────

  const totalPages = Math.max(
    1,
    Math.ceil(
      pagination.total / pagination.take
    )
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    fetchReviews({
      status: activeStatus,
      page,
      take: pagination.take,
      search: debouncedSearch,
    });
  };

  return (
    <div
      className={`
        min-h-screen p-4 sm:p-6 lg:p-8
        ${theme.bg}
      `}
    >
      {/* ─── Page Header ───────────────────────────────────────────── */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p
            className="
              text-[10px] font-semibold uppercase
              tracking-[0.16em] text-emerald-600
            "
          >
            Supervisor workspace
          </p>

          <h1
            className={`mt-1 text-xl font-bold sm:text-2xl ${theme.text}`}
          >
            Sample Review
          </h1>

          <p
            className={`mt-1 text-sm ${theme.textMuted}`}
          >
            Review submitted samples and manage laboratory workflow.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || statsLoading}
          className={`
            inline-flex items-center justify-center gap-2
            rounded-lg border px-3 py-2
            text-xs font-semibold transition-colors
            disabled:cursor-not-allowed disabled:opacity-50
            ${theme.border}
            ${theme.card}
            ${theme.hover}
            ${theme.text}
          `}
        >
          <RefreshCw
            size={14}
            className={
              loading || statsLoading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ─── Workflow Stats ────────────────────────────────────────── */}

      <div
        className="
          mb-6 grid grid-cols-2 gap-3
          sm:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-7
        "
      >
        {statCards.map((card) => (
          <ReviewStatCard
            key={card.status}
            {...card}
            active={activeStatus === card.status}
            loading={statsLoading}
            theme={theme}
            onClick={() =>
              setActiveStatus(card.status)
            }
          />
        ))}
      </div>

      {/* ─── Main Workspace ────────────────────────────────────────── */}

      <div
        className={`
          overflow-hidden rounded-xl border
          ${theme.border}
          ${theme.card}
        `}
      >
        {/* Status tabs */}

        <div
          className={`
            overflow-x-auto border-b
            ${theme.border}
          `}
        >
          <div className="flex min-w-max">
            {STATUS_TABS.map((status) => (
              <StatusTab
                key={status}
                status={status}
                count={statusCounts[status]}
                active={activeStatus === status}
                onClick={() =>
                  setActiveStatus(status)
                }
                theme={theme}
              />
            ))}
          </div>
        </div>

        {/* Toolbar */}

        <div
          className={`
            flex flex-col gap-3 border-b p-4
            sm:flex-row sm:items-center sm:justify-between
            ${theme.border}
          `}
        >
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={15}
              className={`
                absolute left-3 top-1/2 -translate-y-1/2
                ${theme.textMuted}
              `}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search samples, products, codes..."
              className={`
                w-full rounded-lg border py-2 pl-9 pr-3
                text-xs outline-none transition
                focus:border-emerald-500 focus:ring-2
                focus:ring-emerald-500/10
                ${theme.border}
                ${theme.bg}
                ${theme.text}
              `}
            />
          </div>

          <p className={`text-xs ${theme.textMuted}`}>
            {pagination.total} sample
            {pagination.total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Error */}

        {error && (
          <div
            className="
              m-4 rounded-lg border border-red-500/20
              bg-red-500/5 px-4 py-3
              text-sm text-red-600 dark:text-red-400
            "
          >
            {error}
          </div>
        )}

        {/* Loading */}

        {loading && (
          <div
            className="
              flex min-h-[320px] items-center
              justify-center
            "
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={24}
                className="animate-spin text-emerald-500"
              />

              <p
                className={`text-xs ${theme.textMuted}`}
              >
                Loading sample reviews...
              </p>
            </div>
          </div>
        )}

        {/* Empty */}

        {!loading && reviews.length === 0 && (
          <div
            className="
              flex min-h-[320px] flex-col
              items-center justify-center px-6 text-center
            "
          >
            <ClipboardCheck
              size={28}
              className="mb-3 text-emerald-500/60"
            />

            <h3
              className={`text-sm font-semibold ${theme.text}`}
            >
              No samples found
            </h3>

            <p
              className={`mt-1 text-xs ${theme.textMuted}`}
            >
              There are currently no samples in this workflow stage.
            </p>
          </div>
        )}

        {/* Samples */}

        {!loading && reviews.length > 0 && (
          <div>
            {reviews.map((sample) => (
              <SampleRow
                key={sample.id}
                sample={sample}
                selected={
                  selectedSample?.id === sample.id
                }
                onClick={() =>
                  handleSelectSample(sample)
                }
                theme={theme}
              />
            ))}
          </div>
        )}

        {/* Pagination */}

        {!loading && pagination.total > pagination.take && (
          <div
            className={`
              flex items-center justify-between border-t px-4 py-3
              ${theme.border}
            `}
          >
            <p
              className={`text-[11px] ${theme.textMuted}`}
            >
              Page {pagination.page} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  handlePageChange(
                    pagination.page - 1
                  )
                }
                className={`
                  rounded-lg border p-1.5
                  disabled:cursor-not-allowed disabled:opacity-40
                  ${theme.border}
                  ${theme.hover}
                `}
              >
                <ChevronLeft
                  size={16}
                  className={theme.text}
                />
              </button>

              <button
                type="button"
                disabled={
                  pagination.page >= totalPages
                }
                onClick={() =>
                  handlePageChange(
                    pagination.page + 1
                  )
                }
                className={`
                  rounded-lg border p-1.5
                  disabled:cursor-not-allowed disabled:opacity-40
                  ${theme.border}
                  ${theme.hover}
                `}
              >
                <ChevronRight
                  size={16}
                  className={theme.text}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Review Detail ─────────────────────────────────────────── */}

      {isDetailOpen && (
        <ReviewDetailModal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          sample={selectedSample}
          reviewDetail={reviewDetail}
          loading={detailLoading}
        />
      )}
    </div>
  );
}