import {
  ArrowRight,
  ClipboardList,
  FlaskConical,
  ImageIcon,
  MapPin,
  Package,
  ShieldCheck,
  User,
} from "lucide-react";

import InfoTile from "./ui/InfoTile";
import PanelHeader from "./ui/PanelHeader";
import StatusBadge from "./ui/StatusBadge";
import SurfaceCard from "./ui/SurfaceCard";
import SectionHeader from "./ui/SectionHeader";

import {
  STATUS_TABS,
  STATUS_TAB_META,
  ISSUE_OPTIONS,
  REVIEW_DECISIONS,
} from "../constants/supervisor.constants";
import ActionButton from "./ui/ActionButton";
import EmptyState from "./ui/EmptyState";
import { getVerificationBadgeType, getReadingStatusType } from "../utils/utils";

const SampleReviewCard = ({ rv, productPhotoSrc, theme }) => {
  return (
    <div className='lg:col-span-2'>
      {rv.selectedSample ? (
        <SurfaceCard className='space-y-6 p-5 sm:p-6'>
          {rv.samples.length > 0 && (
            <div className='flex items-center justify-between gap-3'>
              <p className={`text-sm ${theme.textMuted}`}>
                Sample {rv.currentSampleIndex} of {rv.samples.length} on this
                page
              </p>
              <StatusBadge
                type={getVerificationBadgeType(
                  rv.selectedSample.verificationStatus,
                )}
              >
                {rv.selectedSample.verificationStatus || "UNVERIFIED"}
              </StatusBadge>
            </div>
          )}
          <PanelHeader title='Sample Details' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            <InfoTile
              icon={<Package size={16} className='text-emerald-600' />}
              label='Product'
            >
              <p className='text-sm font-semibold text-gray-900 dark:text-white'>
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
              icon={<User size={16} className='text-emerald-600' />}
              label='Collector'
            >
              <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                {rv.selectedSample.creator?.fullName || "—"}
              </p>
              <p className={`mt-2 text-xs ${theme.textMuted}`}>
                Sample ID: {rv.selectedSample.sampleId || "—"}
              </p>
            </InfoTile>
            <InfoTile
              icon={<MapPin size={16} className='text-emerald-600' />}
              label='Location'
            >
              <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                {rv.selectedSample.state?.name || "—"}
                {rv.selectedSample.lga?.name
                  ? ` › ${rv.selectedSample.lga.name}`
                  : ""}
                {rv.selectedSample.market?.name
                  ? ` › ${rv.selectedSample.market.name}`
                  : rv.selectedSample.marketName
                    ? ` › ${rv.selectedSample.marketName}`
                    : ""}
              </p>
            </InfoTile>
          </div>
          {/* Product photo */}
          <SurfaceCard className={`overflow-hidden ${theme.bg}`} padding='p-0'>
            <div className='flex items-center justify-between border-b border-gray-200 bg-white/60 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/20'>
              <div className='flex items-center gap-2'>
                <ShieldCheck size={15} className='text-emerald-500' />
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider ${theme.emeraldText}`}
                >
                  Product Photo
                </span>
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider ${theme.textMuted}`}
              >
                Field Capture
              </span>
            </div>
            {productPhotoSrc && !rv.imageFailed ? (
              <div className='flex justify-center p-5'>
                <img
                  src={productPhotoSrc}
                  alt='Product Photo'
                  className='max-h-72 w-auto rounded-xl object-contain shadow-sm'
                  onError={() => rv.setImageFailed(true)}
                />
              </div>
            ) : (
              <div className='flex h-48 flex-col items-center justify-center gap-3 text-gray-500'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800'>
                  <ImageIcon className='h-5 w-5' />
                </div>
                <p className='text-sm'>
                  {rv.selectedSample?.productPhotoUrl
                    ? "Product photo could not be loaded"
                    : "No product photo captured"}
                </p>
              </div>
            )}
          </SurfaceCard>
          {/* Heavy metal readings */}
          <div>
            <SectionHeader
              title='Heavy Metal Readings'
              icon={<FlaskConical size={16} className='text-emerald-600' />}
            />
            <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
              {rv.normalizedReadings.map((reading) => (
                <SurfaceCard
                  key={reading.id}
                  className={theme.bg}
                  padding='p-4'
                >
                  <div className='mb-3 flex items-center justify-between gap-2'>
                    <p className={`text-sm font-semibold ${theme.text}`}>
                      {reading.heavyMetal}
                    </p>
                    <StatusBadge type={getReadingStatusType(reading.status)}>
                      {reading.status}
                    </StatusBadge>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className={theme.textMuted}>XRF</span>
                      <span className='font-semibold'>
                        {reading.xrfReading}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className={theme.textMuted}>AAS</span>
                      <span className='font-semibold'>
                        {reading.aasReading}
                      </span>
                    </div>
                  </div>
                </SurfaceCard>
              ))}
            </div>
            {(!rv.selectedSample.heavyMetalReadings ||
              rv.selectedSample.heavyMetalReadings.length === 0) && (
              <p className={`mt-3 text-xs ${theme.textMuted}`}>
                No heavy metal readings returned — fallback values shown for
                visibility.
              </p>
            )}
          </div>
          {/* Review form */}
          <div className={`border-t pt-5 ${theme.border}`}>
            <SectionHeader
              title='Review Sample'
              subtitle='Select a decision, flag issues if needed, and add notes.'
            />

            {/* Decision */}
            <div className='mt-5'>
              <label className='mb-2 block text-xs font-semibold sm:text-sm'>
                Decision
              </label>
              <div className='grid grid-cols-3 gap-2'>
                {REVIEW_DECISIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => rv.setReviewStatus(status)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                      rv.reviewForm.status === status
                        ? status === "APPROVED"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : status === "REJECTED"
                            ? "border-red-600 bg-red-600 text-white"
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
            <div className='mt-5'>
              <label className='mb-2 block text-xs font-semibold sm:text-sm'>
                Flag Issues
              </label>
              <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                {ISSUE_OPTIONS.map((issue) => (
                  <label
                    key={issue}
                    className='flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/40 sm:text-sm'
                  >
                    <input
                      type='checkbox'
                      checked={rv.reviewForm.issues.includes(issue)}
                      onChange={() => rv.toggleIssue(issue)}
                      className='h-4 w-4 flex-shrink-0 rounded text-emerald-600'
                    />
                    <span>{issue}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className='mt-5'>
              <label className='mb-2 block text-xs font-semibold sm:text-sm'>
                Comments
                {rv.reviewForm.status === "REJECTED" && (
                  <span className='ml-1 text-red-600 dark:text-red-400'>
                    (required for reject)
                  </span>
                )}
              </label>
              <textarea
                value={rv.reviewForm.comments}
                onChange={(e) => rv.setReviewComments(e.target.value)}
                rows='4'
                placeholder={
                  rv.reviewForm.status === "REJECTED"
                    ? "Provide a reason for rejection..."
                    : "Add notes or observations..."
                }
                className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-base ${theme.border} ${theme.card}`}
              />
            </div>

            {/* Submit */}
            <div className='mt-5 flex flex-col gap-3 sm:flex-row'>
              <ActionButton
                onClick={rv.handleSubmitReview}
                disabled={rv.reviewing}
                className='flex-1'
              >
                {rv.reviewing ? "Submitting..." : "Submit Review"}
              </ActionButton>
              {rv.samples.length > 1 && (
                <ActionButton
                  type='button'
                  onClick={rv.goToNextSample}
                  variant='ghost'
                >
                  Next sample <ArrowRight className='h-4 w-4' />
                </ActionButton>
              )}
            </div>
          </div>
        </SurfaceCard>
      ) : (
        <SurfaceCard
          className={rv.samples.length === 0 ? "bg-transparent" : ""}
        >
          <EmptyState
            icon={<ClipboardList className='h-5 w-5 text-gray-500' />}
            title={
              rv.samples.length === 0
                ? "No sample selected — this page has no records"
                : "Select a sample to review"
            }
            description={
              rv.samples.length === 0
                ? "When records are available, sample details will appear here."
                : "Product, reading, and review information will appear here."
            }
            minHeight='min-h-[260px]'
          />
        </SurfaceCard>
      )}
    </div>
  );
};

export default SampleReviewCard;
