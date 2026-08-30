import React, { useEffect, useMemo, useState } from "react";
import {
  Edit2,
  Save,
  X,
  SlidersHorizontal,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Search,
  RotateCcw,
} from "lucide-react";

import api from "../../utils/api";
import {
  validateThresholdLimits,
  formatDecimal,
} from "../../utils/thresholdUtils";
import { useTheme } from "../../context/ThemeContext";
import { useEnums } from "../../context/EnumsContext";

const FALLBACK_METALS = [
  "LEAD",
  "CADMIUM",
  "CHROMIUM",
  "NICKEL",
  "ARSENIC",
  "MERCURY",
  "COPPER",
  "ZINC",
  "COBALT",
  "MANGANESE",
];

const ThresholdManagement = () => {
  const {
    theme,
  } = useTheme();

  const {
    heavyMetals: enumsHeavyMetals,
  } = useEnums();

  const [thresholds, setThresholds] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [heavyMetals, setHeavyMetals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [filterMetal, setFilterMetal] =
    useState("all");

  const [filterCategory, setFilterCategory] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [editValues, setEditValues] =
    useState({});

  /* ---------------------------------------------------------------------- */
  /* Data                                                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    Promise.all([
      fetchThresholds(),
      fetchCategories(),
      fetchHeavyMetals(),
    ]);
  }, []);

  const fetchThresholds = async () => {
    try {
      const response =
        await api.get("/thresholds");

      setThresholds(
        response.data?.data || []
      );

      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch thresholds: " +
          (
            err.response?.data?.error ||
            err.message
          )
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response =
        await api.get(
          "/products/categories"
        );

      setCategories(
        response.data?.data || []
      );
    } catch (err) {
      console.error(
        "Failed to fetch categories:",
        err
      );
    }
  };

  const fetchHeavyMetals = async () => {
    try {
      const response =
        await api.get("/thresholds");

      const metals = [
        ...new Set(
          (
            response.data?.data || []
          )
            .map(
              (threshold) =>
                threshold.heavyMetal
            )
            .filter(Boolean)
        ),
      ].sort();

      setHeavyMetals(
        metals.length
          ? metals
          : enumsHeavyMetals?.length
          ? enumsHeavyMetals
          : FALLBACK_METALS
      );
    } catch (err) {
      console.error(
        "Failed to fetch heavy metals:",
        err
      );

      setHeavyMetals(
        enumsHeavyMetals?.length
          ? enumsHeavyMetals
          : FALLBACK_METALS
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Editing                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleEdit = (threshold) => {
    setEditingId(threshold.id);

    const categoryId =
      threshold.productCategoryId ||
      threshold.productCategory?.id;

    setEditValues({
      heavyMetal:
        threshold.heavyMetal,
      productCategoryId:
        categoryId,
      safeLimit:
        threshold.safeLimit,
      warningLimit:
        threshold.warningLimit,
      dangerLimit:
        threshold.dangerLimit,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
    setError(null);
  };

  const handleValueChange = (
    field,
    value
  ) => {
    setEditValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async (id) => {
    try {
      const safeLimit = parseFloat(
        editValues.safeLimit
      );

      const warningLimit =
        editValues.warningLimit !== "" &&
        editValues.warningLimit !== null &&
        editValues.warningLimit !== undefined
          ? parseFloat(
              editValues.warningLimit
            )
          : null;

      const dangerLimit = parseFloat(
        editValues.dangerLimit
      );

      const validation =
        validateThresholdLimits({
          safeLimit,
          warningLimit,
          dangerLimit,
        });

      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      await api.patch(
        `/thresholds/${id}`,
        {
          safeLimit,
          warningLimit,
          dangerLimit,
        }
      );

      await fetchThresholds();

      setEditingId(null);
      setEditValues({});
      setError(null);
    } catch (err) {
      setError(
        "Failed to update threshold: " +
          (
            err.response?.data?.error ||
            err.message
          )
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Filtering                                                               */
  /* ---------------------------------------------------------------------- */

  const filteredThresholds = useMemo(() => {
    const query =
      searchTerm.trim().toLowerCase();

    return thresholds.filter(
      (threshold) => {
        const matchesMetal =
          filterMetal === "all" ||
          threshold.heavyMetal ===
            filterMetal;

        const categoryId =
          threshold.productCategoryId ||
          threshold.productCategory?.id;

        const matchesCategory =
          filterCategory === "all" ||
          categoryId === filterCategory;

        const categoryName =
          threshold.productCategory
            ?.displayName ||
          categories.find(
            (category) =>
              category.id === categoryId
          )?.displayName ||
          "";

        const matchesSearch =
          !query ||
          threshold.heavyMetal
            ?.toLowerCase()
            .includes(query) ||
          categoryName
            ?.toLowerCase()
            .includes(query);

        return (
          matchesMetal &&
          matchesCategory &&
          matchesSearch
        );
      }
    );
  }, [
    thresholds,
    categories,
    filterMetal,
    filterCategory,
    searchTerm,
  ]);

  const getCategoryName = (
    threshold
  ) => {
    if (
      threshold.productCategory
        ?.displayName
    ) {
      return threshold.productCategory
        .displayName;
    }

    const categoryId =
      threshold.productCategoryId ||
      threshold.productCategory?.id;

    return (
      categories.find(
        (category) =>
          category.id === categoryId
      )?.displayName || "Unknown"
    );
  };

  const resetFilters = () => {
    setFilterMetal("all");
    setFilterCategory("all");
    setSearchTerm("");
  };

  const activeFilterCount =
    [
      filterMetal !== "all",
      filterCategory !== "all",
      Boolean(searchTerm),
    ].filter(Boolean).length;

  /* ---------------------------------------------------------------------- */
  /* Stats                                                                   */
  /* ---------------------------------------------------------------------- */

  const totalThresholds =
    thresholds.length;

  const filteredCount =
    filteredThresholds.length;

  const metalCount =
    new Set(
      thresholds.map(
        (item) => item.heavyMetal
      )
    ).size;

  const categoryCount =
    new Set(
      thresholds.map(
        (item) =>
          item.productCategoryId ||
          item.productCategory?.id
      )
    ).size;

  /* ---------------------------------------------------------------------- */
  /* Input                                                                    */
  /* ---------------------------------------------------------------------- */

  const ThresholdInput = ({
    field,
    value,
    disabled = false,
  }) => (
    <input
      type="number"
      step="0.001"
      value={value ?? ""}
      disabled={disabled}
      onChange={(event) =>
        handleValueChange(
          field,
          event.target.value
        )
      }
      className={`
        w-24
        rounded-lg
        border
        px-2.5
        py-2
        text-center
        text-xs
        font-semibold
        outline-none
        transition
        ${theme?.input}
        ${theme?.border}
        focus:ring-2
        focus:ring-emerald-500/30
      `}
    />
  );

  /* ---------------------------------------------------------------------- */
  /* Threshold value                                                         */
  /* ---------------------------------------------------------------------- */

  const LimitValue = ({
    type,
    value,
  }) => {
    const config = {
      safe: {
        icon: ShieldCheck,
        iconClass:
          "text-emerald-600 dark:text-emerald-400",
        bg:
          "bg-emerald-50/70 dark:bg-emerald-950/20",
      },
      warning: {
        icon: AlertTriangle,
        iconClass:
          "text-amber-600 dark:text-amber-400",
        bg:
          "bg-amber-50/70 dark:bg-amber-950/20",
      },
      danger: {
        icon: AlertOctagon,
        iconClass:
          "text-red-600 dark:text-red-400",
        bg:
          "bg-red-50/70 dark:bg-red-950/20",
      },
    }[type];

    const Icon = config.icon;

    return (
      <div
        className={`
          inline-flex
          items-center
          gap-2
          rounded-lg
          px-2.5
          py-1.5
          ${config.bg}
        `}
      >
        <Icon
          className={`
            h-3.5 w-3.5
            ${config.iconClass}
          `}
        />

        <span
          className={`
            text-xs
            font-bold
            ${theme?.text}
          `}
        >
          {value !== null &&
          value !== undefined &&
          value !== ""
            ? formatDecimal(value)
            : "—"}
        </span>
      </div>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className={`
        min-h-full
        p-3
        sm:p-4
        lg:p-6
        ${theme?.bg}
      `}
    >
      <div className="mx-auto max-w-7xl space-y-5">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

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
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

          <div className="relative p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
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
                  <SlidersHorizontal className="h-3 w-3" />
                  Regulatory configuration
                </div>

                <h1
                  className={`
                    mt-3
                    text-xl
                    font-bold
                    tracking-tight
                    sm:text-2xl
                    ${theme?.text}
                  `}
                >
                  Threshold Management
                </h1>

                <p
                  className={`
                    mt-2
                    max-w-2xl
                    text-xs
                    leading-5
                    sm:text-sm
                    ${theme?.textMuted}
                  `}
                >
                  Configure safe, warning,
                  and danger concentration
                  limits for heavy metals
                  detected in sampled products.
                </p>
              </div>

              <div
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-3
                  py-2.5
                  ${theme?.border}
                  ${theme?.bg}
                `}
              >
                <SlidersHorizontal
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
                    Measurement
                  </p>

                  <p
                    className={`
                      text-xs
                      font-bold
                      ${theme?.text}
                    `}
                  >
                    Parts per million (ppm)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Error                                                             */}
        {/* ---------------------------------------------------------------- */}

        {error && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
              dark:border-red-900/50
              dark:bg-red-950/20
              dark:text-red-300
            "
          >
            <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0" />

            <span className="min-w-0 flex-1 text-xs leading-5">
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
              className="rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Summary cards                                                     */}
        {/* ---------------------------------------------------------------- */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Total thresholds"
            value={totalThresholds}
            icon={SlidersHorizontal}
            theme={theme}
          />

          <SummaryCard
            label="Heavy metals"
            value={metalCount}
            icon={AlertOctagon}
            theme={theme}
          />

          <SummaryCard
            label="Categories"
            value={categoryCount}
            icon={ShieldCheck}
            theme={theme}
          />

          <SummaryCard
            label="Showing"
            value={filteredCount}
            icon={Search}
            theme={theme}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Filters                                                            */}
        {/* ---------------------------------------------------------------- */}

        <section
          className={`
            rounded-2xl
            border
            p-4
            ${theme?.border}
            ${theme?.card}
          `}
        >
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                className={`
                  text-xs
                  font-bold
                  ${theme?.text}
                `}
              >
                Threshold catalogue
              </h2>

              <p
                className={`
                  mt-0.5
                  text-[10px]
                  ${theme?.textMuted}
                `}
              >
                Filter the regulatory limits
                you need to review.
              </p>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className={`
                  inline-flex
                  items-center
                  gap-1.5
                  self-start
                  rounded-lg
                  px-2.5
                  py-1.5
                  text-[10px]
                  font-semibold
                  ${theme?.textMuted}
                  ${theme?.hover}
                `}
              >
                <RotateCcw className="h-3 w-3" />
                Reset filters
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {/* Search */}

            <div className="relative md:col-span-1">
              <Search
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search metal or category..."
                className={`
                  w-full
                  rounded-xl
                  border
                  py-2.5
                  pl-9
                  pr-3
                  text-xs
                  outline-none
                  ${theme?.input}
                  ${theme?.border}
                  focus:ring-2
                  focus:ring-emerald-500/30
                `}
              />
            </div>

            {/* Metal */}

            <select
              value={filterMetal}
              onChange={(event) =>
                setFilterMetal(
                  event.target.value
                )
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
            >
              <option value="all">
                All Heavy Metals
              </option>

              {heavyMetals.map((metal) => (
                <option
                  key={metal}
                  value={metal}
                >
                  {metal}
                </option>
              ))}
            </select>

            {/* Category */}

            <select
              value={filterCategory}
              onChange={(event) =>
                setFilterCategory(
                  event.target.value
                )
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
            >
              <option value="all">
                All Product Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.displayName ||
                      category.name}
                  </option>
                )
              )}
            </select>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Loading                                                           */}
        {/* ---------------------------------------------------------------- */}

        {loading ? (
          <div
            className={`
              rounded-2xl
              border
              px-5
              py-16
              text-center
              ${theme?.border}
              ${theme?.card}
            `}
          >
            <div
              className="
                mx-auto
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                bg-emerald-50
                text-emerald-600
                dark:bg-emerald-950/30
                dark:text-emerald-400
              "
            >
              <SlidersHorizontal className="h-5 w-5 animate-pulse" />
            </div>

            <p
              className={`
                mt-3
                text-xs
                font-semibold
                ${theme?.text}
              `}
            >
              Loading thresholds
            </p>

            <p
              className={`
                mt-1
                text-[10px]
                ${theme?.textMuted}
              `}
            >
              Retrieving current regulatory
              configuration...
            </p>
          </div>
        ) : filteredThresholds.length ===
          0 ? (
          /* -------------------------------------------------------------- */
          /* Empty                                                           */
          /* -------------------------------------------------------------- */

          <div
            className={`
              rounded-2xl
              border
              px-5
              py-16
              text-center
              ${theme?.border}
              ${theme?.card}
            `}
          >
            <div
              className="
                mx-auto
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                bg-slate-100
                text-slate-500
                dark:bg-slate-800
                dark:text-slate-400
              "
            >
              <Search className="h-5 w-5" />
            </div>

            <p
              className={`
                mt-3
                text-xs
                font-semibold
                ${theme?.text}
              `}
            >
              No thresholds found
            </p>

            <p
              className={`
                mx-auto
                mt-1
                max-w-sm
                text-[10px]
                leading-5
                ${theme?.textMuted}
              `}
            >
              Try changing the heavy metal,
              category, or search filters.
            </p>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-lg
                  bg-emerald-600
                  px-3
                  py-2
                  text-[10px]
                  font-bold
                  text-white
                  hover:bg-emerald-700
                "
              >
                <RotateCcw className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ------------------------------------------------------------ */}
            {/* Desktop table                                                 */}
            {/* ------------------------------------------------------------ */}

            <section
              className={`
                hidden
                overflow-hidden
                rounded-2xl
                border
                lg:block
                ${theme?.border}
                ${theme?.card}
              `}
            >
              <div
                className={`
                  flex
                  items-center
                  justify-between
                  border-b
                  px-4
                  py-3
                  ${theme?.border}
                `}
              >
                <div>
                  <h2
                    className={`
                      text-xs
                      font-bold
                      ${theme?.text}
                    `}
                  >
                    Regulatory thresholds
                  </h2>

                  <p
                    className={`
                      mt-0.5
                      text-[10px]
                      ${theme?.textMuted}
                    `}
                  >
                    {filteredCount} of{" "}
                    {totalThresholds}{" "}
                    thresholds
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    bg-emerald-50
                    px-2.5
                    py-1
                    text-[9px]
                    font-bold
                    text-emerald-700
                    dark:bg-emerald-950/30
                    dark:text-emerald-400
                  "
                >
                  ppm
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr
                      className={`
                        border-b
                        ${theme?.border}
                        ${theme?.bg}
                      `}
                    >
                      <th
                        className={`
                          px-4
                          py-3
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

                      <th
                        className={`
                          px-4
                          py-3
                          text-left
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wider
                          ${theme?.textMuted}
                        `}
                      >
                        Product category
                      </th>

                      <th
                        className={`
                          px-4
                          py-3
                          text-center
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wider
                          ${theme?.textMuted}
                        `}
                      >
                        Safe
                      </th>

                      <th
                        className={`
                          px-4
                          py-3
                          text-center
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wider
                          ${theme?.textMuted}
                        `}
                      >
                        Warning
                      </th>

                      <th
                        className={`
                          px-4
                          py-3
                          text-center
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wider
                          ${theme?.textMuted}
                        `}
                      >
                        Danger
                      </th>

                      <th
                        className={`
                          px-4
                          py-3
                          text-right
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wider
                          ${theme?.textMuted}
                        `}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredThresholds.map(
                      (threshold) => {
                        const isEditing =
                          editingId ===
                          threshold.id;

                        return (
                          <tr
                            key={
                              threshold.id
                            }
                            className={`
                              border-b
                              last:border-b-0
                              ${theme?.border}
                              ${theme?.hover}
                            `}
                          >
                            {/* Metal */}

                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="
                                    flex h-8 w-8
                                    shrink-0
                                    items-center justify-center
                                    rounded-lg
                                    bg-slate-100
                                    text-[8px]
                                    font-bold
                                    text-slate-600
                                    dark:bg-slate-800
                                    dark:text-slate-300
                                  "
                                >
                                  {threshold.heavyMetal?.slice(
                                    0,
                                    2
                                  )}
                                </div>

                                <span
                                  className={`
                                    text-xs
                                    font-bold
                                    ${theme?.text}
                                  `}
                                >
                                  {
                                    threshold.heavyMetal
                                  }
                                </span>
                              </div>
                            </td>

                            {/* Category */}

                            <td className="px-4 py-3.5">
                              <span
                                className={`
                                  text-xs
                                  ${theme?.text}
                                `}
                              >
                                {getCategoryName(
                                  threshold
                                )}
                              </span>
                            </td>

                            {/* Safe */}

                            <td className="px-4 py-3.5 text-center">
                              {isEditing ? (
                                <ThresholdInput
                                  field="safeLimit"
                                  value={
                                    editValues.safeLimit
                                  }
                                />
                              ) : (
                                <LimitValue
                                  type="safe"
                                  value={
                                    threshold.safeLimit
                                  }
                                />
                              )}
                            </td>

                            {/* Warning */}

                            <td className="px-4 py-3.5 text-center">
                              {isEditing ? (
                                <ThresholdInput
                                  field="warningLimit"
                                  value={
                                    editValues.warningLimit
                                  }
                                />
                              ) : (
                                <LimitValue
                                  type="warning"
                                  value={
                                    threshold.warningLimit
                                  }
                                />
                              )}
                            </td>

                            {/* Danger */}

                            <td className="px-4 py-3.5 text-center">
                              {isEditing ? (
                                <ThresholdInput
                                  field="dangerLimit"
                                  value={
                                    editValues.dangerLimit
                                  }
                                />
                              ) : (
                                <LimitValue
                                  type="danger"
                                  value={
                                    threshold.dangerLimit
                                  }
                                />
                              )}
                            </td>

                            {/* Action */}

                            <td className="px-4 py-3.5 text-right">
                              {isEditing ? (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSave(
                                        threshold.id
                                      )
                                    }
                                    className="
                                      flex h-8 w-8
                                      items-center justify-center
                                      rounded-lg
                                      bg-emerald-600
                                      text-white
                                      hover:bg-emerald-700
                                    "
                                    title="Save changes"
                                  >
                                    <Save className="h-3.5 w-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={
                                      handleCancelEdit
                                    }
                                    className={`
                                      flex h-8 w-8
                                      items-center justify-center
                                      rounded-lg
                                      ${theme?.bg}
                                      ${theme?.textMuted}
                                      ${theme?.hover}
                                    `}
                                    title="Cancel"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      threshold
                                    )
                                  }
                                  className={`
                                    flex h-8 w-8
                                    ml-auto
                                    items-center justify-center
                                    rounded-lg
                                    ${theme?.bg}
                                    ${theme?.textMuted}
                                    ${theme?.hover}
                                  `}
                                  title="Edit threshold"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* Mobile / tablet cards                                         */}
            {/* ------------------------------------------------------------ */}

            <div className="space-y-3 lg:hidden">
              {filteredThresholds.map(
                (threshold) => {
                  const isEditing =
                    editingId ===
                    threshold.id;

                  return (
                    <section
                      key={threshold.id}
                      className={`
                        overflow-hidden
                        rounded-2xl
                        border
                        ${theme?.border}
                        ${theme?.card}
                      `}
                    >
                      {/* Card header */}

                      <div
                        className={`
                          flex
                          items-start
                          justify-between
                          gap-3
                          border-b
                          px-4
                          py-3.5
                          ${theme?.border}
                        `}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className="
                              flex h-9 w-9
                              shrink-0
                              items-center justify-center
                              rounded-xl
                              bg-slate-100
                              text-[9px]
                              font-bold
                              text-slate-600
                              dark:bg-slate-800
                              dark:text-slate-300
                            "
                          >
                            {threshold.heavyMetal?.slice(
                              0,
                              2
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3
                              className={`
                                truncate
                                text-xs
                                font-bold
                                ${theme?.text}
                              `}
                            >
                              {
                                threshold.heavyMetal
                              }
                            </h3>

                            <p
                              className={`
                                mt-0.5
                                truncate
                                text-[10px]
                                ${theme?.textMuted}
                              `}
                            >
                              {getCategoryName(
                                threshold
                              )}
                            </p>
                          </div>
                        </div>

                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                threshold
                              )
                            }
                            className={`
                              flex h-8 w-8
                              shrink-0
                              items-center justify-center
                              rounded-lg
                              ${theme?.bg}
                              ${theme?.textMuted}
                              ${theme?.hover}
                            `}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Values */}

                      <div className="grid grid-cols-3 gap-2 p-3.5">
                        <ThresholdMobileValue
                          label="Safe"
                          type="safe"
                          value={
                            threshold.safeLimit
                          }
                          editing={
                            isEditing
                          }
                          input={
                            <ThresholdInput
                              field="safeLimit"
                              value={
                                editValues.safeLimit
                              }
                            />
                          }
                          theme={theme}
                        />

                        <ThresholdMobileValue
                          label="Warning"
                          type="warning"
                          value={
                            threshold.warningLimit
                          }
                          editing={
                            isEditing
                          }
                          input={
                            <ThresholdInput
                              field="warningLimit"
                              value={
                                editValues.warningLimit
                              }
                            />
                          }
                          theme={theme}
                        />

                        <ThresholdMobileValue
                          label="Danger"
                          type="danger"
                          value={
                            threshold.dangerLimit
                          }
                          editing={
                            isEditing
                          }
                          input={
                            <ThresholdInput
                              field="dangerLimit"
                              value={
                                editValues.dangerLimit
                              }
                            />
                          }
                          theme={theme}
                        />
                      </div>

                      {/* Editing actions */}

                      {isEditing && (
                        <div
                          className={`
                            flex
                            gap-2
                            border-t
                            px-3.5
                            py-3
                            ${theme?.border}
                          `}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleSave(
                                threshold.id
                              )
                            }
                            className="
                              flex
                              flex-1
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              bg-emerald-600
                              px-3
                              py-2.5
                              text-xs
                              font-bold
                              text-white
                              hover:bg-emerald-700
                            "
                          >
                            <Save className="h-3.5 w-3.5" />
                            Save changes
                          </button>

                          <button
                            type="button"
                            onClick={
                              handleCancelEdit
                            }
                            className={`
                              flex
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              border
                              px-4
                              py-2.5
                              text-xs
                              font-semibold
                              ${theme?.border}
                              ${theme?.text}
                              ${theme?.hover}
                            `}
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </section>
                  );
                }
              )}
            </div>
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Legend                                                            */}
        {/* ---------------------------------------------------------------- */}

        <section
          className={`
            rounded-2xl
            border
            p-4
            ${theme?.border}
            ${theme?.card}
          `}
        >
          <div className="mb-3">
            <h2
              className={`
                text-xs
                font-bold
                ${theme?.text}
              `}
            >
              Threshold interpretation
            </h2>

            <p
              className={`
                mt-0.5
                text-[10px]
                ${theme?.textMuted}
              `}
            >
              How the configured concentration
              limits are interpreted.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <LegendItem
              icon={ShieldCheck}
              title="Safe limit"
              description="Concentration below this level is considered safe for use."
              type="safe"
              theme={theme}
            />

            <LegendItem
              icon={AlertTriangle}
              title="Warning limit"
              description="Concentration where additional caution is advised."
              type="warning"
              theme={theme}
            />

            <LegendItem
              icon={AlertOctagon}
              title="Danger limit"
              description="Concentration at which the product is considered unsafe."
              type="danger"
              theme={theme}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* Summary Card                                                               */
/* ========================================================================== */

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  theme,
}) => (
  <div
    className={`
      rounded-2xl
      border
      p-3.5
      sm:p-4
      ${theme?.border}
      ${theme?.card}
    `}
  >
    <div className="flex items-center gap-2.5">
      <div
        className="
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
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p
          className={`
            truncate
            text-[9px]
            font-bold
            uppercase
            tracking-wider
            ${theme?.textMuted}
          `}
        >
          {label}
        </p>

        <p
          className={`
            mt-0.5
            text-lg
            font-bold
            ${theme?.text}
          `}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);

/* ========================================================================== */
/* Mobile threshold value                                                    */
/* ========================================================================== */

const ThresholdMobileValue = ({
  label,
  type,
  value,
  editing,
  input,
  theme,
}) => {
  const configs = {
    safe: {
      bg:
        "bg-emerald-50/70 dark:bg-emerald-950/20",
      text:
        "text-emerald-700 dark:text-emerald-400",
    },
    warning: {
      bg:
        "bg-amber-50/70 dark:bg-amber-950/20",
      text:
        "text-amber-700 dark:text-amber-400",
    },
    danger: {
      bg:
        "bg-red-50/70 dark:bg-red-950/20",
      text:
        "text-red-700 dark:text-red-400",
    },
  };

  const config = configs[type];

  return (
    <div
      className={`
        min-w-0
        rounded-xl
        p-2.5
        ${config.bg}
      `}
    >
      <p
        className={`
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          ${config.text}
        `}
      >
        {label}
      </p>

      <div className="mt-2">
        {editing ? (
          input
        ) : (
          <p
            className={`
              truncate
              text-sm
              font-bold
              ${theme?.text}
            `}
          >
            {value !== null &&
            value !== undefined &&
            value !== ""
              ? formatDecimal(value)
              : "—"}
          </p>
        )}
      </div>

      <p
        className={`
          mt-1
          text-[8px]
          ${theme?.textMuted}
        `}
      >
        ppm
      </p>
    </div>
  );
};

/* ========================================================================== */
/* Legend item                                                                */
/* ========================================================================== */

const LegendItem = ({
  icon: Icon,
  title,
  description,
  type,
  theme,
}) => {
  const styles = {
    safe: {
      icon:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    },
    warning: {
      icon:
        "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    },
    danger: {
      icon:
        "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    },
  };

  return (
    <div
      className={`
        flex
        gap-2.5
        rounded-xl
        border
        p-3
        ${theme?.border}
      `}
    >
      <div
        className={`
          flex h-8 w-8
          shrink-0
          items-center justify-center
          rounded-lg
          ${styles[type].icon}
        `}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p
          className={`
            text-[10px]
            font-bold
            ${theme?.text}
          `}
        >
          {title}
        </p>

        <p
          className={`
            mt-0.5
            text-[9px]
            leading-4
            ${theme?.textMuted}
          `}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default ThresholdManagement;