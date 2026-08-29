import {
  X,
  AlertTriangle,
  Pencil,
  MapPin,
  Package,
  FlaskConical,
  Image as ImageIcon,
  CalendarDays,
  UserRound,
  Factory,
  Tag,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { useState } from "react";
import ImageWithLoader from "./ImageWithLoader";
import ImagePreviewModal from "./ImagePreviewModal";
import { useSelector } from "react-redux";

import HeavyMetalStatusBadge from "../common/HeavyMetalStatusBadge";

import {
  canViewHeavyMetalPpm,
  getHeavyMetalPublicStatus,
  normalizeHeavyMetalStatus,
} from "../../utils/heavyMetalStatus";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatVendorType = (
  vendorType,
  vendorTypeOther
) => {
  if (
    vendorType === "OTHER" &&
    vendorTypeOther
  ) {
    return vendorTypeOther;
  }

  return (
    vendorType
      ?.replace(/_/g, " ")
      ?.replace(/\b\w/g, (char) =>
        char.toUpperCase()
      ) || "—"
  );
};

const formatValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return value;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (price) => {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "—";
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return price;
  }

  return `₦${numericPrice.toLocaleString()}`;
};

const getContaminationInfo = (
  heavyMetalReadings
) => {
  if (
    !Array.isArray(heavyMetalReadings) ||
    heavyMetalReadings.length === 0
  ) {
    return {
      hasReadings: false,
      readings: [],
    };
  }

  const getReadingStatus = (reading) =>
    reading?.finalStatus ||
    reading?.aasStatus ||
    reading?.xrfStatus ||
    "PENDING";

  return {
    hasReadings: true,

    readings: heavyMetalReadings.map(
      (reading) => ({
        metal: reading?.heavyMetal,
        xrf: reading?.xrfReading
          ? parseFloat(
              reading.xrfReading
            )
          : null,
        aas: reading?.aasReading
          ? parseFloat(
              reading.aasReading
            )
          : null,
        status:
          getReadingStatus(reading),
      })
    ),
  };
};

/* -------------------------------------------------------------------------- */
/* Small UI primitives                                                        */
/* -------------------------------------------------------------------------- */

const DetailItem = ({
  icon: Icon,
  label,
  value,
  theme,
}) => (
  <div className="min-w-0">
    <div className="flex items-center gap-1.5">
      {Icon && (
        <Icon
          className={`h-3 w-3 shrink-0 ${theme?.textMuted}`}
        />
      )}

      <span
        className={`
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.08em]
          ${theme?.textMuted}
        `}
      >
        {label}
      </span>
    </div>

    <p
      className={`
        mt-1
        break-words
        text-xs
        font-semibold
        ${theme?.text}
      `}
    >
      {formatValue(value)}
    </p>
  </div>
);

