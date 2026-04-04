import { useEffect, useMemo, useState } from "react";
import { FilterSep, BtnPrimary, BtnGhost } from "../utils/MohUI";
import { FilterBar } from "../components/FilterBar";
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

  // UI filter state
  const [stateFilter, setStateFilter] = useState("");
  const [lgaFilter, setLgaFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Applied filter state
  const [appliedFilters, setAppliedFilters] = useState({
    stateId: "",
    lgaId: "",
    fromDate: "",
    toDate: "",
  });

  const inputClass = `
    text-xs px-2 py-1.5 rounded-md outline-none border min-w-0
    ${theme.input} ${theme.border}
    focus:border-green-500
  `;

  const tableCellClass = darkMode
    ? "border-gray-700 text-gray-200"
    : "border-gray-100 text-gray-700";

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
      Array.isArray(payload?.data) ? payload.data :
      Array.isArray(payload?.states) ? payload.states :
      Array.isArray(payload?.data?.states) ? payload.data.states :
      Array.isArray(payload?.items) ? payload.items :
      Array.isArray(payload) ? payload :
      [];

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
      Array.isArray(payload?.data) ? payload.data :
      Array.isArray(payload?.lgas) ? payload.lgas :
      Array.isArray(payload?.data?.lgas) ? payload.data.lgas :
      Array.isArray(payload?.items) ? payload.items :
      Array.isArray(payload) ? payload :
      [];

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
      sessionStorage.setItem(STATES_CACHE_KEY, JSON.stringify(normalized));
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

      const normalized = normalizeLgas(res.data, selectedStateId);
      setLgaOptions(normalized);
      sessionStorage.setItem(cacheKey, JSON.stringify(normalized));
    } catch (error) {
      console.error("Failed to fetch LGAs:", error);
      setLgaOptions([]);
    } finally {
      setLgaLoading(false);
    }
  };

  const fetchSamples = async ({ nextPage = 1, append = false } = {}) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const data = await getMOHSamples({
        page: nextPage,
        pageSize,
        stateId: appliedFilters.stateId || undefined,
        lgaId: appliedFilters.lgaId || undefined,
        fromDate: appliedFilters.fromDate || undefined,
        toDate: appliedFilters.toDate || undefined,
      });

      const rows = applyDateFilter(normalizeRows(data), appliedFilters);
      const computedTotalPages = resolveTotalPages(data, pageSize);

      setTotalPages(computedTotalPages);
      setHasMore(nextPage < computedTotalPages);

      if (append) {
        setSamples((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const dedupedNewRows = rows.filter((item) => !existingIds.has(item.id));
          return [...prev, ...dedupedNewRows];
        });
      } else {
        setSamples(rows);
      }

      setPage(nextPage);
    } catch (error) {
      console.error("Failed to fetch MOH samples:", error);

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
    fetchSamples({ nextPage: 1, append: false });
  }, [pageSize, appliedFilters]);

  const tableRows = useMemo(() => samples || [], [samples]);

  return (
    <div className={`w-full min-w-0 ${theme.text}`}>
      <FilterBar>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <label className={`text-xs whitespace-nowrap ${theme.textMuted}`}>
            State
          </label>

          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
            }}
            className={`${inputClass} flex-1 sm:flex-none min-w-[220px]`}
            disabled={statesLoading}
          >
            <option value="">
              {statesLoading ? "Loading states..." : "All States"}
            </option>

            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>

          <label className={`text-xs whitespace-nowrap ${theme.textMuted}`}>
            LGA
          </label>

          <select
            value={lgaFilter}
            onChange={(e) => {
              setLgaFilter(e.target.value);
            }}
            disabled={!stateFilter || lgaLoading}
            className={`${inputClass} flex-1 sm:flex-none min-w-[220px] disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <option value="">
              {!stateFilter
                ? "Select state first"
                : lgaLoading
                ? "Loading LGAs..."
                : "All LGAs"}
            </option>

            {lgaOptions.map((lga) => (
              <option key={lga.id} value={lga.id}>
                {lga.name}
              </option>
            ))}
          </select>
        </div>

        <FilterSep />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <label className={`text-xs whitespace-nowrap ${theme.textMuted}`}>
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
            }}
            className={`${inputClass} flex-1 sm:flex-none`}
          />

          <label className={`text-xs whitespace-nowrap ${theme.textMuted}`}>
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
            }}
            className={`${inputClass} flex-1 sm:flex-none`}
          />
        </div>

        <FilterSep />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <BtnPrimary onClick={applyFilters}>Apply filters</BtnPrimary>
          <BtnGhost onClick={clearFilters}>Clear</BtnGhost>
        </div>
      </FilterBar>

      <div
        className={`${theme.card} rounded-xl border ${theme.border} overflow-hidden`}
      >
        <div
          className={`px-4 py-3 border-b ${theme.border} flex flex-wrap items-center justify-between gap-2`}
        >
          <div className="min-w-0">
            <div className={`text-sm font-medium ${theme.text}`}>
              All samples
            </div>
            <div className={`text-xs mt-0.5 truncate ${theme.textMuted}`}>
              Read-only view
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
              className={`${inputClass} flex-shrink-0`}
            >
              <option value={10}>10 per load</option>
              <option value={20}>20 per load</option>
              <option value={50}>50 per load</option>
              <option value={100}>100 per load</option>
            </select>

            <div className={`text-xs ${theme.textMuted}`}>
              Loaded page {page} of {totalPages}
            </div>
          </div>
        </div>

        {loading ? (
          <div className={`p-8 text-sm text-center ${theme.textMuted}`}>
            Loading samples...
          </div>
        ) : tableRows.length === 0 ? (
          <div className={`p-8 text-sm text-center ${theme.textMuted}`}>
            No samples found.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table
                className="w-full border-collapse text-xs"
                style={{ minWidth: 900 }}
              >
                <thead className={`${theme.text} ${theme.bg}`}>
                  <tr>
                    {COLUMNS.map((header) => (
                      <th
                        key={header}
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b ${theme.border}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className={`${theme.card} ${theme.textMuted} transition-colors`}
                    >
                      <td
                        className={`px-4 py-3 border-b ${tableCellClass} font-mono text-xs ${theme.text}`}
                      >
                        {row.code || "—"}
                      </td>
                      <td className={`px-4 py-3 border-b ${tableCellClass}`}>
                        {row.state?.name || row.stateName || "—"}
                      </td>
                      <td className={`px-4 py-3 border-b ${tableCellClass}`}>
                        {row.lga?.name || row.lgaName || "—"}
                      </td>
                      <td className={`px-4 py-3 border-b ${tableCellClass}`}>
                        {row.market?.name || row.marketName || "—"}
                      </td>
                      <td
                        className={`px-4 py-3 border-b ${tableCellClass} font-medium`}
                      >
                        {row.productName || "—"}
                      </td>
                      <td className={`px-4 py-3 border-b ${tableCellClass}`}>
                        {row.productVariant?.category?.displayName ||
                          row.category?.displayName ||
                          row.category ||
                          "—"}
                      </td>
                      <td
                        className={`px-4 py-3 border-b ${tableCellClass} font-mono text-xs`}
                      >
                        {row.nafdacNumber || "—"}
                      </td>
                      <td
                        className={`px-4 py-3 border-b ${tableCellClass} font-mono text-xs`}
                      >
                        {row.sonNumber || "—"}
                      </td>
                      <td className={`px-4 py-3 border-b ${tableCellClass}`}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td className={`px-4 py-3 border-b ${tableCellClass}`}>
                        {row.price || "—"}
                      </td>
                      <td className={`px-4 py-3 border-b ${tableCellClass}`}>
                        {row.productOrigin || "—"}
                      </td>
                      <td
                        className={`px-4 py-3 border-b ${theme.border} ${theme.textMuted}`}
                      >
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`md:hidden divide-y ${theme.border}`}>
              {tableRows.map((row) => (
                <div key={row.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-xs font-medium truncate ${
                        darkMode ? "text-green-300" : "text-green-700"
                      }`}
                    >
                      {row.code || "—"}
                    </span>
                    <StatusBadge status={row.status} />
                  </div>

                  <div className={`text-sm font-medium truncate ${theme.text}`}>
                    {row.productName || "—"}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="flex flex-col">
                      <span className={`uppercase tracking-wide text-xs ${theme.textMuted}`}>
                        State / LGA
                      </span>
                      <span className={`${theme.text} truncate`}>
                        {row.state?.name || row.stateName || "—"}
                        {row.lga?.name || row.lgaName
                          ? ` · ${row.lga?.name || row.lgaName}`
                          : ""}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className={`uppercase tracking-wide text-xs ${theme.textMuted}`}>
                        Market
                      </span>
                      <span className={`${theme.text} truncate`}>
                        {row.market?.name || row.marketName || "—"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className={`uppercase tracking-wide text-xs ${theme.textMuted}`}>
                        Category
                      </span>
                      <span className={`${theme.text} truncate`}>
                        {row.productVariant?.category?.displayName ||
                          row.category?.displayName ||
                          row.category ||
                          "—"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className={`uppercase tracking-wide text-xs ${theme.textMuted}`}>
                        Origin
                      </span>
                      <span className={`${theme.text} truncate`}>
                        {row.productOrigin || "—"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className={`uppercase tracking-wide text-xs ${theme.textMuted}`}>
                        NAFDAC No.
                      </span>
                      <span className={`font-mono truncate ${theme.text}`}>
                        {row.nafdacNumber || "—"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className={`uppercase tracking-wide text-xs ${theme.textMuted}`}>
                        SON No.
                      </span>
                      <span className={`font-mono truncate ${theme.text}`}>
                        {row.sonNumber || "—"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className={`uppercase tracking-wide text-xs ${theme.textMuted}`}>
                        Price
                      </span>
                      <span className={theme.text}>{row.price || "—"}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className={`uppercase tracking-wide text-xs ${theme.textMuted}`}>
                        Created
                      </span>
                      <span className={theme.textMuted}>
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={`px-4 py-4 border-t ${theme.border} flex flex-col items-center gap-3`}>
              <div className={`text-xs ${theme.textMuted}`}>
                Showing {tableRows.length} loaded record{tableRows.length === 1 ? "" : "s"}
                {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
              </div>

              {hasMore ? (
                <BtnPrimary
                  onClick={() => fetchSamples({ nextPage: page + 1, append: true })}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </BtnPrimary>
              ) : (
                <div className={`text-xs ${theme.textMuted}`}>
                  No more samples to load.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Samples;