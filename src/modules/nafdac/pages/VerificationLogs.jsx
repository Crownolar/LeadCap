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
  const [summary, setSummary] = useState(null);
  const [logsData, setLogsData] = useState({
    items: [],
    skip: 0,
    take: 20,
    totalCount: 0,
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [take, setTake] = useState(20);
  const [skip, setSkip] = useState(0);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  function handleFetchMore() {
    const newSkip = skip + 20;
    const noMore = skip + take >= (logsData.totalCount || 1);
    if (noMore) return;

    setSkip(newSkip);
    setLoadingLogs(true);
    setError(null);

    const params = { skip: newSkip, take };
    if (statusFilter !== "ALL") params.status = statusFilter;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    getVerificationLogs(params)
      .then((data) => {
        setLogsData((prev) => ({
          ...prev,
          skip: data.skip || prev.skip,
          items: [...prev.items, ...data.items],
        }));
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoadingLogs(false));
  }

  // SUMMARY
  useEffect(() => {
    getVerificationSummary()
      .then(setSummary)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoadingSummary(false));
  }, []);

  useEffect(() => {
    setLoadingLogs(true);
    setError(null);
    setSkip(0);
    setLogsData({
      items: [],
      skip: 0,
      take: 20,
      totalCount: 0,
    });
    const params = { skip: 0, take };
    if (statusFilter !== "ALL") params.status = statusFilter;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    getVerificationLogs(params)
      .then(setLogsData)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoadingLogs(false));
  }, [statusFilter, dateFrom, dateTo]);

  const handleVerify = (id) => {
    setVerifyingId(id);
    verifySample(id)
      .then(() => {
        getVerificationLogs({
          skip,
          take,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          from: dateFrom || undefined,
          to: dateTo || undefined,
        }).then(setLogsData);
        if (summary) getVerificationSummary().then(setSummary);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setVerifyingId(null));
  };

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
        <div>
          <p className='px-4 py-2 text-sm text-slate-500'>
            Showing {logsData.items?.length || 0} of {logsData.totalCount || 0}
          </p>
        </div>
        <div className='p-4'>
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
        {/* LOADING AND ERROR STATES */}
        <div className='flex flex-col items-center justify-center '>
          {loadingLogs && (
            <div className='flex items-center justify-center gap-3 mt-5 p-4 '>
              <div className='w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin text-center' />
            </div>
          )}

          {logsData?.items?.length > 0 && (
            <div className='py-3 flex justify-center '>
              <button
                onClick={handleFetchMore}
                disabled={
                  loadingLogs || skip + take >= (logsData.totalCount || 1)
                }
                className={`px-4 py-2 rounded-lg text-sm text-white ${loadingLogs || skip + take >= (logsData.totalCount || 0) ? "bg-gray-400 opacity-60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {loadingLogs ? "Loading..." : "Load more"}
              </button>
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
          {!loadingLogs && (!logsData.items || logsData.items.length === 0) && (
            <div className='p-8 text-center text-slate-500 text-sm'>
              No verification logs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationLogs;
