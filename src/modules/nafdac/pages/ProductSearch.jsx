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

const PAGE_SIZE = 20;

const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const [nafdacNumber, setNafdacNumber] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    searchRegistryProducts({
      q: query || undefined,
      status: filter !== "ALL" ? filter : undefined,
      page,
      pageSize: PAGE_SIZE,
    })
      .then(setData)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [query, filter, page]);

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));

  const handleSearchNafdac = (nafdacNo) => {
    setLoading(true);
    setError(null);
    getProductByNafdacNumber(nafdacNumber || "")
      .then(setData)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <PageHeader
        title='Product Registry Search'
        subtitle='Search and verify registered products. Used for investigation, legal checks, and cross-agency confirmation.'
      />

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

      <div className='flex flex-col sm:flex-row gap-3 mb-6'>
        <div className='flex-1 relative'>
          <Icon
            d={icons.search}
            size={16}
            className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
          />
          <input
            type='text'
            placeholder='Search by by nafdac number, product name, or brand...'
            className='w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white'
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* nafdac search */}
        {/* <div className='flex-1 relative'>
          <Icon
            d={icons.search}
            size={16}
            className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
          />
          <input
            type='text'
            placeholder='Search by NAFDAC number'
            className='w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white'
            value={nafdacNumber}
            onChange={(e) => {
              setNafdacNumber(e.target.value);
              setPage(1);
            }}
          />
        </div> */}
        <div className='flex gap-2 flex-wrap'>
          {["ALL", "ACTIVE", "SUSPENDED"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setPage(1);
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
              : `${(data.total ?? 0).toLocaleString()} results found`}
          </p>
          {totalPages > 1 && (
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className='px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'
              >
                Previous
              </button>
              <span className='text-xs text-slate-500'>
                Page {page} of {totalPages}
              </span>
              <button
                type='button'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className='px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'
              >
                Next
              </button>
            </div>
          )}
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
        </div>
        {!loading && (!data.items || data.items.length === 0) && (
          <div className='p-8 text-center text-slate-500 text-sm'>
            No products found. Try a different search or ensure an active
            registry version exists.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
