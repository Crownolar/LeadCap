import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { WhiteCard } from "../components/WhiteCard";
import { StatusBadge } from "../components/StatusBadge";
import { RateBadge } from "../components/RateBadge";
import api from "../../../utils/api";

const RiskIntelligence = () => {
  const { theme } = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("6m");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const fetchRiskIntelligence = async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      setError("");

      const response = await api.get("/moh/risk-intelligence", {
        params: { period },
      });

      setData(response.data?.data || response.data || null);
    } catch (err) {
      console.error("Risk intelligence fetch error:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load risk intelligence.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRiskIntelligence();
  }, [period]);

  const summary = data?.summary || data?.overview || {};
  const riskAreas =
    data?.riskAreas || data?.highRiskAreas || data?.geographicRisk || [];
  const products =
    data?.products || data?.productRisks || data?.highRiskProducts || [];
  const trends = data?.trends || data?.trend || [];
  const alerts = data?.alerts || data?.riskAlerts || [];

  const metrics = [
    {
      label: "Overall risk score",
      value: summary.overallRiskScore ?? summary.riskScore ?? "—",
      suffix: summary.overallRiskScore != null ? "/100" : "",
      icon: ShieldAlert,
      tone: "red",
      sub: "Current intelligence assessment",
    },
    {
      label: "High-risk areas",
      value:
        summary.highRiskAreas ??
        riskAreas.filter((x) => Number(x.riskScore || x.score || 0) >= 70)
          .length,
      icon: MapPin,
      tone: "amber",
      sub: "Priority geographic zones",
    },
    {
      label: "High-risk products",
      value:
        summary.highRiskProducts ??
        products.filter((x) => Number(x.riskScore || x.score || 0) >= 70)
          .length,
      icon: AlertTriangle,
      tone: "red",
      sub: "Products requiring attention",
    },
    {
      label: "Samples assessed",
      value: summary.samplesAssessed ?? summary.totalSamples ?? "—",
      icon: Activity,
      tone: "emerald",
      sub: "Samples in selected period",
    },
  ];

  const filteredAreas = useMemo(() => {
    if (riskFilter === "ALL") return riskAreas;
    return riskAreas.filter((item) => {
      const score = Number(item.riskScore ?? item.score ?? item.rate ?? 0);
      if (riskFilter === "HIGH") return score >= 70;
      if (riskFilter === "MODERATE") return score >= 40 && score < 70;
      return score < 40;
    });
  }, [riskAreas, riskFilter]);

  const getRiskType = (score) => {
    const value = Number(score);
    if (value >= 70) return "danger";
    if (value >= 40) return "moderate";
    return "safe";
  };

  const getName = (item) =>
    item?.name ||
    item?.label ||
    item?.stateName ||
    item?.productName ||
    item?.productType ||
    "Unknown";

  const getScore = (item) =>
    Number(item?.riskScore ?? item?.score ?? item?.risk ?? item?.rate ?? 0);

  const getContamination = (item) =>
    item?.contaminationRate ??
    item?.contaminationPercentage ??
    item?.rate ??
    item?.contaminatedRate ??
    "—";

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString();
  };

  if (loading && !data) {
    return (
      <div className={`${theme.text} space-y-5`}>
        <WhiteCard className="flex min-h-[420px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
              <Activity className="h-6 w-6 animate-pulse text-emerald-600" />
            </div>
            <h2 className="mt-4 text-base font-bold">
              Loading risk intelligence
            </h2>
            <p className={`mt-1 text-sm ${theme.textMuted}`}>
              Preparing the latest risk indicators…
            </p>
          </div>
        </WhiteCard>
      </div>
    );
  }

  return (
    <div className={`${theme.text} space-y-6`}>
      <section
        className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 ${theme.card} ${theme.border}`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              <ShieldAlert className="h-3.5 w-3.5" />
              Regulatory risk intelligence
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Risk Intelligence
            </h1>
            <p
              className={`mt-2 max-w-2xl text-sm leading-6 md:text-base ${theme.textMuted}`}
            >
              Identify geographic, product, and contamination signals that
              require priority regulatory attention.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold outline-none focus:border-emerald-500 ${theme.card} ${theme.border} ${theme.text}`}
            >
              <option value="1m">Last month</option>
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
            </select>

            <button
              type="button"
              onClick={() => fetchRiskIntelligence(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Risk intelligence unavailable</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ label, value, suffix, icon: Icon, tone, sub }) => (
          <WhiteCard key={label} className="relative overflow-hidden p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs font-semibold ${theme.textMuted}`}>
                  {label}
                </p>
                <p
                  className={`mt-2 text-2xl font-bold ${tone === "red" ? "text-red-600 dark:text-red-400" : tone === "amber" ? "text-amber-600 dark:text-amber-400" : tone === "emerald" ? "text-emerald-600 dark:text-emerald-400" : ""}`}
                >
                  {value}
                  {suffix && <span className="ml-1 text-sm">{suffix}</span>}
                </p>
              </div>
              <div
                className={`rounded-xl p-2.5 ${tone === "red" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300" : tone === "amber" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300"}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className={`mt-3 text-xs ${theme.textMuted}`}>{sub}</p>
          </WhiteCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <WhiteCard className="overflow-hidden xl:col-span-3">
          <div className={`border-b p-5 md:p-6 ${theme.border}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <h2 className="text-sm font-bold">
                    Geographic risk intelligence
                  </h2>
                </div>
                <p className={`mt-1 text-xs ${theme.textMuted}`}>
                  Areas ranked by current risk score and contamination signal.
                </p>
              </div>

              <div className={`flex rounded-xl p-1 ${theme.bg}`}>
                {[
                  ["ALL", "All"],
                  ["HIGH", "High"],
                  ["MODERATE", "Moderate"],
                  ["LOW", "Low"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRiskFilter(key)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
                      riskFilter === key
                        ? "bg-white text-emerald-700 shadow-sm dark:bg-gray-800 dark:text-emerald-300"
                        : theme.textMuted
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className={theme.bg}>
                  <th
                    className={`px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                  >
                    Area
                  </th>
                  <th
                    className={`px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                  >
                    Risk
                  </th>
                  <th
                    className={`px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                  >
                    Samples
                  </th>
                  <th
                    className={`px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                  >
                    Contamination
                  </th>
                  <th
                    className={`px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
                  >
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAreas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className={`px-5 py-12 text-center text-sm ${theme.textMuted}`}
                    >
                      No geographic risk records available.
                    </td>
                  </tr>
                ) : (
                  filteredAreas.slice(0, 10).map((item, index) => {
                    const score = getScore(item);
                    return (
                      <tr
                        key={item.id || getName(item) || index}
                        className={`border-t ${theme.border} hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">
                              {getName(item)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge type={getRiskType(score)}>
                            {score ? `${score}/100` : "—"}
                          </StatusBadge>
                        </td>
                        <td className={`px-5 py-4 ${theme.textMuted}`}>
                          {item.samples ?? item.totalSamples ?? "—"}
                        </td>
                        <td className={`px-5 py-4 ${theme.textMuted}`}>
                          {typeof getContamination(item) === "number"
                            ? `${getContamination(item)}%`
                            : getContamination(item)}
                        </td>
                        <td className="px-5 py-4">
                          <RateBadge rate={score} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </WhiteCard>

        <WhiteCard className="xl:col-span-2">
          <div className={`border-b p-5 ${theme.border}`}>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-bold">Risk trend</h2>
            </div>
            <p className={`mt-1 text-xs ${theme.textMuted}`}>
              Risk movement during the selected period.
            </p>
          </div>

          <div className="p-5">
            {trends.length === 0 ? (
              <div
                className={`flex min-h-[250px] items-center justify-center rounded-2xl border border-dashed ${theme.border} text-center text-sm ${theme.textMuted}`}
              >
                No trend data available.
              </div>
            ) : (
              <div className="space-y-4">
                {trends.slice(-8).map((item, index) => {
                  const score = Number(
                    item.score ?? item.riskScore ?? item.value ?? 0,
                  );
                  const width = Math.max(4, Math.min(100, score));
                  return (
                    <div key={item.id || index}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span
                          className={`text-xs font-semibold ${theme.textMuted}`}
                        >
                          {item.label ||
                            item.date ||
                            item.period ||
                            `Period ${index + 1}`}
                        </span>
                        <span className="text-xs font-bold">
                          {score || "—"}
                        </span>
                      </div>
                      <div
                        className={`h-2 overflow-hidden rounded-full ${theme.bg}`}
                      >
                        <div
                          className={`h-full rounded-full ${score >= 70 ? "bg-red-500" : score >= 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </WhiteCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WhiteCard className="overflow-hidden">
          <div className={`border-b p-5 ${theme.border}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h2 className="text-sm font-bold">High-risk products</h2>
            </div>
            <p className={`mt-1 text-xs ${theme.textMuted}`}>
              Product categories and products showing elevated risk signals.
            </p>
          </div>

          <div className="divide-y">
            {products.length === 0 ? (
              <div
                className={`px-5 py-12 text-center text-sm ${theme.textMuted}`}
              >
                No high-risk product data available.
              </div>
            ) : (
              products.slice(0, 8).map((item, index) => {
                const score = getScore(item);
                return (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {getName(item)}
                      </p>
                      <p className={`mt-1 text-xs ${theme.textMuted}`}>
                        {item.samples ?? item.totalSamples ?? "—"} samples
                        {item.category ? ` · ${item.category}` : ""}
                      </p>
                    </div>
                    <StatusBadge type={getRiskType(score)}>
                      {score ? `${score}/100` : "No score"}
                    </StatusBadge>
                  </div>
                );
              })
            )}
          </div>
        </WhiteCard>

        <WhiteCard className="overflow-hidden">
          <div className={`border-b p-5 ${theme.border}`}>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold">
                Risk alerts & recommendations
              </h2>
            </div>
            <p className={`mt-1 text-xs ${theme.textMuted}`}>
              Signals that may require follow-up by regulatory teams.
            </p>
          </div>

          <div className="divide-y">
            {alerts.length === 0 ? (
              <div
                className={`px-5 py-12 text-center text-sm ${theme.textMuted}`}
              >
                No active risk alerts available.
              </div>
            ) : (
              alerts.slice(0, 8).map((item, index) => (
                <div key={item.id || index} className="flex gap-3 px-5 py-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                    {item.priority === "HIGH" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {item.title ||
                        item.finding ||
                        item.message ||
                        "Risk signal"}
                    </p>
                    <p className={`mt-1 text-xs leading-5 ${theme.textMuted}`}>
                      {item.recommendation ||
                        item.action ||
                        item.description ||
                        "Review the available evidence and determine the appropriate follow-up."}
                    </p>
                    {item.createdAt && (
                      <p className={`mt-2 text-[11px] ${theme.textMuted}`}>
                        {formatDate(item.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </WhiteCard>
      </div>

      <WhiteCard className="p-5">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            [
              BarChart3,
              "Evidence driven",
              "Combines available sample and contamination signals.",
            ],
            [
              Users,
              "Regulatory focus",
              "Surfaces information for prioritisation and review.",
            ],
            [
              TrendingUp,
              "Trend aware",
              "Makes changes in risk easier to identify.",
            ],
            [
              CheckCircle2,
              "Action oriented",
              "Keeps recommendations close to the relevant signal.",
            ],
          ].map(([Icon, title, description]) => (
            <div key={title} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold">{title}</p>
                <p className={`mt-1 text-[11px] leading-4 ${theme.textMuted}`}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </WhiteCard>
    </div>
  );
};

export default RiskIntelligence;
