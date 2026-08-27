import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BrainCircuit,
  Database,
  FlaskConical,
  Info,
  MapPin,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import api from "../../../utils/api";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-NG").format(Number(value || 0));

const pct = (value) => Number(value || 0).toFixed(1);

const ResearchModelingDashboard = () => {
  const { theme } = useTheme();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadResearchSummary = async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      setError("");

      const response = await api.get("/samples/policy-dashboard-summary");
      setSummary(response?.data?.data || null);
    } catch (err) {
      setSummary(null);
      setError(
        err?.response?.data?.message ||
          "Unable to load the research dataset summary."
      );
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    loadResearchSummary();
  }, []);

  const trend = useMemo(
    () => (Array.isArray(summary?.trendData) ? summary.trendData : []),
    [summary]
  );

  const productGroups = useMemo(
    () =>
      Array.isArray(summary?.productRiskRows)
        ? [...summary.productRiskRows].sort(
            (a, b) =>
              Number(b.contaminationRate || 0) -
              Number(a.contaminationRate || 0)
          )
        : [],
    [summary]
  );

  const hotspots = useMemo(
    () => (Array.isArray(summary?.hotspots) ? summary.hotspots : []),
    [summary]
  );

  const latestTrend = trend[trend.length - 1];
  const previousTrend = trend[trend.length - 2];
  const trendDelta =
    latestTrend && previousTrend
      ? Number(latestTrend.contaminationRate || 0) -
        Number(previousTrend.contaminationRate || 0)
      : 0;

  const maxTrend = Math.max(
    1,
    ...trend.map((item) => Number(item.contaminationRate || 0))
  );

  const methodologyNote =
    "This workspace presents aggregated research indicators. It does not expose individual participant, collector, or sample-identifying records.";

  if (loading) {
    return (
      <div className={`min-h-[50vh] flex items-center justify-center ${theme.text}`}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500" />
          <p className="font-semibold">Loading research workspace…</p>
          <p className={`mt-1 text-sm ${theme.textMuted}`}>
            Preparing aggregated data for analysis.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mx-auto mt-8 max-w-3xl rounded-3xl border ${theme.border} ${theme.card} p-7 ${theme.text}`}>
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30">
            <Info className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Research data unavailable</h2>
            <p className={`mt-1 text-sm ${theme.textMuted}`}>{error}</p>
            <button
              onClick={() => loadResearchSummary()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={`mx-auto mt-8 max-w-3xl rounded-3xl border ${theme.border} ${theme.card} p-7 ${theme.text}`}>
        <h2 className="text-lg font-bold">No research data available</h2>
        <p className={`mt-1 text-sm ${theme.textMuted}`}>
          The aggregated research dataset is currently empty.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 px-3 pb-8 sm:px-5 lg:px-8 ${theme.text}`}>
      {/* Header */}
      <section className="relative overflow-hidden rounded-[28px] border border-indigo-200 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-sm dark:border-indigo-800 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-violet-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
              <BrainCircuit className="h-3.5 w-3.5" />
              Research & Modeling
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              University Research Workspace
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
              Explore aggregated contamination patterns, temporal trends and
              product-level indicators for statistical research and model
              development.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium">
              <Database className="h-4 w-4" />
              Aggregated dataset
            </span>
            <button
              onClick={() => loadResearchSummary(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard theme={theme} icon={Database} label="Available samples" value={formatNumber(summary.totalSamples)} note="Aggregated records" />
        <MetricCard theme={theme} icon={FlaskConical} label="Contamination rate" value={`${pct(summary.contaminationRate)}%`} note="Across reviewed samples" />
        <MetricCard theme={theme} icon={BarChart3} label="Product groups" value={formatNumber(productGroups.length)} note="Aggregated categories" />
        <MetricCard
          theme={theme}
          icon={trendDelta > 0 ? TrendingUp : trendDelta < 0 ? TrendingDown : TrendingUp}
          label="Latest trend"
          value={`${trendDelta >= 0 ? "+" : ""}${trendDelta.toFixed(1)} pp`}
          note="Change vs previous month"
          accent={trendDelta > 0 ? "danger" : trendDelta < 0 ? "safe" : "neutral"}
        />
      </div>

      {/* Main analysis */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Panel theme={theme}>
          <PanelTitle
            title="Contamination trend"
            subtitle="Six-month aggregated contamination movement"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <div className="mt-6">
            {trend.length ? (
              <>
                <div className="flex h-52 items-end gap-2 sm:gap-4">
                  {trend.map((item, index) => {
                    const value = Number(item.contaminationRate || 0);
                    const height = Math.max(8, (value / maxTrend) * 100);
                    const isLatest = index === trend.length - 1;
                    return (
                      <div key={`${item.month}-${item.total}-${index}`} className="flex h-full flex-1 flex-col justify-end">
                        <div className="mb-2 text-center text-xs font-semibold">
                          {pct(value)}%
                        </div>
                        <div
                          className={`mx-auto w-full max-w-12 rounded-t-xl transition-all ${
                            isLatest
                              ? "bg-indigo-500"
                              : "bg-indigo-200 dark:bg-indigo-900/70"
                          }`}
                          style={{ height: `${height}%` }}
                          title={`${item.month}: ${pct(value)}%`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className={`mt-3 flex gap-2 border-t pt-3 ${theme.border}`}>
                  {trend.map((item, index) => (
                    <span
                      key={`${item.month}-label-${index}`}
                      className={`flex-1 truncate text-center text-[11px] ${theme.textMuted}`}
                    >
                      {item.month}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <EmptyInline theme={theme}>No temporal trend data available.</EmptyInline>
            )}
          </div>
        </Panel>

        <Panel theme={theme}>
          <PanelTitle
            title="Product risk profile"
            subtitle="Highest-risk aggregated product groups"
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <div className="mt-5 space-y-3">
            {productGroups.slice(0, 6).map((item) => {
              const rate = Number(item.contaminationRate || 0);
              return (
                <div key={item.productType} className={`rounded-2xl border ${theme.border} p-3.5`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.productType || "Unspecified"}</p>
                      <p className={`mt-1 text-xs ${theme.textMuted}`}>
                        {formatNumber(item.samples)} aggregated samples
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 dark:bg-red-900/20 dark:text-red-300">
                      {pct(rate)}%
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(rate, 100)}%` }} />
                  </div>
                </div>
              );
            })}
            {!productGroups.length && <EmptyInline theme={theme}>No product indicators available.</EmptyInline>}
          </div>
        </Panel>
      </div>

      {/* Geographic + signals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel theme={theme}>
          <PanelTitle
            title="Geographic research signals"
            subtitle="Available geographic aggregates for cross-region analysis"
            icon={<MapPin className="h-4 w-4" />}
          />
          <div className="mt-5 space-y-3">
            {hotspots.length ? hotspots.slice(0, 6).map((item, index) => (
              <div key={`${item.name || item.state || index}-${index}`} className={`flex items-center justify-between gap-3 rounded-2xl border ${theme.border} p-3.5`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.name || item.state || item.location || "Geographic aggregate"}
                    </p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      {item.samples != null ? `${formatNumber(item.samples)} samples` : "Research signal"}
                    </p>
                  </div>
                </div>
                {item.contaminationRate != null && (
                  <span className="shrink-0 text-sm font-bold">{pct(item.contaminationRate)}%</span>
                )}
              </div>
            )) : (
              <EmptyInline theme={theme}>No geographic hotspot aggregates are currently available.</EmptyInline>
            )}
          </div>
        </Panel>

        <Panel theme={theme}>
          <PanelTitle
            title="Research signals"
            subtitle="Aggregate indicators for statistical and predictive-modeling work"
            icon={<BrainCircuit className="h-4 w-4" />}
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <SignalCard
              theme={theme}
              title="Temporal"
              text={
                trendDelta > 0
                  ? "Latest period shows an upward contamination-rate movement."
                  : trendDelta < 0
                  ? "Latest period shows a downward contamination-rate movement."
                  : "Latest period is broadly stable against the previous period."
              }
            />
            <SignalCard
              theme={theme}
              title="Geographic"
              text={
                hotspots.length
                  ? `${hotspots.length} geographic aggregates are available for cross-region analysis.`
                  : "No geographic hotspot aggregates are currently available."
              }
            />
            <SignalCard
              theme={theme}
              title="Modeling boundary"
              text="Predictive outputs are not presented as scientific predictions here; model execution and validation belong to the research/backend layer."
            />
          </div>
        </Panel>
      </div>

      {/* Boundary notice */}
      <section className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-800 dark:bg-indigo-950/30 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-indigo-900/50 dark:text-indigo-300">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold sm:text-base">Research data boundary</h2>
            <p className="mt-1 text-sm leading-6 text-indigo-700 dark:text-indigo-300">
              {methodologyNote}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const Panel = ({ theme, children }) => (
  <section className={`rounded-3xl border ${theme.border} ${theme.card} p-5 shadow-sm sm:p-6`}>
    {children}
  </section>
);

const PanelTitle = ({ title, subtitle, icon }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
      {icon}
    </div>
  </div>
);

const MetricCard = ({ theme, icon: Icon, label, value, note, accent = "neutral" }) => {
  const iconClass =
    accent === "danger"
      ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300"
      : accent === "safe"
      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300"
      : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300";

  return (
    <section className={`rounded-3xl border ${theme.border} ${theme.card} p-4 shadow-sm sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-medium ${theme.textMuted}`}>{label}</p>
          <p className="mt-1 truncate text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className={`mt-3 text-xs ${theme.textMuted}`}>{note}</p>
    </section>
  );
};

const SignalCard = ({ theme, title, text }) => (
  <div className={`rounded-2xl border ${theme.border} p-4`}>
    <p className="text-sm font-bold">{title}</p>
    <p className={`mt-2 text-xs leading-5 ${theme.textMuted}`}>{text}</p>
  </div>
);

const EmptyInline = ({ theme, children }) => (
  <div className={`rounded-2xl border border-dashed ${theme.border} py-10 text-center text-sm ${theme.textMuted}`}>
    {children}
  </div>
);

export default ResearchModelingDashboard;
