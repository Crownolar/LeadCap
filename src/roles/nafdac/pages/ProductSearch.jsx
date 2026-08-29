import { useState, useEffect, useCallback } from "react";
import Badge from "../components/Badge";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import { icons } from "../utils/icons";
import Icon from "../components/icons/Icon";
import { searchRegistryProducts } from "../api/nafdacService";
import { useTheme } from "../../../context/ThemeContext";

const STATUS_FILTERS = ["ALL", "ACTIVE", "SUSPENDED"];

const ProductSearch = () => {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [take] = useState(20);
  const [skip, setSkip] = useState(0);
  const [data, setData] = useState({ items: [], skip: 0, take: 20, totalCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchRegistryProducts({
        q: debouncedQuery.trim() || undefined,
        status: filter !== "ALL" ? filter : undefined,
        skip: 0,
        take,
      });
      setSkip(0);
      setData({
        items: result?.items || [],
        skip: result?.skip || 0,
        take: result?.take || take,
        totalCount: result?.totalCount || 0,
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to load registry products.");
      setData((prev) => ({ ...prev, items: [], totalCount: 0, skip: 0 }));
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filter, take]);

  const handleFetchMore = async () => {
    const currentCount = data.items?.length || 0;
    if (loading || currentCount >= (data.totalCount || 0)) return;

    const newSkip = currentCount;
    setLoading(true);
    setError(null);
    try {
      const result = await searchRegistryProducts({
        q: debouncedQuery.trim() || undefined,
        status: filter !== "ALL" ? filter : undefined,
        skip: newSkip,
        take,
      });
      setSkip(newSkip);
      setData((prev) => ({
        ...prev,
        skip: result?.skip ?? newSkip,
        items: [...(prev.items || []), ...(result?.items || [])],
        totalCount: result?.totalCount ?? prev.totalCount,
      }));
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to load more products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 450);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const resultCount = data?.items?.length || 0;
  const totalCount = data?.totalCount || 0;
  const canLoadMore = resultCount < totalCount;

  return (
    <div className={`${theme.text} space-y-6 pb-8`}>
      <PageHeader
        title="Product Registry Search"
        subtitle="Search and verify registered products for investigation, legal checks, and cross-agency confirmation."
      />

      {/* Search workspace */}
      <section className={`${theme.card} ${theme.border} overflow-hidden rounded-3xl border shadow-sm`}>
        <div className="relative overflow-hidden px-5 py-6 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                <Icon d={icons.search} size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold sm:text-base">Registry lookup</h2>
                <p className={`text-xs ${theme.textMuted}`}>Find a product by name, brand, manufacturer, or NAFDAC number.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Icon
                  d={icons.search}
                  size={17}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by NAFDAC number, product name, or brand..."
                  className={`w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${theme.input} ${theme.text} ${theme.border}`}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                {STATUS_FILTERS.map((status) => {
                  const active = filter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFilter(status)}
                      className={`whitespace-nowrap rounded-xl border px-4 py-3 text-xs font-semibold transition sm:text-sm ${
                        active
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                          : `${theme.border} ${theme.bg} ${theme.text} hover:border-emerald-400 hover:text-emerald-600`
                      }`}
                    >
                      {status === "ALL" ? "All products" : status === "ACTIVE" ? "Active" : "Suspended"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Result summary */}
        <div className={`flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${theme.border}`}>
          <div>
            <p className="text-sm font-semibold">Registered products</p>
            <p className={`mt-0.5 text-xs ${theme.textMuted}`}>
              {loading ? "Updating registry results..." : `${resultCount.toLocaleString()} loaded of ${totalCount.toLocaleString()} matching records`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {query.trim() && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${theme.border} ${theme.textMuted} hover:text-emerald-600`}
              >
                Clear search
              </button>
            )}
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          <Icon d={icons.alert} size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Registry search failed</p>
            <p className="mt-0.5 text-xs opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      <section className={`${theme.card} ${theme.border} overflow-hidden rounded-3xl border shadow-sm`}>
        <div className={`flex items-center justify-between border-b px-5 py-4 sm:px-6 ${theme.border}`}>
          <div>
            <p className="text-sm font-bold">Search results</p>
            <p className={`mt-1 text-xs ${theme.textMuted}`}>
              {filter === "ALL" ? "All registry statuses" : `${filter.toLowerCase()} registry records`}
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
            {totalCount.toLocaleString()} total
          </span>
        </div>

        {loading && resultCount === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <div>
              <p className="text-sm font-semibold">Searching registry</p>
              <p className={`mt-1 text-xs ${theme.textMuted}`}>Fetching the latest matching product records.</p>
            </div>
          </div>
        ) : resultCount === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800">
              <Icon d={icons.search} size={22} />
            </div>
            <p className="text-sm font-bold">No products found</p>
            <p className={`mt-1 max-w-md text-xs leading-5 ${theme.textMuted}`}>
              Try a different search term or check that an active registry version exists.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto p-2 sm:p-4">
              <Table
                headers={["NAFDAC No.", "Product Name", "Brand", "Manufacturer", "Category", "Status", ""]}
                rows={(data.items || []).map((p) => [
                  <code
                    key={`n-${p.id || p.nafdacNumber}`}
                    className="inline-flex whitespace-nowrap rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                  >
                    {p.nafdacNumber ?? "—"}
                  </code>,
                  <span key={`pn-${p.id || p.nafdacNumber}`} className={`font-semibold ${theme.text}`}>
                    {p.productName ?? "—"}
                  </span>,
                  p.brandName ?? "—",
                  p.manufacturer ?? "—",
                  p.category ?? "—",
                  <Badge key={`st-${p.id || p.nafdacNumber}`} status={p.status ?? "ACTIVE"} />,
                  "",
                ])}
              />
            </div>

            <div className={`flex flex-col items-center justify-between gap-3 border-t px-5 py-4 sm:flex-row sm:px-6 ${theme.border}`}>
              <p className={`text-xs ${theme.textMuted}`}>
                Showing {resultCount.toLocaleString()} of {totalCount.toLocaleString()} products
              </p>
              {canLoadMore ? (
                <button
                  type="button"
                  onClick={handleFetchMore}
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Loading more..." : "Load more products"}
                </button>
              ) : (
                <span className={`text-xs font-medium ${theme.textMuted}`}>End of results</span>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default ProductSearch;