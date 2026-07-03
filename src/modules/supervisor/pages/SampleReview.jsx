/**
 * SampleReview.jsx
 * ─────────────────
 * Thin orchestrator. All data logic lives in useSampleReview.
 * No API calls or business logic here.
 */

import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  CheckCircle, FlaskConical, MapPin, Package, User,
  ShieldCheck, ClipboardList, ArrowRight, AlertCircle,
  ImageIcon, ChevronRight,
} from "lucide-react";

import { useSampleReview } from "../hooks/useSampleReview";
import { STATUS_TABS, STATUS_TAB_META, ISSUE_OPTIONS, REVIEW_DECISIONS } from "../constants/supervisor.constants";

import SurfaceCard   from "../components/ui/SurfaceCard";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge   from "../components/ui/StatusBadge";
import ActionButton  from "../components/ui/ActionButton";
import EmptyState    from "../components/ui/EmptyState";
import InfoTile      from "../components/ui/InfoTile";
import PanelHeader   from "../components/ui/PanelHeader";

// ── Helpers ───────────────────────────────────────────────────────────────────

const getVerificationBadgeType = (status) => {
  if (status === "VERIFIED_ORIGINAL") return "safe";
  if (status === "VERIFIED_FAKE")     return "danger";
  return "neutral";
};

const getReadingStatusType = (status) => {
  if (status === "SAFE")        return "safe";
  if (status === "CONTAMINATED" || status === "FAILED") return "danger";
  if (status === "MODERATE")    return "moderate";
  return "neutral";
};

const getTabCardClass = (status, isActive, theme) => {
  if (isActive) {
    const activeMap = {
      PENDING:  "bg-amber-500 text-white border-amber-500 shadow-sm",
      APPROVED: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
      REJECTED: "bg-red-600 text-white border-red-600 shadow-sm",
      FLAGGED:  "bg-violet-600 text-white border-violet-600 shadow-sm",
    };
    return activeMap[status] || "bg-gray-600 text-white shadow-sm";
  }
  return `${theme.card} ${theme.border} hover:shadow-md hover:-translate-y-[1px]`;
};

// ── Component ─────────────────────────────────────────────────────────────────

