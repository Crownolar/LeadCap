import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Beaker,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  ChevronDown,
  X,
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

  const [pageNumbers, setPageNumbers] = useState({
    currentPage: 1,
    startPage: 1,
    endPage: 7,
  });

  const [allSamples, setAllSamples] = useState([]);
  const [stats, setStats] = useState(null);
  const [samplesLoading, setSamplesLoading] = useState(null);
  const [samplesError, setSamplesError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [variantFilter, setVariantFilter] = useState("all");

  const [selectedSample, setSelectedSample] = useState(null);
  const [showHeavyMetalModal, setShowHeavyMetalModal] = useState(false);
  const [detailSample, setDetailSample] = useState(null);
  const [editSample, setEditSample] = useState(null);

  const [supervisor, setSupervisor] = useState(null);
  const [loadingSupervisor, setLoadingSupervisor] = useState(false);

  const PAGE_SIZE = 50;
  const LIMIT = 50;
  const [maxPageButtons, setMaxPageButtons] = useState(7);
  const [take, setTake] = useState(20);
  const [skip, setSkip] = useState(0);

  const filteredSamples = useMemo(() => {
    return allSamples.filter((sample) => {
      if (filterStatus === "pending" && hasAllReadings(sample)) return false;
      if (filterStatus === "completed" && !hasAllReadings(sample)) return false;

      if (variantFilter !== "all") {
        const variantName =
          sample.productVariant?.displayName || sample.productVariant?.name;
        if (variantName !== variantFilter) return false;
      }

      // if (searchQuery.trim()) {
      //   const q = searchQuery.toLowerCase();
      //   const matchesId = sample.sampleId?.toLowerCase().includes(q);
      //   const matchesName = sample.productName?.toLowerCase().includes(q);
      //   if (!matchesId && !matchesName) return false;
      // }

      return true;
    });
  }, [allSamples, filterStatus, variantFilter, searchQuery]);

  // SEARCH BAR

  // useEffect(() => {
  //   if (searchQuery) return;
  //   setSkip(0);
  //   fetchLabData();
  // }, [searchQuery]);
  // effect for debouncing and fetching data when query changes
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setDebouncedQuery(searchQuery);
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, [searchQuery]);

  // useEffect(() => {
  //   let params = searchQuery ? { q: searchQuery, take, skip } : { take, skip };
  //   api.get("/samples/search", { params }).then;
  // }, [debouncedQuery]);

  const handlePrevClickPagination = () => {
    const step = maxPageButtons;
    if (pageNumbers.currentPage == 1) return;

    if (pageNumbers.startPage > 1) {
      return setPageNumbers((prev) => ({
        ...prev,
        startPage: prev.startPage - step,
        endPage: prev.endPage - step,
        currentPage: prev.currentPage - 1,
      }));
    }

    setPageNumbers((prev) => ({
      ...prev,
      currentPage: prev.currentPage - 1,
    }));
  };

  const handleNextClickPagination = () => {
    const step = maxPageButtons;
    if (pageNumbers.currentPage == (pagination?.totalPages || 1)) return;

    if (pageNumbers.currentPage == pageNumbers.endPage) {
      return setPageNumbers((prev) => ({
        ...prev,
        startPage: prev.startPage + step,
        endPage: prev.endPage + step,
        currentPage: prev.currentPage + 1,
      }));
    }

    setPageNumbers((prev) => ({
      ...prev,
      currentPage: prev.currentPage + 1,
    }));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    function updateMax() {
      const isMobile = window.innerWidth < 768;
      const max = isMobile ? 2 : 7;
      setMaxPageButtons(max);

      setPageNumbers((prev) => ({
        ...prev,
        endPage: prev.startPage + max - 1,
      }));
    }

    updateMax();
    window.addEventListener("resize", updateMax);
    return () => window.removeEventListener("resize", updateMax);
  }, []);

  useEffect(() => {
    api.get("/samples/stats").then((res) => {
      setStats(res.data.data);
    });
  }, []);

  useEffect(() => {
    async function fetchCollectorSamples() {
      try {
        const params = {
          limit: LIMIT,
          collectorId: currentUser.id,
          page: pageNumbers.currentPage,
        };

        setSamplesLoading(true);

        await api.get("/samples", { params }).then((res) => {
          setAllSamples(res.data.data);
          setPagination(res.data.pagination);
        });
      } catch (e) {
        console.log(e);
        setSamplesError(true);
      } finally {
        setSamplesLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    if (currentUser?.id) fetchCollectorSamples();
  }, [pageNumbers.currentPage, currentUser?.id]);

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

  const uniqueVariants = useMemo(() => {
    const variants = allSamples
      .map((s) => s.productVariant?.displayName || s.productVariant?.name)
      .filter(Boolean);

    return [...new Set(variants)];
  }, [allSamples]);

  const hasAllReadings = (sample) => {
    return (
      (allSamples.find((s) => s.id === sample.id)?.heavyMetalReadings || [])
        .length > 0
    );
  };

  const getReadingStatus = (sample) => {
    const readings =
      allSamples?.find((s) => s.id === sample.id)?.heavyMetalReadings || [];

    if (readings.length === 0) {
      return {
        label: "No Results",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        dot: "bg-red-500",
        icon: AlertCircle,
      };
    }

    return {
      label: `${readings.length} Result${readings.length > 1 ? "s" : ""}`,
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      dot: "bg-emerald-500",
      icon: CheckCircle,
    };
  };

  const filteredSamples = useMemo(() => {
    return allSamples.filter((sample) => {
      if (filterStatus === "pending" && hasAllReadings(sample)) return false;
      if (filterStatus === "completed" && !hasAllReadings(sample)) return false;

      if (variantFilter !== "all") {
        const variantName =
          sample.productVariant?.displayName || sample.productVariant?.name;
        if (variantName !== variantFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = sample.sampleId?.toLowerCase().includes(q);
        const matchesName = sample.productName?.toLowerCase().includes(q);
        if (!matchesId && !matchesName) return false;
      }

      return true;
    });
  }, [allSamples, filterStatus, variantFilter, searchQuery]);

  const totalPages = pagination?.totalPages || 1;

  const displayedPages = pagination
    ? Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(
        pageNumbers.startPage - 1,
        pageNumbers.startPage - 1 + maxPageButtons
      )
    : [];

  const handleAddResults = (sample) => {
    setSelectedSample(sample);
    setShowHeavyMetalModal(true);
  };

  const handleModalClose = () => {
    setShowHeavyMetalModal(false);
    if (selectedSample) dispatch(getSampleReadings(selectedSample.id));
    setSelectedSample(null);
  };

  const handleViewDetails = (sample) => setDetailSample(sample);

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

  const hasActiveFilters = filterStatus !== "all" || variantFilter !== "all";

  const clearFilters = () => {
    setFilterStatus("all");
    setVariantFilter("all");
    // setSearchQuery("");
  };

  return (
    <div className={`min-h-screen ${theme?.bg}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'>
        <div
          className={`${theme?.card} border ${theme?.border} rounded-3xl shadow-sm overflow-hidden mb-8`}
        >
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-emerald-50/80 via-white/20 to-cyan-50/80 dark:from-emerald-900/20 dark:via-transparent dark:to-cyan-900/20' />
            <div className='relative p-5 sm:p-6 lg:p-8'>
              <div className='flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6'>
                <div className='flex items-start gap-4'>
                  <div className='w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0'>
                    <Beaker className='w-7 h-7 sm:w-8 sm:h-8 text-white' />
                  </div>

                  <div className='min-w-0'>
                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3'>
                      Sample Operations
                    </div>

                    <h1 className={`text-2xl lg:text-3xl font-bold ${theme?.text}`}>
                      Data Collector Dashboard
                    </h1>

                    <p className={`text-sm sm:text-base mt-2 ${theme?.textMuted}`}>
                      Manage submitted samples, monitor result progress, and add
                      heavy metal readings from one clean workspace.
                    </p>
                  </div>
                </div>

                <div
                  className={`xl:min-w-[360px] rounded-2xl border ${theme?.border} ${theme?.card} p-4 shadow-sm`}
                >
                  <div className='space-y-3'>
                    <div>
                      <p
                        className={`text-xs uppercase tracking-[0.16em] font-semibold ${theme?.textMuted}`}
                      >
                        Collector
                      </p>
                      <p className={`mt-1 text-sm font-semibold ${theme?.text}`}>
                        {currentUser?.fullName || "--"}
                      </p>
                      {currentUser?.organization && (
                        <p className={`text-sm ${theme?.textMuted}`}>
                          {currentUser.organization}
                        </p>
                      )}
                    </div>

                    <div className={`h-px ${theme?.border} border-t`} />

                    <div>
                      <p
                        className={`text-xs uppercase tracking-[0.16em] font-semibold ${theme?.textMuted}`}
                      >
                        Supervisor
                      </p>

                      {supervisor ? (
                        <div className='mt-1'>
                          <p className={`text-sm font-semibold ${theme?.text}`}>
                            {supervisor.fullName}
                          </p>
                          <p className={`text-sm ${theme?.textMuted}`}>
                            {supervisor.email}
                          </p>
                        </div>
                      ) : loadingSupervisor ? (
                        <p className={`mt-1 text-sm ${theme?.textMuted}`}>
                          Loading supervisor info...
                        </p>
                      ) : (
                        <p className={`mt-1 text-sm ${theme?.textMuted}`}>
                          No supervisor assigned yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-6 flex flex-col sm:flex-row gap-3'>
                <div
                  className={`flex items-center justify-between sm:justify-start gap-2 px-4 py-3 rounded-2xl border ${theme?.border} bg-emerald-50 dark:bg-emerald-900/10`}
                >
                  <span className={`text-xs font-medium ${theme?.textMuted}`}>
                    Samples on page
                  </span>
                  <span className={`text-sm font-bold ${theme?.text}`}>
                    {!samplesLoading ? allSamples.length : "--"}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between sm:justify-start gap-2 px-4 py-3 rounded-2xl border ${theme?.border} bg-emerald-50 dark:bg-emerald-900/10`}
                >
                  <span className={`text-xs font-medium ${theme?.textMuted}`}>
                    With results
                  </span>
                  <span className={`text-sm font-bold ${theme?.text}`}>
                    {!samplesLoading
                      ? allSamples.filter((s) => hasAllReadings(s)).length
                      : "--"}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between sm:justify-start gap-2 px-4 py-3 rounded-2xl border ${theme?.border} bg-emerald-50 dark:bg-emerald-900/10`}
                >
                  <span className={`text-xs font-medium ${theme?.textMuted}`}>
                    Without results
                  </span>
                  <span className={`text-sm font-bold ${theme?.text}`}>
                    {!samplesLoading
                      ? allSamples.filter((s) => !hasAllReadings(s)).length
                      : "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8'>
          {[
            {
              label: "Total Samples",
              value: stats ? stats?.total : "--",
              icon: Eye,
              iconBg: "bg-blue-100 dark:bg-blue-900/30",
              iconColor: "text-blue-600 dark:text-blue-400",
              accent: "bg-blue-500",
            },
            {
              label: "Total Pending Results",
              value: stats ? stats.pendingResults : "--",
              icon: Clock,
              iconBg: "bg-amber-100 dark:bg-amber-900/30",
              iconColor: "text-amber-600 dark:text-amber-400",
              accent: "bg-amber-500",
            },
            {
              label: "Total With Results",
              value: stats ? stats.withResults : "--",
              icon: CheckCircle,
              iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
              iconColor: "text-emerald-600 dark:text-emerald-400",
              accent: "bg-emerald-500",
            },
          ].map(({ label, value, icon: Icon, iconBg, iconColor, accent }) => (
            <div
              key={label}
              className={`${theme?.card} rounded-2xl border ${theme?.border} shadow-sm p-5 relative overflow-hidden`}
            >
              <div className={`absolute left-0 top-0 h-full w-1.5 ${accent}`} />
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <p
                    className={`${theme?.textMuted} text-xs font-semibold uppercase tracking-[0.16em]`}
                  >
                    {label}
                  </p>
                  <p className={`${theme?.text} text-2xl lg:text-3xl font-bold mt-2`}>
                    {value}
                  </p>
                </div>

                <div
                  className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`${theme?.card} rounded-3xl border ${theme?.border} shadow-sm p-4 sm:p-5 mb-6`}
        >
          <div className='flex flex-col xl:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme?.textMuted}`}
              />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search by sample ID or product name...'
                className={`w-full h-12 pl-11 pr-10 rounded-2xl border ${theme?.border} ${theme?.card} ${theme?.text} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition`}
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme?.textMuted} hover:text-red-500 transition`}
                >
                  <X className='w-4 h-4' />
                </button>
              )}
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 xl:flex gap-3'>
              <div className='relative'>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`appearance-none w-full xl:w-48 h-12 pl-4 pr-10 rounded-2xl border ${theme?.border} ${theme?.card} ${theme?.text} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition cursor-pointer`}
                >
                  <option value='all'>All Statuses</option>
                  <option value='pending'>Pending Results</option>
                  <option value='completed'>With Results</option>
                </select>
                <ChevronDown
                  className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme?.textMuted}`}
                />
              </div>

              <div className='relative'>
                <select
                  value={variantFilter}
                  onChange={(e) => setVariantFilter(e.target.value)}
                  className={`appearance-none w-full xl:w-48 h-12 pl-4 pr-10 rounded-2xl border ${theme?.border} ${theme?.card} ${theme?.text} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition cursor-pointer`}
                >
                  <option value='all'>All Variants</option>
                  {uniqueVariants.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme?.textMuted}`}
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className='h-12 px-4 rounded-2xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition whitespace-nowrap'
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <div className='flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60'>
              {searchQuery && (
                <span className='inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-3 py-1.5 rounded-full'>
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X className='w-3 h-3' />
                  </button>
                </span>
              )}

              {filterStatus !== "all" && (
                <span className='inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-3 py-1.5 rounded-full'>
                  Status: {filterStatus === "pending" ? "Pending" : "With Results"}
                  <button onClick={() => setFilterStatus("all")}>
                    <X className='w-3 h-3' />
                  </button>
                </span>
              )}

              {variantFilter !== "all" && (
                <span className='inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-3 py-1.5 rounded-full'>
                  Variant: {variantFilter}
                  <button onClick={() => setVariantFilter("all")}>
                    <X className='w-3 h-3' />
                  </button>
                </span>
              )}

              <span className={`text-xs ${theme?.textMuted} self-center`}>
                {filteredSamples.length} result
                {filteredSamples.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {samplesError && (
          <div className='bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-2xl mb-5 text-sm'>
            Error occured when fetching samples
          </div>
        )}

        {samplesLoading && (
          <div
            className={`${theme?.card} rounded-3xl border ${theme?.border} shadow-sm py-20 text-center`}
          >
            <div className='inline-flex items-center gap-2'>
              {[0, 0.1, 0.2].map((delay, i) => (
                <div
                  key={i}
                  className='w-2.5 h-2.5 bg-emerald-600 rounded-full animate-bounce'
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
              <p className={`ml-2 text-sm ${theme?.text}`}>
                {samplesLoading ? "Loading samples..." : "Loading readings..."}
              </p>
            </div>
          </div>
        )}

        {!samplesLoading && filteredSamples.length === 0 && (
          <div
            className={`${theme?.card} rounded-3xl border ${theme?.border} p-12 text-center shadow-sm`}
          >
            <div className='w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <Beaker className='w-8 h-8 text-gray-400' />
            </div>

            <p className={`${theme?.text} font-semibold text-lg mb-2`}>
              No samples found
            </p>

            <p className={`text-sm ${theme?.textMuted} max-w-md mx-auto`}>
              {hasActiveFilters
                ? "No samples match your current filters. Try adjusting or clearing them."
                : filterStatus === "completed"
                  ? "You haven't added results to any samples yet."
                  : filterStatus === "pending"
                    ? "All your samples have results."
                    : "Start collecting samples to see them here."}
            </p>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className='mt-5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition'
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {!samplesLoading && filteredSamples.length > 0 && (
          <div
            className={`${theme?.card} rounded-3xl border ${theme?.border} shadow-sm overflow-hidden`}
          >
            <div className='px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 bg-white/40 dark:bg-transparent'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div>
                  <h2 className={`text-lg font-semibold ${theme?.text}`}>
                    Submitted Samples
                  </h2>
                  <p className={`text-sm ${theme?.textMuted} mt-1`}>
                    Review sample information and manage heavy metal result entry.
                  </p>
                </div>

                <div className='inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold'>
                  {filteredSamples.length} item
                  {filteredSamples.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <div className='hidden lg:block overflow-x-auto scrollbar-hide'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className={`border-b ${theme?.border} bg-gray-50 dark:bg-gray-800/40`}>
                    {[
                      "Product / Variant",
                      "Location",
                      "Price",
                      "Metals Recorded",
                      "Status",
                      "Actions",
                    ].map((col) => (
                      <th
                        key={col}
                        className={`px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] ${theme?.textMuted} whitespace-nowrap`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className='divide-y divide-gray-100 dark:divide-gray-700/60'>
                  {filteredSamples.map((sample) => {
                    const status = getReadingStatus(sample);
                    const readings =
                      allSamples?.find((s) => s.id === sample.id)
                        ?.heavyMetalReadings || [];

                    return (
                      <tr
                        key={sample.id}
                        className='group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors'
                      >
                        <td className='px-5 py-4 align-top'>
                          <div className='min-w-[220px]'>
                            <p className={`font-semibold ${theme?.text} leading-5`}>
                              {sample.productName}
                            </p>
                            <p className={`text-xs ${theme?.textMuted} mt-1`}>
                              {sample.productVariant?.displayName ||
                                sample.productVariant?.name ||
                                "Unknown variant"}
                            </p>
                          </div>
                        </td>

                        <td className='px-5 py-4 align-top'>
                          <div className='min-w-[190px]'>
                            <p className={`${theme?.text} font-medium`}>
                              {sample.marketName || sample.market?.name || "N/A"}
                            </p>
                            <p className={`text-xs ${theme?.textMuted} mt-1`}>
                              {sample.lga?.name}, {sample.state?.name}
                            </p>
                          </div>
                        </td>

                        <td className='px-5 py-4 align-top whitespace-nowrap'>
                          <span className={`font-semibold ${theme?.text}`}>
                            {!Number.isNaN(parseFloat(sample.price))
                              ? `₦${parseFloat(sample.price).toLocaleString()}`
                              : "N/A"}
                          </span>
                        </td>

                        <td className='px-5 py-4 align-top'>
                          {readings.length > 0 ? (
                            <div className='flex flex-wrap gap-1.5 max-w-[240px]'>
                              {readings.slice(0, 3).map((r) => (
                                <span
                                  key={r.id}
                                  className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-medium'
                                >
                                  {r.heavyMetal}
                                </span>
                              ))}
                              {readings.length > 3 && (
                                <span className={`text-xs ${theme?.textMuted} self-center`}>
                                  +{readings.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className={`text-xs ${theme?.textMuted} italic`}>
                              None yet
                            </span>
                          )}
                        </td>

                        <td className='px-5 py-4 align-top whitespace-nowrap'>
                          <span
                            className={`inline-flex items-center gap-1.5 ${status.color} px-3 py-1.5 rounded-full text-xs font-semibold`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${status.dot} flex-shrink-0`}
                            />
                            {status.label}
                          </span>
                        </td>

                        <td className='px-5 py-4 align-top'>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() => handleViewDetails(sample)}
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${theme?.border} ${theme?.text} bg-transparent hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/10 transition`}
                              title='View details'
                            >
                              <Eye className='w-4 h-4' />
                            </button>

                            <button
                              onClick={() => handleAddResults(sample)}
                              className='inline-flex items-center gap-2 px-4 h-10 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-xs font-semibold rounded-xl transition shadow-sm hover:shadow-md whitespace-nowrap'
                            >
                              <Plus className='w-3.5 h-3.5' />
                              {readings.length > 0 ? "Update Results" : "Add Results"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className='lg:hidden divide-y divide-gray-100 dark:divide-gray-700/60'>
              {filteredSamples.map((sample) => {
                const status = getReadingStatus(sample);
                const readings =
                  allSamples?.find((s) => s.id === sample.id)?.heavyMetalReadings ||
                  [];

                return (
                  <div key={sample.id} className='p-4 sm:p-5'>
                    <div className='rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0 flex-1'>
                          <p className={`font-semibold ${theme?.text} truncate`}>
                            {sample.productName}
                          </p>
                          <p className={`text-xs ${theme?.textMuted} mt-1`}>
                            {sample.productVariant?.displayName ||
                              sample.productVariant?.name ||
                              "Unknown variant"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 ${status.color} px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4'>
                        <div className='rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3'>
                          <p
                            className={`${theme?.textMuted} uppercase font-semibold tracking-[0.16em] text-[10px]`}
                          >
                            Location
                          </p>
                          <p className={`${theme?.text} font-medium text-sm mt-1`}>
                            {sample.marketName || sample.market?.name || "N/A"}
                          </p>
                          <p className={`text-xs ${theme?.textMuted} mt-1`}>
                            {sample.lga?.name}, {sample.state?.name}
                          </p>
                        </div>

                        <div className='rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3'>
                          <p
                            className={`${theme?.textMuted} uppercase font-semibold tracking-[0.16em] text-[10px]`}
                          >
                            Price
                          </p>
                          <p className={`${theme?.text} font-medium text-sm mt-1`}>
                            {!Number.isNaN(parseFloat(sample.price))
                              ? `₦${parseFloat(sample.price).toLocaleString()}`
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {readings.length > 0 && (
                        <div className='flex flex-wrap gap-1.5 mt-4'>
                          {readings.map((r) => (
                            <span
                              key={r.id}
                              className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-medium'
                            >
                              {r.heavyMetal}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className='flex gap-2 mt-4'>
                        <button
                          onClick={() => handleViewDetails(sample)}
                          className={`inline-flex items-center justify-center gap-1.5 px-4 h-11 rounded-xl border ${theme?.border} ${theme?.text} bg-transparent hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/10 text-xs font-medium transition`}
                        >
                          <Eye className='w-4 h-4' />
                          View
                        </button>

                        <button
                          onClick={() => handleAddResults(sample)}
                          className='flex-1 inline-flex items-center justify-center gap-1.5 px-4 h-11 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-xs font-semibold rounded-xl transition shadow-sm'
                        >
                          <Plus className='w-3.5 h-3.5' />
                          {readings.length > 0 ? "Update Results" : "Add Results"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className='px-4 sm:px-5 py-4 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/30'>
              <div className='flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4'>
                <p className={`text-xs sm:text-sm ${theme?.text}`}>
                  Showing{" "}
                  <span className='font-semibold'>
                    {(pageNumbers.currentPage - 1) * PAGE_SIZE + 1}
                  </span>{" "}
                  to{" "}
                  <span className='font-semibold'>
                    {Math.min(
                      pageNumbers.currentPage * PAGE_SIZE,
                      pagination?.totalCount || pageNumbers.currentPage * PAGE_SIZE
                    )}
                  </span>{" "}
                  of{" "}
                  <span className='font-semibold'>
                    {pagination?.totalCount
                      ? pagination.totalCount
                      : filteredSamples.length}
                  </span>{" "}
                  samples
                </p>

                <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                  {totalPages > 1 && (
                    <div
                      className={`flex items-center flex-wrap gap-2 ${theme?.card} rounded-2xl border ${theme?.border} px-3 py-2`}
                    >
                      <button
                        onClick={handlePrevClickPagination}
                        disabled={pageNumbers.currentPage === 1}
                        className={`px-3 py-2 rounded-xl border ${theme?.border} ${theme?.text} text-xs font-medium ${
                          pageNumbers.currentPage === 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        Prev
                      </button>

                      {displayedPages.map((page) => (
                        <button
                          key={page}
                          onClick={() => {
                            setPageNumbers((prev) => ({
                              ...prev,
                              currentPage: page,
                            }));
                          }}
                          className={`min-w-[36px] px-3 py-2 rounded-xl text-xs font-medium border ${theme?.border} ${
                            pageNumbers.currentPage === page
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : `${theme?.text} hover:bg-gray-100 dark:hover:bg-gray-700`
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      {totalPages > maxPageButtons && (
                        <span className={`text-xs ${theme?.textMuted} px-1`}>…</span>
                      )}

                      <button
                        onClick={handleNextClickPagination}
                        disabled={pageNumbers.currentPage === totalPages}
                        className={`px-3 py-2 rounded-xl border ${theme?.border} ${theme?.text} text-xs font-medium ${
                          pageNumbers.currentPage === totalPages
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className='text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium'
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
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
          mode='edit'
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