import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Users,
  User,
  Mail,
  Building2,
  CalendarDays,
  Activity,
  MapPinned,
  FolderKanban,
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import api from "../../../../utils/api";

import SurfaceCard from "../components/ui/SurfaceCard";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import ActionButton from "../components/ui/ActionButton";
import EmptyState from "../components/ui/EmptyState";
import InfoTile from "../components/ui/InfoTile";

const CollectorManagement = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        setLoading(true);
        const res = await api.get("/supervisor/collectors");

        if (res.data.success) {
          const data = res.data.data || res.data;
          const normalized = Array.isArray(data) ? data : data?.data || [];
          setCollectors(normalized);
        }
      } catch (err) {
        console.error("Error fetching collectors:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectors();
  }, []);

  const handleSelectCollector = (collector) => {
    setSelectedCollector(collector);
  };

  if (loading) {
    return (
      <SurfaceCard className="p-10 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <div>
            <p className={`text-base font-semibold ${theme.text}`}>
              Loading collectors
            </p>
            <p className={`text-sm ${theme.textMuted}`}>
              Please wait while your team data is being prepared.
            </p>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <div className={`${theme.text} space-y-6`}>
      <SurfaceCard className="rounded-3xl p-6 md:p-8 overflow-hidden relative">
        <div className={`absolute inset-0 pointer-events-none ${theme.card}`} />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className={`inline-flex items-center gap-2 rounded-full border ${theme.emeraldBorder} ${theme.emerald} px-3 py-1 text-xs font-semibold ${theme.emeraldText} mb-4`}>
              <Users className="h-3.5 w-3.5" />
              Collector Management
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Manage assigned data collectors and monitor their performance
            </h1>

            <p className={`mt-3 text-sm md:text-base ${theme.textMuted}`}>
              View collector profiles, inspect activity, and move directly into
              the sample review workflow when action is needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[430px]">
            <div className={`${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                Collectors
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {collectors.length}
              </p>
            </div>

            <div className={`${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                Active
              </p>
              <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                {collectors.filter((collector) => collector.isActive).length}
              </p>
            </div>

            <div className={`${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                Inactive
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                {collectors.filter((collector) => !collector.isActive).length}
              </p>
            </div>

            <div className={`${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                Selected
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {selectedCollector ? 1 : 0}
              </p>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SurfaceCard className="lg:col-span-1">
          <SectionHeader
            title="Your Data Collectors"
            subtitle="Select a collector to view profile and performance."
            icon={<Users className="h-5 w-5" />}
            badge={<StatusBadge type="safe">{collectors.length}</StatusBadge>}
          />

          <div className="mt-5 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
            {collectors.length === 0 ? (
              <EmptyState
                icon={<Users className={`h-5 w-5 ${theme.textMuted}`} />}
                title="No collectors assigned"
                description="Collectors in your assigned states will appear here."
                minHeight="min-h-[280px]"
              />
            ) : (
              collectors.map((collector) => {
                const isSelected = selectedCollector?.id === collector.id;

                return (
                  <button
                    key={collector.id}
                    type="button"
                    onClick={() => handleSelectCollector(collector)}
                    className={`
                      w-full rounded-2xl border p-4 text-left transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                      ${
                        isSelected
                          ? `${theme.emeraldBorder} ${theme.emerald} shadow-sm dark:${theme.emeraldDark}`
                          : `${theme.border} hover:shadow-md hover:-translate-y-[1px] hover:${theme.hover}`
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`truncate text-sm font-semibold ${theme.text}`}>
                            {collector.name}
                          </p>
                          <StatusBadge type={collector.isActive ? "safe" : "danger"}>
                            {collector.isActive ? "Active" : "Inactive"}
                          </StatusBadge>
                        </div>

                        <p className={`mt-1 truncate text-xs ${theme.textMuted}`}>
                          {collector.email}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusBadge type="info">
                            {collector.totalSamples || 0} samples
                          </StatusBadge>

                          <StatusBadge type="moderate">
                            {collector.samplesThisMonth || 0} this month
                          </StatusBadge>
                        </div>
                      </div>

                      <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </SurfaceCard>

        <div className="lg:col-span-2">
          {selectedCollector ? (
            <SurfaceCard className="space-y-6">
              <SectionHeader
                title={selectedCollector.name}
                subtitle="Collector profile and operational details."
                icon={<User className="h-5 w-5" />}
                badge={
                  <StatusBadge type={selectedCollector.isActive ? "safe" : "danger"}>
                    {selectedCollector.isActive ? "Active" : "Inactive"}
                  </StatusBadge>
                }
                action={
                  <ActionButton
                    onClick={() => navigate(`/sample-review/${selectedCollector.id}`)}
                  >
                    Review their samples
                  </ActionButton>
                }
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoTile
                  icon={<User className="h-4 w-4 text-emerald-600" />}
                  label="Name"
                >
                  <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>
                    {selectedCollector.name}
                  </p>
                </InfoTile>

                <InfoTile
                  icon={<Mail className="h-4 w-4 text-emerald-600" />}
                  label="Email"
                >
                  <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>
                    {selectedCollector.email}
                  </p>
                </InfoTile>

                {selectedCollector.organization && (
                  <InfoTile
                    icon={<Building2 className="h-4 w-4 text-emerald-600" />}
                    label="Organization"
                  >
                    <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>
                      {selectedCollector.organization}
                    </p>
                  </InfoTile>
                )}

                <InfoTile
                  icon={<CalendarDays className="h-4 w-4 text-emerald-600" />}
                  label="Joined"
                >
                  <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>
                    {new Date(selectedCollector.joinedAt).toLocaleDateString()}
                  </p>
                </InfoTile>
              </div>
            </SurfaceCard>
          ) : (
            <SurfaceCard className={`${collectors.length === 0 ? "bg-transparent" : ""}`}>
              <EmptyState
                icon={<Users className="h-5 w-5 text-gray-500" />}
                title={
                  collectors.length === 0
                    ? "No collectors in your assigned states yet"
                    : "Select a collector to view their details"
                }
                description={
                  collectors.length === 0
                    ? "Profiles will appear here once collectors are assigned."
                    : "Collector information and performance metrics will appear here."
                }
                minHeight="min-h-[280px]"
              />
            </SurfaceCard>
          )}
        </div>
      </div>

      {selectedCollector && (
        <SurfaceCard>
          <SectionHeader
            title="Performance Summary"
            subtitle="Overview of collector activity and operational coverage."
            icon={<Activity className="h-5 w-5" />}
          />

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={`rounded-2xl border p-4 shadow-sm ${theme.border} ${theme.bg}`}>
              <div className="mb-2 flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                  Total Samples
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {selectedCollector.totalSamples || 0}
              </p>
            </div>

            <div className={`rounded-2xl border p-4 shadow-sm ${theme.border} ${theme.bg}`}>
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                  This Month
                </p>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {selectedCollector.samplesThisMonth || 0}
              </p>
            </div>

            <div className={`rounded-2xl border p-4 shadow-sm ${theme.border} ${theme.bg}`}>
              <div className="mb-2 flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                  States Covered
                </p>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Object.keys(selectedCollector.samplesByState || {}).length}
              </p>
            </div>

            <div className={`rounded-2xl border p-4 shadow-sm ${theme.border} ${theme.bg}`}>
              <div className="mb-2 flex items-center gap-2">
                <Users
                  className={`h-4 w-4 ${
                    selectedCollector.isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
                <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                  Status
                </p>
              </div>
              <p
                className={`text-2xl font-bold ${
                  selectedCollector.isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {selectedCollector.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>

          {selectedCollector.samplesByState &&
            Object.keys(selectedCollector.samplesByState).length > 0 && (
              <div className={`mt-8 border-t pt-6 ${theme.border}`}>
                <SectionHeader
                  title="Samples by State"
                  subtitle="Distribution of collected samples across covered states."
                  icon={<MapPinned className="h-5 w-5" />}
                />

                <div className="mt-4 space-y-2">
                  {Object.entries(selectedCollector.samplesByState).map(
                    ([state, count]) => (
                      <div
                        key={state}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${theme.border} $theme.bg hover:${theme.hover}`}
                      >
                        <span className={`text-sm font-medium ${theme.textMuted}`}>
                          {state}
                        </span>

                        <StatusBadge type="safe">{count} samples</StatusBadge>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </SurfaceCard>
      )}
    </div>
  );
};

export default CollectorManagement;