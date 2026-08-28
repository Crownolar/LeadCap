import {
  Search,
  Download,
  Lock,
  Loader,
  SlidersHorizontal,
  Database,
  MapPin,
  UserRound,
  CalendarDays,
  Eye,
  Trash2,
  X,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

import api from "../../utils/api";
import SampleDetailModal from "../modals/SampleDetailModal";
import HeavyMetalStatusBadge from "../common/HeavyMetalStatusBadge";
import { getHeavyMetalPublicStatus } from "../../utils/heavyMetalStatus";
import { useState } from "react";

const DatabaseView = ({
  theme,
  loading,
  samples,
  states,
  currentUser,
  filterState,
  setFilterState,
  filterProductVariant,
  setFilterProductVariant,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  filteredSamples,
  selectedSample,
  setSelectedSample,
  fetchStateError,
  fetchSampleError,
  pagination,
  searchTerm,
  setSearchTerm,
  handleFetchMore,
  loadingMore,
  loadingMoreError,
}) => {
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    sample: null,
  });

  const isDataCollector =
    currentUser?.role
      ?.toLowerCase()
      .replace(/[\s_]/g, "") === "datacollector";

  const normalizedRole =
    currentUser?.role
      ?.toLowerCase()
      .replace(/[\s_]/g, "") ?? "";

  const isHeadResearcher =
    normalizedRole === "headresearcher";

  const isSuperAdmin =
    normalizedRole === "superadmin";

  const canSeeCollector =
    isSuperAdmin || isHeadResearcher;

  /* ---------------------------------------------------------------------- */
  /* Access restricted                                                      */
  /* ---------------------------------------------------------------------- */

  if (isDataCollector) {
    return (
      <div
        className={`
          flex min-h-[70vh]
          items-center justify-center
          p-4 sm:p-6
          ${theme?.bg}
        `}
      >
        <div
          className={`
            w-full max-w-md
            rounded-2xl
            border
            p-7 sm:p-8
            text-center
            shadow-sm
            ${theme?.card}
            ${theme?.border}
          `}
        >
          <div
            className={`
              mx-auto mb-5
              flex h-14 w-14
              items-center justify-center
              rounded-2xl
              ${theme?.moderate}
            `}
          >
            <Lock className="h-6 w-6" />
          </div>

          <h2
            className={`
              text-lg font-bold
              ${theme?.text}
            `}
          >
            Database access restricted
          </h2>

          <p
            className={`
              mx-auto mt-2
              max-w-sm
              text-sm leading-6
              ${theme?.textMuted}
            `}
          >
            Data collectors can only view their own
            collected samples from the{" "}
            <strong>My Samples</strong> section.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Export                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleExcelExportClick = async () => {
    try {
      const response = await api.get(
        "/samples/export/data",
        {
          params: { format: "excel" },
          responseType: "blob",
        }
      );

      const url =
        window.URL.createObjectURL(
          new Blob([response.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        `samples-export-${
          new Date()
            .toISOString()
            .split("T")[0]
        }.xlsx`
      );

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Failed to export samples:",
        error
      );

      alert(
        "Failed to export samples. Please try again."
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Delete                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleDeleteSample = async (
    sample
  ) => {
    try {
      await api.delete(
        `/samples/${sample.id}`
      );

      setDeleteConfirmModal({
        isOpen: false,
        sample: null,
      });
    } catch (error) {
      console.error(
        "Failed to delete sample:",
        error
      );

      alert(
        "Failed to delete sample. Please try again."
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Filter helpers                                                         */
  /* ---------------------------------------------------------------------- */

  const clearFilters = () => {
    setSearchTerm("");
    setFilterState("all");
    setFilterCategory("all");
    setFilterProductVariant("all");
    setFilterStatus("all");
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    filterState !== "all" ||
    filterCategory !== "all" ||
    filterProductVariant !== "all" ||
    filterStatus !== "all";

  const uniqueCategoryIds = [
    ...new Set(
      (samples || [])
        .map(
          (sample) =>
            sample?.productVariant?.categoryId
        )
        .filter(Boolean)
    ),
  ];

  const uniqueProductIds = [
    ...new Set(
      (samples || [])
        .map(
          (sample) =>
            sample?.productVariant?.id
        )
        .filter(Boolean)
    ),
  ];

  /* ---------------------------------------------------------------------- */
  /* Reusable filter                                                        */
  /* ---------------------------------------------------------------------- */

  const FilterSelect = ({
    value,
    onChange,
    children,
    disabled,
  }) => (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={`
          h-10 w-full
          appearance-none
          rounded-xl
          border
          px-3 pr-9
          text-xs
          font-medium
          outline-none
          transition
          ${theme?.input}
          ${theme?.border}
          focus:border-emerald-500
          focus:ring-2
          focus:ring-emerald-500/10
          disabled:cursor-not-allowed
          disabled:opacity-50
        `}
      >
        {children}
      </select>

      <ChevronDown
        className={`
          pointer-events-none
          absolute right-3 top-1/2
          h-3.5 w-3.5
          -translate-y-1/2
          ${theme?.textMuted}
        `}
      />
    </div>
  );

  /* ---------------------------------------------------------------------- */
  /* Delete modal                                                           */
  /* ---------------------------------------------------------------------- */

  const DeleteConfirmModal = () => {
    if (!deleteConfirmModal.isOpen) {
      return null;
    }

    const sample =
      deleteConfirmModal.sample;

    return (
      <div
        className="
          fixed inset-0 z-[100]
          flex items-center justify-center
          bg-slate-950/50
          p-4
          backdrop-blur-sm
        "
      >
        <div
          className={`
            w-full max-w-md
            rounded-2xl
            border
            p-5 sm:p-6
            shadow-2xl
            ${theme?.card}
            ${theme?.border}
          `}
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex h-10 w-10
                shrink-0
                items-center justify-center
                rounded-xl
                bg-red-50
                text-red-600
                dark:bg-red-950/30
                dark:text-red-400
              "
            >
              <Trash2 className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h3
                className={`
                  text-sm font-bold
                  ${theme?.text}
                `}
              >
                Delete sample?
              </h3>

              <p
                className={`
                  mt-1 text-xs leading-5
                  ${theme?.textMuted}
                `}
              >
                This action will permanently remove{" "}
                <strong>
                  {sample?.sampleId ||
                    sample?.productName ||
                    "this sample"}
                </strong>{" "}
                from the database.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setDeleteConfirmModal({
                  isOpen: false,
                  sample: null,
                })
              }
              className={`
                ml-auto rounded-lg p-1.5
                ${theme?.textMuted}
                ${theme?.hover}
              `}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            className="
              mt-5 flex
              flex-col-reverse
              gap-2
              sm:flex-row sm:justify-end
            "
          >
            <button
              type="button"
              onClick={() =>
                setDeleteConfirmModal({
                  isOpen: false,
                  sample: null,
                })
              }
              className={`
                rounded-xl
                border
                px-4 py-2.5
                text-xs font-semibold
                ${theme?.border}
                ${theme?.text}
                ${theme?.hover}
              `}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                handleDeleteSample(sample)
              }
              className="
                rounded-xl
                bg-red-600
                px-4 py-2.5
                text-xs font-semibold
                text-white
                transition
                hover:bg-red-700
              "
            >
              Delete sample
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Error state                                                            */
  /* ---------------------------------------------------------------------- */

  if (
    fetchSampleError &&
    !loading
  ) {
    return (
      <>
        <div
          className={`
            rounded-2xl
            border
            p-8
            text-center
            ${theme?.card}
            ${theme?.border}
          `}
        >
          <div
            className="
              mx-auto mb-4
              flex h-12 w-12
              items-center justify-center
              rounded-xl
              bg-red-50
              text-red-600
              dark:bg-red-950/30
              dark:text-red-400
            "
          >
            <Database className="h-5 w-5" />
          </div>

          <h2
            className={`
              text-base font-bold
              ${theme?.text}
            `}
          >
            Unable to load sample database
          </h2>

          <p
            className={`
              mx-auto mt-2
              max-w-md
              text-sm
              ${theme?.textMuted}
            `}
          >
            {fetchSampleError}
          </p>
        </div>

        <DeleteConfirmModal />
      </>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Main                                                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className={`
        space-y-5
        ${theme?.text}
      `}
    >
      {/* ================================================================ */}
      {/* PAGE HEADER                                                       */}
      {/* ================================================================ */}

      <div
        className={`
          rounded-2xl
          border
          p-5 sm:p-6
          ${theme?.card}
          ${theme?.border}
        `}
      >
        <div
          className="
            flex flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div className="flex items-start gap-3">
            <div
              className={`
                flex h-11 w-11
                shrink-0
                items-center justify-center
                rounded-xl
                ${theme?.emerald}
                ${theme?.emeraldText}
              `}
            >
              <Database className="h-5 w-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className={`
                    text-lg font-bold
                    tracking-tight
                    sm:text-xl
                    ${theme?.text}
                  `}
                >
                  Sample Database
                </h1>

                <span
                  className={`
                    rounded-full
                    border
                    px-2 py-0.5
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-wider
                    ${theme?.border}
                    ${theme?.textMuted}
                  `}
                >
                  Research records
                </span>
              </div>

              <p
                className={`
                  mt-1 max-w-2xl
                  text-xs leading-5
                  ${theme?.textMuted}
                `}
              >
                Search, filter and inspect collected
                environmental sample records.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExcelExportClick}
            disabled={loading}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-emerald-600
              px-4
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-emerald-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Download className="h-3.5 w-3.5" />
            Export Excel
          </button>
        </div>

        {/* ============================================================ */}
        {/* SEARCH + FILTERS                                              */}
        {/* ============================================================ */}

        <div
          className={`
            mt-5
            border-t
            pt-5
            ${theme?.border}
          `}
        >
          <div
            className="
              grid
              grid-cols-1
              gap-2.5
              md:grid-cols-2
              xl:grid-cols-[minmax(220px,1.5fr)_repeat(4,minmax(140px,1fr))_auto]
            "
          >
            {/* Search */}

            <div className="relative">
              <Search
                className={`
                  absolute left-3
                  top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  ${theme?.textMuted}
                `}
              />

              <input
                type="text"
                disabled={
                  loading ||
                  Boolean(fetchSampleError)
                }
                placeholder="Search sample, product, brand..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                className={`
                  h-10 w-full
                  rounded-xl
                  border
                  pl-9 pr-9
                  text-xs
                  outline-none
                  transition
                  ${theme?.input}
                  ${theme?.border}
                  focus:border-emerald-500
                  focus:ring-2
                  focus:ring-emerald-500/10
                `}
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  className={`
                    absolute right-2.5
                    top-1/2
                    -translate-y-1/2
                    rounded-md
                    p-1
                    ${theme?.textMuted}
                    ${theme?.hover}
                  `}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* State */}

            <FilterSelect
              value={filterState}
              disabled={loading}
              onChange={(event) =>
                setFilterState(
                  event.target.value
                )
              }
            >
              <option value="all">
                All states
              </option>

              {states?.map((state) => (
                <option
                  key={state.id}
                  value={state.id}
                >
                  {state.name}
                </option>
              ))}
            </FilterSelect>

            {/* Category */}

            <FilterSelect
              value={filterCategory}
              disabled={loading}
              onChange={(event) =>
                setFilterCategory(
                  event.target.value
                )
              }
            >
              <option value="all">
                All categories
              </option>

              {uniqueCategoryIds.map(
                (categoryId) => {
                  const category =
                    samples?.find(
                      (sample) =>
                        sample?.productVariant
                          ?.categoryId ===
                        categoryId
                    )?.productVariant
                      ?.category;

                  return (
                    <option
                      key={categoryId}
                      value={categoryId}
                    >
                      {category?.displayName ||
                        "Unknown"}
                    </option>
                  );
                }
              )}
            </FilterSelect>

            {/* Product */}

            <FilterSelect
              value={filterProductVariant}
              disabled={loading}
              onChange={(event) =>
                setFilterProductVariant(
                  event.target.value
                )
              }
            >
              <option value="all">
                All products
              </option>

              {uniqueProductIds.map(
                (variantId) => {
                  const variant =
                    samples?.find(
                      (sample) =>
                        sample?.productVariant
                          ?.id === variantId
                    )?.productVariant;

                  return (
                    <option
                      key={variantId}
                      value={variantId}
                    >
                      {variant?.displayName ||
                        variant?.name ||
                        "Unknown"}
                    </option>
                  );
                }
              )}
            </FilterSelect>

            {/* Status */}

            <FilterSelect
              value={filterStatus}
              disabled={loading}
              onChange={(event) =>
                setFilterStatus(
                  event.target.value
                )
              }
            >
              <option value="all">
                All results
              </option>
              <option value="safe">
                Safe
              </option>
              <option value="moderate">
                Moderate
              </option>
              <option value="contaminated">
                Contaminated
              </option>
              <option value="pending">
                Pending
              </option>
            </FilterSelect>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={`
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-1.5
                  rounded-xl
                  border
                  px-3
                  text-xs
                  font-semibold
                  ${theme?.border}
                  ${theme?.textMuted}
                  ${theme?.hover}
                `}
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Filter status line */}

          <div
            className="
              mt-3
              flex
              flex-wrap
              items-center
              justify-between
              gap-2
            "
          >
            <div
              className={`
                flex items-center gap-2
                text-[10px]
                ${theme?.textMuted}
              `}
            >
              <SlidersHorizontal className="h-3 w-3" />

              {hasActiveFilters
                ? "Filters applied"
                : "Showing all available records"}
            </div>

            {fetchStateError && (
              <span className="text-[10px] font-medium text-red-600">
                Unable to load states. Check your
                connection and refresh.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* DATABASE CONTENT                                                  */}
      {/* ================================================================ */}

      <div
        className={`
          overflow-hidden
          rounded-2xl
          border
          ${theme?.card}
          ${theme?.border}
        `}
      >
        {/* Database toolbar */}

        <div
          className={`
            flex flex-col
            gap-3
            border-b
            px-4 py-3.5
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-5
            ${theme?.border}
          `}
        >
          <div className="flex items-center gap-2">
            <div
              className={`
                flex h-8 w-8
                items-center justify-center
                rounded-lg
                ${theme?.bg}
              `}
            >
              <Database
                className={`h-3.5 w-3.5 ${theme?.emeraldText}`}
              />
            </div>

            <div>
              <p
                className={`
                  text-xs font-bold
                  ${theme?.text}
                `}
              >
                Sample records
              </p>

              <p
                className={`
                  text-[10px]
                  ${theme?.textMuted}
                `}
              >
                {filteredSamples?.length || 0}{" "}
                records currently displayed
              </p>
            </div>
          </div>

          {loading && (
            <div
              className={`
                flex items-center gap-2
                text-[10px]
                ${theme?.textMuted}
              `}
            >
              <Loader className="h-3 w-3 animate-spin" />
              Loading records...
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* DESKTOP TABLE                                                 */}
        {/* ============================================================ */}

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[980px] text-xs">
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
                    px-5 py-3
                    text-left
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    ${theme?.textMuted}
                  `}
                >
                  Product
                </th>

                <th
                  className={`
                    px-4 py-3
                    text-left
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    ${theme?.textMuted}
                  `}
                >
                  Location
                </th>

                {canSeeCollector && (
                  <th
                    className={`
                      px-4 py-3
                      text-left
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      ${theme?.textMuted}
                    `}
                  >
                    Collector
                  </th>
                )}

                <th
                  className={`
                    px-4 py-3
                    text-left
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    ${theme?.textMuted}
                  `}
                >
                  Heavy metal result
                </th>

                <th
                  className={`
                    px-4 py-3
                    text-left
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    ${theme?.textMuted}
                  `}
                >
                  Date
                </th>

                <th
                  className={`
                    px-5 py-3
                    text-right
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    ${theme?.textMuted}
                  `}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSamples?.map(
                (sample) => {
                  const heavyMetalStatus =
                    getHeavyMetalPublicStatus(
                      sample
                    );

                  return (
                    <tr
                      key={sample?.id}
                      className={`
                        border-b
                        last:border-b-0
                        ${theme?.border}
                        ${theme?.hover}
                      `}
                    >
                      {/* Product */}

                      <td className="px-5 py-3.5">
                        <div className="max-w-[220px]">
                          <p
                            className={`
                              truncate
                              font-semibold
                              ${theme?.text}
                            `}
                          >
                            {sample?.productName ||
                              "Unnamed product"}
                          </p>

                          <div
                            className={`
                              mt-1 flex
                              items-center gap-2
                              text-[10px]
                              ${theme?.textMuted}
                            `}
                          >
                            <span>
                              {sample?.brandName ||
                                "No brand"}
                            </span>

                            {sample?.sampleId && (
                              <>
                                <span>•</span>
                                <span>
                                  {sample.sampleId}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Location */}

                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-2">
                          <MapPin
                            className={`
                              mt-0.5
                              h-3.5 w-3.5
                              shrink-0
                              ${theme?.emeraldText}
                            `}
                          />

                          <div className="min-w-0">
                            <p
                              className={`
                                max-w-[180px]
                                truncate
                                font-medium
                                ${theme?.text}
                              `}
                            >
                              {sample?.lga?.name ||
                                "Unknown LGA"}
                              {sample?.state?.name
                                ? `, ${sample.state.name}`
                                : ""}
                            </p>

                            <p
                              className={`
                                mt-0.5
                                max-w-[180px]
                                truncate
                                text-[10px]
                                ${theme?.textMuted}
                              `}
                            >
                              {sample?.marketName ||
                                sample?.market?.name ||
                                "No market recorded"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Collector */}

                      {canSeeCollector && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-start gap-2">
                            <UserRound
                              className={`
                                mt-0.5
                                h-3.5 w-3.5
                                shrink-0
                                ${theme?.textMuted}
                              `}
                            />

                            <div className="min-w-0">
                              <p
                                className={`
                                  max-w-[160px]
                                  truncate
                                  font-medium
                                  ${theme?.text}
                                `}
                              >
                                {sample?.creator
                                  ?.fullName ||
                                  sample?.creator
                                    ?.email ||
                                  "Unknown"}
                              </p>

                              <p
                                className={`
                                  mt-0.5
                                  text-[10px]
                                  ${theme?.textMuted}
                                `}
                              >
                                {sample?.creator?.role
                                  ?.replace(
                                    /_/g,
                                    " "
                                  ) ||
                                  "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Result */}

                      <td className="px-4 py-3.5">
                        <HeavyMetalStatusBadge
                          status={
                            heavyMetalStatus
                          }
                        />
                      </td>

                      {/* Date */}

                      <td className="px-4 py-3.5">
                        <div
                          className={`
                            flex items-center gap-1.5
                            whitespace-nowrap
                            ${theme?.textMuted}
                          `}
                        >
                          <CalendarDays className="h-3.5 w-3.5" />

                          {sample?.createdAt
                            ? new Date(
                                sample.createdAt
                              ).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "N/A"}
                        </div>
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSample(
                                sample
                              )
                            }
                            className={`
                              inline-flex
                              items-center gap-1.5
                              rounded-lg
                              border
                              px-2.5 py-1.5
                              text-[10px]
                              font-semibold
                              ${theme?.border}
                              ${theme?.emeraldText}
                              ${theme?.hover}
                            `}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>

                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirmModal(
                                  {
                                    isOpen: true,
                                    sample,
                                  }
                                )
                              }
                              className="
                                inline-flex
                                h-7 w-7
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-red-50
                                hover:text-red-600
                                dark:hover:bg-red-950/30
                                dark:hover:text-red-400
                              "
                              title="Delete sample"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* ============================================================ */}
        {/* MOBILE / TABLET CARDS                                        */}
        {/* ============================================================ */}

        <div className="grid gap-2.5 p-3 lg:hidden">
          {filteredSamples?.map(
            (sample) => {
              const heavyMetalStatus =
                getHeavyMetalPublicStatus(
                  sample
                );

              return (
                <article
                  key={sample?.id}
                  className={`
                    rounded-xl
                    border
                    p-3.5
                    ${theme?.border}
                    ${theme?.bg}
                  `}
                >
                  {/* Card header */}

                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        flex h-9 w-9
                        shrink-0
                        items-center justify-center
                        rounded-lg
                        ${theme?.emerald}
                        ${theme?.emeraldText}
                      `}
                    >
                      <Database className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className={`
                              truncate
                              text-xs font-bold
                              ${theme?.text}
                            `}
                          >
                            {sample?.productName ||
                              "Unnamed product"}
                          </p>

                          <p
                            className={`
                              mt-0.5 truncate
                              text-[10px]
                              ${theme?.textMuted}
                            `}
                          >
                            {sample?.brandName ||
                              "No brand"}
                          </p>
                        </div>

                        <HeavyMetalStatusBadge
                          status={
                            heavyMetalStatus
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sample ID */}

                  {sample?.sampleId && (
                    <div
                      className={`
                        mt-3
                        rounded-lg
                        border
                        px-2.5 py-2
                        ${theme?.border}
                      `}
                    >
                      <p
                        className={`
                          text-[8px]
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
                          mt-0.5
                          truncate
                          text-[10px]
                          font-medium
                          ${theme?.text}
                        `}
                      >
                        {sample.sampleId}
                      </p>
                    </div>
                  )}

                  {/* Information grid */}

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div
                      className={`
                        rounded-lg
                        border
                        p-2.5
                        ${theme?.border}
                      `}
                    >
                      <div className="flex items-center gap-1.5">
                        <MapPin
                          className={`
                            h-3 w-3
                            ${theme?.emeraldText}
                          `}
                        />

                        <p
                          className={`
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-wider
                            ${theme?.textMuted}
                          `}
                        >
                          Location
                        </p>
                      </div>

                      <p
                        className={`
                          mt-1
                          truncate
                          text-[10px]
                          font-semibold
                          ${theme?.text}
                        `}
                      >
                        {sample?.lga?.name ||
                          "Unknown"}
                        {sample?.state?.name
                          ? `, ${sample.state.name}`
                          : ""}
                      </p>

                      <p
                        className={`
                          mt-0.5 truncate
                          text-[9px]
                          ${theme?.textMuted}
                        `}
                      >
                        {sample?.marketName ||
                          sample?.market?.name ||
                          "No market"}
                      </p>
                    </div>

                    <div
                      className={`
                        rounded-lg
                        border
                        p-2.5
                        ${theme?.border}
                      `}
                    >
                      <div className="flex items-center gap-1.5">
                        <CalendarDays
                          className={`
                            h-3 w-3
                            ${theme?.textMuted}
                          `}
                        />

                        <p
                          className={`
                            text-[8px]
                            font-semibold
                            uppercase
                            tracking-wider
                            ${theme?.textMuted}
                          `}
                        >
                          Collected
                        </p>
                      </div>

                      <p
                        className={`
                          mt-1
                          text-[10px]
                          font-semibold
                          ${theme?.text}
                        `}
                      >
                        {sample?.createdAt
                          ? new Date(
                              sample.createdAt
                            ).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Collector */}

                  {canSeeCollector && (
                    <div
                      className={`
                        mt-2
                        flex items-center gap-2
                        rounded-lg
                        border
                        px-2.5 py-2
                        ${theme?.border}
                      `}
                    >
                      <UserRound
                        className={`
                          h-3.5 w-3.5
                          ${theme?.textMuted}
                        `}
                      />

                      <div className="min-w-0">
                        <p
                          className={`
                            truncate
                            text-[10px]
                            font-semibold
                            ${theme?.text}
                          `}
                        >
                          {sample?.creator
                            ?.fullName ||
                            sample?.creator
                              ?.email ||
                            "Unknown"}
                        </p>

                        <p
                          className={`
                            truncate
                            text-[9px]
                            ${theme?.textMuted}
                          `}
                        >
                          {sample?.creator?.role
                            ?.replace(
                              /_/g,
                              " "
                            ) || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}

                  <div
                    className={`
                      mt-3
                      flex gap-2
                      border-t
                      pt-3
                      ${theme?.border}
                    `}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSample(
                          sample
                        )
                      }
                      className="
                        flex flex-1
                        items-center
                        justify-center
                        gap-1.5
                        rounded-lg
                        bg-emerald-600
                        px-3 py-2
                        text-[10px]
                        font-semibold
                        text-white
                        transition
                        hover:bg-emerald-700
                      "
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View details
                    </button>

                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmModal(
                            {
                              isOpen: true,
                              sample,
                            }
                          )
                        }
                        className="
                          flex h-8 w-9
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-red-200
                          text-red-600
                          transition
                          hover:bg-red-50
                          dark:border-red-900/40
                          dark:text-red-400
                          dark:hover:bg-red-950/30
                        "
                        title="Delete sample"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </article>
              );
            }
          )}
        </div>

        {/* ============================================================ */}
        {/* EMPTY STATE                                                   */}
        {/* ============================================================ */}

        {!loading &&
          !fetchSampleError &&
          filteredSamples?.length === 0 && (
            <div className="px-5 py-14 text-center">
              <div
                className={`
                  mx-auto mb-3
                  flex h-11 w-11
                  items-center justify-center
                  rounded-xl
                  ${theme?.bg}
                `}
              >
                <Search
                  className={`
                    h-5 w-5
                    ${theme?.textMuted}
                  `}
                />
              </div>

              <p
                className={`
                  text-sm font-semibold
                  ${theme?.text}
                `}
              >
                No samples found
              </p>

              <p
                className={`
                  mt-1 text-xs
                  ${theme?.textMuted}
                `}
              >
                Try adjusting your search or
                filter criteria.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    mt-4
                    inline-flex
                    items-center gap-1.5
                    rounded-lg
                    bg-emerald-600
                    px-3 py-2
                    text-[10px]
                    font-semibold
                    text-white
                    hover:bg-emerald-700
                  "
                >
                  <RefreshCw className="h-3 w-3" />
                  Clear filters
                </button>
              )}
            </div>
          )}

        {/* ============================================================ */}
        {/* LOADING MORE                                                  */}
        {/* ============================================================ */}

        {loadingMore && (
          <div
            className={`
              flex
              items-center
              justify-center
              gap-2
              border-t
              py-5
              text-xs
              ${theme?.border}
              ${theme?.textMuted}
            `}
          >
            <Loader className="h-4 w-4 animate-spin" />
            Loading more samples...
          </div>
        )}

        {loadingMoreError && (
          <div
            className="
              border-t
              border-red-100
              bg-red-50/50
              px-5 py-3
              text-center
              text-xs
              text-red-600
              dark:border-red-900/30
              dark:bg-red-950/10
              dark:text-red-400
            "
          >
            Error occurred while fetching more
            samples. Check your connection and try
            again.
          </div>
        )}

        {/* ============================================================ */}
        {/* LOAD MORE                                                     */}
        {/* ============================================================ */}

        {!fetchSampleError &&
          !loading &&
          filteredSamples?.length > 0 && (
            <div
              className={`
                border-t
                px-4 py-4
                text-center
                ${theme?.border}
              `}
            >
              <button
                type="button"
                onClick={handleFetchMore}
                disabled={
                  loadingMore ||
                  !pagination?.hasNextPage
                }
                className={`
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  px-4 py-2
                  text-xs
                  font-semibold
                  transition
                  ${
                    !pagination?.hasNextPage
                      ? `${theme?.border} ${theme?.textMuted} cursor-not-allowed opacity-60`
                      : `${theme?.border} ${theme?.text} ${theme?.hover}`
                  }
                `}
              >
                {loadingMore ? (
                  <>
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                    Loading...
                  </>
                ) : pagination?.hasNextPage ? (
                  "Load more samples"
                ) : (
                  "All samples loaded"
                )}
              </button>
            </div>
          )}
      </div>

      {/* ================================================================ */}
      {/* MODALS                                                           */}
      {/* ================================================================ */}

      <DeleteConfirmModal />

      {selectedSample && (
        <SampleDetailModal
          theme={theme}
          sample={selectedSample}
          onClose={() =>
            setSelectedSample(null)
          }
        />
      )}
    </div>
  );
};

export default DatabaseView;