const Section = ({
  title,
  description,
  icon: Icon,
  children,
  theme,
  action,
}) => (
  <section
    className={`
      overflow-hidden
      rounded-2xl
      border
      ${theme?.border}
      ${theme?.card}
    `}
  >
    <div
      className={`
        flex flex-col
        gap-2
        border-b
        px-4 py-3.5
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:px-5
        ${theme?.border}
      `}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className={`
              flex h-8 w-8
              shrink-0
              items-center justify-center
              rounded-lg
              ${theme?.bg}
            `}
          >
            <Icon
              className={`h-3.5 w-3.5 ${theme?.emeraldText}`}
            />
          </div>
        )}

        <div>
          <h3
            className={`
              text-xs
              font-bold
              ${theme?.text}
            `}
          >
            {title}
          </h3>

          {description && (
            <p
              className={`
                mt-0.5
                text-[10px]
                ${theme?.textMuted}
              `}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>

    <div className="p-4 sm:p-5">
      {children}
    </div>
  </section>
);

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

const SampleDetailModal = ({
  sample,
  onClose,
  onEditRequest,
}) => {
  const { theme } = useTheme();

  const [previewImage, setPreviewImage] =
    useState(null);

  const { currentUser } = useSelector(
    (state) => state.auth
  );

  const contaminationInfo =
    getContaminationInfo(
      sample?.heavyMetalReadings
    );

  const publicStatus =
    getHeavyMetalPublicStatus(sample);

  const canViewPpm =
    canViewHeavyMetalPpm(
      currentUser,
      sample
    );

  const handleEdit = () => {
    onEditRequest?.(sample);
    onClose();
  };

  const isContaminated =
    normalizeHeavyMetalStatus(
      sample?.status
    ) === "CONTAMINATED" ||
    publicStatus === "CONTAMINATED";

  return (
    <div
      className="
        fixed inset-0
        z-[5000]
        flex items-center
        justify-center
        bg-slate-950/55
        p-2
        backdrop-blur-sm
        sm:p-4
      "
    >
      <div
        className={`
          flex
          h-[96vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          border
          shadow-2xl
          sm:h-[92vh]
          ${theme?.card}
          ${theme?.border}
          ${theme?.text}
        `}
      >
        {/* ================================================================== */}
        {/* HEADER                                                            */}
        {/* ================================================================== */}

        <header
          className={`
            shrink-0
            border-b
            ${theme?.border}
          `}
        >
          <div className="flex items-start gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
            {/* Identity */}

            <div
              className={`
                flex h-10 w-10
                shrink-0
                items-center justify-center
                rounded-xl
                ${theme?.emerald}
                ${theme?.emeraldText}
              `}
            >
              <FlaskConical className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className={`
                    max-w-[480px]
                    truncate
                    text-sm
                    font-bold
                    sm:text-base
                    ${theme?.text}
                  `}
                >
                  {sample?.productName ||
                    "Sample details"}
                </h2>

                <HeavyMetalStatusBadge
                  status={publicStatus}
                  size="sm"
                />
              </div>

              <div
                className={`
                  mt-1 flex flex-wrap
                  items-center gap-x-2 gap-y-1
                  text-[10px]
                  ${theme?.textMuted}
                `}
              >
                <span>
                  {sample?.code ||
                    sample?.sampleId ||
                    "No sample ID"}
                </span>

                {sample?.brandName && (
                  <>
                    <span>•</span>
                    <span>
                      {sample.brandName}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}

            <div className="flex shrink-0 items-center gap-1">
              {onEditRequest && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className={`
                    inline-flex
                    h-8
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    px-2.5
                    text-[10px]
                    font-semibold
                    ${theme?.border}
                    ${theme?.text}
                    ${theme?.hover}
                  `}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    Edit
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className={`
                  flex h-8 w-8
                  items-center justify-center
                  rounded-lg
                  ${theme?.textMuted}
                  ${theme?.hover}
                `}
                aria-label="Close sample details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ================================================================== */}
        {/* BODY                                                              */}
        {/* ================================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
          "
        >
          <div className="space-y-4 p-3.5 sm:space-y-5 sm:p-5">
            {/* ============================================================== */}
            {/* QUICK SUMMARY                                                 */}
            {/* ============================================================== */}

            <div
              className={`
                grid
                grid-cols-2
                gap-2
                sm:grid-cols-4
              `}
            >
              <div
                className={`
                  rounded-xl
                  border
                  p-3
                  ${theme?.border}
                `}
              >
                <p
                  className={`
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-wider
                    ${theme?.textMuted}
                  `}
                >
                  Sample ID
                </p>

                <p
                  className={`
                    mt-1 truncate
                    text-xs
                    font-bold
                    ${theme?.text}
                  `}
                >
                  {sample?.code ||
                    sample?.sampleId ||
                    "—"}
                </p>
              </div>

              <div
                className={`
                  rounded-xl
                  border
                  p-3
                  ${theme?.border}
                `}
              >
                <p
                  className={`
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-wider
                    ${theme?.textMuted}
                  `}
                >
                  Result
                </p>

                <div className="mt-1">
                  <HeavyMetalStatusBadge
                    status={publicStatus}
                    size="sm"
                  />
                </div>
              </div>

              <div
                className={`
                  rounded-xl
                  border
                  p-3
                  ${theme?.border}
                `}
              >
                <p
                  className={`
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-wider
                    ${theme?.textMuted}
                  `}
                >
                  Collected
                </p>

                <p
                  className={`
                    mt-1 text-xs
                    font-bold
                    ${theme?.text}
                  `}
                >
                  {formatDate(
                    sample?.createdAt
                  )}
                </p>
              </div>

              <div
                className={`
                  rounded-xl
                  border
                  p-3
                  ${theme?.border}
                `}
              >
                <p
                  className={`
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-wider
                    ${theme?.textMuted}
                  `}
                >
                  Location
                </p>

                <p
                  className={`
                    mt-1 truncate
                    text-xs
                    font-bold
                    ${theme?.text}
                  `}
                >
                  {sample?.state?.name ||
                    "Unknown"}
                </p>
              </div>
            </div>

            {/* ============================================================== */}
            {/* SAMPLE + LOCATION                                             */}
            {/* ============================================================== */}

            <div className="grid gap-4 lg:grid-cols-2">
              <Section
                title="Sample information"
                description="Product and collection metadata"
                icon={Package}
                theme={theme}
              >
                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <DetailItem
                    icon={Tag}
                    label="Category"
                    value={
                      sample?.productVariant
                        ?.category
                        ?.name ||
                      sample?.productVariant
                        ?.category
                        ?.displayName
                    }
                    theme={theme}
                  />

                  <DetailItem
                    icon={Package}
                    label="Variant"
                    value={sample?.productVariant?.name?.replace(
                      /_/g,
                      " "
                    )}
                    theme={theme}
                  />

                  <DetailItem
                    label="Brand"
                    value={sample?.brandName}
                    theme={theme}
                  />

                  <DetailItem
                    label="Batch"
                    value={
                      sample?.batchNumber
                    }
                    theme={theme}
                  />

                  <DetailItem
                    icon={Factory}
                    label="Manufacturer"
                    value={
                      sample?.manufacturerName
                    }
                    theme={theme}
                  />

                  <DetailItem
                    label="Origin"
                    value={sample?.productOrigin?.replace(
                      /_/g,
                      " "
                    )}
                    theme={theme}
                  />

                  <DetailItem
                    label="Price"
                    value={formatPrice(
                      sample?.price
                    )}
                    theme={theme}
                  />

                  <DetailItem
                    label="Vendor type"
                    value={formatVendorType(
                      sample?.vendorType,
                      sample?.vendorTypeOther
                    )}
                    theme={theme}
                  />
                </div>
              </Section>

              <Section
                title="Collection location"
                description="Where the sample was obtained"
                icon={MapPin}
                theme={theme}
              >
                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <DetailItem
                    icon={MapPin}
                    label="State"
                    value={
                      sample?.state?.name
                    }
                    theme={theme}
                  />

                  <DetailItem
                    label="LGA"
                    value={
                      sample?.lga?.name
                    }
                    theme={theme}
                  />

                  <DetailItem
                    label="Market"
                    value={
                      sample?.market?.name ||
                      sample?.marketName
                    }
                    theme={theme}
                  />

                  <DetailItem
                    icon={UserRound}
                    label="Collected by"
                    value={
                      sample?.creator
                        ?.fullName
                    }
                    theme={theme}
                  />

                  <DetailItem
                    label="Collection date"
                    value={formatDate(
                      sample?.createdAt
                    )}
                    theme={theme}
                  />

                  <DetailItem
                    label="Coordinates"
                    value={
                      sample?.gpsLatitude &&
                      sample?.gpsLongitude
                        ? `${sample.gpsLatitude}, ${sample.gpsLongitude}`
                        : "Not recorded"
                    }
                    theme={theme}
                  />
                </div>
              </Section>
            </div>

            {/* ============================================================== */}
            {/* HEAVY METAL ANALYSIS                                          */}
            {/* ============================================================== */}

            <Section
              title="Heavy metal analysis"
              description={
                canViewPpm
                  ? "Laboratory readings and analytical status"
                  : "Public result summary"
              }
              icon={FlaskConical}
              theme={theme}
              action={
                <HeavyMetalStatusBadge
                  status={publicStatus}
                  size="md"
                />
              }
            >
              {!canViewPpm && (
                <div
                  className={`
                    mb-4
                    flex items-start gap-3
                    rounded-xl
                    border
                    p-3
                    ${theme?.border}
                    ${theme?.bg}
                  `}
                >
                  <div
                    className="
                      mt-0.5
                      flex h-7 w-7
                      shrink-0
                      items-center justify-center
                      rounded-lg
                      bg-slate-100
                      text-slate-500
                      dark:bg-slate-800
                      dark:text-slate-400
                    "
                  >
                    <LockKeyhole className="h-3.5 w-3.5" />
                  </div>

                  <div>
                    <p
                      className={`
                        text-[11px]
                        font-semibold
                        ${theme?.text}
                      `}
                    >
                      Detailed readings restricted
                    </p>

                    <p
                      className={`
                        mt-0.5
                        text-[10px]
                        leading-4
                        ${theme?.textMuted}
                      `}
                    >
                      PPM values are available only
                      to authorized personnel.
                    </p>
                  </div>
                </div>
              )}

              {contaminationInfo.hasReadings ? (
                <div className="overflow-hidden rounded-xl border">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-xs">
                      <thead
                        className={`
                          border-b
                          ${theme?.border}
                          ${theme?.bg}
                        `}
                      >
                        <tr>
                          <th
                            className={`
                              px-3 py-2.5
                              text-left
                              text-[9px]
                              font-bold
                              uppercase
                              tracking-wider
                              ${theme?.textMuted}
                            `}
                          >
                            Heavy metal
                          </th>

                          {canViewPpm && (
                            <>
                              <th
                                className={`
                                  px-3 py-2.5
                                  text-left
                                  text-[9px]
                                  font-bold
                                  uppercase
                                  tracking-wider
                                  ${theme?.textMuted}
                                `}
                              >
                                XRF
                              </th>

                              <th
                                className={`
                                  px-3 py-2.5
                                  text-left
                                  text-[9px]
                                  font-bold
                                  uppercase
                                  tracking-wider
                                  ${theme?.textMuted}
                                `}
                              >
                                AAS
                              </th>
                            </>
                          )}

                          <th
                            className={`
                              px-3 py-2.5
                              text-left
                              text-[9px]
                              font-bold
                              uppercase
                              tracking-wider
                              ${theme?.textMuted}
                            `}
                          >
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {contaminationInfo.readings.map(
                          (
                            reading,
                            index
                          ) => {
                            const readingStatus =
                              normalizeHeavyMetalStatus(
                                reading.status
                              );

                            return (
                              <tr
                                key={`${reading.metal}-${index}`}
                                className={`
                                  border-b
                                  last:border-b-0
                                  ${theme?.border}
                                `}
                              >
                                <td
                                  className={`
                                    px-3 py-3
                                    font-semibold
                                    ${theme?.text}
                                  `}
                                >
                                  {reading.metal ||
                                    "Unknown"}
                                </td>

                                {canViewPpm && (
                                  <>
                                    <td
                                      className={`
                                        px-3 py-3
                                        ${theme?.text}
                                      `}
                                    >
                                      {reading.xrf !==
                                      null
                                        ? `${reading.xrf} ppm`
                                        : "—"}
                                    </td>

                                    <td
                                      className={`
                                        px-3 py-3
                                        ${theme?.text}
                                      `}
                                    >
                                      {reading.aas !==
                                      null
                                        ? `${reading.aas} ppm`
                                        : "—"}
                                    </td>
                                  </>
                                )}

                                <td className="px-3 py-3">
                                  <HeavyMetalStatusBadge
                                    status={
                                      readingStatus
                                    }
                                    size="sm"
                                  />
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div
                  className={`
                    rounded-xl
                    border
                    p-5
                    text-center
                    ${theme?.border}
                    ${theme?.bg}
                  `}
                >
                  <FlaskConical
                    className={`
                      mx-auto
                      h-5 w-5
                      ${theme?.textMuted}
                    `}
                  />

                  <p
                    className={`
                      mt-2
                      text-xs
                      font-semibold
                      ${theme?.text}
                    `}
                  >
                    No analysis recorded
                  </p>

                  <p
                    className={`
                      mt-1
                      text-[10px]
                      ${theme?.textMuted}
                    `}
                  >
                    Heavy metal results have not
                    been recorded for this sample.
                  </p>
                </div>
              )}
            </Section>

            {/* ============================================================== */}
            {/* EVIDENCE                                                       */}
            {/* ============================================================== */}

            {(sample?.productPhotoUrl ||
              sample?.calibrationCurve
                ?.fileUrl) && (
              <Section
                title="Sample evidence"
                description="Images associated with this record"
                icon={ImageIcon}
                theme={theme}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {sample?.productPhotoUrl && (
                    <div
                      className={`
                        overflow-hidden
                        rounded-xl
                        border
                        ${theme?.border}
                      `}
                    >
                      <div
                        className={`
                          flex items-center gap-2
                          border-b
                          px-3 py-2
                          ${theme?.border}
                        `}
                      >
                        <ImageIcon
                          className={`
                            h-3.5 w-3.5
                            ${theme?.emeraldText}
                          `}
                        />

                        <span
                          className={`
                            text-[10px]
                            font-semibold
                            ${theme?.text}
                          `}
                        >
                          Product photo
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImage(
                            sample.productPhotoUrl
                          )
                        }
                        className="
                          block
                          w-full
                          cursor-zoom-in
                        "
                      >
                        <ImageWithLoader
                          src={
                            sample.productPhotoUrl
                          }
                          alt="Product sample"
                        />
                      </button>
                    </div>
                  )}

                  {sample?.calibrationCurve
                    ?.fileUrl && (
                    <div
                      className={`
                        overflow-hidden
                        rounded-xl
                        border
                        ${theme?.border}
                      `}
                    >
                      <div
                        className={`
                          flex items-center gap-2
                          border-b
                          px-3 py-2
                          ${theme?.border}
                        `}
                      >
                        <FlaskConical
                          className={`
                            h-3.5 w-3.5
                            ${theme?.emeraldText}
                          `}
                        />

                        <span
                          className={`
                            text-[10px]
                            font-semibold
                            ${theme?.text}
                          `}
                        >
                          Calibration curve
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImage(
                            sample
                              .calibrationCurve
                              .fileUrl
                          )
                        }
                        className="
                          block
                          w-full
                          cursor-zoom-in
                        "
                      >
                        <ImageWithLoader
                          src={
                            sample
                              .calibrationCurve
                              .fileUrl
                          }
                          alt="Calibration curve"
                        />
                      </button>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* ============================================================== */}
            {/* CONTAMINATION WARNING                                         */}
            {/* ============================================================== */}

            {isContaminated && (
              <div
                className="
                  flex items-start gap-3
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  p-4
                  dark:border-red-900/40
                  dark:bg-red-950/20
                "
              >
                <div
                  className="
                    flex h-9 w-9
                    shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-red-100
                    text-red-600
                    dark:bg-red-950/50
                    dark:text-red-400
                  "
                >
                  <AlertTriangle className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-red-700 dark:text-red-400">
                    Contaminated product
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-red-600/80 dark:text-red-400/80">
                    This sample has been identified
                    as contaminated. Review the
                    laboratory findings and follow
                    the applicable response procedure.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom spacing */}

            <div className="h-1" />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* IMAGE PREVIEW                                                        */}
      {/* ==================================================================== */}

      <ImagePreviewModal
        src={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default SampleDetailModal;