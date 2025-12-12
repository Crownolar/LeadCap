import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Beaker, Plus, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react";
import api from "../utils/api";
import { useTheme } from "../hooks/useTheme";
import HeavyMetalFormModal from "../components/modals/lab-result_modal/HeavyMetalFormModal";

const DataCollectorDashboard = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  // State management
  const [mySamples, setMySamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, pending, completed
  const [selectedSample, setSelectedSample] = useState(null);
  const [selectedReadings, setSelectedReadings] = useState([]);
  const [showHeavyMetalModal, setShowHeavyMetalModal] = useState(false);
  const [sampleReadings, setSampleReadings] = useState({});

  // Fetch user's samples
  useEffect(() => {
    fetchMySamples();
  }, [currentUser?.id]);

  const fetchMySamples = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/samples");
      // Filter samples created by current user
      const userSamples = response.data.data.filter(
        (sample) => sample.creator?.id === currentUser?.id
      );
      setMySamples(userSamples);

      
      for (const sample of userSamples) {
        try {
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 150));
          
          const readingsRes = await api.get(
            `/heavy-metals/sample/${sample.sampleId}`
          );
          setSampleReadings((prev) => ({
            ...prev,
            [sample.id]: readingsRes.data.data || [],
          }));
        } catch (err) {
          // Graceful error handling - don't block on 429 errors
          if (err.response?.status === 429) {
            console.warn(`Rate limited fetching readings for sample ${sample.sampleId}, retrying...`);
            // Add longer delay and retry once
            await new Promise(resolve => setTimeout(resolve, 500));
            try {
              const readingsRes = await api.get(
                `/heavy-metals/sample/${sample.sampleId}`
              );
              setSampleReadings((prev) => ({
                ...prev,
                [sample.id]: readingsRes.data.data || [],
              }));
            } catch (retryErr) {
              console.error(`Failed to fetch readings for sample ${sample.sampleId} after retry`);
            }
          } else {
            console.error(`Failed to fetch readings for sample ${sample.sampleId}`);
          }
        }
      }
    } catch (err) {
      // Only show error if it's not a rate limit error
      if (err.response?.status !== 429) {
        setError("Failed to fetch your samples");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check if sample has all readings
  const hasAllReadings = (sample) => {
    const readings = sampleReadings[sample.id] || [];
    return readings.length > 0;
  };

  // Get reading status badge
  const getReadingStatus = (sample) => {
    const readings = sampleReadings[sample.id] || [];
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
    setSelectedReadings(sampleReadings[sample.id] || []);
    setShowHeavyMetalModal(true);
  };

  const handleModalClose = () => {
    setShowHeavyMetalModal(false);
    setSelectedSample(null);
    setSelectedReadings([]);
    // Refresh readings
    fetchMySamples();
  };

  return (
    <div className={`min-h-screen ${theme?.bg}`}>
      {/* Header */}
      <div className={`${theme?.card} border-b ${theme?.border} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Beaker className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${theme?.text}`}>
                Data Collector Dashboard
              </h1>
              <p className={theme?.textMuted}>
                Manage your collected samples and add lab results
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className={`bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 p-4 rounded-lg border ${theme?.border}`}>
            <p className={theme?.text}>
              <span className="font-semibold">Welcome, {currentUser?.fullName}</span>
              {currentUser?.organization && (
                <span className={`ml-2 ${theme?.textMuted}`}>
                  • {currentUser.organization}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Samples */}
          <div className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${theme?.textMuted} text-sm font-medium`}>
                  Total Samples
                </p>
                <p className={`${theme?.text} text-3xl font-bold mt-2`}>
                  {mySamples.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Pending Results */}
          <div className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${theme?.textMuted} text-sm font-medium`}>
                  Pending Results
                </p>
                <p className={`${theme?.text} text-3xl font-bold mt-2`}>
                  {mySamples.filter((s) => !hasAllReadings(s)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className={`${theme?.card} rounded-lg shadow-md p-6 border ${theme?.border}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${theme?.textMuted} text-sm font-medium`}>
                  With Results
                </p>
                <p className={`${theme?.text} text-3xl font-bold mt-2`}>
                  {mySamples.filter((s) => hasAllReadings(s)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          {[
            { value: "all", label: "All Samples" },
            { value: "pending", label: "Pending Results" },
            { value: "completed", label: "With Results" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <p className={`ml-2 ${theme?.text}`}>Loading samples...</p>
            </div>
          </div>
        )}

        {/* Samples List */}
        {!loading && filteredSamples.length === 0 && (
          <div className={`${theme?.card} rounded-lg border ${theme?.border} p-12 text-center`}>
            <Beaker className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className={`${theme?.text} font-semibold text-lg`}>
              No samples found
            </p>
            <p className={theme?.textMuted}>
              {filterStatus === "completed"
                ? "You haven't added results to any samples yet"
                : filterStatus === "pending"
                ? "All your samples have results!"
                : "Start collecting samples to see them here"}
            </p>
          </div>
        )}

        {/* Samples Grid */}
        {!loading && filteredSamples.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSamples.map((sample) => {
              const status = getReadingStatus(sample);
              const StatusIcon = status.icon;
              const readings = sampleReadings[sample.id] || [];

              return (
                <div
                  key={sample.id}
                  className={`${theme?.card} rounded-xl shadow-md border ${theme?.border} hover:shadow-lg transition-all overflow-hidden`}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-4">
                    <h3 className="text-white font-bold text-lg truncate">
                      {sample.productName}
                    </h3>
                    <p className="text-emerald-100 text-sm">
                      {sample.sampleId}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Location Info */}
                    <div className="space-y-2">
                      <p className={`${theme?.textMuted} text-xs font-semibold uppercase`}>
                        Location
                      </p>
                      <p className={`${theme?.text} font-medium`}>
                        {sample.market?.name || "N/A"}
                      </p>
                      <p className={`${theme?.textMuted} text-sm`}>
                        {sample.lga?.name}, {sample.state?.name}
                      </p>
                    </div>

                    {/* Product Info */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className={`${theme?.textMuted} text-xs font-semibold uppercase`}>
                          Type
                        </p>
                        <p className={`${theme?.text} font-medium text-sm`}>
                          {sample.productType?.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <p className={`${theme?.textMuted} text-xs font-semibold uppercase`}>
                          Price
                        </p>
                        <p className={`${theme?.text} font-medium text-sm`}>
                          ₦{parseFloat(sample.price).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Results Status */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className={`${status.color} px-3 py-2 rounded-lg flex items-center gap-2`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {status.label}
                        </span>
                      </div>
                      {readings.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className={`${theme?.textMuted} text-xs font-semibold uppercase`}>
                            Recorded Metals:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {readings.map((reading) => (
                              <span
                                key={reading.id}
                                className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded text-xs font-medium"
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
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleAddResults(sample)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-5 h-5" />
                      {readings.length > 0 ? "Update Results" : "Add Lab Results"}
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
        <HeavyMetalFormModal
          theme={theme}
          onClose={handleModalClose}
          sampleId={selectedSample.id}
          productType={selectedSample.productType}
          existingReadings={selectedReadings}
        />
      )}
    </div>
  );
};

export default DataCollectorDashboard;
