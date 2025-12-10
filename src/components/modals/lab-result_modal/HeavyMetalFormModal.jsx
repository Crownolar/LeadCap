import { X, AlertTriangle, CheckCircle, Beaker } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../utils/api";
import { productTypes } from "../../../utils/constants";
import {
  addOrUpdateHeavyMetal,
  clearHeavyMetalState,
  getSampleReadings,
} from "../../../redux/slice/heavyMetalSlice";

const HeavyMetalFormModal = ({
  theme,
  onClose,
  sampleId,
  existingData = null,
}) => {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector(
    (state) => state.heavyMetal
  );

  const [thresholds, setThresholds] = useState([]);
  const [loadingThresholds, setLoadingThresholds] = useState(true);
  const [selectedProductType, setSelectedProductType] = useState("TIRO");

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

  const [formData, setFormData] = useState({
    sampleId: sampleId || existingData?.sampleId || "",
    heavyMetal: existingData?.heavyMetal || "",
    xrfReading: existingData?.xrfReading || "",
    aasReading: existingData?.aasReading || "",
    unit: existingData?.unit || "ppm",
    notes: existingData?.notes || "",
  });

  // Fetch thresholds from backend on component mount
  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        setLoadingThresholds(true);
        const response = await api.get("/thresholds");
        if (response.data?.success) {
          setThresholds(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch thresholds:", err);
      } finally {
        setLoadingThresholds(false);
      }
    };
    fetchThresholds();
  }, []);

  // Get threshold for selected metal and product type
  const getSelectedMetalThreshold = () => {
    return thresholds.find(
      (t) => t.heavyMetal === formData.heavyMetal && t.productType === selectedProductType
    ) || null;
  };

  const getContaminationLevel = (reading, threshold) => {
    if (!reading || !threshold) return null;
    const val = parseFloat(reading);
    const safeLimit = threshold.safeLimit;
    const warningLimit = threshold.warningLimit || threshold.dangerLimit * 0.5;
    const dangerLimit = threshold.dangerLimit;

    if (val <= safeLimit) return "safe";
    if (val <= warningLimit) return "acceptable";
    if (val <= dangerLimit) return "elevated";
    return "dangerous";
  };

  const getContaminationColor = (level) => {
    switch (level) {
      case "safe":
        return "border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30";
      case "acceptable":
        return "border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30";
      case "elevated":
        return "border-2 border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30";
      case "dangerous":
        return "border-2 border-red-400 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30";
      default:
        return "";
    }
  };

  const getStatusBadgeColor = (level) => {
    switch (level) {
      case "safe":
        return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white";
      case "acceptable":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
      case "elevated":
        return "bg-gradient-to-r from-orange-500 to-orange-600 text-white";
      case "dangerous":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      default:
        return "";
    }
  };

  const getWorstContaminationLevel = () => {
    const threshold = getSelectedMetalThreshold();
    const levels = ["safe", "acceptable", "elevated", "dangerous"];
    const xrfLevel = getContaminationLevel(formData.xrfReading, threshold);
    const aasLevel = getContaminationLevel(formData.aasReading, threshold);
    return levels[
      Math.max(
        levels.indexOf(xrfLevel || "safe"),
        levels.indexOf(aasLevel || "safe")
      )
    ];
  };

  const handleSubmit = async () => {
    if (!formData.sampleId || !formData.heavyMetal)
      return alert("Please provide Sample ID and Heavy Metal");
    if (!formData.xrfReading && !formData.aasReading)
      return alert("Provide at least one reading");

    const payload = {
      ...formData,
      xrfReading: formData.xrfReading
        ? parseFloat(formData.xrfReading)
        : undefined,
      aasReading: formData.aasReading
        ? parseFloat(formData.aasReading)
        : undefined,
    };

    const result = await dispatch(addOrUpdateHeavyMetal(payload));
    if (addOrUpdateHeavyMetal.fulfilled.match(result)) onClose();
    else alert(result.payload || "Failed to save reading");
  };

  const worstLevel = getWorstContaminationLevel();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border-2 border-gray-200 dark:border-gray-700">
        {/* Header - Sticky */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 p-6 rounded-t-2xl sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Beaker className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {existingData ? "Update" : "Add"} Heavy Metal Analysis
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Record XRF and/or AAS laboratory test results
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Sample Information Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Sample Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Sample ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sampleId}
                  disabled={!!sampleId}
                  onChange={(e) =>
                    setFormData({ ...formData, sampleId: e.target.value })
                  }
                  placeholder="Enter sample identifier"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800 font-medium transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Heavy Metal Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.heavyMetal}
                  onChange={(e) =>
                    setFormData({ ...formData, heavyMetal: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none font-medium transition-all"
                >
                  <option value="">Select Heavy Metal</option>
                  {heavyMetals.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Product Type
                </label>
                <select
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none font-medium transition-all"
                >
                  {Object.entries(productTypes).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {getSelectedMetalThreshold() && (
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                      Safe Limit: <span className="text-lg">{getSelectedMetalThreshold()?.safeLimit}</span> ppm
                    </p>
                  </div>
                  {getSelectedMetalThreshold()?.warningLimit && (
                    <p className="text-sm text-blue-800 dark:text-blue-300 ml-7">
                      Warning Limit: <span className="font-semibold">{getSelectedMetalThreshold()?.warningLimit}</span> ppm
                    </p>
                  )}
                  <p className="text-sm text-blue-800 dark:text-blue-300 ml-7">
                    Danger Limit: <span className="font-semibold">{getSelectedMetalThreshold()?.dangerLimit}</span> ppm
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Test Readings Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Laboratory Test Readings
            </h3>

            <div className="space-y-4">
              {["xrfReading", "aasReading"].map((method) => {
                const label =
                  method === "xrfReading"
                    ? "XRF Reading (X-Ray Fluorescence)"
                    : "AAS Reading (Atomic Absorption Spectroscopy)";
                const threshold = getSelectedMetalThreshold();
                const level = getContaminationLevel(formData[method], threshold);
                return (
                  <div
                    key={method}
                    className={`p-5 rounded-xl transition-all ${
                      level
                        ? getContaminationColor(level)
                        : "border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    }`}
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      {label}
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="number"
                        step="0.001"
                        value={formData[method]}
                        onChange={(e) =>
                          setFormData({ ...formData, [method]: e.target.value })
                        }
                        placeholder="Enter reading value"
                        className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none font-medium transition-all"
                      />
                      <span className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold min-w-[80px] text-center">
                        {formData.unit}
                      </span>
                      {level && (
                        <span
                          className={`px-4 py-2 rounded-lg font-bold text-sm uppercase shadow-md ${getStatusBadgeColor(
                            level
                          )}`}
                        >
                          {level}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Notes Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Additional Notes
            </h3>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              placeholder="Optional: Add any relevant observations, anomalies, or technical notes..."
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-600 focus:outline-none font-medium transition-all resize-none"
            />
          </div>

          {/* Warning for dangerous levels */}
          {(worstLevel === "dangerous" || worstLevel === "elevated") && (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                worstLevel === "dangerous"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-600"
                  : "bg-orange-50 dark:bg-orange-900/20 border-orange-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`w-6 h-6 flex-shrink-0 ${
                    worstLevel === "dangerous"
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                />
                <div>
                  <p
                    className={`font-semibold ${
                      worstLevel === "dangerous"
                        ? "text-red-800 dark:text-red-200"
                        : "text-orange-800 dark:text-orange-200"
                    }`}
                  >
                    {worstLevel === "dangerous"
                      ? "Critical Contamination Level Detected"
                      : "Elevated Contamination Level Detected"}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      worstLevel === "dangerous"
                        ? "text-red-700 dark:text-red-300"
                        : "text-orange-700 dark:text-orange-300"
                    }`}
                  >
                    This reading exceeds safe regulatory limits. Please verify
                    measurements and follow proper reporting protocols.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-200 dark:border-gray-700 rounded-b-2xl">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={handleSubmit}
              className={`flex-1 px-6 py-3 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : worstLevel === "dangerous"
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : worstLevel === "elevated"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {existingData ? "Update Reading" : "Save Reading"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeavyMetalFormModal;
