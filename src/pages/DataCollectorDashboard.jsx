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
import { useTheme } from "../hooks/useTheme";
import HeavyMetalFormModalNew from "../components/modals/lab-result_modal/HeavyMetalFormModalNew";
import { fetchSamples } from "../redux/slice/samplesSlice";
import { getMultipleSampleReadings, getSampleReadings } from "../redux/slice/heavyMetalSlice";

const DataCollectorDashboard = ({ theme: propTheme }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { theme: hookTheme } = useTheme();
  const { samples: allSamples, loading: samplesLoading, error: samplesError } = useSelector((state) => state.samples);
  const { readingsBySample, loading: readingsLoading } = useSelector((state) => state.heavyMetal);
  
  // Use prop if provided, otherwise fall back to hook theme
  const theme = propTheme || hookTheme;
  
  // Fallback theme object if neither prop nor hook provided
  const fallbackTheme = {
    bg: "bg-gray-900",
    card: "bg-gray-800", 
    text: "text-white",
    textMuted: "text-gray-400",
    border: "border-gray-700",
    input: "bg-gray-700 text-white border-gray-600",
    hover: "hover:bg-gray-700",
  };
  
  const activeTheme = theme || fallbackTheme;

  // State management
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, completed
  const [selectedSample, setSelectedSample] = useState(null);
  const [showHeavyMetalModal, setShowHeavyMetalModal] = useState(false);
  const [supervisor, setSupervisor] = useState(null);
  const [loadingSupervisor, setLoadingSupervisor] = useState(false);

  // Filter user's samples
  const mySamples = allSamples.filter(
    (sample) => sample.creator?.id === currentUser?.id
  );

  // Fetch samples and readings on component mount
  useEffect(() => {
    if (currentUser?.id) {
      // Fetch all samples first
      dispatch(fetchSamples({ page: 1, limit: 5000 }));
      // Fetch supervisor info
      fetchSupervisorInfo();
    }
  }, [dispatch, currentUser?.id]);

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
      const sampleIds = mySamples.map(sample => sample.id);
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
        color: "bg-red-100 text-red-700",
        icon: AlertCircle,
      };
    }
    return {
      label: `${readings.length} Results`,
      color: "bg-green-100 text-green-700", 
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
    // Refresh readings for the updated sample
    if (selectedSample) {
      dispatch(getSampleReadings(selectedSample.id));
    }
  };

  return (
    <div className={`min-h-screen ${activeTheme?.bg}`}>
      {/* Header */}
      <div className={`${activeTheme?.card} border-b ${activeTheme?.border} shadow-md`}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg'>
              <Beaker className='w-7 h-7 text-white' />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${activeTheme?.text}`}>
                Data Collector Dashboard
              </h1>
              <p className={activeTheme?.textMuted}>
                Manage your collected samples and add lab results
              </p>
            </div>
          </div>

          {/* User Info */}
          <div
            className={`bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 p-4 rounded-lg border ${activeTheme?.border}`}
          >
            <div className="space-y-2">
              <p className={activeTheme?.text}>
                <span className='font-semibold'>
                  Welcome, {currentUser?.fullName}
                </span>
                {currentUser?.organization && (
                  <span className={`ml-2 ${activeTheme?.textMuted}`}>
                    • {currentUser.organization}
                  </span>
                )}
              </p>
              {supervisor ? (
                <p className={activeTheme?.textMuted}>
                  <span className="font-semibold">Supervisor:</span> {supervisor.fullName} ({supervisor.email})
                </p>
              ) : loadingSupervisor ? (
                <p className={activeTheme?.textMuted}>Loading supervisor info...</p>
              ) : (
                <p className={activeTheme?.textMuted}>
                  No supervisor assigned yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          {/* Total Samples */}
          <div
            className={`${activeTheme?.card} rounded-lg shadow-md p-6 border ${activeTheme?.border}`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className={`${activeTheme?.textMuted} text-sm font-medium`}>
                  Total Samples
                </p>
                <p className={`${activeTheme?.text} text-3xl font-bold mt-2`}>
                  {!samplesLoading ? mySamples.length : "--"}
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
                <Eye className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
          </div>

          {/* Pending Results */}
          <div
            className={`${activeTheme?.card} rounded-lg shadow-md p-6 border ${activeTheme?.border}`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className={`${activeTheme?.textMuted} text-sm font-medium`}>
                  Pending Results
                </p>
                <p className={`${activeTheme?.text} text-3xl font-bold mt-2`}>
                  {!samplesLoading && !readingsLoading
                    ? mySamples.filter((s) => !hasAllReadings(s)).length
                    : "--"}
                </p>
              </div>
              <div className='w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center'>
                <Clock className='w-6 h-6 text-yellow-600 dark:text-yellow-400' />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div
            className={`${activeTheme?.card} rounded-lg shadow-md p-6 border ${activeTheme?.border}`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className={`${activeTheme?.textMuted} text-sm font-medium`}>
                  With Results
                </p>
                <p className={`${activeTheme?.text} text-3xl font-bold mt-2`}>
                  {!samplesLoading && !readingsLoading
                    ? mySamples.filter((s) => hasAllReadings(s)).length
                    : "--"}
                </p>
              </div>
              <div className='w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center'>
                <CheckCircle className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='flex gap-3 mb-6 '>
          {[
            { value: "all", label: "All Samples" },
            { value: "pending", label: "Pending Results" },
            { value: "completed", label: "With Results" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`[@media(max-width:400px)]:px-1 [@media(max-width:400px)]:py-1 px-4 py-2 rounded-lg [@media(max-width:400px)]:text-sm  font-medium transition-all 
                ${
                  filterStatus === tab.value
                    ? "bg-emerald-600 text-white shadow-md"
                    : `${activeTheme?.card} ${activeTheme?.text} border ${activeTheme?.border} hover:border-emerald-400`
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {samplesError && (
          <div className='bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6'>
            {samplesError}
          </div>
        )}

        {/* Loading State */}
        {(samplesLoading || readingsLoading) && (
          <div className='text-center py-12'>
            <div className='inline-flex items-center gap-2'>
              <div className='w-2 h-2 bg-emerald-600 rounded-full animate-bounce'></div>
              <div
                className='w-2 h-2 bg-emerald-600 rounded-full animate-bounce'
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className='w-2 h-2 bg-emerald-600 rounded-full animate-bounce'
                style={{ animationDelay: "0.2s" }}
              ></div>
              <p className={`ml-2 ${activeTheme?.text}`}>
                {samplesLoading ? "Loading samples..." : "Loading readings..."}
              </p>
            </div>
          </div>
        )}

        {/* Samples List */}
        {!samplesLoading && !readingsLoading && filteredSamples.length === 0 && (
          <div
            className={`${activeTheme?.card} rounded-lg border ${activeTheme?.border} p-12 text-center`}
          >
            <Beaker className='w-16 h-16 mx-auto mb-4 text-gray-400' />
            <p className={`${activeTheme?.text} font-semibold text-lg`}>
              No samples found
            </p>
            <p className={activeTheme?.textMuted}>
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
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredSamples.map((sample) => {
              const status = getReadingStatus(sample);
              const StatusIcon = status.icon;
              const readings = readingsBySample?.[sample.id] || [];
              // console.log(readings.length);

              return (
                <div
                  key={sample.id}
                  className={`${activeTheme?.card} rounded-xl shadow-md border ${activeTheme?.border} hover:shadow-lg transition-all overflow-hidden`}
                >
                  {/* Header */}
                  <div className='bg-gradient-to-r from-emerald-500 to-cyan-500 p-4'>
                    <h3 className='text-white font-bold text-lg truncate'>
                      {sample.productName}
                    </h3>
                    <p className='text-emerald-100 text-sm'>
                      {sample.sampleId}
                    </p>
                  </div>

                  {/* Content */}
                  <div className='p-4 space-y-3'>
                    {/* Location Info */}
                    <div className='space-y-2'>
                      <p
                        className={`${activeTheme?.textMuted} text-xs font-semibold uppercase`}
                      >
                        Location
                      </p>
                      <p className={`${activeTheme?.text} font-medium`}>
                        {sample.market?.name || "N/A"}
                      </p>
                      <p className={`${activeTheme?.textMuted} text-sm`}>
                        {sample.lga?.name}, {sample.state?.name}
                      </p>
                    </div>

                    {/* Product Info */}
                    <div className='grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700'>
                      <div>
                        <p
                          className={`${activeTheme?.textMuted} text-xs font-semibold uppercase`}
                        >
                          Type
                        </p>
                        <p className={`${activeTheme?.text} font-medium text-sm`}>
                          {sample.productVariant?.displayName || sample.productVariant?.name || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`${activeTheme?.textMuted} text-xs font-semibold uppercase`}
                        >
                          Price
                        </p>
                        <p className={`${activeTheme?.text} font-medium text-sm`}>
                          ₦{parseFloat(sample.price).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Results Status */}
                    <div className='pt-3 border-t border-gray-200 dark:border-gray-700'>
                      <div
                        className={`${status.color} px-3 py-2 rounded-lg flex items-center gap-2`}
                      >
                        <StatusIcon className='w-4 h-4' />
                        <span className='text-sm font-semibold'>
                          {status.label}
                        </span>
                      </div>
                      {readings.length > 0 && (
                        <div className='mt-3 space-y-1'>
                          <p
                            className={`${activeTheme?.textMuted} text-xs font-semibold uppercase`}
                          >
                            Recorded Metals:
                          </p>
                          <div className='flex flex-wrap gap-2'>
                            {readings.map((reading) => (
                              <span
                                key={reading.id}
                                className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded text-xs font-medium'
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
                  <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
                    <button
                      onClick={() => handleAddResults(sample)}
                      className='w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg'
                    >
                      <Plus className='w-5 h-5' />
                      {readings.length > 0
                        ? "Update Results"
                        : "Add Lab Results"}
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
          theme={activeTheme}
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
