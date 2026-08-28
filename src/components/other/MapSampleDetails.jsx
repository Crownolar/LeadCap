import {
  MapPin,
  Building2,
  MessageCircle,
  ShieldCheck,
  ShieldAlert,
  Package,
  CalendarDays,
  Store,
  Tag,
  Hash,
  CheckCircle2,
  AlertTriangle,
  Clock3,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

/* -------------------------------------------------------------------------- */
/* Status                                                                      */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG = {
  CONTAMINATED: {
    label: "Contaminated",
    dot: "bg-red-500",
    badge:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50",
    rail: "bg-red-500",
    icon: ShieldAlert,
  },

  SAFE: {
    label: "Safe",
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/50",
    rail: "bg-emerald-500",
    icon: ShieldCheck,
  },

  MODERATE: {
    label: "Moderate",
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50",
    rail: "bg-amber-500",
    icon: AlertTriangle,
  },

  PENDING: {
    label: "Pending",
    dot: "bg-slate-400",
    badge:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    rail: "bg-slate-400",
    icon: Clock3,
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const formatValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  return value;
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatVendorType = (value) => {
  if (!value) return "N/A";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

/* -------------------------------------------------------------------------- */
/* Component helpers                                                           */
/* -------------------------------------------------------------------------- */

const Label = ({ children, theme }) => (
  <span
    className={`
      block text-[9px] font-semibold uppercase
      tracking-[0.1em]
      ${theme.textMuted}
    `}
  >
    {children}
  </span>
);

const Value = ({
  children,
  theme,
  className = "",
}) => (
  <span
    className={`
      block truncate text-[12px] font-semibold
      ${theme.text}
      ${className}
    `}
  >
    {children}
  </span>
);

const DetailRow = ({
  icon: Icon,
  label,
  children,
  theme,
}) => (
  <div className="flex min-w-0 items-start gap-2.5">
    <div
      className={`
        mt-0.5 flex h-7 w-7 shrink-0 items-center
        justify-center rounded-lg
        ${theme.bg}
        ${theme.border}
        border
      `}
    >
      <Icon
        size={13}
        className={theme.emeraldText}
      />
    </div>

    <div className="min-w-0 flex-1">
      <Label theme={theme}>{label}</Label>
      <Value theme={theme}>{children}</Value>
    </div>
  </div>
);

const MetaItem = ({
  icon: Icon,
  label,
  value,
  theme,
}) => (
  <div
    className={`
      min-w-0 rounded-xl border
      p-3
      ${theme.border}
      ${theme.bg}
    `}
  >
    <div className="mb-1.5 flex items-center gap-1.5">
      <Icon
        size={12}
        className={theme.textMuted}
      />

      <Label theme={theme}>{label}</Label>
    </div>

    <Value theme={theme}>{value}</Value>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

export default function MapSampleDetails({
  samples = [],
  setCommentSectionView,
}) {
  const { theme } = useTheme();

  if (!Array.isArray(samples) || samples.length === 0) {
    return (
      <div
        className={`
          flex min-h-[180px]
          items-center justify-center
          p-6
          ${theme.bg}
        `}
      >
        <div className="text-center">
          <MapPin
            size={22}
            className={`mx-auto mb-2 ${theme.textMuted}`}
          />

          <p
            className={`text-sm font-semibold ${theme.text}`}
          >
            No sample details available
          </p>

          <p
            className={`mt-1 text-xs ${theme.textMuted}`}
          >
            There are no records associated with this location.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        grid grid-cols-1 gap-3.5
        p-4
        sm:p-5
        lg:grid-cols-2
        ${theme.bg}
      `}
    >
      {samples.map((sample) => {
        const status = getStatusConfig(
          sample?.status
        );

        const StatusIcon = status.icon;

        const verification =
          sample?.verificationStatus;

        const isOriginal =
          verification ===
          "VERIFIED_ORIGINAL";

        const isCounterfeit =
          verification ===
          "VERIFIED_FAKE";

        return (
          <article
            key={
              sample?.id ||
              sample?.code ||
              `${sample?.productName}-${sample?.createdAt}`
            }
            className={`
              relative overflow-hidden
              rounded-2xl
              border
              ${theme.border}
              ${theme.card}
              shadow-sm
              transition-shadow
              hover:shadow-md
            `}
          >
            {/* ---------------------------------------------------------- */}
            {/* Status rail                                                 */}
            {/* ---------------------------------------------------------- */}

            <div
              className={`
                absolute inset-y-0 left-0 w-1
                ${status.rail}
              `}
            />

            {/* ---------------------------------------------------------- */}
            {/* Header                                                      */}
            {/* ---------------------------------------------------------- */}

            <div
              className={`
                border-b px-4 py-3.5
                ${theme.border}
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={`
                        h-2 w-2 shrink-0 rounded-full
                        ${status.dot}
                      `}
                    />

                    <span
                      className={`
                        text-[10px] font-bold uppercase
                        tracking-[0.09em]
                        ${theme.textMuted}
                      `}
                    >
                      Sample status
                    </span>
                  </div>

                  <h3
                    className={`
                      truncate text-[15px]
                      font-bold tracking-tight
                      ${theme.text}
                    `}
                  >
                    {formatValue(
                      sample?.productName
                    )}
                  </h3>
                </div>

                <span
                  className={`
                    inline-flex shrink-0
                    items-center gap-1.5
                    rounded-full border
                    px-2.5 py-1
                    text-[9px] font-bold uppercase
                    tracking-wide
                    ${status.badge}
                  `}
                >
                  <StatusIcon size={11} />

                  {status.label}
                </span>
              </div>

              {/* Sample identifier */}

              <div className="mt-2.5 flex items-center gap-1.5">
                <Hash
                  size={11}
                  className={theme.textMuted}
                />

                <span
                  className={`
                    truncate font-mono text-[10px]
                    ${theme.textMuted}
                  `}
                >
                  {formatValue(sample?.code)}
                </span>
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* Body                                                        */}
            {/* ---------------------------------------------------------- */}

            <div className="space-y-4 p-4">
              {/* Product tags */}

              <div className="flex flex-wrap gap-1.5">
                {(sample?.productVariant?.displayName ||
                  sample?.productVariant?.name) && (
                  <span
                    className={`
                      inline-flex items-center gap-1
                      rounded-md border px-2 py-1
                      text-[9px] font-semibold
                      ${theme.border}
                      ${theme.info}
                    `}
                  >
                    <Tag size={10} />

                    {sample.productVariant
                      ?.displayName ||
                      sample.productVariant?.name}
                  </span>
                )}

                {sample?.isRegistered && (
                  <span
                    className={`
                      inline-flex items-center gap-1
                      rounded-md border px-2 py-1
                      text-[9px] font-semibold
                      ${theme.emeraldBorder}
                      ${theme.emerald}
                    `}
                  >
                    <CheckCircle2 size={10} />

                    Registered
                  </span>
                )}

                {sample?.productOrigin ===
                  "IMPORTED" && (
                  <span
                    className={`
                      rounded-md border px-2 py-1
                      text-[9px] font-semibold
                      ${theme.border}
                      ${theme.bg}
                      ${theme.textMuted}
                    `}
                  >
                    Imported
                  </span>
                )}
              </div>

              {/* ------------------------------------------------------ */}
              {/* Location                                                 */}
              {/* ------------------------------------------------------ */}

              <div
                className={`
                  rounded-xl border p-3
                  ${theme.border}
                `}
              >
                <div className="mb-3 flex items-center gap-2">
                  <MapPin
                    size={14}
                    className={theme.emeraldText}
                  />

                  <span
                    className={`
                      text-[10px] font-bold uppercase
                      tracking-[0.1em]
                      ${theme.text}
                    `}
                  >
                    Collection location
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailRow
                    icon={Store}
                    label="Market"
                    theme={theme}
                  >
                    {formatValue(
                      sample?.market?.name
                    )}
                  </DetailRow>

                  <DetailRow
                    icon={Building2}
                    label="Location"
                    theme={theme}
                  >
                    {sample?.lga?.name ||
                      "N/A"}
                    {sample?.state?.name
                      ? `, ${sample.state.name}`
                      : ""}
                  </DetailRow>
                </div>
              </div>

              {/* ------------------------------------------------------ */}
              {/* Product metadata                                         */}
              {/* ------------------------------------------------------ */}

              <div className="grid grid-cols-2 gap-2">
                <MetaItem
                  icon={Store}
                  label="Vendor"
                  value={formatVendorType(
                    sample?.vendorType
                  )}
                  theme={theme}
                />

                <MetaItem
                  icon={Package}
                  label="Price"
                  value={
                    typeof sample?.price ===
                    "number"
                      ? `₦${sample.price.toLocaleString()}`
                      : formatValue(
                          sample?.price
                        )
                  }
                  theme={theme}
                />

                {sample?.brandName && (
                  <MetaItem
                    icon={Tag}
                    label="Brand"
                    value={sample.brandName}
                    theme={theme}
                  />
                )}

                {sample?.batchNumber && (
                  <MetaItem
                    icon={Hash}
                    label="Batch"
                    value={sample.batchNumber}
                    theme={theme}
                  />
                )}
              </div>

              {/* ------------------------------------------------------ */}
              {/* Collection date                                          */}
              {/* ------------------------------------------------------ */}

              <div
                className={`
                  flex items-center justify-between
                  gap-3 border-y py-2.5
                  ${theme.border}
                `}
              >
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={13}
                    className={theme.textMuted}
                  />

                  <span
                    className={`text-[10px] ${theme.textMuted}`}
                  >
                    Collected
                  </span>
                </div>

                <span
                  className={`
                    text-[11px] font-semibold
                    ${theme.text}
                  `}
                >
                  {formatDate(
                    sample?.createdAt
                  )}
                </span>
              </div>

              {/* ------------------------------------------------------ */}
              {/* Verification                                             */}
              {/* ------------------------------------------------------ */}

              {(isOriginal || isCounterfeit) && (
                <div
                  className={`
                    rounded-xl border p-3
                    ${
                      isOriginal
                        ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                        : "border-red-200 bg-red-50/70 dark:border-red-900/50 dark:bg-red-950/20"
                    }
                  `}
                >
                  <div className="flex items-start gap-2.5">
                    {isOriginal ? (
                      <ShieldCheck
                        size={16}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                    ) : (
                      <ShieldAlert
                        size={16}
                        className="mt-0.5 shrink-0 text-red-600"
                      />
                    )}

                    <div className="min-w-0">
                      <p
                        className={`
                          text-[9px] font-bold
                          uppercase tracking-[0.1em]
                          ${
                            isOriginal
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-red-700 dark:text-red-300"
                          }
                        `}
                      >
                        Verification
                      </p>

                      <p
                        className={`
                          mt-1 text-[12px] font-bold
                          ${
                            isOriginal
                              ? "text-emerald-800 dark:text-emerald-200"
                              : "text-red-800 dark:text-red-200"
                          }
                        `}
                      >
                        {isOriginal
                          ? "Original product"
                          : "Counterfeit detected"}
                      </p>

                      <div className="mt-2 space-y-0.5">
                        {sample?.nafdacNumber && (
                          <p
                            className={`
                              truncate font-mono
                              text-[9px]
                              ${theme.textMuted}
                            `}
                          >
                            NAFDAC:{" "}
                            {
                              sample.nafdacNumber
                            }
                          </p>
                        )}

                        {sample?.sonNumber && (
                          <p
                            className={`
                              truncate font-mono
                              text-[9px]
                              ${theme.textMuted}
                            `}
                          >
                            SON:{" "}
                            {sample.sonNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------ */}
              {/* Comments CTA                                             */}
              {/* ------------------------------------------------------ */}

              <button
                type="button"
                onClick={() =>
                  setCommentSectionView({
                    isOpen: true,
                    sample,
                  })
                }
                className={`
                  group flex w-full items-center
                  justify-center gap-2
                  rounded-xl border
                  px-3 py-2.5
                  text-[11px] font-semibold
                  transition-all
                  ${theme.border}
                  ${theme.card}
                  ${theme.hover}
                  ${theme.emeraldText}
                `}
              >
                <MessageCircle
                  size={14}
                  className="transition-transform group-hover:scale-110"
                />

                View sample comments
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}