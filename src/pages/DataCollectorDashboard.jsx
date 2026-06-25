import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Beaker,
  Plus,
  Eye,
  AlertCircle,
  Search,
  ChevronDown,
  X,
  RefreshCw,
  FlaskConical,
  SlidersHorizontal,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import HeavyMetalFormModalNew from "../components/modals/lab-result_modal/HeavyMetalFormModalNew";
import SampleDetailModal from "../components/modals/SampleDetailModal";
import SampleFormModal from "../components/modals/SampleFormModal";
import { getSampleReadings } from "../redux/slice/heavyMetalSlice";
import { fetchSamples } from "../redux/slice/samplesSlice";
import api from "../utils/api";

const DataCollectorDashboard = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  const [allSamples, setAllSamples] = useState([]);
  const [stats, setStats] = useState(null);
  const [samplesLoading, setSamplesLoading] = useState(null);
  const [samplesError, setSamplesError] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all");
  const [variantFilter, setVariantFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedSample, setSelectedSample] = useState(null);
  const [showHeavyMetalModal, setShowHeavyMetalModal] = useState(false);
  const [detailSample, setDetailSample] = useState(null);
  const [editSample, setEditSample] = useState(null);

  const [supervisor, setSupervisor] = useState(null);
  const [loadingSupervisor, setLoadingSupervisor] = useState(false);

  const [take] = useState(20);
  const [skip, setSkip] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const handleFetchMore = async () => {
    if (samplesLoading) return;
    const newSkip = skip + 20;
    if (skip + take >= (totalItems || 1)) return;

    try {
      setSamplesLoading(true);
      setSamplesError(false);
      setSkip(newSkip);

      const params = {
        take,
        skip: newSkip,
        collectorId: currentUser.id,
        q: searchQuery || undefined,
      };

      const res = await api.get(
        debouncedQuery ? "/samples/search" : "/samples",
        { params },
      );

      if (res.data?.data) {
        setAllSamples((prev) => [...prev, ...res.data.data]);
        setTotalItems(res.data.pagination.totalCount || 1);
      }
    } catch {
      setSamplesError("Failed to load more samples");
    } finally {
      setSamplesLoading(false);
    }
  };

  const fetchCollectorSamples = async () => {
    try {
      setSamplesLoading(true);
      setSamplesError(false);
      setAllSamples([]);

      const params = {
        q: searchQuery || undefined,
        createdBy: currentUser.id,
        skip,
        take,
      };

      const res = await api.get(
        debouncedQuery ? "/samples/search" : "/samples",
        { params },
      );
      setAllSamples(res.data.data);
      setTotalItems(res.data.pagination.totalCount || 1);
    } catch {
      setSamplesError(true);
    } finally {
      setSamplesLoading(false);
    }
  };

  useEffect(() => {
    api.get("/samples/stats").then((res) => setStats(res.data.data));
  }, []);

  useEffect(() => {
    if (currentUser?.id) fetchCollectorSamples();
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchSupervisorInfo = async () => {
      try {
        setLoadingSupervisor(true);
        const res = await api.get("/data-collectors/me/supervisor");
        if (res.data?.success) setSupervisor(res.data.data);
      } catch (err) {
        console.error("Supervisor fetch failed:", err);
      } finally {
        setLoadingSupervisor(false);
      }
    };
    fetchSupervisorInfo();
  }, [currentUser?.id]);

  useEffect(() => {
    setSkip(0);
    fetchCollectorSamples();
  }, [debouncedQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const uniqueVariants = useMemo(() => {
    const variants = allSamples
      .map((s) => s.productVariant?.displayName || s.productVariant?.name)
      .filter(Boolean);
    return [...new Set(variants)];
  }, [allSamples]);

  const hasReadings = (sample) =>
    (allSamples.find((s) => s.id === sample.id)?.heavyMetalReadings || [])
      .length > 0;

  const getReadingStatus = (sample) => {
    const readings =
      allSamples?.find((s) => s.id === sample.id)?.heavyMetalReadings || [];
    if (readings.length === 0) {
      return {
        label: "No results",
        colorClass:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        dot: "bg-amber-500",
      };
    }
    return {
      label: `${readings.length} result${readings.length > 1 ? "s" : ""}`,
      colorClass:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      dot: "bg-emerald-500",
    };
  };

  const hasActiveFilters =
    filterStatus !== "all" || variantFilter !== "all" || searchQuery.trim();

  const clearFilters = () => {
    setFilterStatus("all");
    setVariantFilter("all");
    setSearchQuery("");
  };

  const filteredSamples = useMemo(() => {
    return allSamples.filter((sample) => {
      if (filterStatus === "pending" && hasReadings(sample)) return false;
      if (filterStatus === "completed" && !hasReadings(sample)) return false;
      if (variantFilter !== "all") {
        const name =
          sample.productVariant?.displayName || sample.productVariant?.name;
        if (name !== variantFilter) return false;
      }
      return true;
    });
  }, [allSamples, filterStatus, variantFilter]);

  const samplesWithReadings = allSamples.filter((s) => hasReadings(s)).length;
  const samplesWithoutReadings = allSamples.filter(
    (s) => !hasReadings(s),
  ).length;
  const canLoadMore = skip + take < (totalItems || 1);

  const handleAddResults = (sample) => {
    setSelectedSample(sample);
    setShowHeavyMetalModal(true);
  };

  const handleModalClose = () => {
    setShowHeavyMetalModal(false);
    if (selectedSample) dispatch(getSampleReadings(selectedSample.id));
    setSelectedSample(null);
  };

  const handleEditRequest = (sample) => {
    setDetailSample(null);
    setEditSample(sample);
  };

  const handleEditSubmit = async (payload) => {
    if (!editSample?.id) return;
    await api.put(`/samples/${editSample.id}`, payload);
    dispatch(fetchSamples());
    setEditSample(null);
  };

  const selectCls = `appearance-none w-full h-10 pl-3.5 pr-8 rounded-xl border ${theme?.border} ${theme?.card} ${theme?.text} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition cursor-pointer`;

  return (
    <div className={`min-h-screen ${theme?.bg}`}>
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <p
                className={`text-xs sm:text-sm font-semibold ${theme?.text} leading-none`}
              >
                LeadCap
              </p>
              <p
                className={`text-[10px] sm:text-xs ${theme?.textMuted} mt-0.5`}
              >
                Field Intelligence
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50 whitespace-nowrap">
            Data Collector
          </span>
        </div>

        <div
          className={`${theme?.card} border ${theme?.border} rounded-2xl p-4 sm:p-5 mb-4`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-5">
            {/* collector info */}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5 sm:mb-2">
                Sample operations
              </p>
              <h1
                className={`text-lg sm:text-xl font-semibold ${theme?.text} leading-snug truncate`}
              >
                {currentUser?.fullName || "—"}
              </h1>
              <p className={`text-xs sm:text-sm ${theme?.textMuted} mt-0.5`}>
                Data Collector
              </p>
              {currentUser?.organization && (
                <p
                  className={`text-[11px] sm:text-xs ${theme?.textMuted} mt-0.5 truncate`}
                >
                  {currentUser.organization}
                </p>
              )}
            </div>

            <div
              className={`rounded-xl border ${theme?.border} p-3 sm:p-4 w-full sm:w-auto sm:min-w-[200px] sm:flex-shrink-0`}
              style={{ background: "var(--tw-card-bg, inherit)" }}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-widest ${theme?.textMuted} mb-1.5`}
              >
                Assigned supervisor
              </p>
              {supervisor ? (
                <>
                  <p
                    className={`text-xs sm:text-sm font-semibold ${theme?.text}`}
                  >
                    {supervisor.fullName}
                  </p>
                  <p
                    className={`text-[11px] sm:text-xs ${theme?.textMuted} mt-0.5 truncate`}
                  >
                    {supervisor.email}
                  </p>
                </>
              ) : loadingSupervisor ? (
                <p className={`text-xs sm:text-sm ${theme?.textMuted}`}>
                  Loading…
                </p>
              ) : (
                <p className={`text-xs sm:text-sm ${theme?.textMuted}`}>
                  No supervisor assigned
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
          {[
            {
              label: "Total",
              value: stats?.total ?? "—",
              sub: "All-time",
              accent: "bg-blue-500",
            },
            {
              label: "Pending",
              value: stats?.pendingResults ?? "—",
              sub: "No readings",
              accent: "bg-amber-500",
            },
            {
              label: "Complete",
              value: stats?.withResults ?? "—",
              sub: "Logged",
              accent: "bg-emerald-500",
            },
          ].map(({ label, value, sub, accent }) => (
            <div
              key={label}
              className={`${theme?.card} border ${theme?.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 relative overflow-hidden`}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${accent} rounded-l-xl sm:rounded-l-2xl`}
              />
              <p
                className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest ${theme?.textMuted} mb-1 sm:mb-1.5 leading-none`}
              >
                {label}
              </p>
              <p
                className={`text-xl sm:text-2xl font-semibold ${theme?.text} leading-none`}
              >
                {value}
              </p>
              <p
                className={`text-[10px] sm:text-xs ${theme?.textMuted} mt-0.5 sm:mt-1`}
              >
                {sub}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {[
            {
              label: "On page",
              value: samplesLoading ? "—" : allSamples.length,
            },
            {
              label: "With results",
              value: samplesLoading ? "—" : samplesWithReadings,
            },
            {
              label: "No results",
              value: samplesLoading ? "—" : samplesWithoutReadings,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border ${theme?.border} ${theme?.card} text-[10px] sm:text-xs`}
            >
              <span className={theme?.textMuted}>{label}</span>
              <span className={`font-semibold ${theme?.text}`}>{value}</span>
            </div>
          ))}
        </div>

        <div
          className={`${theme?.card} border ${theme?.border} rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5`}
        >
          {/* search row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className={`absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${theme?.textMuted}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search samples…"
                className={`w-full h-10 pl-8 sm:pl-9 pr-8 rounded-xl border ${theme?.border} ${theme?.card} ${theme?.text} text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${theme?.textMuted} hover:text-red-500 transition`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`md:hidden flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                showFilters || hasActiveFilters
                  ? "border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/10"
                  : `${theme?.border} ${theme?.text}`
              }`}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={selectCls}
                  style={{ minWidth: 148 }}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending results</option>
                  <option value="completed">With results</option>
                </select>
                <ChevronDown
                  className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${theme?.textMuted}`}
                />
              </div>

              <div className="relative">
                <select
                  value={variantFilter}
                  onChange={(e) => setVariantFilter(e.target.value)}
                  className={selectCls}
                  style={{ minWidth: 136 }}
                >
                  <option value="all">All variants</option>
                  {uniqueVariants.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${theme?.textMuted}`}
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="h-10 px-3 rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="md:hidden mt-2.5 flex flex-col gap-2">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={selectCls}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending results</option>
                  <option value="completed">With results</option>
                </select>
                <ChevronDown
                  className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${theme?.textMuted}`}
                />
              </div>
              <div className="relative">
                <select
                  value={variantFilter}
                  onChange={(e) => setVariantFilter(e.target.value)}
                  className={selectCls}
                >
                  <option value="all">All variants</option>
                  {uniqueVariants.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${theme?.textMuted}`}
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="h-10 w-full rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-1.5"
                >
                  <X className="w-3 h-3" /> Clear all filters
                </button>
              )}
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {filterStatus !== "all" && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full">
                  {filterStatus === "pending" ? "Pending" : "With results"}
                  <button onClick={() => setFilterStatus("all")}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {variantFilter !== "all" && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full">
                  {variantFilter}
                  <button onClick={() => setVariantFilter("all")}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              <span className={`text-[10px] sm:text-xs ${theme?.textMuted}`}>
                {filteredSamples.length} result
                {filteredSamples.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {samplesError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-3 sm:px-4 py-3 rounded-xl mb-4 text-xs sm:text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              {samplesError === true
                ? "Failed to load samples. Please try again."
                : samplesError}
            </span>
          </div>
        )}

        {samplesLoading && (
          <div className="flex items-center justify-center gap-2 py-10">
            {[0, 0.1, 0.2].map((delay, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
            <span className={`ml-2 text-sm ${theme?.textMuted}`}>
              Loading samples…
            </span>
          </div>
        )}

        {!samplesLoading && filteredSamples.length === 0 && (
          <div
            className={`${theme?.card} border ${theme?.border} rounded-2xl p-10 sm:p-12 text-center`}
          >
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 ${theme?.bg} rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}
            >
              <Beaker className={`w-5 h-5 sm:w-6 sm:h-6 ${theme?.textMuted}`} />
            </div>
            <p
              className={`${theme?.text} font-semibold text-sm sm:text-base mb-1.5`}
            >
              No samples found
            </p>
            <p
              className={`text-xs sm:text-sm ${theme?.textMuted} max-w-xs mx-auto`}
            >
              {hasActiveFilters
                ? "No samples match your filters. Try adjusting or clearing them."
                : filterStatus === "completed"
                  ? "You haven't added results to any samples yet."
                  : filterStatus === "pending"
                    ? "All your samples have results."
                    : "Start collecting samples to see them here."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 sm:mt-5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-xl transition"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {filteredSamples.length > 0 && (
          <div
            className={`${theme?.card} border ${theme?.border} rounded-2xl overflow-hidden`}
          >
            {/* panel header */}
            <div
              className={`flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b ${theme?.border}`}
            >
              <div>
                <h2
                  className={`text-xs sm:text-sm font-semibold ${theme?.text}`}
                >
                  Submitted samples
                </h2>
                <p
                  className={`text-[10px] sm:text-xs ${theme?.textMuted} mt-0.5`}
                >
                  Manage heavy metal readings per sample
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                {filteredSamples.length} item
                {filteredSamples.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={`border-b ${theme?.border} bg-gray-50/80 dark:bg-gray-800/40`}
                  >
                    {[
                      "Product / variant",
                      "Location",
                      "Price",
                      "Metals logged",
                      "Status",
                      "Actions",
                    ].map((col) => (
                      <th
                        key={col}
                        className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest ${theme?.textMuted} whitespace-nowrap`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filteredSamples.map((sample) => {
                    const status = getReadingStatus(sample);
                    const readings =
                      allSamples?.find((s) => s.id === sample.id)
                        ?.heavyMetalReadings || [];
                    const sampleHasReadings = readings.length > 0;

                    return (
                      <tr
                        key={sample.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 align-middle">
                          <p
                            className={`font-semibold text-sm ${theme?.text} leading-snug`}
                          >
                            {sample.productName}
                          </p>
                          <p className={`text-xs ${theme?.textMuted} mt-0.5`}>
                            {sample.productVariant?.displayName ||
                              sample.productVariant?.name ||
                              "Unknown variant"}
                          </p>
                        </td>

                        <td className="px-5 py-3.5 align-middle">
                          <p className={`text-sm ${theme?.text}`}>
                            {sample.marketName || sample.market?.name || "N/A"}
                          </p>
                          <p className={`text-xs ${theme?.textMuted} mt-0.5`}>
                            {sample.lga?.name}, {sample.state?.name}
                          </p>
                        </td>

                        <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                          <span
                            className={`text-sm font-semibold ${theme?.text}`}
                          >
                            {!Number.isNaN(parseFloat(sample.price))
                              ? `₦${parseFloat(sample.price).toLocaleString()}`
                              : "N/A"}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 align-middle">
                          {readings.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {readings.slice(0, 3).map((r) => (
                                <span
                                  key={r.id}
                                  className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                >
                                  {r.heavyMetal}
                                </span>
                              ))}
                              {readings.length > 3 && (
                                <span
                                  className={`text-xs ${theme?.textMuted} self-center`}
                                >
                                  +{readings.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span
                              className={`text-xs ${theme?.textMuted} italic`}
                            >
                              None yet
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 ${status.colorClass} px-2.5 py-1 rounded-full text-[10px] font-semibold`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${status.dot} flex-shrink-0`}
                            />
                            {status.label}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 align-middle">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setDetailSample(sample)}
                              title="View details"
                              className={`w-9 h-9 rounded-xl border ${theme?.border} ${theme?.text} flex items-center justify-center hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/10 transition`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {sampleHasReadings ? (
                              <button
                                onClick={() => handleAddResults(sample)}
                                className={`inline-flex items-center gap-1.5 h-9 px-3.5 border ${theme?.border} ${theme?.text} text-xs font-medium rounded-xl hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/10 transition whitespace-nowrap`}
                              >
                                <RefreshCw className="w-3 h-3" />
                                Update
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddResults(sample)}
                                className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition whitespace-nowrap"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add results
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="hidden sm:block lg:hidden divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredSamples.map((sample) => {
                const status = getReadingStatus(sample);
                const readings =
                  allSamples?.find((s) => s.id === sample.id)
                    ?.heavyMetalReadings || [];
                const sampleHasReadings = readings.length > 0;

                return (
                  <div key={sample.id} className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-semibold text-sm ${theme?.text} truncate`}
                        >
                          {sample.productName}
                        </p>
                        <p className={`text-xs ${theme?.textMuted} mt-0.5`}>
                          {sample.productVariant?.displayName ||
                            sample.productVariant?.name ||
                            "Unknown variant"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 ${status.colorClass} px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className={`rounded-xl ${theme?.bg} p-2.5`}>
                        <p
                          className={`text-[9px] font-semibold uppercase tracking-widest ${theme?.textMuted} mb-1`}
                        >
                          Location
                        </p>
                        <p
                          className={`text-xs font-medium ${theme?.text} leading-snug`}
                        >
                          {sample.marketName || sample.market?.name || "N/A"}
                        </p>
                        <p className={`text-[10px] ${theme?.textMuted} mt-0.5`}>
                          {sample.lga?.name}, {sample.state?.name}
                        </p>
                      </div>
                      <div className={`rounded-xl ${theme?.bg} p-2.5`}>
                        <p
                          className={`text-[9px] font-semibold uppercase tracking-widest ${theme?.textMuted} mb-1`}
                        >
                          Price
                        </p>
                        <p className={`text-xs font-semibold ${theme?.text}`}>
                          {!Number.isNaN(parseFloat(sample.price))
                            ? `₦${parseFloat(sample.price).toLocaleString()}`
                            : "N/A"}
                        </p>
                      </div>
                      <div className={`rounded-xl ${theme?.bg} p-2.5`}>
                        <p
                          className={`text-[9px] font-semibold uppercase tracking-widest ${theme?.textMuted} mb-1`}
                        >
                          Metals
                        </p>
                        {readings.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {readings.slice(0, 2).map((r) => (
                              <span
                                key={r.id}
                                className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                              >
                                {r.heavyMetal}
                              </span>
                            ))}
                            {readings.length > 2 && (
                              <span
                                className={`text-[10px] ${theme?.textMuted}`}
                              >
                                +{readings.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span
                            className={`text-[10px] ${theme?.textMuted} italic`}
                          >
                            None yet
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setDetailSample(sample)}
                        className={`inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl border ${theme?.border} ${theme?.text} text-xs font-medium hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      {sampleHasReadings ? (
                        <button
                          onClick={() => handleAddResults(sample)}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 h-9 border ${theme?.border} ${theme?.text} text-xs font-medium rounded-xl hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Update results
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddResults(sample)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add results
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredSamples.map((sample) => {
                const status = getReadingStatus(sample);
                const readings =
                  allSamples?.find((s) => s.id === sample.id)
                    ?.heavyMetalReadings || [];
                const sampleHasReadings = readings.length > 0;

                return (
                  <div key={sample.id} className="p-3.5">
                    {/* name + status */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="min-w-0">
                        <p
                          className={`font-semibold text-sm ${theme?.text} leading-snug`}
                        >
                          {sample.productName}
                        </p>
                        <p className={`text-[11px] ${theme?.textMuted} mt-0.5`}>
                          {sample.productVariant?.displayName ||
                            sample.productVariant?.name ||
                            "Unknown variant"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 ${status.colorClass} px-2 py-0.5 rounded-full text-[9px] font-semibold flex-shrink-0 mt-0.5`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                      <div className={`rounded-lg ${theme?.bg} p-2.5`}>
                        <p
                          className={`text-[9px] font-semibold uppercase tracking-wider ${theme?.textMuted} mb-1`}
                        >
                          Location
                        </p>
                        <p
                          className={`text-[11px] font-medium ${theme?.text} leading-snug`}
                        >
                          {sample.marketName || sample.market?.name || "N/A"}
                        </p>
                        <p className={`text-[10px] ${theme?.textMuted} mt-0.5`}>
                          {sample.lga?.name}, {sample.state?.name}
                        </p>
                      </div>
                      <div className={`rounded-lg ${theme?.bg} p-2.5`}>
                        <p
                          className={`text-[9px] font-semibold uppercase tracking-wider ${theme?.textMuted} mb-1`}
                        >
                          Price
                        </p>
                        <p
                          className={`text-[11px] font-semibold ${theme?.text}`}
                        >
                          {!Number.isNaN(parseFloat(sample.price))
                            ? `₦${parseFloat(sample.price).toLocaleString()}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {readings.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {readings.map((r) => (
                          <span
                            key={r.id}
                            className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
                          >
                            {r.heavyMetal}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setDetailSample(sample)}
                        className={`inline-flex items-center justify-center gap-1 h-9 px-3 rounded-xl border ${theme?.border} ${theme?.text} text-[11px] font-medium hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex-shrink-0`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      {sampleHasReadings ? (
                        <button
                          onClick={() => handleAddResults(sample)}
                          className={`flex-1 inline-flex items-center justify-center gap-1 h-9 border ${theme?.border} ${theme?.text} text-[11px] font-medium rounded-xl hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Update
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddResults(sample)}
                          className="flex-1 inline-flex items-center justify-center gap-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-xl transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add results
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`flex justify-center px-4 sm:px-5 py-3 sm:py-4 border-t ${theme?.border}`}
            >
              <button
                onClick={handleFetchMore}
                disabled={samplesLoading || !canLoadMore}
                className={`h-9 px-5 rounded-xl border text-xs sm:text-sm font-medium transition ${
                  samplesLoading || !canLoadMore
                    ? `${theme?.border} ${theme?.textMuted} opacity-50 cursor-not-allowed`
                    : `${theme?.border} ${theme?.text} hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10`
                }`}
              >
                {samplesLoading
                  ? "Loading…"
                  : canLoadMore
                    ? "Load more"
                    : "All samples loaded"}
              </button>
            </div>
          </div>
        )}
      </div>

      {detailSample && (
        <SampleDetailModal
          theme={theme}
          sample={detailSample}
          onClose={() => setDetailSample(null)}
          onEditRequest={handleEditRequest}
        />
      )}

      {editSample && (
        <SampleFormModal
          onClose={() => setEditSample(null)}
          onSubmit={handleEditSubmit}
          mode="edit"
          initialSample={editSample}
        />
      )}

      {showHeavyMetalModal && selectedSample && (
        <HeavyMetalFormModalNew
          onClose={handleModalClose}
          sampleId={selectedSample.id}
          sampleData={selectedSample}
          existingReadings={
            allSamples.find((s) => s.id === selectedSample.id)
              ?.heavyMetalReadings || []
          }
        />
      )}
    </div>
  );
};

export default DataCollectorDashboard;
