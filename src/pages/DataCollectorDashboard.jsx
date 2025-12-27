import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Beaker,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import HeavyMetalFormModalNew from "../components/modals/lab-result_modal/HeavyMetalFormModalNew";
import { fetchSamples } from "../redux/slice/samplesSlice";
import {
  getMultipleSampleReadings,
  getSampleReadings,
} from "../redux/slice/heavyMetalSlice";

const DataCollectorDashboard = ({ theme: propTheme }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();
  const {
    samples: allSamples,
    loading: samplesLoading,
    error: samplesError,
  } = useSelector((state) => state.samples);
  const { readingsBySample, loading: readingsLoading } = useSelector(
    (state) => state.heavyMetal
  );

  // State management
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSample, setSelectedSample] = useState(null);
  const [showHeavyMetalModal, setShowHeavyMetalModal] = useState(false);
  const [supervisor, setSupervisor] = useState(null);
  const [loadingSupervisor, setLoadingSupervisor] = useState(false);

  // Filter user's samples
  const mySamples = allSamples.filter(
    (sample) => sample.creator?.id === currentUser?.id
  );

  // Fetch samples and readings on component mount
  // useEffect(() => {
  //   if (currentUser?.id) {
  //     dispatch(fetchSamples({ page: 1, limit: 5000 }));
  //     fetchSupervisorInfo();
  //   }
  // }, [dispatch, currentUser?.id]);

  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) return;

    dispatch(fetchSamples({ page: 1, limit: 5000 }));
  }, [dispatch, isAuthenticated, currentUser?.id]);

  const fetchSupervisorInfo = async () => {
    try {
      setLoadingSupervisor(true);
      const api = require("../utils/api").default;
      const response = await api.get("/data-collector/me/supervisor");
      if (response.data.success) {
        setSupervisor(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching supervisor info:", err);
    } finally {
      setLoadingSupervisor(false);
    }
  };

  // Fetch heavy metal readings when samples are loaded
  useEffect(() => {
    if (mySamples.length > 0) {
      const sampleIds = mySamples.map((sample) => sample.id);
      dispatch(getMultipleSampleReadings(sampleIds));
    }
  }, [dispatch, mySamples.length]);

  // Check if sample has readings
  const hasAllReadings = (sample) => {
    const readings = readingsBySample?.[sample.id] || [];
    return readings.length > 0;
  };

  // Get reading status badge
  const getReadingStatus = (sample) => {
    const readings = readingsBySample?.[sample.id] || [];
    if (readings.length === 0) {
      return {
        label: "No Results",
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        icon: AlertCircle,
      };
    }
    return {
      label: `${readings.length} Results`,
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      icon: CheckCircle,
    };
  };

  // Filter samples based on status
  const filteredSamples = mySamples.filter((sample) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return !hasAllReadings(sample);
    if (filterStatus === "completed") return hasAllReadings(sample);
    return true;
  });

  const handleAddResults = (sample) => {
    setSelectedSample(sample);
    setShowHeavyMetalModal(true);
  };

  const handleModalClose = () => {
    setShowHeavyMetalModal(false);
    setSelectedSample(null);
    if (selectedSample) {
      dispatch(getSampleReadings(selectedSample.id));
    }
  };

  return (
    <div className={`min-h-screen ${theme?.bg}`}>
      {/* Header */}
      <div className={`${theme?.card} border-b ${theme?.border} shadow-md`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Title Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Beaker className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className={`text-xl sm:text-2xl lg:text-3xl font-bold ${theme?.text}`}
              >
                Data Collector Dashboard
              </h1>
              <p className={`text-sm sm:text-base ${theme?.textMuted} mt-1`}>
                Manage samples and add lab results
              </p>
            </div>
          </div>

          {/* User Info */}
          <div
            className={`bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 p-3 sm:p-4 rounded-lg border ${theme?.border}`}
          >
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <p className={`${theme?.text} text-sm sm:text-base`}>
                  <span className="font-semibold">
                    Welcome, {currentUser?.fullName}
                  </span>
                </p>
                {currentUser?.organization && (
                  <span className={`text-xs sm:text-sm ${theme?.textMuted}`}>
                    • {currentUser.organization}
                  </span>
                )}
              </div>
              {supervisor ? (
                <p className={`text-xs sm:text-sm ${theme?.textMuted}`}>
                  <span className="font-semibold">Supervisor:</span>{" "}
                  {supervisor.fullName} ({supervisor.email})
                </p>
              ) : loadingSupervisor ? (
                <p className={`text-xs sm:text-sm ${theme?.textMuted}`}>
                  Loading supervisor info...
                </p>
              ) : (
                <p className={`text-xs sm:text-sm ${theme?.textMuted}`}>
                  No supervisor assigned yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Total Samples */}
          <div
            className={`${theme?.card} rounded-lg shadow-md p-4 sm:p-6 border ${theme?.border}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p
                  className={`${theme?.textMuted} text-xs sm:text-sm font-medium`}
                >
                  Total Samples
                </p>
                <p
                  className={`${theme?.text} text-2xl sm:text-3xl font-bold mt-1 sm:mt-2`}
                >
                  {!samplesLoading ? mySamples.length : "--"}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Pending Results */}
          <div
            className={`${theme?.card} rounded-lg shadow-md p-4 sm:p-6 border ${theme?.border}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p
                  className={`${theme?.textMuted} text-xs sm:text-sm font-medium`}
                >
                  Pending Results
                </p>
                <p
                  className={`${theme?.text} text-2xl sm:text-3xl font-bold mt-1 sm:mt-2`}
                >
                  {!samplesLoading && !readingsLoading
                    ? mySamples.filter((s) => !hasAllReadings(s)).length
                    : "--"}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div
            className={`${theme?.card} rounded-lg shadow-md p-4 sm:p-6 border ${theme?.border} sm:col-span-2 lg:col-span-1`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p
                  className={`${theme?.textMuted} text-xs sm:text-sm font-medium`}
                >
                  With Results
                </p>
                <p
                  className={`${theme?.text} text-2xl sm:text-3xl font-bold mt-1 sm:mt-2`}
                >
                  {!samplesLoading && !readingsLoading
                    ? mySamples.filter((s) => hasAllReadings(s)).length
                    : "--"}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
          {[
            { value: "all", label: "All Samples" },
            { value: "pending", label: "Pending Results" },
            { value: "completed", label: "With Results" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap
                ${
                  filterStatus === tab.value
                    ? "bg-emerald-600 text-white shadow-md"
                    : `${theme?.card} ${theme?.text} border ${theme?.border} hover:border-emerald-400`
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {samplesError && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm">
            {samplesError}
          </div>
        )}

        {/* Loading State */}
        {(samplesLoading || readingsLoading) && (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <p className={`ml-2 text-sm sm:text-base ${theme?.text}`}>
                {samplesLoading ? "Loading samples..." : "Loading readings..."}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!samplesLoading &&
          !readingsLoading &&
          filteredSamples.length === 0 && (
            <div
              className={`${theme?.card} rounded-lg border ${theme?.border} p-8 sm:p-12 text-center`}
            >
              <Beaker className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
              <p
                className={`${theme?.text} font-semibold text-base sm:text-lg mb-2`}
              >
                No samples found
              </p>
              <p className={`text-sm sm:text-base ${theme?.textMuted}`}>
                {filterStatus === "completed"
                  ? "You haven't added results to any samples yet"
                  : filterStatus === "pending"
                  ? "All your samples have results!"
                  : "Start collecting samples to see them here"}
              </p>
            </div>
          )}

        {/* Samples Grid */}
        {!samplesLoading && !readingsLoading && filteredSamples.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredSamples.map((sample) => {
              const status = getReadingStatus(sample);
              const StatusIcon = status.icon;
              const readings = readingsBySample?.[sample.id] || [];

              return (
                <div
                  key={sample.id}
                  className={`${theme?.card} rounded-xl shadow-md border ${theme?.border} hover:shadow-lg transition-all overflow-hidden`}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-3 sm:p-4">
                    <h3 className="text-white font-bold text-base sm:text-lg truncate">
                      {sample.productName}
                    </h3>
                    <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                      {sample.sampleId}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 space-y-3">
                    {/* Location Info */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <p
                        className={`${theme?.textMuted} text-xs font-semibold uppercase`}
                      >
                        Location
                      </p>
                      <p
                        className={`${theme?.text} font-medium text-sm sm:text-base`}
                      >
                        {sample.market?.name || "N/A"}
                      </p>
                      <p className={`${theme?.textMuted} text-xs sm:text-sm`}>
                        {sample.lga?.name}, {sample.state?.name}
                      </p>
                    </div>

                    {/* Product Info */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p
                          className={`${theme?.textMuted} text-xs font-semibold uppercase`}
                        >
                          Type
                        </p>
                        <p
                          className={`${theme?.text} font-medium text-xs sm:text-sm mt-1`}
                        >
                          {sample.productVariant?.displayName ||
                            sample.productVariant?.name ||
                            "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`${theme?.textMuted} text-xs font-semibold uppercase`}
                        >
                          Price
                        </p>
                        <p
                          className={`${theme?.text} font-medium text-xs sm:text-sm mt-1`}
                        >
                          ₦{parseFloat(sample.price).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Results Status */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div
                        className={`${status.color} px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg flex items-center gap-2`}
                      >
                        <StatusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold">
                          {status.label}
                        </span>
                      </div>
                      {readings.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p
                            className={`${theme?.textMuted} text-xs font-semibold uppercase`}
                          >
                            Recorded Metals:
                          </p>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {readings.map((reading) => (
                              <span
                                key={reading.id}
                                className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 sm:py-1 rounded text-xs font-medium"
                              >
                                {reading.heavyMetal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleAddResults(sample)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-2 sm:py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="truncate">
                        {readings.length > 0
                          ? "Update Results"
                          : "Add Lab Results"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Heavy Metal Modal */}
      {showHeavyMetalModal && selectedSample && (
        <HeavyMetalFormModalNew
          onClose={handleModalClose}
          sampleId={selectedSample.id}
          sampleData={selectedSample}
          existingReadings={readingsBySample?.[selectedSample.id] || []}
        />
      )}
    </div>
  );
};

export default DataCollectorDashboard;
