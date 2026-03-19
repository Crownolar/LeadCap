import { useState, useEffect } from "react";
import Btn from "../components/Btn";
import Icon from "../components/icons/Icon";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { icons } from "../utils/icons";
import {
  getHighRiskRegions,
  getReusedNafdacNumbers,
  getFakeProductsSummary,
} from "../api/nafdacService";

const RiskIntelligence = () => {
  const [regions, setRegions] = useState([]);
  const [reused, setReused] = useState([]);
  const [fakeSummary, setFakeSummary] = useState({
    totalFakeProducts: 0,
    fakeByCategory: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    setError(null);
    Promise.allSettled([
      getHighRiskRegions().then((r) => r.regions || []),
      getReusedNafdacNumbers().then((r) => r.items || []),
      getFakeProductsSummary().then((r) =>
        console.log("getFakeProductsSummary", r),
      ),
    ])
      .then(([regs, reusedItems, fake]) => {
        setRegions(regs.value);
        setReused(reusedItems.value);
        setFakeSummary({
          totalFakeProducts: fake.totalFakeProducts ?? 0,
          fakeByCategory: fake.fakeByCategory ?? [],
        });
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const highRiskCount = regions?.filter((r) => (r.riskScore ?? 0) > 50).length;
  const maxScore = Math.max(1, ...regions.map((d) => d.riskScore ?? 0));
  const maxCategoryCount = Math.max(
    1,
    ...fakeSummary.fakeByCategory.map((c) => c.count ?? 0),
  );

  return (
    <div>
      <PageHeader
        title='Risk & Fraud Intelligence'
        subtitle='Counterfeit detection, high-risk market analysis, and reused NAFDAC number alerts.'
        action={
          <Btn
            variant='outline'
            icon='refresh'
            small
            onClick={fetchAll}
            disabled={loading}
          >
            {loading ? "Loading…" : "Refresh Analysis"}
          </Btn>
        }
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

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
        <StatCard
          label='High-Risk Regions'
          value={loading ? "..." : highRiskCount}
          sub='Above threshold'
          icon='alert'
          color='red'
        />
        <StatCard
          label='Reused NAFDAC Numbers'
          value={loading ? "..." : reused.length}
          sub='Detected'
          icon='shield'
          color='amber'
        />
        <StatCard
          label='Fake Products Flagged'
          value={
            loading
              ? "..."
              : (fakeSummary.totalFakeProducts ?? 0).toLocaleString()
          }
          sub='Confirmed counterfeits'
          icon='x'
          color='red'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
        <div className='lg:col-span-3 col-span-1 bg-white border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-5 overflow-auto'>
          <p className='font-semibold text-slate-700 text-sm mb-4'>
            Regional Risk Scores
          </p>
          {loading ? (
            <p className='text-sm text-slate-500'>Loading...</p>
          ) : regions.length === 0 ? (
            <p className='text-sm text-slate-500'>No high-risk region data.</p>
          ) : (
            <div className='space-y-4'>
              {[...regions]
                .sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0))
                .map((d) => (
                  <div key={d.stateId || d.stateName}>
                    <div className='flex items-center justify-between mb-1.5'>
                      <span className='text-sm font-medium text-slate-700'>
                        {d.stateName ?? "—"}
                      </span>
                      <span
                        className={`text-xs font-bold ${(d.riskScore ?? 0) > 70 ? "text-red-600" : (d.riskScore ?? 0) > 50 ? "text-amber-600" : "text-emerald-600"}`}
                      >
                        {d.riskScore ?? 0}
                      </span>
                    </div>
                    <div className='h-2 bg-slate-100 rounded-full overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all ${(d.riskScore ?? 0) > 70 ? "bg-red-400" : (d.riskScore ?? 0) > 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{
                          width: `${Math.min(100, ((d.riskScore ?? 0) / maxScore) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className='lg:col-span-2 col-span-1 space-y-4'>
          <div className='bg-red-50 border border-red-100 rounded-2xl p-4 sm:p-5'>
            <p className='text-xs font-semibold text-red-600 uppercase tracking-widest mb-3'>
              Reused NAFDAC Numbers
            </p>
            {loading ? (
              <p className='text-xs text-slate-500'>Loading…</p>
            ) : reused.length === 0 ? (
              <p className='text-xs text-slate-500'>None detected.</p>
            ) : (
              <div className='space-y-2'>
                {reused.slice(0, 10).map((item) => (
                  <div
                    key={item.nafdacNumber}
                    className='flex items-center gap-2 text-xs text-red-700 bg-white rounded-lg px-3 py-2 border border-red-100'
                  >
                    <Icon
                      d={icons.alert}
                      size={13}
                      className='text-red-400 flex-shrink-0'
                    />
                    <code className='font-mono'>{item.nafdacNumber}</code>
                    <span className='text-red-600'>
                      (used by {item.productCount ?? item.sampleCount ?? 0}{" "}
                      products)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm'>
            <p className='text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3'>
              Fake Products by Category
            </p>
            {loading ? (
              <p className='text-xs text-slate-500'>Loading…</p>
            ) : !fakeSummary.fakeByCategory?.length ? (
              <p className='text-xs text-slate-500'>No data.</p>
            ) : (
              fakeSummary.fakeByCategory.map((c) => (
                <div
                  key={c.productVariantId || c.categoryName || c.variantName}
                  className='mb-3'
                >
                  <div className='flex justify-between text-xs mb-1'>
                    <span className='text-slate-600 font-medium'>
                      {c.categoryName ?? c.variantName ?? "—"}
                    </span>
                    <span className='text-slate-400'>{c.count ?? 0} cases</span>
                  </div>
                  <div className='h-1.5 bg-slate-100 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-red-400 rounded-full'
                      style={{
                        width: `${Math.min(100, ((c.count ?? 0) / maxCategoryCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskIntelligence;
