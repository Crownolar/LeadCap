import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileSearch,
  FlaskConical,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import api from "../../../utils/api";
import { deriveFlaggedProducts, deriveRiskCategories } from "../utils/nafdacHelpers";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Unable to load NAFDAC dashboard data.";

const STATUS = {
  verified: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  flagged: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
};

const NafdacDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await api.get("/nafdac/verification/stats");
      setStats(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const riskCategories = useMemo(
    () => deriveRiskCategories(stats || {}),
    [stats]
  );

  const flaggedProducts = useMemo(
    () => deriveFlaggedProducts(stats?.recentDetectedFakeSamples || []),
    [stats]
  );

  const trendData = stats?.monthlyAnalysis || [];

  const verificationData = [
    { name: "Matched", value: Number(stats?.verifiedMatchesCount ?? 0), key: "verified" },
    { name: "Flagged", value: Number(stats?.fakeRecordsCount ?? 0), key: "flagged" },
    {
      name: "Pending",
      value: Number(
        stats?.pendingVerificationsCount ?? stats?.pendingReviewsCount ?? 0
      ),
      key: "pending",
    },
  ];

  const totalVerification = verificationData.reduce((sum, item) => sum + item.value, 0);
  const matchRate =
    totalVerification > 0
      ? Math.round((verificationData[0].value / totalVerification) * 100)
      : 0;

  const actions = [
    { label: "Upload registry", desc: "Ingest a new registry dataset", icon: UploadCloud, route: "/nafdac-upload" },
    { label: "Search products", desc: "Find registry-linked products", icon: Search, route: "/nafdac-products" },
    { label: "Verification logs", desc: "Inspect verification outcomes", icon: FileSearch, route: "/nafdac-verifications" },
    { label: "Risk intelligence", desc: "Review priority risk signals", icon: ShieldAlert, route: "/nafdac-risk" },
  ];

  if (loading) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${theme.text}`}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="font-semibold">Loading NAFDAC intelligence</p>
          <p className={`mt-1 text-sm ${theme.textMuted}`}>
            Preparing registry and verification insights…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-full space-y-6 ${theme.text}`}>
      {/* Header */}
      <section className={`relative overflow-hidden rounded-3xl border ${theme.border} ${theme.card} p-6 md:p-8`}>
        <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              NAFDAC regulatory intelligence
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Registry & verification oversight
            </h1>
            <p className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${theme.textMuted}`}>
              A command view of registry activity, verification outcomes, flagged
              records and products requiring regulatory attention.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh data"}
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load live intelligence</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard theme={theme} icon={Database} label="Registered products" value={stats?.registeredProductCount ?? 0} hint="Registry-linked records" tone="blue" />
        <MetricCard theme={theme} icon={CheckCircle2} label="Verified matches" value={stats?.verifiedMatchesCount ?? 0} hint="Matched against registry" tone="green" />
        <MetricCard theme={theme} icon={ShieldAlert} label="Flagged records" value={stats?.fakeRecordsCount ?? 0} hint="Require regulatory attention" tone="red" />
        <MetricCard theme={theme} icon={Clock3} label="Pending reviews" value={stats?.pendingReviewsCount ?? 0} hint="Awaiting verification action" tone="amber" />
      </section>

      {/* Main intelligence row */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(330px,0.85fr)]">
        <Panel theme={theme} title="Registry activity" subtitle="Monthly movement of registered and flagged records" icon={Activity}>
          {trendData.length ? (
            <div className="h-[310px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="nafdacRegisteredFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="nafdacFlaggedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.20} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 10px 30px rgba(0,0,0,.08)",
                    }}
                  />
                  <Area type="monotone" dataKey="registered" name="Registered" stroke="#10b981" strokeWidth={2.5} fill="url(#nafdacRegisteredFill)" />
                  <Area type="monotone" dataKey="fakeSamples" name="Flagged" stroke="#ef4444" strokeWidth={2.5} fill="url(#nafdacFlaggedFill)" />
                  <Area type="monotone" dataKey="flagged" name="Flagged" stroke="#ef4444" strokeWidth={2.5} fill="url(#nafdacFlaggedFill)" hide={trendData.some((x) => x.fakeSamples != null)} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart theme={theme} message="No monthly trend data available." />
          )}
        </Panel>

        <Panel theme={theme} title="Verification health" subtitle="Current verification outcome mix" icon={ShieldCheck}>
          <div className="relative mx-auto h-[270px] max-w-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={verificationData} dataKey="value" nameKey="name" innerRadius={78} outerRadius={104} paddingAngle={3} stroke="none">
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{matchRate}%</span>
              <span className={`mt-1 text-xs ${theme.textMuted}`}>match rate</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t pt-4 text-center dark:border-slate-700">
            {verificationData.map((item) => (
              <div key={item.name}>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${theme.textMuted}`}>{item.name}</p>
                <p className="mt-1 text-lg font-bold">{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {/* Risk + flagged records */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.5fr]">
        <Panel theme={theme} title="Risk concentration" subtitle="Flagged-rate signal across the current registry view" icon={ShieldAlert}>
          <div className="space-y-4">
            {riskCategories.map((item) => {
              const rate = Math.min(Number(item.fakeRecordsRate || 0), 100);
              const high = item.riskLevel === "High";
              const medium = item.riskLevel === "Medium";
              return (
                <div key={item.category} className={`rounded-2xl border ${theme.border} p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.category}</p>
                      <p className={`mt-1 text-xs ${theme.textMuted}`}>
                        {item.fakeRecordsCount} flagged of {item.registeredProductCount} records
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${high ? STATUS.flagged : medium ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300" : STATUS.verified}`}>
                      {item.riskLevel}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className={theme.textMuted}>Flagged rate</span>
                    <span className="font-bold">{rate.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${high ? "bg-red-500" : medium ? "bg-orange-500" : "bg-emerald-500"}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel theme={theme} title="Recent flagged products" subtitle="Latest records requiring verification or compliance attention" icon={AlertTriangle}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className={`border-b text-left ${theme.border}`}>
                  {["Product", "Brand", "State", "Verification", "Contamination"].map((head) => (
                    <th key={head} className={`px-3 py-3 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flaggedProducts.length === 0 ? (
                  <tr><td colSpan={5} className={`px-3 py-12 text-center text-sm ${theme.textMuted}`}>No flagged products found.</td></tr>
                ) : flaggedProducts.map((row) => (
                  <tr key={row.id} className={`border-b last:border-0 ${theme.border} transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30`}>
                    <td className="px-3 py-4">
                      <p className="max-w-[190px] truncate text-sm font-semibold">{row.productName}</p>
                    </td>
                    <td className={`px-3 py-4 text-sm ${theme.textMuted}`}>{row.brandName}</td>
                    <td className="px-3 py-4 text-sm">{row.state}</td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS.flagged}`}>{row.status}</span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`text-xs font-semibold ${String(row.contaminationStatus).toLowerCase() === "contaminated" ? "text-red-600" : theme.textMuted}`}>
                        {row.contaminationStatus || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      {/* Actions */}
      <Panel theme={theme} title="Regulatory workflows" subtitle="Jump directly into the NAFDAC operations that need attention" icon={ArrowUpRight}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map(({ label, desc, icon: Icon, route }) => (
            <button
              key={route}
              type="button"
              onClick={() => navigate(route)}
              className={`group rounded-2xl border ${theme.border} p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${theme.hover}`}
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                  <Icon className="h-5 w-5" />
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
              </div>
              <p className="mt-4 text-sm font-bold">{label}</p>
              <p className={`mt-1 text-xs leading-5 ${theme.textMuted}`}>{desc}</p>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
};

const MetricCard = ({ theme, icon: Icon, label, value, hint, tone }) => {
  const tones = {
    blue: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    red: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  };

  return (
    <div className={`group rounded-2xl border ${theme.border} ${theme.card} p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
      </div>
      <p className={`mt-5 text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{Number(value || 0).toLocaleString()}</p>
      <p className={`mt-1 text-xs ${theme.textMuted}`}>{hint}</p>
    </div>
  );
};

const Panel = ({ theme, title, subtitle, icon: Icon, children }) => (
  <section className={`overflow-hidden rounded-2xl border ${theme.border} ${theme.card} shadow-sm`}>
    <div className={`flex items-start gap-3 border-b ${theme.border} px-5 py-4`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-bold">{title}</h2>
        <p className={`mt-0.5 text-xs ${theme.textMuted}`}>{subtitle}</p>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const EmptyChart = ({ theme, message }) => (
  <div className={`flex h-[310px] items-center justify-center text-sm ${theme.textMuted}`}>
    <div className="text-center">
      <Activity className="mx-auto mb-2 h-6 w-6 opacity-50" />
      {message}
    </div>
  </div>
);

export default NafdacDashboard;