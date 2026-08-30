/**
 * CollectorManagement.jsx
 * ────────────────────────
 * Supervisor Collector Command Center.
 *
 * Data/API logic remains inside useCollectorManagement.
 * This page is presentation + local UI state only.
 */

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

import {
  Users,
  User,
  Mail,
  Building2,
  CalendarDays,
  Activity,
  MapPinned,
  FolderKanban,
  Search,
  Filter,
  ChevronRight,
  ArrowUpRight,
  ClipboardCheck,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";

import { useCollectorManagement } from "../hooks/useCollectorManagement";

import SurfaceCard from "../components/ui/SurfaceCard";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import ActionButton from "../components/ui/ActionButton";
import EmptyState from "../components/ui/EmptyState";
import InfoTile from "../components/ui/InfoTile";

const CollectorManagement = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const { collectors = [], loading, error } = useCollectorManagement();

  const [selectedCollector, setSelectedCollector] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const active = collectors.filter((collector) => collector.isActive).length;
  const inactive = collectors.filter((collector) => !collector.isActive).length;

  const totalSamples = collectors.reduce(
    (total, collector) => total + Number(collector.totalSamples || 0),
    0,
  );

  const monthlySamples = collectors.reduce(
    (total, collector) => total + Number(collector.samplesThisMonth || 0),
    0,
  );

  const filteredCollectors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return collectors.filter((collector) => {
      const matchesSearch =
        !query ||
        collector.name?.toLowerCase().includes(query) ||
        collector.email?.toLowerCase().includes(query) ||
        collector.organization?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && collector.isActive) ||
        (statusFilter === "inactive" && !collector.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [collectors, search, statusFilter]);

  const selectCollector = (collector) => {
    setSelectedCollector(collector);
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return "DC";

    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className={`${theme.text} space-y-6`}>
        <SurfaceCard className='rounded-3xl p-8'>
          <div className='flex min-h-[360px] flex-col items-center justify-center text-center'>
            <div className='mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10'>
              <RefreshCw className='h-6 w-6 animate-spin text-emerald-500' />
            </div>

            <h2 className='text-lg font-bold'>Loading collector workspace</h2>

            <p className={`mt-2 max-w-md text-sm ${theme.textMuted}`}>
              Preparing your assigned data collectors and their operational
              statistics.
            </p>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className={`${theme.text} space-y-6 pb-8`}>
      {/* ================================================================
          PAGE HEADER
      ================================================================= */}

      <SurfaceCard className='relative overflow-hidden rounded-3xl p-6 md:p-8'>
        <div className='pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl' />

        <div className='relative'>
          <div className='flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between'>
            <div className='max-w-2xl'>
              <div
                className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${theme.emeraldBorder} ${theme.emeraldText}`}
              >
                <Users className='h-3.5 w-3.5' />
                SUPERVISOR WORKSPACE
              </div>

              <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                Data Collector Management
              </h1>

              <p
                className={`mt-3 max-w-xl text-sm leading-6 md:text-base ${theme.textMuted}`}
              >
                Monitor your field collection team, inspect activity, and move
                directly into sample review workflows.
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${theme.border} ${theme.bg}`}
              >
                <Activity className='h-4 w-4 text-emerald-500' />
                {active} active collectors
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      {/* ================================================================
          KPI GRID
      ================================================================= */}

      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {[
          {
            label: "Total Collectors",
            value: collectors.length,
            icon: <Users className='h-5 w-5' />,
            iconClass: "text-emerald-500 bg-emerald-500/10",
          },
          {
            label: "Active",
            value: active,
            icon: <UserCheck className='h-5 w-5' />,
            iconClass: "text-green-500 bg-green-500/10",
          },
          {
            label: "Inactive",
            value: inactive,
            icon: <UserX className='h-5 w-5' />,
            iconClass: "text-red-500 bg-red-500/10",
          },
          {
            label: "Total Samples",
            value: totalSamples.toLocaleString(),
            icon: <FolderKanban className='h-5 w-5' />,
            iconClass: "text-blue-500 bg-blue-500/10",
          },
        ].map((metric) => (
          <SurfaceCard key={metric.label} className='rounded-2xl p-4 md:p-5'>
            <div className='flex flex-col md:flex-row items-start justify-between gap-3'>
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}
                >
                  {metric.label}
                </p>

                <p className='mt-2 text-2xl font-bold tracking-tight md:text-3xl'>
                  {metric.value}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${metric.iconClass}`}
              >
                {metric.icon}
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>

      {/* ================================================================
          ERROR
      ================================================================= */}

      {error && (
        <div className='flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300'>
          <Activity className='mt-0.5 h-4 w-4 shrink-0' />
          <div>
            <p className='font-semibold'>Unable to load collector data</p>
            <p className='mt-1 opacity-90'>{error}</p>
          </div>
        </div>
      )}

      {/* ================================================================
          MAIN WORKSPACE
      ================================================================= */}

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.6fr)]'>
        {/* ==============================================================
            COLLECTOR LIST
        ============================================================== */}

        <SurfaceCard className='overflow-hidden rounded-3xl'>
          <div className='border-b border-inherit  md:p-6'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <SectionHeader
                  title='Field Collectors'
                  subtitle='Your assigned collection team.'
                  icon={<Users className='h-5 w-5' />}
                  badge={
                    <StatusBadge type='safe'>
                      {filteredCollectors.length}
                    </StatusBadge>
                  }
                />
              </div>
            </div>

            {/* Search */}
            <div className='mt-5'>
              <div
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${theme.border} ${theme.bg}`}
              >
                <Search className={`h-4 w-4 ${theme.textMuted}`} />

                <input
                  type='text'
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder='Search name, email or organization...'
                  className={`min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-60 ${theme.text}`}
                />
              </div>
            </div>

            {/* Filters */}
            <div className='mt-3 flex items-center gap-2 overflow-x-auto pb-1'>
              <div
                className={`mr-1 flex items-center gap-1 ${theme.textMuted}`}
              >
                <Filter className='h-3.5 w-3.5' />
                <span className='text-xs font-semibold'>Status</span>
              </div>

              {[
                ["all", "All"],
                ["active", "Active"],
                ["inactive", "Inactive"],
              ].map(([value, label]) => {
                const selected = statusFilter === value;

                return (
                  <button
                    key={value}
                    type='button'
                    onClick={() => setStatusFilter(value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? "bg-emerald-600 text-white shadow-sm"
                        : `${theme.bg} ${theme.textMuted} hover:opacity-80`
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className='max-h-[620px] overflow-y-auto mt-3 md:mt-4 md:p-5'>
            {filteredCollectors.length === 0 ? (
              <EmptyState
                icon={<Users className={`h-5 w-5 ${theme.textMuted}`} />}
                title={
                  collectors.length === 0
                    ? "No collectors assigned"
                    : "No matching collectors"
                }
                description={
                  collectors.length === 0
                    ? "Collectors in your assigned states will appear here."
                    : "Try changing your search or status filter."
                }
                minHeight='min-h-[300px]'
              />
            ) : (
              <div className='space-y-3'>
                {filteredCollectors.map((collector) => {
                  const isSelected = selectedCollector?.id === collector.id;

                  return (
                    <button
                      key={collector.id}
                      type='button'
                      onClick={() => selectCollector(collector)}
                      className={`group w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? `${theme.emeraldBorder} ${theme.emerald} shadow-sm`
                          : `${theme.border} hover:-translate-y-[1px] hover:shadow-md`
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        {/* Avatar */}
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            isSelected
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {getInitials(collector.name)}
                        </div>

                        <div className='min-w-0 flex-1'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <p className='truncate text-sm font-bold'>
                              {collector.name || "Unnamed Collector"}
                            </p>

                            <StatusBadge
                              type={collector.isActive ? "safe" : "danger"}
                            >
                              {collector.isActive ? "Active" : "Inactive"}
                            </StatusBadge>
                          </div>

                          <p
                            className={`mt-1 truncate text-xs ${theme.textMuted}`}
                          >
                            {collector.email || "No email available"}
                          </p>
                        </div>

                        <ChevronRight
                          className={`h-5 w-5 shrink-0 transition-transform ${
                            isSelected
                              ? "translate-x-0 text-emerald-500"
                              : "text-gray-400 group-hover:translate-x-1"
                          }`}
                        />
                      </div>

                      <div className='mt-4 grid grid-cols-2 gap-2'>
                        <div className={`rounded-xl px-3 py-2 ${theme.bg}`}>
                          <p
                            className={`text-[10px] font-semibold uppercase tracking-wide ${theme.textMuted}`}
                          >
                            Samples
                          </p>
                          <p className='mt-0.5 text-sm font-bold'>
                            {collector.totalSamples || 0}
                          </p>
                        </div>

                        <div className={`rounded-xl px-3 py-2 ${theme.bg}`}>
                          <p
                            className={`text-[10px] font-semibold uppercase tracking-wide ${theme.textMuted}`}
                          >
                            This month
                          </p>
                          <p className='mt-0.5 text-sm font-bold'>
                            {collector.samplesThisMonth || 0}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </SurfaceCard>

        {/* ==============================================================
            DETAIL PANEL
        ============================================================== */}

        <div className='min-w-0'>
          {selectedCollector ? (
            <div className='space-y-6'>
              <SurfaceCard className='overflow-hidden rounded-3xl'>
                {/* Profile header */}
                <div className='relative overflow-hidden border-b border-inherit p-5 md:p-7'>
                  <div className='pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl' />

                  <div className='relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
                    <div className='flex min-w-0 items-center gap-4'>
                      <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-lg shadow-emerald-600/20'>
                        {getInitials(selectedCollector.name)}
                      </div>

                      <div className='min-w-0'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <h2 className='truncate text-xl font-bold md:text-2xl'>
                            {selectedCollector.name}
                          </h2>

                          <StatusBadge
                            type={
                              selectedCollector.isActive ? "safe" : "danger"
                            }
                          >
                            {selectedCollector.isActive ? "Active" : "Inactive"}
                          </StatusBadge>
                        </div>

                        <p
                          className={`mt-1 truncate text-sm ${theme.textMuted}`}
                        >
                          {selectedCollector.email}
                        </p>

                        {selectedCollector.organization && (
                          <p
                            className={`mt-1 flex items-center gap-1.5 text-xs ${theme.textMuted}`}
                          >
                            <Building2 className='h-3.5 w-3.5' />
                            {selectedCollector.organization}
                          </p>
                        )}
                      </div>
                    </div>

                    <ActionButton
                      onClick={() =>
                        navigate(`/sample-review/${selectedCollector.id}`)
                      }
                    >
                      <span className='flex items-center gap-2'>
                        Review samples
                        <ArrowUpRight className='h-4 w-4' />
                      </span>
                    </ActionButton>
                  </div>
                </div>

                {/* Profile details */}
                <div className='p-5 md:p-7'>
                  <div className='mb-4'>
                    <p className='text-sm font-bold'>Collector Information</p>
                    <p className={`mt-1 text-xs ${theme.textMuted}`}>
                      Account and operational details.
                    </p>
                  </div>

                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    <InfoTile
                      icon={<User className='h-4 w-4 text-emerald-600' />}
                      label='Full Name'
                    >
                      <p className={`text-sm font-semibold ${theme.text}`}>
                        {selectedCollector.name || "—"}
                      </p>
                    </InfoTile>

                    <InfoTile
                      icon={<Mail className='h-4 w-4 text-emerald-600' />}
                      label='Email'
                    >
                      <p
                        className={`break-all text-sm font-semibold ${theme.text}`}
                      >
                        {selectedCollector.email || "—"}
                      </p>
                    </InfoTile>

                    {selectedCollector.organization && (
                      <InfoTile
                        icon={
                          <Building2 className='h-4 w-4 text-emerald-600' />
                        }
                        label='Organization'
                      >
                        <p className={`text-sm font-semibold ${theme.text}`}>
                          {selectedCollector.organization}
                        </p>
                      </InfoTile>
                    )}

                    <InfoTile
                      icon={
                        <CalendarDays className='h-4 w-4 text-emerald-600' />
                      }
                      label='Joined'
                    >
                      <p className={`text-sm font-semibold ${theme.text}`}>
                        {formatDate(selectedCollector.joinedAt)}
                      </p>
                    </InfoTile>
                  </div>
                </div>
              </SurfaceCard>

              {/* ========================================================
                  PERFORMANCE
              ======================================================== */}

              <SurfaceCard className='rounded-3xl p-5 md:p-7'>
                <SectionHeader
                  title='Operational Performance'
                  subtitle='Collection activity and geographic coverage.'
                  icon={<Activity className='h-5 w-5' />}
                />

                <div className='mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4'>
                  {[
                    {
                      label: "Total Samples",
                      value: selectedCollector.totalSamples || 0,
                      icon: <FolderKanban className='h-4 w-4' />,
                      cls: "text-blue-600 dark:text-blue-400",
                    },
                    {
                      label: "This Month",
                      value: selectedCollector.samplesThisMonth || 0,
                      icon: <Activity className='h-4 w-4' />,
                      cls: "text-green-600 dark:text-green-400",
                    },
                    {
                      label: "States Covered",
                      value: Object.keys(selectedCollector.samplesByState || {})
                        .length,
                      icon: <MapPinned className='h-4 w-4' />,
                      cls: "text-purple-600 dark:text-purple-400",
                    },
                    {
                      label: "Account",
                      value: selectedCollector.isActive ? "Active" : "Inactive",
                      icon: selectedCollector.isActive ? (
                        <UserCheck className='h-4 w-4' />
                      ) : (
                        <UserX className='h-4 w-4' />
                      ),
                      cls: selectedCollector.isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className={`rounded-2xl border p-4 ${theme.border} ${theme.bg}`}
                    >
                      <div
                        className={`mb-2 flex items-center gap-2 ${metric.cls}`}
                      >
                        {metric.icon}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide ${theme.textMuted}`}
                        >
                          {metric.label}
                        </span>
                      </div>

                      <p className={`text-xl font-bold ${metric.cls}`}>
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* State coverage */}
                {selectedCollector.samplesByState &&
                  Object.keys(selectedCollector.samplesByState).length > 0 && (
                    <div className={`mt-7 border-t pt-6 ${theme.border}`}>
                      <div className='flex items-center justify-between gap-3'>
                        <div>
                          <p className='text-sm font-bold'>
                            Geographic Coverage
                          </p>
                          <p className={`mt-1 text-xs ${theme.textMuted}`}>
                            Samples distributed across covered states.
                          </p>
                        </div>

                        <MapPinned className='h-5 w-5 text-purple-500' />
                      </div>

                      <div className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                        {Object.entries(selectedCollector.samplesByState).map(
                          ([state, count]) => (
                            <div
                              key={state}
                              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${theme.border} ${theme.bg}`}
                            >
                              <div className='flex min-w-0 items-center gap-2'>
                                <MapPinned className='h-4 w-4 shrink-0 text-purple-500' />

                                <span className='truncate text-sm font-medium'>
                                  {state}
                                </span>
                              </div>

                              <span className='ml-3 shrink-0 rounded-lg bg-purple-500/10 px-2 py-1 text-xs font-bold text-purple-600 dark:text-purple-400'>
                                {count}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </SurfaceCard>

              {/* ========================================================
                  QUICK ACTION
              ======================================================== */}

              <SurfaceCard className='rounded-3xl border-emerald-500/20 p-5 md:p-6'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-start gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                      <ClipboardCheck className='h-5 w-5' />
                    </div>

                    <div>
                      <p className='text-sm font-bold'>
                        Continue to sample review
                      </p>

                      <p
                        className={`mt-1 text-xs leading-5 ${theme.textMuted}`}
                      >
                        Inspect samples submitted by {selectedCollector.name}.
                      </p>
                    </div>
                  </div>

                  <button
                    type='button'
                    onClick={() =>
                      navigate(`/sample-review/${selectedCollector.id}`)
                    }
                    className='inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700'
                  >
                    Open review queue
                    <ChevronRight className='h-4 w-4' />
                  </button>
                </div>
              </SurfaceCard>
            </div>
          ) : (
            <SurfaceCard className='rounded-3xl'>
              <div className='flex min-h-[560px] flex-col items-center justify-center px-6 py-12 text-center'>
                <div className='mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500'>
                  <User className='h-7 w-7' />
                </div>

                <h2 className='text-lg font-bold'>Select a collector</h2>

                <p
                  className={`mt-2 max-w-md text-sm leading-6 ${theme.textMuted}`}
                >
                  Select a collector from the team list to inspect their
                  profile, collection activity, geographic coverage, and sample
                  review queue.
                </p>

                {collectors.length > 0 && (
                  <div
                    className={`mt-6 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold ${theme.border} ${theme.bg}`}
                  >
                    <Users className='h-4 w-4 text-emerald-500' />
                    {collectors.length} collector
                    {collectors.length === 1 ? "" : "s"} available
                  </div>
                )}
              </div>
            </SurfaceCard>
          )}
        </div>
      </div>

      {/* ================================================================
          FOOTER SUMMARY
      ================================================================= */}

      <div
        className={`flex flex-col gap-2 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${theme.border} ${theme.bg}`}
      >
        <div className='flex items-center gap-2'>
          <Activity className='h-4 w-4 text-emerald-500' />
          <p className='text-xs font-semibold'>Team activity</p>
        </div>

        <p className={`text-xs ${theme.textMuted}`}>
          {active} active · {inactive} inactive ·{" "}
          {monthlySamples.toLocaleString()} samples this month
        </p>
      </div>
    </div>
  );
};

export default CollectorManagement;
