import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Layers3, MapPin, RefreshCw, ShieldAlert, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";
import Map from "../other/Map";

const MapView = ({ theme: propTheme, samples: propSamples }) => {
  const { theme } = useTheme();
  const activeTheme = propTheme || theme;

  const [samples, setSamples] = useState(propSamples || []);
  const [loading, setLoading] = useState(!propSamples);
  const [error, setError] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  const loadSamples = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/samples?fields=minimal&take=5000");
      setSamples(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propSamples) {
      setSamples(propSamples);
      setLoading(false);
      return;
    }
    loadSamples();
  }, [propSamples]);

  const geoSamples = useMemo(
    () =>
      samples.filter(
        (s) =>
          s.gpsLatitude !== null &&
          s.gpsLatitude !== undefined &&
          s.gpsLongitude !== null &&
          s.gpsLongitude !== undefined &&
          Number.isFinite(Number(s.gpsLatitude)) &&
          Number.isFinite(Number(s.gpsLongitude))
      ),
    [samples]
  );

  const stats = useMemo(() => {
    const contaminated = geoSamples.filter(
      (s) =>
        s.status === "CONTAMINATED" ||
        s.contaminationStatus === "CONTAMINATED"
    ).length;

    const safe = geoSamples.filter(
      (s) => s.status === "SAFE" || s.contaminationStatus === "SAFE"
    ).length;

    const pending = geoSamples.filter(
      (s) => !s.status || s.status === "PENDING"
    ).length;

    return { total: geoSamples.length, contaminated, safe, pending };
  }, [geoSamples]);

  if (loading) {
    return (
      <section className={`rounded-3xl border ${activeTheme.border} ${activeTheme.card} p-8`}>
        <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
          <div className="mb-4 h-11 w-11 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <h2 className={`text-base font-bold ${activeTheme.text}`}>Loading geographic intelligence</h2>
          <p className={`mt-1 text-sm ${activeTheme.textMuted}`}>
            Preparing sample locations for the map.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`rounded-3xl border ${activeTheme.border} ${activeTheme.card} p-6`}>
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className={`text-lg font-bold ${activeTheme.text}`}>Map data could not be loaded</h2>
            <p className={`mt-2 text-sm ${activeTheme.textMuted}`}>
              Refresh the geographic view and try again.
            </p>
            <button
              onClick={loadSamples}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!geoSamples.length) {
    return (
      <section className={`rounded-3xl border ${activeTheme.border} ${activeTheme.card} p-6`}>
        <div className="flex min-h-[300px] items-center justify-center text-center">
          <div>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className={`text-lg font-bold ${activeTheme.text}`}>No mapped samples yet</h2>
            <p className={`mt-2 max-w-md text-sm ${activeTheme.textMuted}`}>
              Samples with valid GPS coordinates will appear here as geographic intelligence.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`overflow-hidden rounded-3xl border ${activeTheme.border} ${activeTheme.card} shadow-sm`}>
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-5 text-white sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
              <Layers3 className="h-3.5 w-3.5" />
              Geographic intelligence
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Sample collection map
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-emerald-100">
              Explore where samples were collected and identify geographic concentrations of contamination.
            </p>
          </div>

          <button
            onClick={() => setShowLegend((v) => !v)}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold backdrop-blur hover:bg-white/15"
          >
            <Layers3 className="h-4 w-4" />
            {showLegend ? "Hide legend" : "Show legend"}
          </button>
        </div>
      </header>

      <div className={`grid grid-cols-2 border-b ${activeTheme.border} sm:grid-cols-4`}>
        <MapStat label="Mapped samples" value={stats.total} icon={MapPin} />
        <MapStat label="Contaminated" value={stats.contaminated} icon={ShieldAlert} tone="danger" />
        <MapStat label="Safe" value={stats.safe} icon={ShieldAlert} tone="safe" />
        <MapStat label="Pending" value={stats.pending} icon={RefreshCw} tone="pending" />
      </div>

      <div className="relative">
        <Map samples={geoSamples} />

        {showLegend && (
          <div className={`absolute bottom-4 left-4 z-[500] w-[calc(100%-2rem)] max-w-xs rounded-2xl border ${activeTheme.border} ${activeTheme.card} p-3.5 shadow-xl backdrop-blur`}>
            <div className="flex items-center justify-between">
              <p className={`text-xs font-bold ${activeTheme.text}`}>Map legend</p>
              <button
                onClick={() => setShowLegend(false)}
                className={`rounded-lg p-1 ${activeTheme.hover}`}
                aria-label="Close map legend"
              >
                <X className={`h-3.5 w-3.5 ${activeTheme.textMuted}`} />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <LegendItem dot="bg-red-500" label="Contamination present" />
              <LegendItem dot="bg-emerald-500" label="Safe / reviewed" />
              <LegendItem dot="bg-amber-500" label="Pending / unresolved" />
              <LegendItem dot="bg-slate-400" label="Sample location" />
            </div>
            <p className={`mt-3 text-[10px] leading-4 ${activeTheme.textMuted}`}>
              Click a marker to inspect the samples collected at that location.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const MapStat = ({ label, value, icon: Icon, tone = "neutral" }) => {
  const toneClass =
    tone === "danger"
      ? "text-red-600 dark:text-red-300"
      : tone === "safe"
      ? "text-emerald-600 dark:text-emerald-300"
      : tone === "pending"
      ? "text-amber-600 dark:text-amber-300"
      : "text-slate-700 dark:text-slate-200";

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
      <Icon className={`h-4 w-4 shrink-0 ${toneClass}`} />
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
};

const LegendItem = ({ dot, label }) => (
  <div className="flex items-center gap-2">
    <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
    <span>{label}</span>
  </div>
);

export default MapView;
