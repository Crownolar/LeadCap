import { useEffect, useMemo, useState } from "react";
import { FilterSep, BtnPrimary, BtnGhost } from "../utils/MohUI";
import { Pagination } from "../components/Pagination";
import { FilterBar } from "../components/FilterBar";
import { StatusBadge } from "../components/StatusBadge";
import { getMOHSamples } from "../../../services/mohService";
import { useTheme } from "../../../context/ThemeContext";

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

const STATES = [
  { id: "cmmnjg7o300l1v2ed900oyiyj", name: "Kano" },
  { id: "cmmnabc300l1v2ed900xyz", name: "Lagos" },
  { id: "cmmndef300l1v2ed900abc", name: "Oyo" },
  { id: "cmmnghi300l1v2ed900def", name: "Abuja" },
];

const Samples = () => {
  const { theme, darkMode } = useTheme();

  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lgaLoading, setLgaLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [stateFilter, setStateFilter] = useState("");
  const [lgaFilter, setLgaFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [lgaOptions, setLgaOptions] = useState([]);

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
    if (Array.isArray(data)) return data;
    return [];
  };

  const resolveTotalPages = (data) => {
    return (
      data?.pagination?.totalPages ||
      data?.meta?.totalPages ||
      data?.totalPages ||
      1
    );
  };

  const applyDateFilter = (rows) => {
    return (rows || []).filter((item) => {
      if (!item?.createdAt) return true;

      const created = new Date(item.createdAt).getTime();
      const from = fromDate
        ? new Date(fromDate).setHours(0, 0, 0, 0)
        : null;
      const to = toDate
        ? new Date(toDate).setHours(23, 59, 59, 999)
        : null;

      if (from && created < from) return false;
      if (to && created > to) return false;

      return true;
    });
  };

  const fetchSamples = async () => {
    try {
      setLoading(true);

      const data = await getMOHSamples({
        page,
        pageSize,
        stateId: stateFilter || undefined,
        lgaId: lgaFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      const rows = normalizeRows(data);
      setSamples(applyDateFilter(rows));
      setTotalPages(resolveTotalPages(data));
    } catch (error) {
      console.error("Failed to fetch MOH samples:", error);
      setSamples([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchLgasByState = async (selectedStateId) => {
    if (!selectedStateId) {
      setLgaOptions([]);
      return;
    }

    try {
      setLgaLoading(true);

      const data = await getMOHSamples({
        page: 1,
        pageSize: 5000,
        stateId: selectedStateId,
      });

      const rows = normalizeRows(data);

      const lgaMap = new Map();

      rows.forEach((item) => {
        const lgaId = item?.lga?.id || item?.lgaId;
        const lgaName =
          item?.lga?.name ||
          item?.lgaName ||
          item?.lga?.label;

        if (lgaId && lgaName && !lgaMap.has(lgaId)) {
          lgaMap.set(lgaId, {
            id: lgaId,
            name: lgaName,
          });
        }
      });

      const uniqueLgas = Array.from(lgaMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setLgaOptions(uniqueLgas);
    } catch (error) {
      console.error("Failed to fetch LGAs by state:", error);
      setLgaOptions([]);
    } finally {
      setLgaLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, [page, pageSize, stateFilter, lgaFilter, fromDate, toDate]);

  useEffect(() => {
    setLgaFilter("");
    setPage(1);

    if (stateFilter) {
      fetchLgasByState(stateFilter);
    } else {
      setLgaOptions([]);
    }
  }, [stateFilter]);

  const clearFilters = () => {
    setStateFilter("");
    setLgaFilter("");
    setFromDate("");
    setToDate("");
    setLgaOptions([]);
    setPage(1);
  };

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
            className={`${inputClass} flex-1 sm:flex-none`}
          >
            <option value="">All States</option>
            {STATES.map((state) => (
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
              setPage(1);
            }}
            disabled={!stateFilter || lgaLoading}
            className={`${inputClass} flex-1 sm:flex-none disabled:opacity-60 disabled:cursor-not-allowed`}
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
              setPage(1);
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
              setPage(1);
            }}
            className={`${inputClass} flex-1 sm:flex-none`}
          />
        </div>

        <FilterSep />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <BtnPrimary
            onClick={() => {
              setPage(1);
              fetchSamples();
            }}
          >
            Apply filters
          </BtnPrimary>

          <BtnGhost onClick={clearFilters}>Clear</BtnGhost>
        </div>
      </FilterBar>

      <div className={`${theme.card} rounded-xl border ${theme.border} overflow-hidden`}>
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

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className={`${inputClass} flex-shrink-0`}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
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
                      <td className={`px-4 py-3 border-b ${tableCellClass} font-mono text-xs ${theme.text}`}>
                        {row.sampleId || "—"}
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
                      <td className={`px-4 py-3 border-b ${tableCellClass} font-medium`}>
                        {row.productName || "—"}
                      </td>
                      <td className={`px-4 py-3 border-b ${tableCellClass}`}>
                        {row.productVariant?.category?.displayName ||
                          row.category?.displayName ||
                          row.category ||
                          "—"}
                      </td>
                      <td className={`px-4 py-3 border-b ${tableCellClass} font-mono text-xs`}>
                        {row.nafdacNumber || "—"}
                      </td>
                      <td className={`px-4 py-3 border-b ${tableCellClass} font-mono text-xs`}>
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
                      <td className={`px-4 py-3 border-b ${theme.border} ${theme.textMuted}`}>
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
                      {row.sampleId || "—"}
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
                        {(row.lga?.name || row.lgaName)
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
          </>
        )}

        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default Samples;