import React, { useState, useEffect, useMemo } from "react";
import { Search, Download, Lock } from "lucide-react";
import api from "../../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../../redux/slice/samplesSlice";
import { useTheme } from "../../hooks/useTheme";
import { filterSamples } from "../../utils/helpers";
import { getContaminationStatus } from "../../utils/chartDataHelpers";
import SampleDetailModal from "../modals/SampleDetailModal";

// Helper to get max heavy metal reading for display
const getMaxReading = (heavyMetalReadings) => {
  if (!heavyMetalReadings || heavyMetalReadings.length === 0) return null;

  let maxReading = 0;
  heavyMetalReadings.forEach((reading) => {
    const xrf = reading.xrfReading ? parseFloat(reading.xrfReading) : 0;
    const aas = reading.aasReading ? parseFloat(reading.aasReading) : 0;
    maxReading = Math.max(maxReading, xrf, aas);
  });
  return maxReading > 0 ? maxReading : null;
};

const Database = ({
  theme: propTheme,
  searchTerm: propSearchTerm,
  setSearchTerm: propSetSearchTerm,
  filterState: propFilterState,
  setFilterState: propSetFilterState,
  filterProduct: propFilterProduct,
  setFilterProduct: propSetFilterProduct,
  filterStatus: propFilterStatus,
  setFilterStatus: propSetFilterStatus,
  filteredSamples: propFilteredSamples,
  setSelectedSample: propSetSelectedSample,
  states: propStates,
}) => {
  const dispatch = useDispatch();
  const { theme: hookTheme } = useTheme();
  const { samples: reduxSamples } = useSelector((state) => state.samples);
  const { currentUser } = useSelector((state) => state.auth);

  // Block DATA_COLLECTOR from accessing this view
  const isDataCollector = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "") === "datacollector";
  if (isDataCollector) {
    return (
      <div className={`${hookTheme?.bg} min-h-screen flex items-center justify-center p-4`}>
        <div className={`${hookTheme?.card} rounded-lg border ${hookTheme?.border} shadow-md p-8 text-center max-w-md`}>
          <Lock className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <h2 className={`${hookTheme?.text} text-2xl font-bold mb-2`}>Access Restricted</h2>
          <p className={hookTheme?.textMuted}>
            Data collectors can only view their own collected samples in the <strong>My Samples</strong> section.
          </p>
        </div>
      </div>
    );
  }

  // Check if user is HEAD_RESEARCHER (only role that can see Collected By column)
  const isHeadResearcher = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "") === "headresearcher";

  // Local state for standalone mode
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localFilterState, setLocalFilterState] = useState("all");
  const [localFilterCategory, setLocalFilterCategory] = useState("all");
  const [localFilterProduct, setLocalFilterProduct] = useState("all");
  const [localFilterStatus, setLocalFilterStatus] = useState("all");
  const [localSelectedSample, setLocalSelectedSample] = useState(null);
  const [localStates, setLocalStates] = useState([]);

  // Use props if provided, otherwise fall back to local/Redux values
  const theme = propTheme || hookTheme;
  const searchTerm = propSearchTerm ?? localSearchTerm;
  const setSearchTerm = propSetSearchTerm || setLocalSearchTerm;
  const filterState = propFilterState ?? localFilterState;
  const setFilterState = propSetFilterState || setLocalFilterState;
  const filterCategory = localFilterCategory; // Category is local only for now
  const setFilterCategory = setLocalFilterCategory;
  const filterProduct = propFilterProduct ?? localFilterProduct;
  const setFilterProduct = propSetFilterProduct || setLocalFilterProduct;
  const filterStatus = propFilterStatus ?? localFilterStatus;
  const setFilterStatus = propSetFilterStatus || setLocalFilterStatus;
  const setSelectedSample = propSetSelectedSample || setLocalSelectedSample;
  const states = propStates || localStates;

  // Compute filtered samples if not provided via props
  const computedFilteredSamples = useMemo(() => {
    if (propFilteredSamples) return propFilteredSamples;
    return filterSamples(reduxSamples || [], searchTerm, filterState, filterCategory, filterProduct, filterStatus);
  }, [propFilteredSamples, reduxSamples, searchTerm, filterState, filterCategory, filterProduct, filterStatus]);

  const filteredSamples = computedFilteredSamples;

  // Fetch samples and states on mount if standalone
  useEffect(() => {
    if (!propFilteredSamples) {
      dispatch(fetchSamples());
    }
  }, [dispatch, propFilteredSamples]);

  useEffect(() => {
    if (!propStates) {
      const fetchStates = async () => {
        try {
          const response = await api.get("/management/states");
          setLocalStates(response.data.data || []);
        } catch (err) {
          console.error("Failed to fetch states:", err);
        }
      };
      fetchStates();
    }
  }, [propStates]);
  const handleExcelExportClick = async () => {
    try {
      const response = await api.get("/samples/export/data", {
        params: { format: "excel" },
        responseType: "blob",
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `samples-export-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export samples:", error);
      alert("Failed to export samples. Please try again.");
    }
  };

  return (
    <div className={`space-y-4 ${theme?.text} text-base`}>
      <div
        className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-4`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme?.textMuted}`}
            />
            <input
              type="text"
              placeholder="Search samples..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
            />
          </div>

          <div className="w-full max-w-full sm:max-w-[100%]">
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base`}
            >
              <option value="all">All States</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value="all">All Categories</option>
            {[...new Set(reduxSamples.map((s) => s.productVariant?.categoryId))].filter(Boolean).map((categoryId) => {
              const category = reduxSamples.find(s => s.productVariant?.categoryId === categoryId)?.productVariant?.category;
              return (
                <option key={categoryId} value={categoryId}>
                  {category?.name || "Unknown"}
                </option>
              );
            })}
          </select>

          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value="all">All Products</option>
            {[...new Set(reduxSamples.map((s) => s.productVariant?.id))].filter(Boolean).map((variantId) => {
              const variant = reduxSamples.find(s => s.productVariant?.id === variantId)?.productVariant;
              return (
                <option key={variantId} value={variantId}>
                  {variant?.displayName || variant?.name || "Unknown"}
                </option>
              );
            })}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value="all">All Status</option>
            <option value="safe">Safe</option>
            <option value="moderate">Moderate</option>
            <option value="contaminated">Contaminated</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => handleExcelExportClick()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      <div
        className={`${theme?.card} rounded-lg shadow-md border ${theme?.border}`}
      >
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead
              className={
                theme?.card === "bg-gray-800" ? "bg-gray-700" : "bg-gray-100"
              }
            >
              <tr>
                {[
                  "Sample ID",
                  "Product",
                  "Location",
                  ...(isHeadResearcher ? ["Collected By"] : []),
                  "Max Reading (ppm)",
                  "Status",
                  "Date",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className={`px-4 py-3 text-left font-semibold ${theme?.textMuted}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSamples?.map((sample) => {
                const maxReading = getMaxReading(sample?.heavyMetalReadings);
                const sampleStatus = getContaminationStatus(sample).toLowerCase();
                return (
                  <tr key={sample?.id} className={theme?.hover}>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {sample?.sampleId}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{sample?.productName}</div>
                        <div className={`text-xs ${theme?.textMuted}`}>
                          {sample?.brandName || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div>
                          {sample?.lga?.name}, {sample?.state?.name}
                        </div>
                        <div className={`text-xs ${theme.textMuted}`}>
                          {sample?.market?.name || "N/A"}
                        </div>
                      </div>
                    </td>
                    {isHeadResearcher && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-sm">
                          {sample?.creator?.fullName || sample?.creator?.email || "Unknown"}
                        </div>
                        <div className={`text-xs ${theme?.textMuted}`}>
                          {sample?.creator?.role?.replace(/_/g, " ") || "N/A"}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap font-semibold">
                      {maxReading !== null ? (
                        <span
                          className={
                            sampleStatus === "contaminated"
                              ? "text-red-500"
                              : sampleStatus === "moderate"
                              ? "text-amber-500"
                              : "text-green-500"
                          }
                        >
                          {maxReading.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          sampleStatus === "safe"
                            ? "bg-green-100 text-green-800"
                            : sampleStatus === "moderate"
                            ? "bg-amber-100 text-amber-800"
                            : sampleStatus === "contaminated"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {sampleStatus?.toUpperCase() || "PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {sample?.createdAt
                        ? new Date(sample?.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedSample(sample)}
                        className="text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="block sm:hidden space-y-4 p-2">
          {filteredSamples?.map((sample) => {
            const maxReading = getMaxReading(sample?.heavyMetalReadings);
            const sampleStatus = getContaminationStatus(sample).toLowerCase();
            return (
              <div
                key={sample.id}
                className={`${theme?.card} border ${theme?.border} rounded-lg p-4 shadow`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-gray-500">
                    Sample ID
                  </span>
                  <span className="text-sm font-medium">
                    {sample?.sampleId}
                  </span>
                </div>

                <div className="text-sm mb-1">
                  <span className="font-semibold">Product:</span>{" "}
                  {sample?.productName}{" "}
                  <span className={`block text-xs ${theme?.textMuted}`}>
                    {sample?.brandName || "N/A"}
                  </span>
                </div>

                <div className="text-sm mb-1">
                  <span className="font-semibold">Location:</span>{" "}
                  {sample?.lga?.name}, {sample?.state?.name}
                  <div className={`text-xs ${theme?.textMuted}`}>
                    {sample?.market?.name || "N/A"}
                  </div>
                </div>

                {isHeadResearcher && (
                  <div className="text-sm mb-1">
                    <span className="font-semibold">Collected By:</span>{" "}
                    {sample?.creator?.fullName || sample?.creator?.email || "Unknown"}
                    <div className={`text-xs ${theme?.textMuted}`}>
                      {sample?.creator?.role?.replace(/_/g, " ") || "N/A"}
                    </div>
                  </div>
                )}

                <div className="text-sm mb-1">
                  <span className="font-semibold">Max Reading:</span>{" "}
                  {maxReading !== null ? (
                    <span
                      className={`font-semibold ${
                        sampleStatus === "contaminated"
                          ? "text-red-500"
                          : sampleStatus === "moderate"
                          ? "text-amber-500"
                          : "text-green-500"
                      }`}
                    >
                      {maxReading.toLocaleString()} ppm
                    </span>
                  ) : (
                    <span className="text-gray-400">No readings</span>
                  )}
                </div>

                <div className="text-sm mb-1">
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`px-2 py-[2px] text-xs font-semibold rounded-full ${
                      sampleStatus === "safe"
                        ? "bg-green-100 text-green-800"
                        : sampleStatus === "moderate"
                        ? "bg-amber-100 text-amber-800"
                        : sampleStatus === "contaminated"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {sampleStatus?.toUpperCase() || "PENDING"}
                  </span>
                </div>

                <div className="text-sm mb-1">
                  <span className="font-semibold">Date:</span>{" "}
                  {sample?.createdAt
                    ? new Date(sample?.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>

                <button
                  onClick={() => setSelectedSample(sample)}
                  className="mt-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Show modal for standalone mode */}
      {localSelectedSample && !propSetSelectedSample && (
        <SampleDetailModal
          theme={theme}
          sample={localSelectedSample}
          onClose={() => setLocalSelectedSample(null)}
        />
      )}
    </div>
  );
};

export default Database;
