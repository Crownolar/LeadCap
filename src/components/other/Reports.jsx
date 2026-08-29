import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  FileText,
  BarChart3,
  Package,
  AlertTriangle,
  Loader,
  Download,
  X,
  Lock,
  ArrowRight,
  CalendarDays,
  MapPinned,
  Layers3,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import { generateReportPDF } from "../../utils/reportUtils";

const DEFAULT_REPORT_FILTERS = {
  state: "",
  states: [],
  productVariants: [],
  dateFrom: "",
  dateTo: "",
  minLeadLevel: 10,
};

/* -------------------------------------------------------------------------- */
/* Report metadata                                                            */
/* -------------------------------------------------------------------------- */

const REPORT_OPTIONS = [
  {
    type: "state-summary",
    title: "State Summary Report",
    description:
      "Generate a consolidated view of sample activity, contamination levels, and findings across a selected state.",
    icon: FileText,
    eyebrow: "GEOGRAPHIC INTELLIGENCE",
  },
  {
    type: "contamination-analysis",
    title: "Contamination Analysis",
    description:
      "Analyse contamination patterns, affected locations, product categories, and reporting trends.",
    icon: BarChart3,
    eyebrow: "RISK ANALYTICS",
  },
  {
    type: "product-type",
    title: "Product Analysis Report",
    description:
      "Review sample and contamination patterns by product category and product variant.",
    icon: Package,
    eyebrow: "PRODUCT INTELLIGENCE",
  },
  {
    type: "risk-assessment",
    title: "Risk Assessment",
    description:
      "Identify high-risk products and locations using the configured contamination threshold.",
    icon: ShieldAlert,
    eyebrow: "PRIORITY ASSESSMENT",
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const needsState = (type) =>
  type === "state-summary" ||
  type === "product-type";

const needsMultipleStates = (type) =>
  type === "contamination-analysis";

const needsCategories = (type) =>
  type === "contamination-analysis";

const needsLeadThreshold = (type) =>
  type === "risk-assessment";

const getReportAccent = (type) => {
  switch (type) {
    case "risk-assessment":
      return {
        icon: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
        border: "border-red-200 dark:border-red-900/40",
      };

    case "contamination-analysis":
      return {
        icon: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-900/40",
      };

    default:
      return {
        icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-900/40",
      };
  }
};

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

const Reports = () => {
  const { currentUser } = useSelector(
    (state) => state.auth
  );

  const { theme } = useTheme();

  const normalizedRole = currentUser?.role
    ?.toLowerCase()
    .replace(/[\s_]/g, "");

  const allowedRoles = [
    "superadmin",
    "headresearcher",
  ];

  if (!allowedRoles.includes(normalizedRole)) {
    return (
      <div
        className={`
          min-h-screen
          flex items-center justify-center
          p-4
          ${theme?.bg}
          ${theme?.text}
        `}
      >
        <div
          className={`
            w-full max-w-md
            rounded-2xl
            border
            p-7
            text-center
            shadow-sm
            ${theme?.card}
            ${theme?.border}
          `}
        >
          <div
            className="
              mx-auto
              flex h-12 w-12
              items-center justify-center
              rounded-xl
              bg-slate-100
              text-slate-500
              dark:bg-slate-800
              dark:text-slate-400
            "
          >
            <Lock className="h-5 w-5" />
          </div>

          <h2
            className={`
              mt-4
              text-lg
              font-bold
              ${theme?.text}
            `}
          >
            Access restricted
          </h2>

          <p
            className={`
              mt-2
              text-sm
              leading-6
              ${theme?.textMuted}
            `}
          >
            Reports are available only to
            Super Admin and Head Researcher
            accounts.
          </p>
        </div>
      </div>
    );
  }

  return <ReportsContent />;
};

/* -------------------------------------------------------------------------- */
/* Reports content                                                             */
/* -------------------------------------------------------------------------- */

const ReportsContent = () => {
  const { theme } = useTheme();

  const [loading, setLoading] =
    useState(false);

  const [selectedReport, setSelectedReport] =
    useState(null);

  const [states, setStates] = useState([]);

  const [categories, setCategories] =
    useState([]);

  const [generationProgress, setGenerationProgress] =
    useState(0);

  /* ------------------------------------------------------------------------ */
  /* Load filter data                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let active = true;

    const loadReportFilters = async () => {
      const [
        statesResult,
        categoriesResult,
      ] = await Promise.allSettled([
        api.get("/management/states", {
          params: {
            activeOnly: "true",
          },
        }),
        api.get("/products/categories"),
      ]);

      if (!active) return;

      if (
        statesResult.status ===
        "fulfilled"
      ) {
        const response =
          statesResult.value;

        setStates(
          response.data?.data ||
            response.data ||
            []
        );
      } else {
        console.error(
          "Failed to fetch states:",
          statesResult.reason
        );

        setStates([]);
      }

      if (
        categoriesResult.status ===
        "fulfilled"
      ) {
        const response =
          categoriesResult.value;

        setCategories(
          response.data?.data ||
            response.data ||
            []
        );
      } else {
        console.error(
          "Failed to fetch categories:",
          categoriesResult.reason
        );

        setCategories([]);
      }
    };

    loadReportFilters();

    return () => {
      active = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Generate report                                                          */
  /* ------------------------------------------------------------------------ */

  const generateReport = async (
    reportType,
    filters
  ) => {
    if (
      needsState(reportType) &&
      !filters.state
    ) {
      alert(
        "Please select a state to generate this report."
      );
      return;
    }

    setLoading(true);
    setGenerationProgress(10);

    try {
      setGenerationProgress(40);

      const apiReportType =
        reportType === "product-analysis"
          ? "product-type"
          : reportType;

      setGenerationProgress(60);

      const filename = `${
        apiReportType
      }-report-${
        new Date()
          .toISOString()
          .split("T")[0]
      }`;

      await generateReportPDF(
        api,
        apiReportType,
        filters,
        filename
      );

      setGenerationProgress(100);

      alert(
        "Report generated and downloaded successfully!"
      );

      setSelectedReport(null);
    } catch (error) {
      console.error(
        "Failed to generate report:",
        error
      );

      alert(
        "Failed to generate report: " +
          (
            error?.response?.data?.error ||
            error?.message ||
            "Unknown error"
          )
      );

      setGenerationProgress(0);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Report modal                                                             */
  /* ------------------------------------------------------------------------ */

  const ReportModal = ({
    report,
    onClose,
  }) => {
    const [filters, setFilters] =
      useState({
        ...DEFAULT_REPORT_FILTERS,
      });

    const isFormValid = useMemo(() => {
      if (needsState(report.type)) {
        return Boolean(filters.state);
      }

      return true;
    }, [filters.state, report.type]);

    const updateFilter = (
      key,
      value
    ) => {
      setFilters((current) => ({
        ...current,
        [key]: value,
      }));
    };

    const toggleState = (
      stateName,
      checked
    ) => {
      setFilters((current) => ({
        ...current,
        states: checked
          ? [
              ...current.states,
              stateName,
            ]
          : current.states.filter(
              (state) =>
                state !== stateName
            ),
      }));
    };

    const toggleCategory = (
      category,
      checked
    ) => {
      const variantIds =
        category.variants?.map(
          (variant) => variant.id
        ) || [];

      setFilters((current) => {
        if (checked) {
          return {
            ...current,
            productVariants: [
              ...current.productVariants,
              ...variantIds.filter(
                (id) =>
                  !current.productVariants.includes(
                    id
                  )
              ),
            ],
          };
        }

        return {
          ...current,
          productVariants:
            current.productVariants.filter(
              (id) =>
                !variantIds.includes(id)
            ),
        };
      });
    };

    const handleSubmit = async () => {
      await generateReport(
        report.type,
        filters
      );
    };

    const accent =
      getReportAccent(report.type);

    return (
      <div
        className="
          fixed inset-0
          z-[5000]
          flex items-center
          justify-center
          bg-slate-950/55
          p-3
          backdrop-blur-sm
          sm:p-5
        "
      >
        <div
          className={`
            flex
            max-h-[92vh]
            w-full
            max-w-2xl
            flex-col
            overflow-hidden
            rounded-2xl
            border
            shadow-2xl
            ${theme?.card}
            ${theme?.border}
            ${theme?.text}
          `}
        >
          {/* Modal header */}

          <div
            className={`
              flex items-start gap-3
              border-b
              px-4 py-4
              sm:px-5
              ${theme?.border}
            `}
          >
            <div
              className={`
                flex h-10 w-10
                shrink-0
                items-center justify-center
                rounded-xl
                ${accent.icon}
              `}
            >
              <report.icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  ${theme?.emeraldText}
                `}
              >
                Report configuration
              </p>

              <h2
                className="
                  mt-1
                  text-sm
                  font-bold
                  sm:text-base
                "
              >
                {report.title}
              </h2>

              <p
                className={`
                  mt-1
                  text-[11px]
                  leading-5
                  ${theme?.textMuted}
                `}
              >
                Configure the parameters
                below before generating the
                report.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`
                flex h-8 w-8
                shrink-0
                items-center justify-center
                rounded-lg
                ${theme?.textMuted}
                ${theme?.hover}
              `}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal body */}

          <div
            className="
              min-h-0
              overflow-y-auto
              p-4
              sm:p-5
            "
          >
            <div className="space-y-5">
              {/* State */}

              {needsState(
                report.type
              ) && (
                <FilterField
                  icon={MapPinned}
                  label="State"
                  description="Select the state to analyse."
                  required
                  theme={theme}
                >
                  <div className="relative">
                    <select
                      value={
                        filters.state
                      }
                      onChange={(event) =>
                        updateFilter(
                          "state",
                          event.target.value
                        )
                      }
                      className={`
                        w-full
                        appearance-none
                        rounded-xl
                        border
                        px-3.5 py-3
                        pr-10
                        text-sm
                        outline-none
                        transition
                        ${theme?.input}
                        ${theme?.border}
                        focus:ring-2
                        focus:ring-emerald-500/30
                      `}
                    >
                      <option value="">
                        Select a state
                      </option>

                      {states.map(
                        (state) => (
                          <option
                            key={state.id}
                            value={
                              state.name
                            }
                          >
                            {state.name}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      className="
                        pointer-events-none
                        absolute right-3
                        top-1/2
                        h-4 w-4
                        -translate-y-1/2
                        text-slate-400
                      "
                    />
                  </div>
                </FilterField>
              )}

              {/* Multiple states */}

              {needsMultipleStates(
                report.type
              ) && (
                <FilterField
                  icon={MapPinned}
                  label="States"
                  description="Optional. Leave unselected to include all available states."
                  theme={theme}
                >
                  <div
                    className={`
                      max-h-48
                      overflow-y-auto
                      rounded-xl
                      border
                      p-2
                      ${theme?.border}
                    `}
                  >
                    {states.length === 0 ? (
                      <EmptyFilter
                        text="No states available."
                        theme={theme}
                      />
                    ) : (
                      states.map(
                        (state) => {
                          const checked =
                            filters.states.includes(
                              state.name
                            );

                          return (
                            <label
                              key={state.id}
                              className={`
                                flex
                                cursor-pointer
                                items-center
                                gap-3
                                rounded-lg
                                px-3 py-2.5
                                transition
                                ${theme?.hover}
                              `}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  checked
                                }
                                onChange={(
                                  event
                                ) =>
                                  toggleState(
                                    state.name,
                                    event
                                      .target
                                      .checked
                                  )
                                }
                                className="
                                  h-4 w-4
                                  rounded
                                  border-slate-300
                                  text-emerald-600
                                  focus:ring-emerald-500
                                "
                              />

                              <span
                                className={`
                                  text-xs
                                  font-medium
                                  ${theme?.text}
                                `}
                              >
                                {state.name}
                              </span>
                            </label>
                          );
                        }
                      )
                    )}
                  </div>
                </FilterField>
              )}

              {/* Product categories */}

              {needsCategories(
                report.type
              ) && (
                <FilterField
                  icon={Layers3}
                  label="Product categories"
                  description="Optional. Select categories whose variants should be included."
                  theme={theme}
                >
                  <div
                    className={`
                      max-h-48
                      overflow-y-auto
                      rounded-xl
                      border
                      p-2
                      ${theme?.border}
                    `}
                  >
                    {categories.length ===
                    0 ? (
                      <EmptyFilter
                        text="No product categories available."
                        theme={theme}
                      />
                    ) : (
                      categories.map(
                        (category) => {
                          const ids =
                            category.variants?.map(
                              (
                                variant
                              ) =>
                                variant.id
                            ) || [];

                          const allSelected =
                            ids.length >
                              0 &&
                            ids.every(
                              (id) =>
                                filters.productVariants.includes(
                                  id
                                )
                            );

                          return (
                            <label
                              key={
                                category.id
                              }
                              className={`
                                flex
                                cursor-pointer
                                items-center
                                gap-3
                                rounded-lg
                                px-3 py-2.5
                                transition
                                ${theme?.hover}
                              `}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  allSelected
                                }
                                onChange={(
                                  event
                                ) =>
                                  toggleCategory(
                                    category,
                                    event
                                      .target
                                      .checked
                                  )
                                }
                                className="
                                  h-4 w-4
                                  rounded
                                  border-slate-300
                                  text-emerald-600
                                  focus:ring-emerald-500
                                "
                              />

                              <span
                                className={`
                                  text-xs
                                  font-medium
                                  ${theme?.text}
                                `}
                              >
                                {category.displayName ||
                                  category.name}
                              </span>
                            </label>
                          );
                        }
                      )
                    )}
                  </div>
                </FilterField>
              )}

              {/* Date range */}

              <FilterField
                icon={CalendarDays}
                label="Date range"
                description="Optional. Restrict the report to a specific collection period."
                theme={theme}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <DateInput
                    label="From"
                    value={
                      filters.dateFrom
                    }
                    onChange={(value) =>
                      updateFilter(
                        "dateFrom",
                        value
                      )
                    }
                    theme={theme}
                  />

                  <DateInput
                    label="To"
                    value={
                      filters.dateTo
                    }
                    onChange={(value) =>
                      updateFilter(
                        "dateTo",
                        value
                      )
                    }
                    theme={theme}
                  />
                </div>
              </FilterField>

              {/* Risk threshold */}

              {needsLeadThreshold(
                report.type
              ) && (
                <FilterField
                  icon={ShieldAlert}
                  label="Minimum contamination level"
                  description="Samples at or above this lead threshold will be prioritised."
                  theme={theme}
                >
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={
                        filters.minLeadLevel
                      }
                      onChange={(event) =>
                        updateFilter(
                          "minLeadLevel",
                          event.target.value
                        )
                      }
                      className={`
                        w-full
                        rounded-xl
                        border
                        px-3.5 py-3
                        pr-14
                        text-sm
                        outline-none
                        ${theme?.input}
                        ${theme?.border}
                        focus:ring-2
                        focus:ring-emerald-500/30
                      `}
                    />

                    <span
                      className="
                        pointer-events-none
                        absolute right-3
                        top-1/2
                        -translate-y-1/2
                        text-xs
                        font-semibold
                        text-slate-400
                      "
                    >
                      ppm
                    </span>
                  </div>
                </FilterField>
              )}

              {/* Generation action */}

              <div
                className={`
                  rounded-xl
                  border
                  p-3
                  ${theme?.border}
                  ${theme?.bg}
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      mt-0.5
                      flex h-8 w-8
                      shrink-0
                      items-center justify-center
                      rounded-lg
                      bg-emerald-50
                      text-emerald-600
                      dark:bg-emerald-950/30
                      dark:text-emerald-400
                    "
                  >
                    <FileText className="h-4 w-4" />
                  </div>

                  <div>
                    <p
                      className={`
                        text-xs
                        font-semibold
                        ${theme?.text}
                      `}
                    >
                      Ready to generate
                    </p>

                    <p
                      className={`
                        mt-0.5
                        text-[10px]
                        leading-4
                        ${theme?.textMuted}
                      `}
                    >
                      The report will be
                      generated as a PDF and
                      downloaded automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className={`
                    rounded-xl
                    border
                    px-4 py-2.5
                    text-xs
                    font-semibold
                    transition
                    ${theme?.border}
                    ${theme?.text}
                    ${theme?.hover}
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  `}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !isFormValid
                  }
                  className="
                    relative
                    overflow-hidden
                    rounded-xl
                    bg-emerald-600
                    px-5 py-2.5
                    text-xs
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-emerald-700
                    disabled:cursor-not-allowed
                    disabled:bg-slate-400
                  "
                >
                  {loading && (
                    <span
                      className="
                        absolute
                        inset-y-0 left-0
                        bg-white/10
                        transition-all
                      "
                      style={{
                        width: `${generationProgress}%`,
                      }}
                    />
                  )}

                  <span
                    className="
                      relative
                      flex items-center
                      justify-center
                      gap-2
                    "
                  >
                    {loading ? (
                      <>
                        <Loader className="h-3.5 w-3.5 animate-spin" />

                        {generationProgress > 0
                          ? `${generationProgress}%`
                          : "Generating..."}
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        Generate report
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Page                                                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className={`
        min-h-full
        space-y-5
        ${theme?.text}
      `}
    >
      {/* Hero */}

      <section
        className={`
          relative
          overflow-hidden
          rounded-2xl
          border
          ${theme?.border}
          ${theme?.card}
        `}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="
              absolute
              -right-24 -top-24
              h-64 w-64
              rounded-full
              bg-emerald-500/5
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -bottom-32 -left-20
              h-56 w-56
              rounded-full
              bg-slate-500/5
              blur-3xl
            "
          />
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-3 py-1
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.13em]
                  ${theme?.emeraldBorder}
                  ${theme?.emeraldText}
                  ${theme?.emerald}
                `}
              >
                <BarChart3 className="h-3 w-3" />
                Intelligence & reporting
              </div>

              <h1
                className="
                  mt-3
                  text-xl
                  font-bold
                  tracking-tight
                  sm:text-2xl
                "
              >
                Generate reports
              </h1>

              <p
                className={`
                  mt-2
                  max-w-xl
                  text-xs
                  leading-5
                  sm:text-sm
                  ${theme?.textMuted}
                `}
              >
                Turn Leadcap's sample,
                laboratory, geographic, and
                contamination data into
                structured PDF reports for
                analysis and decision-making.
              </p>
            </div>

            <div
              className={`
                flex items-center gap-2
                rounded-xl
                border
                px-3 py-2.5
                ${theme?.border}
                ${theme?.bg}
              `}
            >
              <CheckCircle2
                className={`
                  h-4 w-4
                  ${theme?.emeraldText}
                `}
              />

              <div>
                <p
                  className={`
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    ${theme?.textMuted}
                  `}
                >
                  Available formats
                </p>

                <p
                  className={`
                    mt-0.5
                    text-xs
                    font-semibold
                    ${theme?.text}
                  `}
                >
                  PDF reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report cards */}

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-bold">
            Report catalogue
          </h2>

          <p
            className={`
              mt-1
              text-[11px]
              ${theme?.textMuted}
            `}
          >
            Select a report type to configure
            its filters and generate a PDF.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {REPORT_OPTIONS.map(
            (report) => {
              const Icon = report.icon;
              const accent =
                getReportAccent(
                  report.type
                );

              return (
                <button
                  key={report.type}
                  type="button"
                  onClick={() =>
                    setSelectedReport(
                      report
                    )
                  }
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    p-4
                    text-left
                    transition-all
                    duration-200
                    hover:-translate-y-[1px]
                    hover:shadow-md
                    ${theme?.card}
                    ${theme?.border}
                  `}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`
                        flex h-10 w-10
                        shrink-0
                        items-center justify-center
                        rounded-xl
                        ${accent.icon}
                      `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          ${theme?.textMuted}
                        `}
                      >
                        {report.eyebrow}
                      </p>

                      <h3
                        className="
                          mt-1
                          text-sm
                          font-bold
                        "
                      >
                        {report.title}
                      </h3>

                      <p
                        className={`
                          mt-1.5
                          text-[11px]
                          leading-5
                          ${theme?.textMuted}
                        `}
                      >
                        {report.description}
                      </p>

                      <div
                        className={`
                          mt-3
                          inline-flex
                          items-center
                          gap-1.5
                          text-[10px]
                          font-bold
                          ${theme?.emeraldText}
                        `}
                      >
                        Configure report

                        <ArrowRight
                          className="
                            h-3.5 w-3.5
                            transition-transform
                            group-hover:translate-x-0.5
                          "
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* Guidance */}

      <section
        className={`
          rounded-2xl
          border
          p-4
          ${theme?.border}
          ${theme?.bg}
        `}
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex h-8 w-8
              shrink-0
              items-center justify-center
              rounded-lg
              bg-slate-100
              text-slate-500
              dark:bg-slate-800
              dark:text-slate-400
            "
          >
            <FileText className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-xs font-bold">
              Report generation
            </h3>

            <p
              className={`
                mt-1
                text-[10px]
                leading-5
                ${theme?.textMuted}
              `}
            >
              Choose a report above, apply
              only the filters you need, then
              generate the PDF. Required filters
              are marked in the configuration
              window.
            </p>
          </div>
        </div>
      </section>

      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() =>
            !loading &&
            setSelectedReport(null)
          }
        />
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Filter field                                                               */
/* -------------------------------------------------------------------------- */

const FilterField = ({
  icon: Icon,
  label,
  description,
  required,
  theme,
  children,
}) => (
  <div>
    <div className="mb-2.5 flex items-start gap-2">
      {Icon && (
        <Icon
          className={`
            mt-0.5
            h-3.5 w-3.5
            shrink-0
            ${theme?.emeraldText}
          `}
        />
      )}

      <div>
        <label
          className="
            text-xs
            font-bold
          "
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        {description && (
          <p
            className={`
              mt-0.5
              text-[10px]
              leading-4
              ${theme?.textMuted}
            `}
          >
            {description}
          </p>
        )}
      </div>
    </div>

    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Date input                                                                  */
/* -------------------------------------------------------------------------- */

const DateInput = ({
  label,
  value,
  onChange,
  theme,
}) => (
  <div>
    <label
      className={`
        mb-1.5
        block
        text-[10px]
        font-semibold
        ${theme?.textMuted}
      `}
    >
      {label}
    </label>

    <input
      type="date"
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className={`
        w-full
        rounded-xl
        border
        px-3
        py-2.5
        text-xs
        outline-none
        ${theme?.input}
        ${theme?.border}
        focus:ring-2
        focus:ring-emerald-500/30
      `}
    />
  </div>
);

/* -------------------------------------------------------------------------- */
/* Empty filter                                                               */
/* -------------------------------------------------------------------------- */

const EmptyFilter = ({
  text,
  theme,
}) => (
  <div
    className={`
      px-3
      py-6
      text-center
      text-xs
      ${theme?.textMuted}
    `}
  >
    {text}
  </div>
);

export default Reports;