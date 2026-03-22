import { useState, useEffect, useRef } from "react";
import PageHeader from "../components/PageHeader";
import { icons } from "../utils/icons";
import StatCard from "../components/StatCard";
import Icon from "../components/icons/Icon";
import Table from "../components/Table";
import Badge from "../components/Badge";
import Btn from "../components/Btn";
import {
  getVerificationSummary,
  getVerificationLogs,
  verifySample,
} from "../api/nafdacService";

const PAGE_SIZE = 20;
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const VerificationLogs = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState(null);
  const [logsData, setLogsData] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    getVerificationSummary()
      .then(setSummary)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoadingSummary(false));
  }, []);

  useEffect(() => {
    setLoadingLogs(true);
    const params = { page, pageSize: PAGE_SIZE };
    if (statusFilter !== "ALL") params.status = statusFilter;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    getVerificationLogs(params)
      .then(setLogsData)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoadingLogs(false));
  }, [statusFilter, dateFrom, dateTo, page]);

  const handleVerify = (id) => {
    setVerifyingId(id);
    verifySample(id)
      .then(() => {
        getVerificationLogs({
          page,
          pageSize: PAGE_SIZE,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          from: dateFrom || undefined,
          to: dateTo || undefined,
        }).then(setLogsData);
        if (summary) getVerificationSummary().then(setSummary);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setVerifyingId(null));
  };

  const totalPages = Math.max(1, Math.ceil((logsData.total || 0) / PAGE_SIZE));
  const total = summary?.totalVerifications ?? 0;
  const matchRate =
    total > 0 ? Math.round(((summary?.verified ?? 0) / total) * 100) : 0;

  return (
    <div>
      <PageHeader
        title='Verification Logs'
        subtitle='Real-time operational visibility into all sample verifications across Nigeria.'
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

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <StatCard
          label='Total Verifications'
          value={
            loadingSummary
              ? "…"
              : (summary?.totalVerifications ?? 0).toLocaleString()
          }
          sub='With NAFDAC number'
          icon='activity'
        />
        <StatCard
          label='Verified'
          value={
            loadingSummary ? "…" : (summary?.verified ?? 0).toLocaleString()
          }
          sub={total ? `${matchRate}% match rate` : "—"}
          icon='check'
          color='emerald'
        />
        <StatCard
          label='Failed'
          value={loadingSummary ? "…" : (summary?.failed ?? 0).toLocaleString()}
          sub='No match / fake'
          icon='x'
          color='red'
        />
        <StatCard
          label='Pending'
          value={
            loadingSummary ? "…" : (summary?.pending ?? 0).toLocaleString()
          }
          sub='Awaiting result'
          icon='refresh'
          color='sky'
        />
      </div>

      <div className='bg-white border border-slate-100 rounded-2xl shadow-sm overflow-auto'>
        <div className='p-4 border-b border-slate-50 flex flex-col sm:flex-row gap-3'>
          <div className='flex gap-2 flex-wrap items-center w-full sm:w-auto ml-0 sm:ml-auto'>
            <Icon d={icons.filter} size={15} className='text-slate-400' />
            {[
              "ALL",
              "VERIFIED_ORIGINAL",
              "VERIFIED_FAKE",
              "UNVERIFIED",
              "VERIFICATION_PENDING",
            ].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${statusFilter === s ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-500 hover:border-emerald-300 bg-white"}`}
              >
                {s === "ALL" ? "All" : s.replace(/_/g, " ")}
              </button>
            ))}
            <div className='flex gap-2 items-center mt-2 sm:mt-0 flex-col sm:flex-row '>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='FROM'
                  value={
                    dateFrom
                      ? new Date(dateFrom).toLocaleDateString("en-GB")
                      : ""
                  }
                  readOnly
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${dateFrom ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-500 hover:border-emerald-300 bg-white"}`}
                />
                <input
                  id='vl-from'
                  type='date'
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  onClick={() => {
                    fromRef.current.showPicker();
                  }}
                  ref={fromRef}
                  className='opacity-0 absolute left-0 top-0 w-full h-full '
                />
              </div>

              <div className='relative'>
                <input
                  type='text'
                  placeholder='TO'
                  value={
                    dateTo ? new Date(dateTo).toLocaleDateString("en-GB") : ""
                  }
                  readOnly
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${dateTo ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-500 hover:border-emerald-300 bg-white"}`}
                />
                <input
                  id='vl-to'
                  type='date'
                  value={dateTo}
                  onClick={() => toRef.current?.showPicker()}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  ref={toRef}
                  className='opacity-0 absolute left-0 top-0 w-full h-full'
                />
              </div>
            </div>
            <i
              className='text-sm font-light text-slate-400 hover:
               cursor-pointer hover:underline hover:text-slate-600'
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setStatusFilter("ALL");
                setPage(1);
              }}
            >
              Clear filters
            </i>
          </div>
        </div>
        <div className='p-4'>
          {totalPages > 1 && (
            <div className='flex items-center justify-end gap-2 mb-2'>
              <button
                type='button'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loadingLogs}
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
                disabled={page >= totalPages || loadingLogs}
                className='px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'
              >
                Next
              </button>
            </div>
          )}
          <Table
            headers={[
              "Sample ID",
              "Product",
              "NAFDAC No.",
              "State",
              "Date",
              "Status",
              "Outcome",
              "",
            ]}
            rows={(logsData.items || []).map((v) => [
              <code key='id' className='text-xs font-mono text-slate-500'>
                {v.sampleId ?? v.id}
              </code>,
              <span key='pn' className='font-medium text-slate-700'>
                {v.productName ?? "—"}
              </span>,
              <code
                key='nn'
                className='text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded'
              >
                {v.nafdacNumber ?? "—"}
              </code>,
              v.state?.name ?? "—",
              formatDate(v.createdAt),
              <Badge key='st' status={v.verificationStatus} />,
              <span key='out' className='text-xs text-slate-600'>
                {v.isOriginal === true
                  ? "Original"
                  : v.isOriginal === false
                    ? "Fake"
                    : "—"}
              </span>,
              <Btn
                key='btn'
                variant='ghost'
                icon='refresh'
                small
                onClick={() => handleVerify(v.id)}
                disabled={verifyingId === v.id}
              >
                {verifyingId === v.id ? "Verifying…" : "Re-verify"}
              </Btn>,
            ])}
          />
        </div>
        {!loadingLogs && (!logsData.items || logsData.items.length === 0) && (
          <div className='p-8 text-center text-slate-500 text-sm'>
            No verification logs found.
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationLogs;