const SampleReview = () => {
  const { theme } = useTheme();
  const rv = useSampleReview();

  const productPhotoSrc = rv.getProductPhotoSrc(rv.selectedSample?.productPhotoUrl);

  if (rv.loading && !rv.samples.length) {
    return (
      <SurfaceCard className="p-10 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <div>
            <p className={`text-base font-semibold ${theme.text}`}>Loading samples</p>
            <p className={`text-sm ${theme.textMuted}`}>Preparing review records…</p>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <div className={`${theme.text} space-y-6`}>
      {/* Hero + status tabs */}
      <SurfaceCard className="relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${theme.card}`} />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border ${theme.emeraldBorder} ${theme.emerald} px-3 py-1 text-xs font-semibold ${theme.emeraldText}`}>
              <ClipboardList className="h-3.5 w-3.5" />
              Sample Review Workspace
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Review, approve, reject, and flag submitted samples
            </h1>
            <p className={`mt-3 text-sm md:text-base ${theme.textMuted}`}>
              Inspect product details and heavy metal readings, then take the appropriate review action.
            </p>
          </div>

          {/* Status tab cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            {STATUS_TABS.map((status) => {
              const count = rv.statusCounts[status] ?? 0;
              const isActive = rv.filterStatus === status;
              return (
                <button key={status} onClick={() => rv.setFilterStatus(status)}
                  className={`rounded-2xl border p-4 text-left transition-all duration-200 ${getTabCardClass(status, isActive, theme)}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-90">{status}</p>
                  <p className="mt-2 text-2xl font-bold">{count}</p>
                  <p className="mt-1 text-[11px] opacity-80">{STATUS_TAB_META[status].sub}</p>
                </button>
              );
            })}
          </div>
        </div>
      </SurfaceCard>

      {/* Error */}
      {rv.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          Error: {rv.error}
        </div>
      )}

      {/* Bulk action bar */}
      {rv.bulkSelection.size > 0 && (
        <SurfaceCard className="flex flex-col items-start justify-between gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold sm:text-base">{rv.bulkSelection.size} sample(s) selected</p>
              <p className={`text-xs sm:text-sm ${theme.textMuted}`}>Apply a bulk action to the selected records.</p>
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-2 lg:w-auto">
            <ActionButton onClick={() => rv.handleBulkAction("APPROVED")} disabled={rv.bulkProcessing} className="flex-1 lg:flex-none">Approve</ActionButton>
            <ActionButton onClick={() => rv.handleBulkAction("FLAGGED")} disabled={rv.bulkProcessing} variant="secondary" className="flex-1 lg:flex-none bg-amber-600 border-amber-600 text-white hover:bg-amber-700">Flag</ActionButton>
            <ActionButton onClick={rv.clearBulkSelection} disabled={rv.bulkProcessing} variant="secondary" className="flex-1 lg:flex-none">Clear</ActionButton>
          </div>
        </SurfaceCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Sample list panel ── */}
        <SurfaceCard className="p-5 sm:p-6">
          <SectionHeader
            title={rv.filterStatus}
            subtitle={`Page ${rv.page} of ${rv.totalPages}`}
            badge={<StatusBadge type="safe">{rv.totalCount}</StatusBadge>}
            action={rv.samples.length > 0 ? (
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium sm:text-sm">
                <input type="checkbox" checked={rv.samples.length > 0 && rv.bulkSelection.size === rv.samples.length} onChange={rv.toggleSelectAll} className="h-4 w-4 rounded text-emerald-600" />
                <span>Select all</span>
              </label>
            ) : null}
          />

          <div className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {rv.loading ? (
              <EmptyState title="Refreshing..." description="Please wait while records reload." minHeight="min-h-[220px]" />
            ) : rv.samples.length === 0 ? (
              <EmptyState icon={<AlertCircle className="h-5 w-5 text-gray-500" />} title={`No ${rv.filterStatus.toLowerCase()} samples`} description="There are no records in this category right now." minHeight="min-h-[220px]" />
            ) : (
              rv.samples.map((sample) => (
                <div key={sample.id} className={`rounded-2xl border transition-all duration-200 ${rv.selectedSample?.id === sample.id ? `${theme.emeraldBorder} ${theme.emerald} shadow-sm` : `${theme.border} hover:-translate-y-[1px] hover:shadow-md`}`}>
                  <div className="flex items-start gap-3 p-4">
                    <input type="checkbox" checked={rv.bulkSelection.has(sample.id)} onChange={() => rv.toggleBulkItem(sample.id)} onClick={(e) => e.stopPropagation()} className="mt-1 h-4 w-4 flex-shrink-0 rounded text-emerald-600" />
                    <button onClick={() => rv.handleSelectSample(sample)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{sample.productName || "Unnamed product"}</p>
                          <p className={`mt-1 truncate text-xs ${theme.textMuted}`}>{sample.sampleId || "No Sample ID"}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge type={getVerificationBadgeType(sample.verificationStatus)} className="text-[10px]">{sample.verificationStatus || "UNVERIFIED"}</StatusBadge>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <StatusBadge type="info" className="text-[11px]">{sample.state?.name || "No state"}</StatusBadge>
                        {sample.lga?.name && <StatusBadge type="moderate" className="text-[11px]">{sample.lga.name}</StatusBadge>}
                      </div>
                      <p className={`mt-3 truncate text-xs ${theme.textMuted}`}>by {sample.creator?.fullName || "Unknown collector"}</p>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className={`mt-5 border-t pt-4 ${theme.border}`}>
            <div className="flex items-center justify-between gap-2">
              <ActionButton onClick={() => rv.setPage((p) => Math.max(1, p - 1))} disabled={rv.page <= 1 || rv.loading} variant="secondary" className="px-3 py-2">Prev</ActionButton>
              <p className={`text-xs sm:text-sm ${theme.textMuted}`}>{rv.totalCount} total • {rv.statsLoading ? "updating..." : "live count"}</p>
              <ActionButton onClick={() => { if (rv.page < rv.totalPages) rv.setPage((p) => p + 1); }} disabled={rv.page >= rv.totalPages || rv.loading || rv.totalPages <= 1} variant="secondary" className="px-3 py-2">Next</ActionButton>
            </div>
          </div>
        </SurfaceCard>

        {/* ── Detail + review panel ── */}
        <div className="lg:col-span-2">
          {rv.selectedSample ? (
            <SurfaceCard className="space-y-6 p-5 sm:p-6">
              {rv.samples.length > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-sm ${theme.textMuted}`}>Sample {rv.currentSampleIndex} of {rv.samples.length} on this page</p>
                  <StatusBadge type={getVerificationBadgeType(rv.selectedSample.verificationStatus)}>{rv.selectedSample.verificationStatus || "UNVERIFIED"}</StatusBadge>
                </div>
              )}

              <PanelHeader title="Sample Details" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <InfoTile icon={<Package size={16} className="text-emerald-600" />} label="Product">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{rv.selectedSample.productName || "—"}</p>
                  <p className={`mt-2 text-xs ${theme.textMuted}`}>Brand: {rv.selectedSample.brandName || "—"}</p>
                  <p className={`mt-1 text-xs ${theme.textMuted}`}>Batch: {rv.selectedSample.batchNumber || "—"}</p>
                </InfoTile>
                <InfoTile icon={<User size={16} className="text-emerald-600" />} label="Collector">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{rv.selectedSample.creator?.fullName || "—"}</p>
                  <p className={`mt-2 text-xs ${theme.textMuted}`}>Sample ID: {rv.selectedSample.sampleId || "—"}</p>
                </InfoTile>
                <InfoTile icon={<MapPin size={16} className="text-emerald-600" />} label="Location">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {rv.selectedSample.state?.name || "—"}
                    {rv.selectedSample.lga?.name ? ` › ${rv.selectedSample.lga.name}` : ""}
                    {rv.selectedSample.market?.name ? ` › ${rv.selectedSample.market.name}` : rv.selectedSample.marketName ? ` › ${rv.selectedSample.marketName}` : ""}
                  </p>
                </InfoTile>
              </div>

              {/* Product photo */}
              <SurfaceCard className={`overflow-hidden ${theme.bg}`} padding="p-0">
                <div className="flex items-center justify-between border-b border-gray-200 bg-white/60 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/20">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-emerald-500" />
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${theme.emeraldText}`}>Product Photo</span>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider ${theme.textMuted}`}>Field Capture</span>
                </div>
                {productPhotoSrc && !rv.imageFailed ? (
                  <div className="flex justify-center p-5">
                    <img src={productPhotoSrc} alt="Product Photo" className="max-h-72 w-auto rounded-xl object-contain shadow-sm" onError={() => rv.setImageFailed(true)} />
                  </div>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center gap-3 text-gray-500">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"><ImageIcon className="h-5 w-5" /></div>
                    <p className="text-sm">{rv.selectedSample?.productPhotoUrl ? "Product photo could not be loaded" : "No product photo captured"}</p>
                  </div>
                )}
              </SurfaceCard>

              {/* Heavy metal readings */}
              <div>
                <SectionHeader title="Heavy Metal Readings" icon={<FlaskConical size={16} className="text-emerald-600" />} />
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {rv.normalizedReadings.map((reading) => (
                    <SurfaceCard key={reading.id} className={theme.bg} padding="p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold ${theme.text}`}>{reading.heavyMetal}</p>
                        <StatusBadge type={getReadingStatusType(reading.status)}>{reading.status}</StatusBadge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm"><span className={theme.textMuted}>XRF</span><span className="font-semibold">{reading.xrfReading}</span></div>
                        <div className="flex items-center justify-between text-sm"><span className={theme.textMuted}>AAS</span><span className="font-semibold">{reading.aasReading}</span></div>
                      </div>
                    </SurfaceCard>
                  ))}
                </div>
                {(!rv.selectedSample.heavyMetalReadings || rv.selectedSample.heavyMetalReadings.length === 0) && (
                  <p className={`mt-3 text-xs ${theme.textMuted}`}>No heavy metal readings returned — fallback values shown for visibility.</p>
                )}
              </div>

              {/* Review form */}
              <div className={`border-t pt-5 ${theme.border}`}>
                <SectionHeader title="Review Sample" subtitle="Select a decision, flag issues if needed, and add notes." />

                {/* Decision */}
                <div className="mt-5">
                  <label className="mb-2 block text-xs font-semibold sm:text-sm">Decision</label>
                  <div className="grid grid-cols-3 gap-2">
                    {REVIEW_DECISIONS.map((status) => (
                      <button key={status} onClick={() => rv.setReviewStatus(status)}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                          rv.reviewForm.status === status
                            ? status === "APPROVED" ? "border-emerald-600 bg-emerald-600 text-white"
                              : status === "REJECTED" ? "border-red-600 bg-red-600 text-white"
                              : "border-amber-500 bg-amber-500 text-white"
                            : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/40"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issues */}
                <div className="mt-5">
                  <label className="mb-2 block text-xs font-semibold sm:text-sm">Flag Issues</label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {ISSUE_OPTIONS.map((issue) => (
                      <label key={issue} className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/40 sm:text-sm">
                        <input type="checkbox" checked={rv.reviewForm.issues.includes(issue)} onChange={() => rv.toggleIssue(issue)} className="h-4 w-4 flex-shrink-0 rounded text-emerald-600" />
                        <span>{issue}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div className="mt-5">
                  <label className="mb-2 block text-xs font-semibold sm:text-sm">
                    Comments
                    {rv.reviewForm.status === "REJECTED" && <span className="ml-1 text-red-600 dark:text-red-400">(required for reject)</span>}
                  </label>
                  <textarea
                    value={rv.reviewForm.comments}
                    onChange={(e) => rv.setReviewComments(e.target.value)}
                    rows="4"
                    placeholder={rv.reviewForm.status === "REJECTED" ? "Provide a reason for rejection..." : "Add notes or observations..."}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-base ${theme.border} ${theme.card}`}
                  />
                </div>

                {/* Submit */}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <ActionButton onClick={rv.handleSubmitReview} disabled={rv.reviewing} className="flex-1">
                    {rv.reviewing ? "Submitting..." : "Submit Review"}
                  </ActionButton>
                  {rv.samples.length > 1 && (
                    <ActionButton type="button" onClick={rv.goToNextSample} variant="ghost">
                      Next sample <ArrowRight className="h-4 w-4" />
                    </ActionButton>
                  )}
                </div>
              </div>
            </SurfaceCard>
          ) : (
            <SurfaceCard className={rv.samples.length === 0 ? "bg-transparent" : ""}>
              <EmptyState
                icon={<ClipboardList className="h-5 w-5 text-gray-500" />}
                title={rv.samples.length === 0 ? "No sample selected — this page has no records" : "Select a sample to review"}
                description={rv.samples.length === 0 ? "When records are available, sample details will appear here." : "Product, reading, and review information will appear here."}
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