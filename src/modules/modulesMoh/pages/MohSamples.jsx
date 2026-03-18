import { useEffect, useState } from "react";
import { FilterSep, BtnPrimary, BtnGhost, TH, TD } from "../utils/MohUI";
import { Pagination } from "../components/Pagination";
import { FilterBar } from "../components/FilterBar";
import { StatusBadge } from "../components/StatusBadge";
import { getMOHSamples } from "../../../services/mohService";
// import getUTCDayRange from "../utils/dateFormat";

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
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [stateFilter, setStateFilter] = useState("");
  const [lgaFilter, setLgaFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchSamples();
  }, [page, pageSize, stateFilter, lgaFilter, fromDate, toDate]);

  const fetchSamples = async () => {
  try {
    setLoading(true);

    const data = await getMOHSamples({
      stateId: stateFilter || undefined,
      lgaId: lgaFilter || undefined,
      page,
      limit: pageSize,
    });

    console.log("Raw API response:", data);

    const filteredSamples = (data.data || []).filter((s) => {
      const sampleDate = new Date(s.createdAt).getTime(); 
      const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
      const to = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

      if (from && sampleDate < from) return false;
      if (to && sampleDate > to) return false;
      return true;
    });

    console.log("Filtered samples:", filteredSamples);

    setSamples(filteredSamples);
    setTotalPages(data.pagination?.totalPages || 1);
  } catch (err) {
    console.error("Failed to load samples", err);
  } finally {
    setLoading(false);
  }
};

  const clearFilters = () => {
    setStateFilter("");
    setLgaFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  useEffect(() => {
    console.log("Pagination state changed:", { page, totalPages });
  }, [page, totalPages]);

  return (
    <div className="w-full min-w-0">
      <FilterBar>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-gray-500 whitespace-nowrap">
            State
          </label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500 flex-1 sm:flex-none min-w-0"
          >
            <option value="">All States</option>
            {STATES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <label className="text-xs text-gray-500">LGA</label>
          <select
            value={lgaFilter}
            onChange={(e) => setLgaFilter(e.target.value)}
            className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500 flex-1 sm:flex-none min-w-0"
          >
            <option value="">All LGAs</option>
          </select>
        </div>

        <FilterSep />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-gray-500 whitespace-nowrap">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500 flex-1 sm:flex-none min-w-0"
          />
          <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500 flex-1 sm:flex-none min-w-0"
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900">All samples</div>
            <div className="text-xs text-gray-400 mt-0.5 truncate">
              Read-only view
            </div>
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500 flex-shrink-0"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-gray-500 text-center">
            Loading samples...
          </div>
        ) : samples.length === 0 ? (
          <div className="p-8 text-sm text-gray-400 text-center">
            No samples found.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table
                className="w-full border-collapse text-xs"
                style={{ minWidth: 900 }}
              >
                <thead>
                  <tr>
                    {COLUMNS.map((h) => (
                      <th key={h} className={TH}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {samples.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className={`${TD} font-mono text-xs text-green-700`}>
                        {row.sampleId}
                      </td>
                      <td className={TD}>{row.state?.name}</td>
                      <td className={TD}>{row.lga?.name}</td>
                      <td className={TD}>{row.market?.name}</td>
                      <td className={`${TD} font-medium`}>{row.productName}</td>
                      <td className={TD}>
                        {row.productVariant?.category?.displayName}
                      </td>
                      <td className={`${TD} font-mono text-xs`}>
                        {row.nafdacNumber}
                      </td>
                      <td className={`${TD} font-mono text-xs`}>
                        {row.sonNumber}
                      </td>
                      <td className={TD}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td className={TD}>{row.price}</td>
                      <td className={TD}>{row.productOrigin}</td>
                      <td className={`${TD} text-gray-400`}>
                        {new Date(row.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {samples.map((row) => (
                <div key={row.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium text-green-700 truncate">
                      {row.sampleId}
                    </span>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {row.productName}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="flex flex-col">
                      <span className="text-gray-400 uppercase tracking-wide text-xs">
                        State / LGA
                      </span>
                      <span className="text-gray-700 truncate">
                        {row.state?.name}
                        {row.lga?.name ? ` · ${row.lga.name}` : ""}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 uppercase tracking-wide text-xs">
                        Market
                      </span>
                      <span className="text-gray-700 truncate">
                        {row.market?.name || "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 uppercase tracking-wide text-xs">
                        Category
                      </span>
                      <span className="text-gray-700 truncate">
                        {row.productCategory?.name || "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 uppercase tracking-wide text-xs">
                        Origin
                      </span>
                      <span className="text-gray-700 truncate">
                        {row.productOrigin || "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 uppercase tracking-wide text-xs">
                        NAFDAC No.
                      </span>
                      <span className="font-mono text-gray-700 truncate">
                        {row.nafdacNumber || "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 uppercase tracking-wide text-xs">
                        SON No.
                      </span>
                      <span className="font-mono text-gray-700 truncate">
                        {row.sonNumber || "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 uppercase tracking-wide text-xs">
                        Price
                      </span>
                      <span className="text-gray-700">{row.price || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 uppercase tracking-wide text-xs">
                        Created
                      </span>
                      <span className="text-gray-400">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <Pagination
          console
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default Samples;
