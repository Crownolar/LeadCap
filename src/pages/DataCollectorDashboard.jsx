import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Beaker,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import HeavyMetalFormModalNew from "../components/modals/lab-result_modal/HeavyMetalFormModalNew";
import SampleDetailModal from "../components/modals/SampleDetailModal";
import SampleFormModal from "../components/modals/SampleFormModal";
import {
  getMultipleSampleReadings,
  getSampleReadings,
} from "../redux/slice/heavyMetalSlice";
import { fetchSamples } from "../redux/slice/samplesSlice";
import api from "../utils/api";

const DataCollectorDashboard = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

  const { theme } = useTheme();

  // samples state
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
  const [maxPageButtons, setMaxPageButtons] = useState(7);

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

  const uniqueVariants = useMemo(() => {
    const variants = allSamples
      .map((s) => s.productVariant?.displayName || s.productVariant?.name)
      .filter(Boolean);
    return [...new Set(variants)];
  }, [allSamples]);

  const LIMIT = 50;
  useEffect(() => {
    async function fetchSamples() {
      try {
        const params = {
          limit: LIMIT,
          collectorId: currentUser.id,
          page: pageNumbers.currentPage,
        };
        setSamplesLoading(true);
        const res = await api.get("/samples", { params }).then((res) => {
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
    fetchSamples();
  }, [pageNumbers.currentPage]);

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

  const hasAllReadings = (sample) => {
    return (
      (allSamples.find((s) => s.id === sample.id)?.heavyMetalReadings || [])
        .length > 0
    );
  };

  const getReadingStatus = (sample) => {
    const readings =
      allSamples?.find((s) => s.id === sample.id)?.heavyMetalReadings || [];
    if (readings.length === 0)
      return {
        label: "No Results",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        dot: "bg-red-500",
        icon: AlertCircle,
      };
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
        pageNumbers.startPage - 1 + maxPageButtons,
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

  const hasActiveFilters =
    filterStatus !== "all" || variantFilter !== "all" || searchQuery.trim();

  const clearFilters = () => {
    setFilterStatus("all");
    setVariantFilter("all");
    setSearchQuery("");
  };

  return (
    <div className={`min-h-screen ${theme?.bg}`}>
      <div className={`${theme?.card} border-b ${theme?.border} shadow-md`}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6'>
            <div className='w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0'>
              <Beaker className='w-6 h-6 sm:w-7 sm:h-7 text-white' />
            </div>
            <div className='flex-1 min-w-0'>
              <h1 className={`text-2xl lg:text-3xl font-bold ${theme?.text}`}>
                Data Collector Dashboard
              </h1>
              <p className={`text-sm ${theme?.textMuted} mt-1`}>
                Manage samples and add lab results
              </p>
            </div>
          </div>

          <div
            className={`bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 p-4 rounded-lg border ${theme?.border}`}
          >
            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4'>
              <p className={`${theme?.text} text-sm`}>
                <span className={`font-semibold text-gray-900 `}>
                  Welcome, {currentUser?.fullName}
                </span>
                {currentUser?.organization && (
                  <span className={`${theme?.textMuted} ml-2`}>
                    · {currentUser.organization}
                  </span>
                )}
              </p>
              <span className='hidden sm:block text-gray-300 dark:text-gray-600'>
                |
              </span>
              {supervisor ? (
                <p className={`${theme?.text} text-sm`}>
                  <span className='font-semibold'>Supervisor:</span>{" "}
                  {supervisor.fullName}{" "}
                  <span className={theme?.textMuted}>({supervisor.email})</span>
                </p>
              ) : loadingSupervisor ? (
                <p className={`${theme?.textMuted} text-sm`}>
                  Loading supervisor info...
                </p>
              ) : (
                <p className={`${theme?.textMuted} text-sm`}>
                  No supervisor assigned yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
          {[
            {
              label: "Total Samples",
              value:
                !samplesLoading || pagination ? pagination?.totalCount : "--",
              icon: Eye,
              iconBg: "bg-blue-100 dark:bg-blue-900/30",
              iconColor: "text-blue-600 dark:text-blue-400",
              accent: "border-l-blue-500",
            },
            {
              label: "Total Pending Results",
              value: stats ? stats.pendingResults : "--",
              icon: Clock,
              iconBg: "bg-amber-100 dark:bg-amber-900/30",
              iconColor: "text-amber-600 dark:text-amber-400",
              accent: "border-l-amber-500",
            },
            {
              label: "Total With Results",
              value: stats ? stats.withResults : "--",
              icon: CheckCircle,
              iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
              iconColor: "text-emerald-600 dark:text-emerald-400",
              accent: "border-l-emerald-500",
            },
          ].map(({ label, value, icon: Icon, iconBg, iconColor, accent }) => (
            <div
              key={label}
              className={`${theme?.card} rounded-xl border ${theme?.border} border-l-4 ${accent} shadow-sm p-5 flex items-center gap-4`}
            >
              <div
                className={`w-11 h-11 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <p
                  className={`${theme?.textMuted} text-xs font-medium uppercase tracking-wide`}
                >
                  {label}
                </p>
                <p className={`${theme?.text} text-2xl font-bold mt-0.5`}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* page info badges */}
        <div className='flex flex-col sm:flex-row gap-3 mb-6'>
          <div
            className={`flex items-center justify-between w-full sm:inline-flex sm:w-auto gap-2 px-3 py-2 rounded-full border ${theme?.border} bg-emerald-50 dark:bg-emerald-900/10`}
          >
            <span className='text-xs text-gray-500'>Samples on page</span>
            <span className='font-semibold text-sm'>
              {!samplesLoading ? allSamples.length : "--"}
            </span>
          </div>

          <div
            className={`flex items-center justify-between w-full sm:inline-flex sm:w-auto gap-2 px-3 py-2 rounded-full border ${theme?.border} bg-emerald-50 dark:bg-emerald-900/10`}
          >
            <span className='text-xs text-gray-500'>With results</span>
            <span className='font-semibold text-sm'>
              {!samplesLoading
                ? allSamples.filter((s) => hasAllReadings(s)).length
                : "--"}
            </span>
          </div>

          <div
            className={`flex items-center justify-between w-full sm:inline-flex sm:w-auto gap-2 px-3 py-2 rounded-full border ${theme?.border} bg-emerald-50 dark:bg-emerald-900/10`}
          >
            <span className='text-xs text-gray-500'>Without results</span>
            <span className='font-semibold text-sm'>
              {!samplesLoading
                ? allSamples.filter((s) => !hasAllReadings(s)).length
                : "--"}
            </span>
          </div>
        </div>

        <div
          className={`${theme?.card} rounded-xl border ${theme?.border} shadow-sm p-4 mb-4`}
        >
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='relative flex-1'>
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme?.textMuted}`}
              />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search by sample ID or product name...'
                className={`w-full pl-9 pr-4 py-2.5 rounded-lg border ${theme?.border} ${theme?.card} ${theme?.text} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition`}
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

            <div className='flex gap-2 sm:gap-3'>
              <div className='relative flex-1 sm:flex-none'>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`appearance-none w-full sm:w-44 pl-3 pr-8 py-2.5 rounded-lg border ${theme?.border} ${theme?.card} ${theme?.text} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition cursor-pointer`}
                >
                  <option value='all'>All Statuses</option>
                  <option value='pending'>Pending Results</option>
                  <option value='completed'>With Results</option>
                </select>
                <ChevronDown
                  className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${theme?.textMuted}`}
                />
              </div>

              <div className='relative flex-1 sm:flex-none'>
                <select
                  value={variantFilter}
                  onChange={(e) => setVariantFilter(e.target.value)}
                  className={`appearance-none w-full sm:w-44 pl-3 pr-8 py-2.5 rounded-lg border ${theme?.border} ${theme?.card} ${theme?.text} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition cursor-pointer`}
                >
                  <option value='all'>All Variants</option>
                  {uniqueVariants.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${theme?.textMuted}`}
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className='flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition whitespace-nowrap'
                >
                  <X className='w-3.5 h-3.5' />
                  Clear
                </button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <div className='flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60'>
              {searchQuery && (
                <span className='inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-full'>
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X className='w-3 h-3' />
                  </button>
                </span>
              )}
              {filterStatus !== "all" && (
                <span className='inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-full'>
                  Status:{" "}
                  {filterStatus === "pending" ? "Pending" : "With Results"}
                  <button onClick={() => setFilterStatus("all")}>
                    <X className='w-3 h-3' />
                  </button>
                </span>
              )}
              {variantFilter !== "all" && (
                <span className='inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-full'>
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
          <div className='bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm'>
            {samplesError}
          </div>
        )}

        {samplesLoading && (
          <div className='text-center py-16'>
            <div className='inline-flex items-center gap-2'>
              {[0, 0.1, 0.2].map((delay, i) => (
                <div
                  key={i}
                  className='w-2 h-2 bg-emerald-600 rounded-full animate-bounce'
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
            className={`${theme?.card} rounded-xl border ${theme?.border} p-12 text-center shadow-sm`}
          >
            <div className='w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <Beaker className='w-8 h-8 text-gray-400' />
            </div>
            <p className={`${theme?.text} font-semibold text-lg mb-2`}>
              No samples found
            </p>
            <p className={`text-sm ${theme?.textMuted}`}>
              {hasActiveFilters
                ? "No samples match your current filters. Try adjusting or clearing them."
                : filterStatus === "completed"
                  ? "You haven't added results to any samples yet"
                  : filterStatus === "pending"
                    ? "All your samples have results!"
                    : "Start collecting samples to see them here"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className='mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition'
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {!samplesLoading && filteredSamples.length > 0 && (
          <div
            className={`${theme?.card} rounded-xl border ${theme?.border} shadow-sm overflow-hidden`}
          >
            <div className='hidden md:block overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className={`border-b ${theme?.border} ${theme.bg}`}>
                    {[
                      "Sample ID",
                      "Product / Variant",
                      "Location",
                      "Price",
                      "Metals Recorded",
                      "Status",
                      "Actions",
                    ].map((col) => (
                      <th
                        key={col}
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme?.text} whitespace-nowrap`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-700/60'>
                  {filteredSamples.map((sample) => {
                    const status = getReadingStatus(sample);
                    const StatusIcon = status.icon;
                    const readings =
                      allSamples?.find((s) => s.id === sample.id)
                        ?.heavyMetalReadings || [];

                    return (
                      <tr
                        key={sample.id}
                        className={`group hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 transition-colors`}
                      >
                        <td className='px-4 py-3.5'>
                          <span
                            className={`font-mono text-xs font-semibold ${theme?.text}`}
                          >
                            {sample.sampleId}
                          </span>
                        </td>

                        <td className='px-4 py-3.5 max-w-[200px]'>
                          <p
                            className={`font-semibold ${theme?.text} truncate`}
                          >
                            {sample.productName}
                          </p>
                          <p className={`text-xs ${theme?.textMuted} mt-0.5`}>
                            {sample.productVariant?.displayName ||
                              sample.productVariant?.name ||
                              "Unknown variant"}
                          </p>
                        </td>

                        <td className='px-4 py-3.5'>
                          <p className={`${theme?.text} font-medium`}>
                            {sample.marketName || sample.market?.name || "N/A"}
                          </p>
                          <p className={`text-xs ${theme?.textMuted} mt-0.5`}>
                            {sample.lga?.name}, {sample.state?.name}
                          </p>
                        </td>

                        <td className='px-4 py-3.5 whitespace-nowrap'>
                          <span className={`font-semibold ${theme?.text}`}>
                            {parseFloat(sample.price)
                              ? `₦${parseFloat(sample.price).toLocaleString()}`
                              : "N/A"}
                          </span>
                        </td>

                        <td className='px-4 py-3.5'>
                          {readings.length > 0 ? (
                            <div className='flex flex-wrap gap-1'>
                              {readings.slice(0, 3).map((r) => (
                                <span
                                  key={r.id}
                                  className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-xs font-medium'
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

                        <td className='px-4 py-3.5 whitespace-nowrap'>
                          <span
                            className={`inline-flex items-center gap-1.5 ${status.color} px-2.5 py-1 rounded-full text-xs font-semibold`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${status.dot} flex-shrink-0`}
                            />
                            {status.label}
                          </span>
                        </td>

                        <td className='px-4 py-3.5'>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() => handleViewDetails(sample)}
                              className={`p-2 rounded-lg border ${theme?.border} ${theme?.text} hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition`}
                              title='View details'
                            >
                              <FileText className='w-4 h-4' />
                            </button>
                            <button
                              onClick={() => handleAddResults(sample)}
                              className='flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-xs font-semibold rounded-lg transition shadow-sm hover:shadow-md whitespace-nowrap'
                            >
                              <Plus className='w-3.5 h-3.5' />
                              {readings.length > 0 ? "Update" : "Add Results"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className='md:hidden divide-y divide-gray-100 dark:divide-gray-700/60'>
              {filteredSamples.map((sample) => {
                const status = getReadingStatus(sample);
                const readings =
                  allSamples?.find((s) => s.id === sample.id)
                    ?.heavyMetalReadings || [];

                return (
                  <div key={sample.id} className='p-4 space-y-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex-1 min-w-0'>
                        <p className={`font-semibold ${theme?.text} truncate`}>
                          {sample.productName}
                        </p>
                        <p
                          className={`font-mono text-xs ${theme?.textMuted} mt-0.5`}
                        >
                          {sample.sampleId}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 ${status.color} px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                    </div>

                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <div>
                        <p
                          className={`${theme?.textMuted} uppercase font-semibold tracking-wide`}
                        >
                          Variant
                        </p>
                        <p className={`${theme?.text} font-medium mt-0.5`}>
                          {sample.productVariant?.displayName ||
                            sample.productVariant?.name ||
                            "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`${theme?.textMuted} uppercase font-semibold tracking-wide`}
                        >
                          Price
                        </p>
                        <p className={`${theme?.text} font-medium mt-0.5`}>
                          ₦{parseFloat(sample.price).toLocaleString()}
                        </p>
                      </div>
                      <div className='col-span-2'>
                        <p
                          className={`${theme?.textMuted} uppercase font-semibold tracking-wide`}
                        >
                          Location
                        </p>
                        <p className={`${theme?.text} font-medium mt-0.5`}>
                          {sample.marketName || sample.market?.name || "N/A"} ·{" "}
                          {sample.lga?.name}, {sample.state?.name}
                        </p>
                      </div>
                    </div>

                    {readings.length > 0 && (
                      <div className='flex flex-wrap gap-1.5'>
                        {readings.map((r) => (
                          <span
                            key={r.id}
                            className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded text-xs font-medium'
                          >
                            {r.heavyMetal}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className='flex gap-2 pt-1'>
                      <button
                        onClick={() => handleViewDetails(sample)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border ${theme?.border} ${theme?.text} hover:border-emerald-400 text-xs font-medium transition`}
                      >
                        <FileText className='w-3.5 h-3.5' />
                        Details
                      </button>
                      <button
                        onClick={() => handleAddResults(sample)}
                        className='flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-xs font-semibold rounded-lg transition shadow-sm'
                      >
                        <Plus className='w-3.5 h-3.5' />
                        {readings.length > 0
                          ? "Update Results"
                          : "Add Lab Results"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`px-4 py-3 border-t ${theme?.border} bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between`}
            >
              <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
                <p className={`text-xs ${theme?.textMuted}`}>
                  Showing
                  <span className='font-semibold mx-1'>
                    {(pageNumbers.currentPage - 1) * PAGE_SIZE + 1}
                  </span>
                  to
                  <span className='font-semibold mx-1'>
                    {pageNumbers.currentPage * PAGE_SIZE}
                  </span>
                  of{" "}
                  <span className='font-semibold ml-1'>
                    {pagination?.totalCount
                      ? pagination.totalCount
                      : filteredSamples.length}
                  </span>{" "}
                  samples
                </p>

                  {totalPages > 1 && (
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={handlePrevClickPagination}
                        disabled={pageNumbers.currentPage === 1}
                        className={`px-2 py-1 rounded border ${theme?.border} text-xs ${pageNumbers.currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                      >
                        Prev
                      </button>

                      {displayedPages.map((page) => {
                        return (
                          <button
                            key={page}
                            onClick={() => {
                              setPageNumbers((prev) => ({
                                ...prev,
                                currentPage: page,
                              }));
                            }}
                            className={`px-2 py-1 rounded text-xs border ${theme?.border} ${pageNumbers.currentPage === page ? "bg-emerald-600 text-white" : ""}`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {totalPages > maxPageButtons && (
                        <span className={`text-xs ${theme?.textMuted} px-2`}>
                          …
                        </span>
                      )}

                      <button
                        onClick={handleNextClickPagination}
                        disabled={pageNumbers.currentPage === totalPages}
                        className={`px-2 py-1 rounded border ${theme?.border} text-xs ${pageNumbers.currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                      >
                        Next
                      </button>
                    </div>
                  )}
              </div>
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
