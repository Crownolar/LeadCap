/**
 * SampleReview.jsx
 * ─────────────────
 * Supervisor Sample Review Workspace
 *
 * Presentation layer only.
 * Data/business logic remains inside useSampleReview.
 */

import React from "react";
import { useTheme } from "../../../context/ThemeContext";
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
  Search,
  RefreshCw,
  Check,
  X,
  Flag,
  CalendarDays,
  Layers3,
  Activity,
} from "lucide-react";

import { useSampleReview } from "../hooks/useSampleReview";
import {
  STATUS_TABS,
  STATUS_TAB_META,
  ISSUE_OPTIONS,
  REVIEW_DECISIONS,
} from "../constants/supervisor.constants";

import SurfaceCard from "../components/ui/SurfaceCard";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import ActionButton from "../components/ui/ActionButton";
import EmptyState from "../components/ui/EmptyState";
import InfoTile from "../components/ui/InfoTile";
import PanelHeader from "../components/ui/PanelHeader";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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

const getDecisionIcon = (status) => {
  if (status === "APPROVED") return <Check className="h-4 w-4" />;
  if (status === "REJECTED") return <X className="h-4 w-4" />;
  return <Flag className="h-4 w-4" />;
};

const getDecisionClass = (status, active) => {
  if (!active) {
    return "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:bg-gray-800/60";
  }

  if (status === "APPROVED") {
    return "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20";
  }

  if (status === "REJECTED") {
    return "border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/20";
  }

  return "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/20";
};

