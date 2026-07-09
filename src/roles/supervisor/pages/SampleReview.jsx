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
  TruckElectric,
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
import { useEffect, useState } from "react";
import SampleReviewCard from "../components/SampleReviewCard";
import {
  getVerificationBadgeType,
  getReadingStatusType,
  getTabCardClass,
} from "../utils/utils";
import Modal from "../../../components/common/ModalWrapper";

// ── Component ─────────────────────────────────────────────────────────────────

const SampleReview = () => {
  const { theme } = useTheme();
  const rv = useSampleReview();
  const screenResponsiveBreakpoint = 1021;

  const productPhotoSrc = rv.getProductPhotoSrc(
    rv.selectedSample?.productPhotoUrl,
  );
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [openModal, setOpenModal] = useState({
    status: false,
    sample: rv?.selectedSample && null,
  });

  useEffect(() => {
    function handleResize() {
      setScreenSize(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (rv.loading && !rv.samples.length) {
    return (
      <SurfaceCard className='p-10 text-center'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <div className='h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin' />
          <div>
            <p className={`text-base font-semibold ${theme.text}`}>
              Loading samples
            </p>
            <p className={`text-sm ${theme.textMuted}`}>
              Preparing review records…
            </p>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <div className={`${theme.text} space-y-6`}>
      {/* Hero + status tabs */}
      <SurfaceCard className='relative overflow-hidden rounded-3xl p-6 md:p-8'>
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${theme.card}`}
        />
        <div className='relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-2xl'>
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full border ${theme.emeraldBorder} ${theme.emerald} px-3 py-1 text-xs font-semibold ${theme.emeraldText}`}
            >
              <ClipboardList className='h-3.5 w-3.5' />
              Sample Review Workspace
            </div>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
              Review, approve, reject, and flag submitted samples
            </h1>
            <p className={`mt-3 text-sm md:text-base ${theme.textMuted}`}>
              Inspect product details and heavy metal readings, then take the
              appropriate review action.
            </p>
          </div>

          {/* Status tab cards */}
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]'>
            {STATUS_TABS.map((status) => {
              const count = rv.statusCounts[status] ?? 0;
              const isActive = rv.filterStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => rv.setFilterStatus(status)}
                  className={`rounded-2xl border p-4 text-left transition-all duration-200 ${getTabCardClass(status, isActive, theme)}`}
                >
                  <p className='text-xs font-semibold uppercase tracking-wide opacity-90'>
                    {status}
                  </p>
                  <p className='mt-2 text-2xl font-bold'>{count}</p>
                  <p className='mt-1 text-[11px] opacity-80'>
                    {STATUS_TAB_META[status].sub}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </SurfaceCard>

      {/* Error */}
      {rv.error && (
        <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300'>
          Error: {rv.error}
        </div>
      )}

      {/* Bulk action bar */}
      {rv.bulkSelection.size > 0 && (
        <SurfaceCard className='flex flex-col items-start justify-between gap-4 p-4 sm:p-5 lg:flex-row lg:items-center'>
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'>
              <CheckCircle className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-semibold sm:text-base'>
                {rv.bulkSelection.size} sample(s) selected
              </p>
              <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
                Apply a bulk action to the selected records.
              </p>
            </div>
          </div>
          <div className='flex w-full flex-wrap gap-2 lg:w-auto'>
            <ActionButton
              onClick={() => rv.handleBulkAction("APPROVED")}
              disabled={rv.bulkProcessing}
              className='flex-1 lg:flex-none'
            >
              Approve
            </ActionButton>
            <ActionButton
              onClick={() => rv.handleBulkAction("FLAGGED")}
              disabled={rv.bulkProcessing}
              variant='secondary'
              className='flex-1 lg:flex-none bg-amber-600 border-amber-600  hover:bg-amber-700'
            >
              Flag
            </ActionButton>
            <ActionButton
              onClick={rv.clearBulkSelection}
              disabled={rv.bulkProcessing}
              variant='secondary'
              className='flex-1 lg:flex-none'
            >
              Clear
            </ActionButton>
          </div>
        </SurfaceCard>
      )}

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* ── Sample list panel ── */}
        <SurfaceCard className='p-5 sm:p-6'>
          <SectionHeader
            title={rv.filterStatus}
            subtitle={`Page ${rv.page} of ${rv.totalPages}`}
            badge={<StatusBadge type='safe'>{rv.totalCount}</StatusBadge>}
            action={
              rv.samples.length > 0 ? (
                <label className='flex cursor-pointer items-center gap-2 text-xs font-medium sm:text-sm'>
                  <input
                    type='checkbox'
                    checked={
                      rv.samples.length > 0 &&
                      rv.bulkSelection.size === rv.samples.length
                    }
                    onChange={rv.toggleSelectAll}
                    className='h-4 w-4 rounded text-emerald-600'
                  />
                  <span>Select all</span>
                </label>
              ) : null
            }
          />

          <div className='mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1'>
            {rv.loading ? (
              <EmptyState
                title='Refreshing...'
                description='Please wait while records reload.'
                minHeight='min-h-[220px]'
              />
            ) : rv.samples.length === 0 ? (
              <EmptyState
                icon={<AlertCircle className='h-5 w-5 text-gray-500' />}
                title={`No ${rv.filterStatus.toLowerCase()} samples`}
                description='There are no records in this category right now.'
                minHeight='min-h-[220px]'
              />
            ) : (
              rv.samples.map((sample) => (
                <div
                  key={sample.id}
                  className={`rounded-2xl border transition-all duration-200 ${rv.selectedSample?.id === sample.id ? `${theme.emeraldBorder} ${theme.emerald} shadow-sm` : `${theme.border} hover:-translate-y-[1px] hover:shadow-md`}`}
                >
                  <div className='flex items-start gap-3 p-4'>
                    <input
                      type='checkbox'
                      checked={rv.bulkSelection.has(sample.id)}
                      onChange={() => rv.toggleBulkItem(sample.id)}
                      onClick={(e) => e.stopPropagation()}
                      className='mt-1 h-4 w-4 flex-shrink-0 rounded text-emerald-600'
                    />
                    <button
                      onClick={() => {
                        rv.handleSelectSample(sample);
                        setOpenModal((prev) => ({ ...prev, status: true }));
                      }}
                      className='min-w-0 flex-1 text-left'
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <p
                            className={`truncate text-sm font-semibold  ${theme.textMuted}`}
                          >
                            {sample.productName || "Unnamed product"}
                          </p>
                        </div>
                        <div className='flex shrink-0 items-center gap-2'>
                          <StatusBadge
                            type={getVerificationBadgeType(
                              sample.verificationStatus,
                            )}
                            className='text-[10px]'
                          >
                            {sample.verificationStatus || "UNVERIFIED"}
                          </StatusBadge>
                          <ChevronRight className='h-4 w-4 text-gray-400' />
                        </div>
                      </div>
                      <div className='mt-3 flex flex-wrap gap-1.5'>
                        <StatusBadge type='info' className='text-[11px]'>
                          {sample.state?.name || "No state"}
                        </StatusBadge>
                        {sample.lga?.name && (
                          <StatusBadge type='moderate' className='text-[11px]'>
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

          {/* Pagination */}
          <div className={`mt-5 border-t pt-4 ${theme.border}`}>
            <div className='flex items-center justify-between gap-2'>
              <ActionButton
                onClick={() => rv.setPage((p) => Math.max(1, p - 1))}
                disabled={rv.page <= 1 || rv.loading}
                variant='secondary'
                className='px-3 py-2'
              >
                Prev
              </ActionButton>
              <p className={`text-xs sm:text-sm ${theme.textMuted}`}>
                {rv.totalCount} total •{" "}
                {rv.statsLoading ? "updating..." : "live count"}
              </p>
              <ActionButton
                onClick={() => {
                  if (rv.page < rv.totalPages) rv.setPage((p) => p + 1);
                }}
                disabled={
                  rv.page >= rv.totalPages || rv.loading || rv.totalPages <= 1
                }
                variant='secondary'
                className='px-3 py-2'
              >
                Next
              </ActionButton>
            </div>
          </div>
        </SurfaceCard>

        {/* ── Detail + review panel ── */}
        {screenSize > screenResponsiveBreakpoint ? (
          <SampleReviewCard
            rv={rv}
            productPhotoSrc={productPhotoSrc}
            theme={theme}
          />
        ) : (
          openModal.status && (
            <Modal
              onClose={() =>
                setOpenModal((prev) => ({ ...prev, status: false }))
              }
            >
              <SampleReviewCard
                rv={rv}
                productPhotoSrc={productPhotoSrc}
                theme={theme}
              />
            </Modal>
          )
        )}
      </div>
    </div>
  );
};

export default SampleReview;
