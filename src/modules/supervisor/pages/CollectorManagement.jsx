/**
 * CollectorManagement.jsx
 * ────────────────────────
 * Thin orchestrator. Data via useCollectorManagement, UI via module components.
 * No API calls here.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import {
  ChevronRight, Users, User, Mail, Building2,
  CalendarDays, Activity, MapPinned, FolderKanban,
} from "lucide-react";

import { useCollectorManagement } from "../hooks/useCollectorManagement";

import SurfaceCard   from "../components/ui/SurfaceCard";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge   from "../components/ui/StatusBadge";
import ActionButton  from "../components/ui/ActionButton";
import EmptyState    from "../components/ui/EmptyState";
import InfoTile      from "../components/ui/InfoTile";

const CollectorManagement = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { collectors, loading, error } = useCollectorManagement();
  const [selectedCollector, setSelectedCollector] = useState(null);

  if (loading) {
    return (
      <SurfaceCard className="p-10 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <div>
            <p className={`text-base font-semibold ${theme.text}`}>Loading collectors</p>
            <p className={`text-sm ${theme.textMuted}`}>Preparing your team data…</p>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  const active   = collectors.filter((c) => c.isActive).length;
  const inactive = collectors.filter((c) => !c.isActive).length;

  return (
    <div className={`${theme.text} space-y-6`}>
      {/* Hero */}
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
              View collector profiles, inspect activity, and move directly into the
              sample review workflow when action is needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[430px]">
            {[
              { label: "Collectors", value: collectors.length,      cls: "text-emerald-600 dark:text-emerald-400" },
              { label: "Active",     value: active,                 cls: "text-green-600 dark:text-green-400"   },
              { label: "Inactive",   value: inactive,               cls: "text-red-600 dark:text-red-400"       },
              { label: "Selected",   value: selectedCollector ? 1 : 0, cls: "text-blue-600 dark:text-blue-400" },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>{label}</p>
                <p className={`mt-2 text-2xl font-bold ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Collector list */}
        <SurfaceCard className="lg:col-span-1">
          <SectionHeader title="Your Data Collectors" subtitle="Select a collector to view profile." icon={<Users className="h-5 w-5" />} badge={<StatusBadge type="safe">{collectors.length}</StatusBadge>} />
          <div className="mt-5 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
            {collectors.length === 0 ? (
              <EmptyState icon={<Users className={`h-5 w-5 ${theme.textMuted}`} />} title="No collectors assigned" description="Collectors in your assigned states will appear here." minHeight="min-h-[280px]" />
            ) : (
              collectors.map((collector) => {
                const isSelected = selectedCollector?.id === collector.id;
                return (
                  <button key={collector.id} type="button" onClick={() => setSelectedCollector(collector)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${isSelected ? `${theme.emeraldBorder} ${theme.emerald} shadow-sm` : `${theme.border} hover:shadow-md hover:-translate-y-[1px]`}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`truncate text-sm font-semibold ${theme.text}`}>{collector.name}</p>
                          <StatusBadge type={collector.isActive ? "safe" : "danger"}>{collector.isActive ? "Active" : "Inactive"}</StatusBadge>
                        </div>
                        <p className={`mt-1 truncate text-xs ${theme.textMuted}`}>{collector.email}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusBadge type="info">{collector.totalSamples || 0} samples</StatusBadge>
                          <StatusBadge type="moderate">{collector.samplesThisMonth || 0} this month</StatusBadge>
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

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selectedCollector ? (
            <SurfaceCard className="space-y-6">
              <SectionHeader
                title={selectedCollector.name}
                subtitle="Collector profile and operational details."
                icon={<User className="h-5 w-5" />}
                badge={<StatusBadge type={selectedCollector.isActive ? "safe" : "danger"}>{selectedCollector.isActive ? "Active" : "Inactive"}</StatusBadge>}
                action={<ActionButton onClick={() => navigate(`/sample-review/${selectedCollector.id}`)}>Review their samples</ActionButton>}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoTile icon={<User className="h-4 w-4 text-emerald-600" />} label="Name">
                  <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>{selectedCollector.name}</p>
                </InfoTile>
                <InfoTile icon={<Mail className="h-4 w-4 text-emerald-600" />} label="Email">
                  <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>{selectedCollector.email}</p>
                </InfoTile>
                {selectedCollector.organization && (
                  <InfoTile icon={<Building2 className="h-4 w-4 text-emerald-600" />} label="Organization">
                    <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>{selectedCollector.organization}</p>
                  </InfoTile>
                )}
                <InfoTile icon={<CalendarDays className="h-4 w-4 text-emerald-600" />} label="Joined">
                  <p className={`break-words text-sm font-semibold ${theme.textMuted}`}>{new Date(selectedCollector.joinedAt).toLocaleDateString()}</p>
                </InfoTile>
              </div>
            </SurfaceCard>
          ) : (
            <SurfaceCard className={collectors.length === 0 ? "bg-transparent" : ""}>
              <EmptyState
                icon={<Users className="h-5 w-5 text-gray-500" />}
                title={collectors.length === 0 ? "No collectors in your assigned states yet" : "Select a collector to view their details"}
                description={collectors.length === 0 ? "Profiles will appear here once collectors are assigned." : "Collector information and performance metrics will appear here."}
                minHeight="min-h-[280px]"
              />
            </SurfaceCard>
          )}
        </div>
      </div>

      {/* Performance summary */}
      {selectedCollector && (
        <SurfaceCard>
          <SectionHeader title="Performance Summary" subtitle="Overview of collector activity and operational coverage." icon={<Activity className="h-5 w-5" />} />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: <FolderKanban className="h-4 w-4 text-blue-600 dark:text-blue-400" />,    label: "Total Samples",  value: selectedCollector.totalSamples || 0,         cls: "text-2xl font-bold text-blue-600 dark:text-blue-400"    },
              { icon: <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />,      label: "This Month",     value: selectedCollector.samplesThisMonth || 0,    cls: "text-2xl font-bold text-green-600 dark:text-green-400"  },
              { icon: <MapPinned className="h-4 w-4 text-purple-600 dark:text-purple-400" />,   label: "States Covered", value: Object.keys(selectedCollector.samplesByState || {}).length, cls: "text-2xl font-bold text-purple-600 dark:text-purple-400" },
              {
                icon: <Users className={`h-4 w-4 ${selectedCollector.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`} />,
                label: "Status",
                value: selectedCollector.isActive ? "Active" : "Inactive",
                cls: `text-2xl font-bold ${selectedCollector.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`,
              },
            ].map(({ icon, label, value, cls }) => (
              <div key={label} className={`rounded-2xl border p-4 shadow-sm ${theme.border} ${theme.bg}`}>
                <div className="mb-2 flex items-center gap-2">{icon}<p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>{label}</p></div>
                <p className={cls}>{value}</p>
              </div>
            ))}
          </div>

          {selectedCollector.samplesByState && Object.keys(selectedCollector.samplesByState).length > 0 && (
            <div className={`mt-8 border-t pt-6 ${theme.border}`}>
              <SectionHeader title="Samples by State" subtitle="Distribution across covered states." icon={<MapPinned className="h-5 w-5" />} />
              <div className="mt-4 space-y-2">
                {Object.entries(selectedCollector.samplesByState).map(([state, count]) => (
                  <div key={state} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${theme.border} ${theme.bg}`}>
                    <span className={`text-sm font-medium ${theme.textMuted}`}>{state}</span>
                    <StatusBadge type="safe">{count} samples</StatusBadge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SurfaceCard>
      )}
    </div>
  );
};

export default CollectorManagement;