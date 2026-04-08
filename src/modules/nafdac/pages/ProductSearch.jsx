import { useState, useEffect } from "react";
import Badge from "../components/Badge";
import Btn from "../components/Btn";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import { icons } from "../utils/icons";
import Icon from "../components/icons/Icon";
import {
  getProductByNafdacNumber,
  searchRegistryProducts,
} from "../api/nafdacService";

const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const [nafdacNumber, setNafdacNumber] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [take, setTake] = useState(20);
  const [skip, setSkip] = useState(0);

  const [data, setData] = useState({
    items: [],
    skip: 0,
    take: 1,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  function handleFetchMore() {
    const newSkip = skip + 20;
    const noMore = skip + take >= (data.totalCount || 1);
    if (noMore) return;

    setSkip(newSkip);
    setLoading(true);
    setError(null);
    searchRegistryProducts({
      q: query || undefined,
      status: filter !== "ALL" ? filter : undefined,
      skip: newSkip,
      take,
    })
      .then((data) =>
        setData((prev) => ({
          ...prev,
          skip: data.skip || prev.skip,
          items: [...prev.items, ...data.items],
        })),
      )
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }

  function handleSearch() {
    setLoading(true);
    setError(null);
    searchRegistryProducts({
      q: query || undefined,
      status: filter !== "ALL" ? filter : undefined,
      skip: 0,
      take,
    })
      .then(setData)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setSkip(0);
    handleSearch();
  }, [debouncedQuery, filter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <PageHeader
        title='Product Registry Search'
        subtitle='Search and verify registered products. Used for investigation, legal checks, and cross-agency confirmation.'
      />

      <div className='flex flex-col sm:flex-row gap-3 mb-6'>
        <div className='flex-1 relative'>
          <Icon
            d={icons.search}
            size={16}
            className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 '
          />
          <input
            type='text'
            placeholder='Search by by nafdac number, product name, or brand...'
            className='w-full pl-10 pr-4 py-2.5 text-sm border text-black border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white'
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </div>

        <div className='flex gap-2 flex-wrap'>
          {["ALL", "ACTIVE", "SUSPENDED"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
              }}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all ${filter === s ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-500 hover:border-emerald-300 bg-white"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className='bg-white border border-slate-100 rounded-2xl shadow-sm overflow-auto'>
        <div className='p-4 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <p className='text-xl text-slate-400'>
            {loading
              ? "Loading..."
              : `${(data?.items?.length ?? 0).toLocaleString()} results  of ${(data?.totalCount ?? 0).toLocaleString()}`}
          </p>
        </div>

        <div className='p-4'>
          <Table
            headers={[
              "NAFDAC No.",
              "Product Name",
              "Brand",
              "Manufacturer",
              "Category",
              "Status",
              "",
            ]}
            rows={(data.items || []).map((p) => [
              <code
                key='n'
                className='text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded'
              >
                {p.nafdacNumber ?? "—"}
              </code>,
              <span key='pn' className='font-medium text-slate-700'>
                {p.productName ?? "—"}
              </span>,
              p.brandName ?? "—",
              p.manufacturer ?? "—",
              p.category ?? "—",
              <Badge key='st' status={p.status ?? "ACTIVE"} />,
              // <Btn key='v' variant='ghost' icon='eye' small>
              //   View
              // </Btn>,
            ])}
          />
          {data?.items?.length > 0 && (
            <div className='py-3 flex justify-center'>
              <button
                onClick={handleFetchMore}
                disabled={loading || skip + take >= (data.totalCount || 1)}
                className={`px-4 py-2 rounded-lg text-sm text-white ${loading || skip + take >= (data.totalCount || 0) ? "bg-gray-400 opacity-60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
        {!loading && (!data.items || data.items.length === 0) && (
          <div className='p-8 text-center text-slate-500 text-sm'>
            No products found. Try a different search or ensure an active
            registry version exists.
          </div>
        )}
        {error && (
          <div className='mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2'>
            <Icon
              d={icons.alert}
              size={18}
              className='text-red-500 flex-shrink-0'
            />
            <p className='text-sm text-red-700'>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