const getTabClass = (status, active, theme) => {
  if (active) {
    const classes = {
      PENDING:
        "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/20",
      APPROVED:
        "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20",
      REJECTED:
        "border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/20",
      FLAGGED:
        "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-600/20",
    };

    return classes[status] || "border-gray-600 bg-gray-600 text-white";
  }

  return `${theme.card} ${theme.border} hover:-translate-y-0.5 hover:shadow-md`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const SampleReview = () => {
  const { theme } = useTheme();
  const rv = useSampleReview();

  const productPhotoSrc = rv.getProductPhotoSrc(
    rv.selectedSample?.productPhotoUrl
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Loading
  // ───────────────────────────────────────────────────────────────────────────

  if (rv.loading && !rv.samples.length) {
    return (
      <div className="min-h-[500px]">
        <SurfaceCard className="flex min-h-[420px] items-center justify-center rounded-3xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
            </div>

            <p className={`text-base font-bold ${theme.text}`}>
              Loading review workspace
            </p>

            <p className={`mt-2 text-sm ${theme.textMuted}`}>
              Preparing submitted samples...
            </p>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className={`${theme.text} space-y-6 pb-10`}>
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════════ */}

      <SurfaceCard className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-blue-500/[0.04]" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
                <ClipboardList className="h-3.5 w-3.5" />
                Supervisor Workspace
              </div>

              <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                Sample Review
              </h1>

              <p className={`mt-2 max-w-2xl text-sm leading-6 ${theme.textMuted}`}>
                Inspect submitted samples, verify laboratory readings, and
                make review decisions before records move further through the
                LeadCap workflow.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`hidden items-center gap-2 rounded-2xl border px-4 py-3 sm:flex ${theme.border} ${theme.card}`}
              >
                <Activity className="h-4 w-4 text-emerald-500" />

                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
                    Records
                  </p>

                  <p className="text-sm font-bold">
                    {rv.totalCount}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => rv.setPage((p) => p)}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              >
                <RefreshCw
                  className={`h-4 w-4 ${rv.loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATUS OVERVIEW
      ═══════════════════════════════════════════════════════════════════════ */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUS_TABS.map((status) => {
          const count = rv.statusCounts[status] ?? 0;
          const active = rv.filterStatus === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() => rv.setFilterStatus(status)}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${getTabClass(
                status,
                active,
                theme
              )}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">
                    {status}
                  </p>

                  <p className="mt-2 text-2xl font-black sm:text-3xl">
                    {count}
                  </p>
                </div>

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    active
                      ? "bg-white/15"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {status === "PENDING" && (
                    <ClipboardList className="h-4 w-4" />
                  )}

                  {status === "APPROVED" && (
                    <CheckCircle className="h-4 w-4" />
                  )}

                  {status === "REJECTED" && (
                    <X className="h-4 w-4" />
                  )}

                  {status === "FLAGGED" && (
                    <Flag className="h-4 w-4" />
                  )}
                </div>
              </div>

              <p className="mt-2 text-[11px] opacity-70">
                {STATUS_TAB_META[status]?.sub}
              </p>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ERROR
      ═══════════════════════════════════════════════════════════════════════ */}

      {rv.error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">Unable to load review records</p>
            <p className="mt-0.5 opacity-80">{rv.error}</p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          BULK ACTION
      ═══════════════════════════════════════════════════════════════════════ */}

      {rv.bulkSelection.size > 0 && (
        <SurfaceCard className="overflow-hidden border-emerald-200 dark:border-emerald-900/40">
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <CheckCircle className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold">
                  {rv.bulkSelection.size} sample
                  {rv.bulkSelection.size !== 1 ? "s" : ""} selected
                </p>

                <p className={`text-xs ${theme.textMuted}`}>
                  Apply an action to all selected records.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionButton
                onClick={() => rv.handleBulkAction("APPROVED")}
                disabled={rv.bulkProcessing}
              >
                <Check className="h-4 w-4" />
                Approve
              </ActionButton>

              <ActionButton
                onClick={() => rv.handleBulkAction("FLAGGED")}
                disabled={rv.bulkProcessing}
                variant="secondary"
                className="border-amber-500 bg-amber-500 text-white hover:bg-amber-600"
              >
                <Flag className="h-4 w-4" />
                Flag
              </ActionButton>

              <ActionButton
                onClick={rv.clearBulkSelection}
                disabled={rv.bulkProcessing}
                variant="secondary"
              >
                Clear
              </ActionButton>
            </div>
          </div>
        </SurfaceCard>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN WORKSPACE
      ═══════════════════════════════════════════════════════════════════════ */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* ─────────────────────────────────────────────────────────────────────
            SAMPLE QUEUE
        ───────────────────────────────────────────────────────────────────── */}

        <SurfaceCard className="overflow-hidden rounded-3xl p-0">
          <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold">
                    Review Queue
                  </h2>

                  <StatusBadge type="info">
                    {rv.totalCount}
                  </StatusBadge>
                </div>

                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  {rv.filterStatus.toLowerCase()} submissions
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={
                    rv.samples.length > 0 &&
                    rv.bulkSelection.size === rv.samples.length
                  }
                  onChange={rv.toggleSelectAll}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                All
              </label>
            </div>

            {/* Visual search field */}
            <div
              className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2.5 ${theme.border} ${theme.bg}`}
            >
              <Search className="h-4 w-4 text-gray-400" />

              <span className={`text-xs ${theme.textMuted}`}>
                Browse submitted samples
              </span>
            </div>
          </div>

          <div className="max-h-[650px] overflow-y-auto p-3 sm:p-4">
            {rv.loading ? (
              <EmptyState
                title="Refreshing queue..."
                description="Please wait while review records reload."
                minHeight="min-h-[260px]"
              />
            ) : rv.samples.length === 0 ? (
              <EmptyState
                icon={<AlertCircle className="h-5 w-5 text-gray-500" />}
                title={`No ${rv.filterStatus.toLowerCase()} samples`}
                description="There are no records in this category right now."
                minHeight="min-h-[260px]"
              />
            ) : (
              <div className="space-y-2">
                {rv.samples.map((sample) => {
                  const selected =
                    rv.selectedSample?.id === sample.id;

                  return (
                    <div
                      key={sample.id}
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${
                        selected
                          ? "border-emerald-400 bg-emerald-50/70 shadow-md dark:border-emerald-700 dark:bg-emerald-900/10"
                          : `${theme.border} ${theme.card} hover:-translate-y-0.5 hover:shadow-md`
                      }`}
                    >
                      {selected && (
                        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500" />
                      )}

                      <div className="flex gap-3 p-4">
                        <input
                          type="checkbox"
                          checked={rv.bulkSelection.has(sample.id)}
                          onChange={() =>
                            rv.toggleBulkItem(sample.id)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 h-4 w-4 shrink-0 rounded text-emerald-600 focus:ring-emerald-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            rv.handleSelectSample(sample)
                          }
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">
                                {sample.productName ||
                                  "Unnamed product"}
                              </p>

                              <p
                                className={`mt-1 truncate text-[11px] ${theme.textMuted}`}
                              >
                                {sample.sampleId ||
                                  "No sample ID"}
                              </p>
                            </div>

                            <ChevronRight
                              className={`mt-0.5 h-4 w-4 shrink-0 transition-transform ${
                                selected
                                  ? "text-emerald-600"
                                  : "text-gray-400 group-hover:translate-x-0.5"
                              }`}
                            />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <StatusBadge
                              type={getVerificationBadgeType(
                                sample.verificationStatus
                              )}
                              className="text-[10px]"
                            >
                              {sample.verificationStatus ||
                                "UNVERIFIED"}
                            </StatusBadge>

                            {sample.state?.name && (
                              <StatusBadge
                                type="info"
                                className="text-[10px]"
                              >
                                {sample.state.name}
                              </StatusBadge>
                            )}
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-gray-400" />

                            <p
                              className={`truncate text-[11px] ${theme.textMuted}`}
                            >
                              {sample.creator?.fullName ||
                                "Unknown collector"}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div
            className={`border-t p-4 ${theme.border}`}
          >
            <div className="flex items-center justify-between gap-2">
              <ActionButton
                onClick={() =>
                  rv.setPage((p) => Math.max(1, p - 1))
                }
                disabled={rv.page <= 1 || rv.loading}
                variant="secondary"
                className="px-3 py-2"
              >
                Prev
              </ActionButton>

              <div className="text-center">
                <p className="text-xs font-semibold">
                  Page {rv.page} / {rv.totalPages}
                </p>

                <p className={`mt-0.5 text-[10px] ${theme.textMuted}`}>
                  {rv.totalCount} total
                </p>
              </div>

              <ActionButton
                onClick={() => {
                  if (rv.page < rv.totalPages) {
                    rv.setPage((p) => p + 1);
                  }
                }}
                disabled={
                  rv.page >= rv.totalPages ||
                  rv.loading ||
                  rv.totalPages <= 1
                }
                variant="secondary"
                className="px-3 py-2"
              >
                Next
              </ActionButton>
            </div>
          </div>
        </SurfaceCard>

        {/* ─────────────────────────────────────────────────────────────────────
            SAMPLE DETAILS
        ───────────────────────────────────────────────────────────────────── */}

        <div className="min-w-0">
          {rv.selectedSample ? (
            <div className="space-y-6">
              {/* Selected sample heading */}
              <SurfaceCard className="rounded-3xl p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <Package className="h-4 w-4" />
                      </span>

                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}
                      >
                        Selected Sample
                      </p>
                    </div>

                    <h2 className="mt-3 truncate text-xl font-black">
                      {rv.selectedSample.productName ||
                        "Unnamed product"}
                    </h2>

                    <p className={`mt-1 text-xs ${theme.textMuted}`}>
                      {rv.selectedSample.sampleId ||
                        "No sample ID"}
                    </p>
                  </div>

                  <StatusBadge
                    type={getVerificationBadgeType(
                      rv.selectedSample.verificationStatus
                    )}
                  >
                    {rv.selectedSample.verificationStatus ||
                      "UNVERIFIED"}
                  </StatusBadge>
                </div>

                {rv.samples.length > 0 && (
                  <div
                    className={`mt-5 flex items-center justify-between border-t pt-4 ${theme.border}`}
                  >
                    <p className={`text-xs ${theme.textMuted}`}>
                      Sample {rv.currentSampleIndex} of{" "}
                      {rv.samples.length} on this page
                    </p>

                    {rv.samples.length > 1 && (
                      <button
                        type="button"
                        onClick={rv.goToNextSample}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        Next sample
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </SurfaceCard>

              {/* Sample identity */}
              <SurfaceCard className="rounded-3xl p-5 sm:p-6">
                <PanelHeader title="Sample Information" />

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoTile
                    icon={
                      <Package className="h-4 w-4 text-emerald-600" />
                    }
                    label="Product"
                  >
                    <p className="text-sm font-bold">
                      {rv.selectedSample.productName || "—"}
                    </p>

                    <p className={`mt-2 text-xs ${theme.textMuted}`}>
                      Brand: {rv.selectedSample.brandName || "—"}
                    </p>

                    <p className={`mt-1 text-xs ${theme.textMuted}`}>
                      Batch: {rv.selectedSample.batchNumber || "—"}
                    </p>
                  </InfoTile>

                  <InfoTile
                    icon={
                      <User className="h-4 w-4 text-emerald-600" />
                    }
                    label="Collector"
                  >
                    <p className="text-sm font-bold">
                      {rv.selectedSample.creator?.fullName ||
                        "—"}
                    </p>

                    <p className={`mt-2 text-xs ${theme.textMuted}`}>
                      Sample ID:{" "}
                      {rv.selectedSample.sampleId || "—"}
                    </p>
                  </InfoTile>

                  <InfoTile
                    icon={
                      <MapPin className="h-4 w-4 text-emerald-600" />
                    }
                    label="Collection Location"
                  >
                    <p className="text-sm font-bold">
                      {rv.selectedSample.state?.name || "—"}
                    </p>

                    <p className={`mt-2 text-xs ${theme.textMuted}`}>
                      {rv.selectedSample.lga?.name || "LGA unavailable"}
                      {rv.selectedSample.market?.name
                        ? ` • ${rv.selectedSample.market.name}`
                        : rv.selectedSample.marketName
                        ? ` • ${rv.selectedSample.marketName}`
                        : ""}
                    </p>
                  </InfoTile>
                </div>
              </SurfaceCard>

              {/* Product photo */}
              <SurfaceCard className="overflow-hidden rounded-3xl p-0">
                <div
                  className={`flex items-center justify-between border-b px-5 py-4 ${theme.border}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                      <ImageIcon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        Product Evidence
                      </p>

                      <p
                        className={`text-[11px] ${theme.textMuted}`}
                      >
                        Field capture
                      </p>
                    </div>
                  </div>

                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>

                {productPhotoSrc && !rv.imageFailed ? (
                  <div className="flex min-h-[260px] items-center justify-center bg-gray-50 p-6 dark:bg-gray-950/30">
                    <img
                      src={productPhotoSrc}
                      alt="Product Photo"
                      className="max-h-[360px] max-w-full rounded-2xl object-contain shadow-lg"
                      onError={() => rv.setImageFailed(true)}
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 bg-gray-50 px-5 dark:bg-gray-950/30">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    </div>

                    <p className="text-sm font-semibold text-gray-500">
                      {rv.selectedSample?.productPhotoUrl
                        ? "Product photo could not be loaded"
                        : "No product photo captured"}
                    </p>
                  </div>
                )}
              </SurfaceCard>

              {/* Heavy metal readings */}
              <SurfaceCard className="rounded-3xl p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                        <FlaskConical className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold">
                          Heavy Metal Readings
                        </h3>

                        <p
                          className={`text-[11px] ${theme.textMuted}`}
                        >
                          Laboratory analysis results
                        </p>
                      </div>
                    </div>
                  </div>

                  <StatusBadge type="info">
                    {rv.normalizedReadings.length} readings
                  </StatusBadge>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {rv.normalizedReadings.map((reading) => (
                    <div
                      key={reading.id}
                      className={`rounded-2xl border p-4 ${theme.border} ${theme.bg}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold">
                          {reading.heavyMetal}
                        </p>

                        <StatusBadge
                          type={getReadingStatusType(
                            reading.status
                          )}
                        >
                          {reading.status}
                        </StatusBadge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-white p-3 dark:bg-gray-900/60">
                          <p
                            className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                          >
                            XRF
                          </p>

                          <p className="mt-1 text-sm font-black">
                            {reading.xrfReading}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3 dark:bg-gray-900/60">
                          <p
                            className={`text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                          >
                            AAS
                          </p>

                          <p className="mt-1 text-sm font-black">
                            {reading.aasReading}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(!rv.selectedSample.heavyMetalReadings ||
                  rv.selectedSample.heavyMetalReadings.length ===
                    0) && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      No heavy metal readings were returned.
                      Fallback values are shown for visibility.
                    </span>
                  </div>
                )}
              </SurfaceCard>

              {/* Review decision */}
              <SurfaceCard className="rounded-3xl border-emerald-200 p-5 sm:p-6 dark:border-emerald-900/40">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <ClipboardList className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-base font-black">
                        Review Decision
                      </h3>

                      <p
                        className={`text-xs ${theme.textMuted}`}
                      >
                        Determine what happens to this sample next.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decision */}
                <div className="mt-6">
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider">
                    Decision
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {REVIEW_DECISIONS.map((status) => {
                      const active =
                        rv.reviewForm.status === status;

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            rv.setReviewStatus(status)
                          }
                          className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all ${getDecisionClass(
                            status,
                            active
                          )}`}
                        >
                          {getDecisionIcon(status)}
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Issues */}
                <div className="mt-6">
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider">
                    Flag Issues
                  </label>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {ISSUE_OPTIONS.map((issue) => {
                      const checked =
                        rv.reviewForm.issues.includes(issue);

                      return (
                        <label
                          key={issue}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-xs font-medium transition ${
                            checked
                              ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/10 dark:text-amber-300"
                              : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              rv.toggleIssue(issue)
                            }
                            className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />

                          <span>{issue}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Comments */}
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider">
                      Reviewer Comments
                    </label>

                    {rv.reviewForm.status === "REJECTED" && (
                      <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                        Required for rejection
                      </span>
                    )}
                  </div>

                  <textarea
                    value={rv.reviewForm.comments}
                    onChange={(e) =>
                      rv.setReviewComments(e.target.value)
                    }
                    rows="5"
                    placeholder={
                      rv.reviewForm.status === "REJECTED"
                        ? "Provide a clear reason for rejection..."
                        : "Add notes, observations, or review context..."
                    }
                    className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${theme.border} ${theme.card}`}
                  />
                </div>

                {/* Submit */}
                <div
                  className={`mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between ${theme.border}`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />

                    <p
                      className={`text-[11px] ${theme.textMuted}`}
                    >
                      Review action will be recorded against this
                      sample.
                    </p>
                  </div>

                  <ActionButton
                    onClick={rv.handleSubmitReview}
                    disabled={rv.reviewing}
                    className="w-full sm:w-auto sm:min-w-[180px]"
                  >
                    {rv.reviewing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Review
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </ActionButton>
                </div>
              </SurfaceCard>
            </div>
          ) : (
            <SurfaceCard className="rounded-3xl">
              <EmptyState
                icon={
                  <ClipboardList className="h-6 w-6 text-gray-500" />
                }
                title={
                  rv.samples.length === 0
                    ? "No samples available"
                    : "Select a sample to begin review"
                }
                description={
                  rv.samples.length === 0
                    ? "When submitted records become available, they will appear in the review queue."
                    : "Select a record from the review queue to inspect its product, location, laboratory readings, and verification information."
                }
                minHeight="min-h-[500px]"
              />
            </SurfaceCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default SampleReview;