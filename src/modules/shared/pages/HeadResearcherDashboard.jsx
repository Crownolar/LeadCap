import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Database,
  FileText,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import api from "../../../utils/api";
import { useTheme } from "../../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const HeadResearcherDashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadOverview = async () => {
      setLoading(true);
      setError(null);

      try {
        const [statsRes, usersRes, statesRes] = await Promise.all([
          api.get("/samples/stats"),
          api.get("/users", { params: { limit: 200 } }),
          api.get("/management/states"),
        ]);

        if (cancelled) return;

        setStats(statsRes.data?.data || null);
        setUsers(usersRes.data?.data || []);
        setStates(statesRes.data?.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Unable to load the national research overview.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOverview();
    return () => {
      cancelled = true;
    };
  }, []);

  const roleCounts = useMemo(() => {
    const normalize = (role = "") =>
      String(role).toLowerCase().replace(/[\s_.-]/g, "");

    return users.reduce(
      (acc, user) => {
        const role = normalize(user.role);
        if (role === "supervisor") acc.supervisors += 1;
        if (role === "datacollector") acc.collectors += 1;
        return acc;
      },
      { supervisors: 0, collectors: 0 },
    );
  }, [users]);

  const activeStates = states.filter((state) => state.isActive).length;
  const totalStates = states.length;
  const totalSamples = stats?.totalSamples ?? stats?.total ?? 0;
  const contaminated = stats?.contaminated ?? 0;
  const pending = stats?.pending ?? 0;

  const cards = [
    {
      label: "Total Samples",
      value: totalSamples,
      icon: Database,
      description: "National sample records",
    },
    {
      label: "Contaminated",
      value: contaminated,
      icon: AlertTriangle,
      description: "Records requiring attention",
    },
    {
      label: "Pending",
      value: pending,
      icon: Activity,
      description: "Records awaiting workflow action",
    },
    {
      label: "Active States",
      value: `${activeStates}/${totalStates}`,
      icon: MapPin,
      description: "Current collection coverage",
    },
  ];

  if (loading) {
    return (
      <div className={`flex min-h-[50vh] items-center justify-center ${theme.text}`}>
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className={`mt-3 text-sm ${theme.textMuted}`}>
            Loading national research overview…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${theme.text}`}>
      <section className={`${theme.card} rounded-3xl border ${theme.border} p-6 md:p-8`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={14} />
              Head Researcher
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              National Research Overview
            </h1>
            <p className={`mt-2 max-w-2xl text-sm md:text-base ${theme.textMuted}`}>
              Monitor national sample activity, research coverage, supervisors,
              collectors, and active collection states from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/database")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Database size={16} />
              Sample Database
            </button>
            <button
              onClick={() => navigate("/reports")}
              className={`inline-flex items-center gap-2 rounded-xl border ${theme.border} px-4 py-2.5 text-sm font-semibold hover:bg-gray-500/10`}
            >
              <FileText size={16} />
              Reports
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, description }) => (
          <div key={label} className={`${theme.card} rounded-2xl border ${theme.border} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <span className={`text-sm font-medium ${theme.textMuted}`}>{label}</span>
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                <Icon size={18} />
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold">{value}</p>
            <p className={`mt-1 text-xs ${theme.textMuted}`}>{description}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={`${theme.card} rounded-2xl border ${theme.border} p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Users size={19} className="text-emerald-500" />
                Research workforce
              </h2>
              <p className={`mt-1 text-sm ${theme.textMuted}`}>
                Current platform counts for national field operations.
              </p>
            </div>
            <button
              onClick={() => navigate("/invitecodes")}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Manage
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className={`rounded-xl border ${theme.border} p-4`}>
              <p className={`text-xs ${theme.textMuted}`}>Supervisors</p>
              <p className="mt-1 text-2xl font-bold">{roleCounts.supervisors}</p>
            </div>
            <div className={`rounded-xl border ${theme.border} p-4`}>
              <p className={`text-xs ${theme.textMuted}`}>Data Collectors</p>
              <p className="mt-1 text-2xl font-bold">{roleCounts.collectors}</p>
            </div>
          </div>
        </div>

        <div className={`${theme.card} rounded-2xl border ${theme.border} p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <MapPin size={19} className="text-emerald-500" />
                State coverage
              </h2>
              <p className={`mt-1 text-sm ${theme.textMuted}`}>
                States currently enabled for sample collection.
              </p>
            </div>
            <button
              onClick={() => navigate("/invitecodes")}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Manage states
            </button>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <span className="text-4xl font-bold">{activeStates}</span>
            <span className={`pb-1 text-sm ${theme.textMuted}`}>of {totalStates} states active</span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${totalStates ? Math.min(100, (activeStates / totalStates) * 100) : 0}%` }}
            />
          </div>
        </div>
      </section>

      <section className={`${theme.card} rounded-2xl border ${theme.border} p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Activity size={19} className="text-emerald-500" />
              National analysis tools
            </h2>
            <p className={`mt-1 text-sm ${theme.textMuted}`}>
              Move directly into the views used for research oversight and reporting.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate("/map")} className={`rounded-xl border ${theme.border} px-3 py-2 text-sm font-semibold hover:bg-gray-500/10`}>Geographical Map</button>
            <button onClick={() => navigate("/reports")} className={`rounded-xl border ${theme.border} px-3 py-2 text-sm font-semibold hover:bg-gray-500/10`}>Reports</button>
            <button onClick={() => navigate("/invitecodes")} className={`rounded-xl border ${theme.border} px-3 py-2 text-sm font-semibold hover:bg-gray-500/10`}>Invitations & States</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeadResearcherDashboard;
