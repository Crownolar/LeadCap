import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Beaker,
  X,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";
import api from "../../../utils/api";
import {
  batchAddXRFReadings,
  getSampleReadings,
  clearHeavyMetalState,
} from "../../../redux/slice/heavyMetalSlice";
import { useTheme } from "../../../context/ThemeContext";

const HeavyMetalFormModalNew = ({
  onClose,
  sampleId,
  fetchMySamples,
  existingReadings = [],
  sampleData = null,
}) => {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector(
    (state) => state.heavyMetal
  );

  // State for sample info and thresholds
  const [sample, setSample] = useState(null);
  const [thresholds, setThresholds] = useState([]);
  const [loadingSample, setLoadingSample] = useState(true);
  const [sampleError, setSampleError] = useState(null);
  const { theme } = useTheme();

  // Heavy metals list
  const heavyMetals = [
    "LEAD",
    "MERCURY",
    "CADMIUM",
    "ARSENIC",
    "CHROMIUM",
    "NICKEL",
  ];

  const metalLabels = {
    LEAD: "Lead (Pb)",
    MERCURY: "Mercury (Hg)",
    CADMIUM: "Cadmium (Cd)",
    ARSENIC: "Arsenic (As)",
    CHROMIUM: "Chromium (Cr)",
    NICKEL: "Nickel (Ni)",
  };

  // Form state: array of readings
  const [readings, setReadings] = useState([]);

  // Fetch sample info and thresholds on mount
  useEffect(() => {
    const fetchSampleAndThresholds = async () => {
      try {
        setLoadingSample(true);
        setSampleError(null);

        // Use provided sample data if available, otherwise fetch from API
        if (sampleData) {
          setSample(sampleData);
        } else {
          // Fetch sample details from API
          const sampleRes = await api.get(`/samples/${sampleId}`);
          if (sampleRes.data.success) {
            setSample(sampleRes.data.data);
          }
        }

        // Fetch thresholds
        const thresholdsRes = await api.get("/thresholds");
        if (thresholdsRes.data.success) {
          setThresholds(thresholdsRes.data.data || []);
        }

        // Initialize readings array with existing readings
        if (existingReadings && existingReadings.length > 0) {
          setReadings(
            existingReadings.map((r) => ({
              heavyMetal: r.heavyMetal,
              xrfReading: r.xrfReading || "",
              xrfNotes: r.xrfNotes || "",
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching sample:", err);
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          "Failed to load sample information";
        setSampleError(errorMsg);
      } finally {
        setLoadingSample(false);
      }
    };

    fetchSampleAndThresholds();
  }, [sampleId]);

  // Clear success/error messages when modal mounts
  useEffect(() => {
    return () => {
      dispatch(clearHeavyMetalState());
    };
  }, [dispatch]);

  // Get unit based on sample type
  const getUnit = () => {
    if (!sample) return "mg/kg";
    return sample.sampleType === "LIQUID" ? "mg/L" : "mg/kg";
  };

  const getUnitLabel = () => {
    return getUnit() === "mg/L" ? "mg/L" : "mg/kg";
  };

  // Get threshold for metal
  const getThreshold = (metal) => {
    if (!sample) return null;
    return thresholds.find(
      (t) =>
        t.heavyMetal === metal &&
        t.productCategoryId === sample.productVariant?.categoryId
    );
  };

  // Determine status based on reading and threshold
  const getStatus = (reading, metal) => {
    const threshold = getThreshold(metal);
    if (!threshold || !reading) return "UNKNOWN";

    const value = parseFloat(reading);
    if (value < threshold.safeLimit) return "SAFE";
    if (threshold.warningLimit && value < threshold.warningLimit)
      return "MODERATE";
    if (value < threshold.dangerLimit) return "MODERATE";
    return "CONTAMINATED";
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "SAFE":
        return theme.safe;
      case "MODERATE":
        return theme.moderate;
      case "CONTAMINATED":
        return theme.danger;
      default:
        return `${theme.card} ${theme.textMuted}`;
    }
  };

  // Add new reading row
  const addReading = () => {
    const usedMetals = readings.map((r) => r.heavyMetal);
    const availableMetal = heavyMetals.find((m) => !usedMetals.includes(m));

    if (availableMetal) {
      setReadings([
        ...readings,
        {
          heavyMetal: availableMetal,
          xrfReading: "",
          xrfNotes: "",
        },
      ]);
    }
  };

  // Remove reading row
  const removeReading = (index) => {
    setReadings(readings.filter((_, i) => i !== index));
  };

  // Update reading
  const updateReading = (index, field, value) => {
    const updated = [...readings];
    updated[index] = { ...updated[index], [field]: value };
    setReadings(updated);
  };

  // Change metal in reading
  const changeMetal = (index, newMetal) => {
    const usedMetals = readings
      .map((r, i) => (i === index ? newMetal : r.heavyMetal))
      .filter((m) => m);
    if (usedMetals.filter((m) => m === newMetal).length > 1) {
      alert("This metal is already selected");
      return;
    }
    updateReading(index, "heavyMetal", newMetal);
  };

  // Submit readings
  const handleSubmit = async () => {
    if (!readings || readings.length === 0) {
      alert("Please add at least one reading");
      return;
    }

    const valid = readings.every((r) => r.heavyMetal && r.xrfReading);
    if (!valid) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const result = await dispatch(
        batchAddXRFReadings({
          sampleId,
          readings: readings.map((r) => ({
            heavyMetal: r.heavyMetal,
            xrfReading: r.xrfReading,
            xrfNotes: r.xrfNotes || "",
          })),
        })
      ).unwrap();

      console.log(
        `Successfully recorded ${
          result.data?.length || readings.length
        } reading(s)`
      );

      await dispatch(getSampleReadings(sampleId));
      onClose();
    } catch (err) {
      console.error("Error submitting readings:", err);
      alert("Failed to save readings: " + (err?.message || "Unknown error"));
    }
  };

  // Determine worst contamination level
  const getWorstLevel = () => {
    if (!readings.length) return "unknown";
    const statuses = readings.map((r) => getStatus(r.xrfReading, r.heavyMetal));
    if (statuses.includes("CONTAMINATED")) return "dangerous";
    if (statuses.includes("MODERATE")) return "elevated";
    return "safe";
  };

  if (loadingSample) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[5000]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-center max-w-sm w-full">
          <div className="animate-spin inline-flex items-center justify-center w-8 h-8 mb-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Loading sample information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[5000] overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full my-4 flex flex-col border-2 border-gray-200 dark:border-gray-700 max-h-[95vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl sticky top-0 z-10">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <Beaker className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
                  Heavy Metal Analysis
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  Record XRF screening results
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {sampleError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm">
              {sampleError}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {/* Sample Info */}
          {sample && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-0.5">Sample ID</p>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {sample.sampleId}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-0.5">Product</p>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {sample.productName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-0.5">Type</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {sample.sampleType}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-0.5">Unit</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    {getUnitLabel()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Readings Table */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Heavy Metal Readings
              </h3>
              <button
                onClick={addReading}
                disabled={readings.length >= heavyMetals.length}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add Metal
              </button>
            </div>

            {readings.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 sm:p-8 text-center">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  No readings added yet. Click "Add Metal" to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {readings.map((reading, index) => {
                  const threshold = getThreshold(reading.heavyMetal);
                  const status = getStatus(
                    reading.xrfReading,
                    reading.heavyMetal
                  );

                  return (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {/* Metal Selection */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                              Heavy Metal
                            </label>
                            <select
                              value={reading.heavyMetal}
                              onChange={(e) =>
                                changeMetal(index, e.target.value)
                              }
                              className="w-full px-2.5 py-2 sm:px-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none"
                            >
                              <option value="">Select Metal</option>
                              {heavyMetals.map((metal) => {
                                const isUsed = readings.some(
                                  (r, i) =>
                                    i !== index && r.heavyMetal === metal
                                );
                                return (
                                  <option
                                    key={metal}
                                    value={metal}
                                    disabled={isUsed}
                                  >
                                    {metalLabels[metal]}
                                    {isUsed ? " (Selected)" : ""}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {/* XRF Reading */}
                          <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                              XRF Reading ({getUnitLabel()})
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={reading.xrfReading}
                              onChange={(e) =>
                                updateReading(
                                  index,
                                  "xrfReading",
                                  e.target.value
                                )
                              }
                              placeholder="Enter value"
                              className="w-full px-2.5 py-2 sm:px-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none"
                            />
                          </div>

                          {/* Status Display */}
                          {reading.xrfReading && (
                            <div className="sm:col-span-2 lg:col-span-1">
                              <label className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                                Status
                              </label>
                              <div
                                className={`px-2.5 py-2 sm:px-3 rounded-lg font-semibold text-center text-xs sm:text-sm ${getStatusColor(
                                  status
                                )}`}
                              >
                                {status}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeReading(index)}
                          className="sm:mt-6 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors self-start"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1.5 sm:mb-2">
                          Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={reading.xrfNotes}
                          onChange={(e) =>
                            updateReading(index, "xrfNotes", e.target.value)
                          }
                          placeholder="Add any observations..."
                          className="w-full px-2.5 py-2 sm:px-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      {/* Threshold Info */}
                      {threshold && reading.xrfReading && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <p>
                            Safe: &lt;{threshold.safeLimit} | Warning:{" "}
                            {threshold.warningLimit} | Danger: &gt;
                            {threshold.dangerLimit}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Warning for contaminated readings */}
          {getWorstLevel() !== "safe" && readings.length > 0 && (
            <div
              className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                getWorstLevel() === "dangerous"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-600"
                  : "bg-orange-50 dark:bg-orange-900/20 border-orange-600"
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle
                  className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 ${
                    getWorstLevel() === "dangerous"
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm sm:text-base ${
                      getWorstLevel() === "dangerous"
                        ? "text-red-800 dark:text-red-200"
                        : "text-orange-800 dark:text-orange-200"
                    }`}
                  >
                    {getWorstLevel() === "dangerous"
                      ? "Critical Contamination Detected"
                      : "Elevated Contamination Detected"}
                  </p>
                  <p
                    className={`text-xs sm:text-sm mt-1 ${
                      getWorstLevel() === "dangerous"
                        ? "text-red-700 dark:text-red-300"
                        : "text-orange-700 dark:text-orange-300"
                    }`}
                  >
                    Some readings exceed safe limits. Please review before
                    submitting.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-200 dark:border-gray-700 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              disabled={loading || readings.length === 0}
              onClick={handleSubmit}
              className={`flex-1 px-4 py-2.5 sm:px-6 sm:py-3 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : getWorstLevel() === "dangerous"
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : getWorstLevel() === "elevated"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="truncate">Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">
                    Save {readings.length} Reading
                    {readings.length !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeavyMetalFormModalNew;