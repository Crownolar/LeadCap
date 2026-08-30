import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Database,
  Filter,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { BtnPrimary, BtnGhost } from "../utils/MohUI";
import { StatusBadge } from "../components/StatusBadge";
import { getMOHSamples } from "../../../services/mohService";
import { useTheme } from "../../../context/ThemeContext";
import api from "../../../utils/api";

const COLUMNS = [
  "Sample ID",
  "State",
  "LGA",
  "Market",
  "Product name",
  "Category",
  "NAFDAC No.",
  "SON No.",
  "Status",
  "Price",
  "Origin",
  "Created at",
];

const STATES_CACHE_KEY = "moh_states_cache_v1";
const LGAS_CACHE_PREFIX = "moh_lgas_cache_v1_";

const Samples = () => {
  const { theme, darkMode } = useTheme();

  const [samples, setSamples] = useState([]);
  const [states, setStates] = useState([]);
  const [lgaOptions, setLgaOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [lgaLoading, setLgaLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [stateFilter, setStateFilter] = useState("");
  const [lgaFilter, setLgaFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    stateId: "",
    lgaId: "",
    fromDate: "",
    toDate: "",
  });

  const [showFilters, setShowFilters] = useState(true);

  /* -----------------------------------------------------------------------
     DATA NORMALIZATION
  ----------------------------------------------------------------------- */

  const normalizeRows = (data) => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.samples)) return data.samples;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data)) return data;

    return [];
  };

  const normalizeStates = (payload) => {
    const rows =
      Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.states)
          ? payload.states
          : Array.isArray(payload?.data?.states)
            ? payload.data.states
            : Array.isArray(payload?.items)
              ? payload.items
              : Array.isArray(payload)
                ? payload
                : [];

    return rows
      .map((state) => ({
        id: state?.id || state?.stateId || state?.value || "",
        name: state?.name || state?.stateName || state?.label || "",
        code: state?.code || "",
        isActive: state?.isActive,
      }))
      .filter((state) => state.id && state.name)
      .filter((state) => state.isActive !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const normalizeLgas = (payload, selectedStateId) => {
    const rows =
      Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.lgas)
          ? payload.lgas
          : Array.isArray(payload?.data?.lgas)
            ? payload.data.lgas
            : Array.isArray(payload?.items)
              ? payload.items
              : Array.isArray(payload)
                ? payload
                : [];

    return rows
      .map((lga) => ({
        id: lga?.id || lga?.lgaId || lga?.value || "",
        name: lga?.name || lga?.lgaName || lga?.label || "",
        stateId: lga?.stateId || lga?.state?.id || lga?.state_id || "",
        isActive: lga?.isActive,
      }))
      .filter((lga) => lga.id && lga.name)
      .filter((lga) => lga.isActive !== false)
      .filter((lga) => lga.stateId === selectedStateId)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const resolveTotalPages = (data, size) => {
    if (data?.count && Number.isFinite(data.count)) {
      return Math.max(1, Math.ceil(data.count / size));
    }

    return (
      data?.pagination?.totalPages ||
      data?.meta?.totalPages ||
      data?.totalPages ||
      data?.pages ||
      1
    );
  };

  const applyDateFilter = (rows, filters) => {
    return (rows || []).filter((item) => {
      if (!item?.createdAt) return true;

      const created = new Date(item.createdAt).getTime();

      const from = filters?.fromDate
        ? new Date(filters.fromDate).setHours(0, 0, 0, 0)
        : null;

      const to = filters?.toDate
        ? new Date(filters.toDate).setHours(23, 59, 59, 999)
        : null;

      if (from && created < from) return false;
      if (to && created > to) return false;

      return true;
    });
  };

  /* -----------------------------------------------------------------------
     STATES / LGAS
  ----------------------------------------------------------------------- */

  const fetchStates = async () => {
    try {
      const cached = sessionStorage.getItem(STATES_CACHE_KEY);

      if (cached) {
        setStates(JSON.parse(cached));
        return;
      }

      setStatesLoading(true);

      const res = await api.get("/management/states", {
        params: {
          page: 1,
          pageSize: 100,
        },
      });

      const normalized = normalizeStates(res.data);

      setStates(normalized);

      sessionStorage.setItem(
        STATES_CACHE_KEY,
        JSON.stringify(normalized)
      );
    } catch (error) {
      console.error("Failed to fetch states:", error);
      setStates([]);
    } finally {
      setStatesLoading(false);
    }
  };

  const fetchLgasByState = async (selectedStateId) => {
    if (!selectedStateId) {
      setLgaOptions([]);
      return;
    }

    const cacheKey = `${LGAS_CACHE_PREFIX}${selectedStateId}`;

    try {
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        setLgaOptions(JSON.parse(cached));
        return;
      }

      setLgaLoading(true);

      const res = await api.get("/management/lgas", {
        params: {
          page: 1,
          pageSize: 1000,
        },
      });

      const normalized = normalizeLgas(
        res.data,
        selectedStateId
      );

      setLgaOptions(normalized);

      sessionStorage.setItem(
        cacheKey,
        JSON.stringify(normalized)
      );
    } catch (error) {
      console.error("Failed to fetch LGAs:", error);
      setLgaOptions([]);
    } finally {
      setLgaLoading(false);
    }
  };

  /* -----------------------------------------------------------------------
     SAMPLES
  ----------------------------------------------------------------------- */

  const fetchSamples = async ({
    nextPage = 1,
    append = false,
  } = {}) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const data = await getMOHSamples({
        page: nextPage,
        pageSize,

        stateId:
          appliedFilters.stateId || undefined,

        lgaId:
          appliedFilters.lgaId || undefined,

        fromDate:
          appliedFilters.fromDate || undefined,

        toDate:
          appliedFilters.toDate || undefined,
      });

      const rows = applyDateFilter(
        normalizeRows(data),
        appliedFilters
      );

      const computedTotalPages =
        resolveTotalPages(data, pageSize);

      setTotalPages(computedTotalPages);
      setHasMore(nextPage < computedTotalPages);

      if (append) {
        setSamples((prev) => {
          const existingIds = new Set(
            prev.map((item) => item.id)
          );

          const dedupedNewRows = rows.filter(
            (item) => !existingIds.has(item.id)
          );

          return [...prev, ...dedupedNewRows];
        });
      } else {
        setSamples(rows);
      }

      setPage(nextPage);
    } catch (error) {
      console.error(
        "Failed to fetch MOH samples:",
        error
      );

      if (!append) {
        setSamples([]);
        setTotalPages(1);
        setHasMore(false);
        setPage(1);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /* -----------------------------------------------------------------------
     FILTERS
  ----------------------------------------------------------------------- */

  const applyFilters = () => {
    setSamples([]);
    setPage(1);
    setHasMore(false);

    setAppliedFilters({
      stateId: stateFilter,
      lgaId: lgaFilter,
      fromDate,
      toDate,
    });
  };

  const clearFilters = () => {
    setStateFilter("");
    setLgaFilter("");
    setFromDate("");
    setToDate("");
    setLgaOptions([]);
    setSamples([]);
    setPage(1);
    setHasMore(false);

    setAppliedFilters({
      stateId: "",
      lgaId: "",
      fromDate: "",
      toDate: "",
    });
  };

  /* -----------------------------------------------------------------------
     EFFECTS
  ----------------------------------------------------------------------- */

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    setLgaFilter("");
    setPage(1);

    if (stateFilter) {
      fetchLgasByState(stateFilter);
    } else {
      setLgaOptions([]);
    }
  }, [stateFilter]);

  useEffect(() => {
    fetchSamples({
      nextPage: 1,
      append: false,
    });
  }, [pageSize, appliedFilters]);

  const tableRows = useMemo(
    () => samples || [],
    [samples]
  );

  const selectedStateName =
    states.find(
      (state) => state.id === appliedFilters.stateId
    )?.name;

  const selectedLgaName =
    lgaOptions.find(
      (lga) => lga.id === appliedFilters.lgaId
    )?.name;

  const hasAppliedFilters =
    Boolean(
      appliedFilters.stateId ||
      appliedFilters.lgaId ||
      appliedFilters.fromDate ||
      appliedFilters.toDate
    );

  /* -----------------------------------------------------------------------
     UI HELPERS
  ----------------------------------------------------------------------- */

  const inputClass = `
    h-11 w-full rounded-xl border px-3 text-sm outline-none
    transition
    ${theme.input}
    ${theme.border}
    focus:border-emerald-500
    focus:ring-2
    focus:ring-emerald-500/10
  `;

  const getStatusLabel = (status) => {
    if (!status) return "UNKNOWN";

    return String(status)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  /* -----------------------------------------------------------------------
     RENDER
  ----------------------------------------------------------------------- */

  return (
    <div className={`w-full min-w-0 space-y-6 ${theme.text}`}>

      {/* ================================================================
          PAGE HEADER
      ================================================================ */}

      <section
        className={`
          relative overflow-hidden rounded-3xl border
          ${theme.border} ${theme.card}
          p-6 md:p-7
        `}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
              <Database className="h-3.5 w-3.5" />
              MOH Surveillance Database
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Sample Database
            </h1>

            <p
              className={`mt-2 max-w-2xl text-sm ${theme.textMuted}`}
            >
              Browse and inspect collected environmental
              lead exposure samples across states, LGAs,
              markets, and product categories.
            </p>
          </div>

          <button
            onClick={() =>
              fetchSamples({
                nextPage: 1,
                append: false,
              })
            }
            disabled={loading}
            className="
              inline-flex h-11 items-center justify-center
              gap-2 rounded-xl bg-emerald-600 px-4
              text-sm font-semibold text-white
              shadow-sm transition
              hover:bg-emerald-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh data
          </button>
        </div>
      </section>

      {/* ================================================================
          DATA SUMMARY
      ================================================================ */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div
          className={`
            ${theme.card} ${theme.border}
            rounded-2xl border p-5
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}
              >
                Loaded records
              </p>

              <p className="mt-2 text-2xl font-bold">
                {tableRows.length.toLocaleString()}
              </p>

              <p
                className={`mt-1 text-xs ${theme.textMuted}`}
              >
                Current result set
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
              <Database className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div
          className={`
            ${theme.card} ${theme.border}
            rounded-2xl border p-5
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}
              >
                Current page
              </p>

              <p className="mt-2 text-2xl font-bold">
                {page}
                <span
                  className={`ml-1 text-sm font-medium ${theme.textMuted}`}
                >
                  / {totalPages}
                </span>
              </p>

              <p
                className={`mt-1 text-xs ${theme.textMuted}`}
              >
                {pageSize} records per load
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div
          className={`
            ${theme.card} ${theme.border}
            rounded-2xl border p-5
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}
              >
                Filter status
              </p>

              <p className="mt-2 text-lg font-bold">
                {hasAppliedFilters
                  ? "Filtered view"
                  : "All samples"}
              </p>

              <p
                className={`mt-1 text-xs ${theme.textMuted}`}
              >
                {hasAppliedFilters
                  ? "Active filters applied"
                  : "No filters applied"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-300">
              <Filter className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FILTER PANEL
      ================================================================ */}

      <section
        className={`
          overflow-hidden rounded-2xl border
          ${theme.border} ${theme.card}
        `}
      >
        <button
          type="button"
          onClick={() =>
            setShowFilters((value) => !value)
          }
          className={`
            flex w-full items-center justify-between
            px-5 py-4 text-left
            transition hover:bg-gray-50
            dark:hover:bg-gray-800/30
          `}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
              <Filter className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-bold">
                Filter samples
              </p>

              <p
                className={`mt-0.5 text-xs ${theme.textMuted}`}
              >
                Narrow the surveillance dataset by location
                and collection period.
              </p>
            </div>
          </div>

          <ChevronDown
            className={`
              h-5 w-5 transition-transform
              ${showFilters ? "rotate-180" : ""}
            `}
          />
        </button>

        {showFilters && (
          <div
            className={`
              border-t ${theme.border}
              p-5
            `}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

              {/* State */}
              <div>
                <label
                  className={`mb-2 flex items-center gap-1.5 text-xs font-semibold ${theme.textMuted}`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  State
                </label>

                <select
                  value={stateFilter}
                  onChange={(e) =>
                    setStateFilter(e.target.value)
                  }
                  className={inputClass}
                  disabled={statesLoading}
                >
                  <option value="">
                    {statesLoading
                      ? "Loading states..."
                      : "All States"}
                  </option>

                  {states.map((state) => (
                    <option
                      key={state.id}
                      value={state.id}
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* LGA */}
              <div>
                <label
                  className={`mb-2 flex items-center gap-1.5 text-xs font-semibold ${theme.textMuted}`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Local Government Area
                </label>

                <select
                  value={lgaFilter}
                  onChange={(e) =>
                    setLgaFilter(e.target.value)
                  }
                  disabled={
                    !stateFilter || lgaLoading
                  }
                  className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <option value="">
                    {!stateFilter
                      ? "Select state first"
                      : lgaLoading
                        ? "Loading LGAs..."
                        : "All LGAs"}
                  </option>

                  {lgaOptions.map((lga) => (
                    <option
                      key={lga.id}
                      value={lga.id}
                    >
                      {lga.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* From */}
              <div>
                <label
                  className={`mb-2 flex items-center gap-1.5 text-xs font-semibold ${theme.textMuted}`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  From date
                </label>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) =>
                    setFromDate(e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              {/* To */}
              <div>
                <label
                  className={`mb-2 flex items-center gap-1.5 text-xs font-semibold ${theme.textMuted}`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  To date
                </label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) =>
                    setToDate(e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div
                className={`text-xs ${theme.textMuted}`}
              >
                {hasAppliedFilters ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span>Active:</span>

                    {selectedStateName && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                        {selectedStateName}
                      </span>
                    )}

                    {selectedLgaName && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        {selectedLgaName}
                      </span>
                    )}

                    {(appliedFilters.fromDate ||
                      appliedFilters.toDate) && (
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-300">
                        Date range
                      </span>
                    )}
                  </div>
                ) : (
                  "Use the filters above to narrow the dataset."
                )}
              </div>

              <div className="flex gap-2">
                <BtnGhost
                  onClick={clearFilters}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Clear
                </BtnGhost>

                <BtnPrimary
                  onClick={applyFilters}
                >
                  <Search className="mr-1.5 h-4 w-4" />
                  Apply filters
                </BtnPrimary>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ================================================================
          DATA TABLE
      ================================================================ */}

      <section
        className={`
          overflow-hidden rounded-2xl border
          ${theme.border} ${theme.card}
          shadow-sm
        `}
      >
        {/* Table header */}
        <div
          className={`
            flex flex-col gap-4
            border-b ${theme.border}
            p-5
            lg:flex-row lg:items-center
            lg:justify-between
          `}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
              <Package className="h-5 w-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold">
                  Sample records
                </h2>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  Read only
                </span>
              </div>

              <p
                className={`mt-1 text-xs ${theme.textMuted}`}
              >
                {tableRows.length
                  ? `${tableRows.length} record${
                      tableRows.length === 1
                        ? ""
                        : "s"
                    } currently loaded`
                  : "No records currently loaded"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label
              className={`text-xs ${theme.textMuted}`}
            >
              Records
            </label>

            <select
              value={pageSize}
              onChange={(e) =>
                setPageSize(
                  Number(e.target.value)
                )
              }
              className={`
                h-10 rounded-xl border
                ${theme.input}
                ${theme.border}
                px-3 text-xs outline-none
                focus:border-emerald-500
              `}
            >
              <option value={10}>
                10 per load
              </option>
              <option value={20}>
                20 per load
              </option>
              <option value={50}>
                50 per load
              </option>
              <option value={100}>
                100 per load
              </option>
            </select>

            <div
              className={`
                flex h-10 items-center rounded-xl
                bg-gray-50 px-3 text-xs
                dark:bg-gray-800
                ${theme.textMuted}
              `}
            >
              Page {page} / {totalPages}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="p-10">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
                <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold">
                  Loading sample records
                </p>

                <p
                  className={`mt-1 text-xs ${theme.textMuted}`}
                >
                  Retrieving the latest surveillance data...
                </p>
              </div>
            </div>
          </div>
        ) : tableRows.length === 0 ? (
          /* Empty */
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
              <Database className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-sm font-bold">
              No samples found
            </h3>

            <p
              className={`mx-auto mt-1 max-w-sm text-xs ${theme.textMuted}`}
            >
              No sample records match the current
              filters. Try adjusting the location or
              date range.
            </p>

            {hasAppliedFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ============================================================
                DESKTOP TABLE
            ============================================================ */}

            <div className="hidden overflow-x-auto lg:block">
              <table
                className="w-full border-collapse text-xs"
                style={{ minWidth: 1250 }}
              >
                <thead>
                  <tr className={theme.bg}>
                    {COLUMNS.map((header) => (
                      <th
                        key={header}
                        className={`
                          border-b ${theme.border}
                          px-4 py-3.5
                          text-left text-[10px]
                          font-bold uppercase
                          tracking-wider
                          ${theme.textMuted}
                        `}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {tableRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`
                        group
                        transition-colors
                        hover:bg-emerald-50/40
                        dark:hover:bg-emerald-900/5
                        ${index !== tableRows.length - 1
                          ? `border-b ${theme.border}`
                          : ""}
                      `}
                    >
                      <td
                        className={`
                          px-4 py-4
                          font-mono text-[11px]
                          font-semibold
                          ${darkMode
                            ? "text-emerald-300"
                            : "text-emerald-700"}
                        `}
                      >
                        {row.code || "—"}
                      </td>

                      <td className="px-4 py-4">
                        {row.state?.name ||
                          row.stateName ||
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        {row.lga?.name ||
                          row.lgaName ||
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        {row.market?.name ||
                          row.marketName ||
                          "—"}
                      </td>

                      <td
                        className={`
                          max-w-[190px]
                          px-4 py-4
                          font-semibold
                          ${theme.text}
                        `}
                      >
                        <div className="truncate">
                          {row.productName || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {row.productVariant?.category
                          ?.displayName ||
                          row.category?.displayName ||
                          row.category ||
                          "—"}
                      </td>

                      <td className="px-4 py-4 font-mono text-[11px]">
                        {row.nafdacNumber || "—"}
                      </td>

                      <td className="px-4 py-4 font-mono text-[11px]">
                        {row.sonNumber || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={row.status}
                        />
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {row.price || "—"}
                      </td>

                      <td className="px-4 py-4">
                        {row.productOrigin || "—"}
                      </td>

                      <td
                        className={`
                          px-4 py-4
                          text-xs
                          ${theme.textMuted}
                        `}
                      >
                        {row.createdAt
                          ? new Date(
                              row.createdAt
                            ).toLocaleDateString(
                              undefined,
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ============================================================
                TABLET / MOBILE CARDS
            ============================================================ */}

            <div
              className={`
                divide-y ${theme.border}
                lg:hidden
              `}
            >
              {tableRows.map((row) => (
                <article
                  key={row.id}
                  className="p-4 transition hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={`
                          truncate font-mono text-[11px]
                          font-semibold
                          ${darkMode
                            ? "text-emerald-300"
                            : "text-emerald-700"}
                        `}
                      >
                        {row.code || "—"}
                      </p>

                      <h3
                        className={`
                          mt-1 truncate text-sm
                          font-bold ${theme.text}
                        `}
                      >
                        {row.productName || "Unnamed product"}
                      </h3>
                    </div>

                    <StatusBadge
                      status={row.status}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                      <p
                        className={`text-[9px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                      >
                        Location
                      </p>

                      <p className="mt-1 truncate text-xs font-medium">
                        {row.state?.name ||
                          row.stateName ||
                          "—"}

                        {row.lga?.name ||
                        row.lgaName
                          ? ` · ${
                              row.lga?.name ||
                              row.lgaName
                            }`
                          : ""}
                      </p>
                    </div>

                    <div>
                      <p
                        className={`text-[9px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                      >
                        Market
                      </p>

                      <p className="mt-1 truncate text-xs font-medium">
                        {row.market?.name ||
                          row.marketName ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p
                        className={`text-[9px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                      >
                        Category
                      </p>

                      <p className="mt-1 truncate text-xs font-medium">
                        {row.productVariant?.category
                          ?.displayName ||
                          row.category?.displayName ||
                          row.category ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p
                        className={`text-[9px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                      >
                        NAFDAC
                      </p>

                      <p className="mt-1 truncate font-mono text-xs">
                        {row.nafdacNumber || "—"}
                      </p>
                    </div>

                    <div>
                      <p
                        className={`text-[9px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                      >
                        SON
                      </p>

                      <p className="mt-1 truncate font-mono text-xs">
                        {row.sonNumber || "—"}
                      </p>
                    </div>

                    <div>
                      <p
                        className={`text-[9px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                      >
                        Origin
                      </p>

                      <p className="mt-1 truncate text-xs font-medium">
                        {row.productOrigin || "—"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`
                      mt-4 flex flex-wrap
                      items-center justify-between
                      gap-2 border-t
                      pt-3 ${theme.border}
                    `}
                  >
                    <span
                      className={`text-xs ${theme.textMuted}`}
                    >
                      Created{" "}
                      {row.createdAt
                        ? new Date(
                            row.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </span>

                    <span
                      className={`text-xs font-semibold ${theme.text}`}
                    >
                      Price: {row.price || "—"}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* ============================================================
                PAGINATION
            ============================================================ */}

            <div
              className={`
                flex flex-col gap-3
                border-t ${theme.border}
                px-5 py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              `}
            >
              <div>
                <p className="text-xs font-semibold">
                  {tableRows.length} loaded record
                  {tableRows.length === 1
                    ? ""
                    : "s"}
                </p>

                <p
                  className={`mt-0.5 text-[11px] ${theme.textMuted}`}
                >
                  {hasMore
                    ? `More records are available on page ${
                        page + 1
                      }.`
                    : "You have reached the end of the available records."}
                </p>
              </div>

              {hasMore ? (
                <button
                  onClick={() =>
                    fetchSamples({
                      nextPage: page + 1,
                      append: true,
                    })
                  }
                  disabled={loadingMore}
                  className="
                    inline-flex h-10
                    items-center justify-center
                    gap-2 rounded-xl
                    bg-emerald-600
                    px-5 text-xs
                    font-semibold text-white
                    transition
                    hover:bg-emerald-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading samples...
                    </>
                  ) : (
                    <>
                      Load more samples
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <div
                  className={`
                    flex items-center gap-2
                    rounded-xl
                    bg-gray-50 px-4 py-2.5
                    text-xs
                    dark:bg-gray-800
                    ${theme.textMuted}
                  `}
                >
                  <ShieldCheck className="h-4 w-4" />
                  End of records
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Samples;