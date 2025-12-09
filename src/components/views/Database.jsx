import React, { useState, useEffect, useMemo } from "react";
import { Search, Download } from "lucide-react";
import { productTypes } from "../../utils/constants";
import api from "../../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../../redux/slice/samplesSlice";
import { useTheme } from "../../hooks/useTheme";
import { filterSamples } from "../../utils/helpers";
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

  // Local state for standalone mode
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localFilterState, setLocalFilterState] = useState("all");
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
  const filterProduct = propFilterProduct ?? localFilterProduct;
  const setFilterProduct = propSetFilterProduct || setLocalFilterProduct;
  const filterStatus = propFilterStatus ?? localFilterStatus;
  const setFilterStatus = propSetFilterStatus || setLocalFilterStatus;
  const setSelectedSample = propSetSelectedSample || setLocalSelectedSample;
  const states = propStates || localStates;

  // Compute filtered samples if not provided via props
  const computedFilteredSamples = useMemo(() => {
    if (propFilteredSamples) return propFilteredSamples;
    return filterSamples(reduxSamples || [], searchTerm, filterState, filterProduct, filterStatus);
  }, [propFilteredSamples, reduxSamples, searchTerm, filterState, filterProduct, filterStatus]);

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
          const response = await api.get("/samples/states/all");
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value="all">All Products</option>
            {Object.entries(productTypes).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value="all">All Status</option>
            <option value="safe">Safe</option>
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
                    <td className="px-4 py-3 whitespace-nowrap font-semibold">
                      {maxReading !== null ? (
                        <span
                          className={
                            sample?.status === "contaminated"
                              ? "text-red-500"
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
                          sample?.status === "safe"
                            ? "bg-green-100 text-green-800"
                            : sample?.status === "contaminated"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {sample?.status?.toUpperCase() || "PENDING"}
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

                <div className="text-sm mb-1">
                  <span className="font-semibold">Max Reading:</span>{" "}
                  {maxReading !== null ? (
                    <span
                      className={`font-semibold ${
                        sample?.status === "contaminated"
                          ? "text-red-500"
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
                      sample?.status === "safe"
                        ? "bg-green-100 text-green-800"
                        : sample?.status === "contaminated"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {sample?.status?.toUpperCase() || "PENDING"}
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

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchSamples } from "../../redux/slice/samplesSlice";
// import { Search, Download } from "lucide-react";
// import { statesData, productTypes } from "../../utils/constants";
// import { handleExcelExport } from "../../utils/helpers";

// const Database = ({ theme }) => {
//   const dispatch = useDispatch();
//   const { samples, loading } = useSelector((state) => state.samples);

//   // Filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterState, setFilterState] = useState("all");
//   const [filterProduct, setFilterProduct] = useState("all");
//   const [filterStatus, setFilterStatus] = useState("all");

//   const [selectedSample, setSelectedSample] = useState(null);

//   // Fetch samples on mount
//   useEffect(() => {
//     dispatch(fetchSamples({ page: 1, limit: 100 }));
//   }, [dispatch]);

//   // Local filtering
//   const filteredSamples = samples.filter((sample) => {
//     const matchesSearch =
//       sample.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       sample.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesState =
//       filterState === "all" || sample.state?.name === filterState;

//     const matchesProduct =
//       filterProduct === "all" || sample.productType?.name === filterProduct;

//     const matchesStatus =
//       filterStatus === "all" || sample.status === filterStatus;

//     return matchesSearch && matchesState && matchesProduct && matchesStatus;
//   });

//   return (
//     <div className={`space-y-4 ${theme?.text} text-base`}>
//       {loading && <p className="text-center py-4">Loading samples...</p>}

//       <div
//         className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-4`}
//       >
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="relative">
//             <Search
//               className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme?.textMuted}`}
//             />
//             <input
//               type="text"
//               placeholder="Search samples..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className={`w-full pl-10 pr-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
//             />
//           </div>

//           <select
//             value={filterState}
//             onChange={(e) => setFilterState(e.target.value)}
//             className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
//           >
//             <option value="all">All States</option>

//             {[
//               ...new Map(
//                 samples
//                   .filter((s) => s.state?.name)
//                   .map((s) => [s.state.id, s.state])
//               ).values(),
//             ].map((stateObj) => (
//               <option key={stateObj.id} value={stateObj.name}>
//                 {stateObj.name}
//               </option>
//             ))}
//           </select>
//           <select
//             value={filterProduct}
//             onChange={(e) => setFilterProduct(e.target.value)}
//             className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
//           >
//             <option value="all">All Products</option>

//             {[
//               ...new Map(
//                 samples
//                   .filter((s) => s.productType?.name)
//                   .map((s) => [s.productType.id, s.productType])
//               ).values(),
//             ].map((p) => (
//               <option key={p.id} value={p.name}>
//                 {p.name}
//               </option>
//             ))}
//           </select>

//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
//           >
//             <option value="all">All Status</option>
//             <option value="safe">Safe</option>
//             <option value="contaminated">Contaminated</option>
//             <option value="pending">Pending</option>
//           </select>
//         </div>

//         <div className="flex justify-end mt-4">
//           <button
//             onClick={() => handleExcelExport(filteredSamples)}
//             className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
//           >
//             <Download className="w-4 h-4" />
//             Export Excel
//           </button>
//         </div>
//       </div>

//       <div
//         className={`${theme?.card} rounded-lg shadow-md border ${theme?.border}`}
//       >
//         <div className="hidden sm:block overflow-x-auto">
//           <table className="w-full min-w-[800px] text-sm">
//             <thead
//               className={
//                 theme?.card === "bg-gray-800" ? "bg-gray-700" : "bg-gray-100"
//               }
//             >
//               <tr>
//                 {[
//                   "Sample ID",
//                   "Product",
//                   "Location",
//                   "Lead Level (ppm)",
//                   "Status",
//                   "Date",
//                   "Actions",
//                 ].map((header) => (
//                   <th
//                     key={header}
//                     className={`px-4 py-3 text-left font-semibold ${theme?.textMuted}`}
//                   >
//                     {header}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filteredSamples.map((sample) => (
//                 <tr key={sample.id} className={`${theme?.hover}`}>
//                   <td className="px-4 py-3 font-medium">{sample.id}</td>
//                   <td className="px-4 py-3">
//                     <div className={`${theme?.text}`}>
//                       <div className="font-medium">{sample.productName}</div>
//                       <div className={`text-xs ${theme?.textMuted}`}>
//                         {sample.brand || sample.productType?.name || "-"}
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className={`${theme?.text}`}>
//                       {sample.lga}, {sample.state?.name || "-"}
//                       <div className={`text-xs ${theme?.textMuted}`}>
//                         {sample.market?.name || "-"}
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 font-semibold">
//                     <span
//                       className={
//                         sample.leadLevel > 1000
//                           ? "text-red-400"
//                           : "text-green-400"
//                       }
//                     >
//                       {sample.leadLevel?.toLocaleString() || "-"}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3">
//                     <span
//                       className={`px-2 py-1 text-xs font-bold rounded-full ${
//                         sample.status === "safe"
//                           ? "bg-green-500/20 text-green-400"
//                           : sample.status === "contaminated"
//                           ? "bg-red-500/20 text-red-400"
//                           : "bg-yellow-500/20 text-yellow-400"
//                       }`}
//                     >
//                       {sample.status?.toUpperCase() || "-"}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3">{sample.date || "-"}</td>
//                   <td className="px-4 py-3">
//                     <button
//                       onClick={() => setSelectedSample(sample)}
//                       className="text-emerald-400 hover:text-emerald-300 font-medium"
//                     >
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Mobile view */}
//         <div className="block sm:hidden space-y-4 p-3">
//           {filteredSamples.map((sample) => (
//             <div
//               key={sample.id}
//               className={`${theme?.card} border ${theme?.border} rounded-lg p-4 shadow`}
//             >
//               <div className="font-semibold text-sm mb-2">
//                 Sample ID: {sample.id}
//               </div>
//               <div className="text-sm mb-1">
//                 <span className="font-semibold">Product:</span>{" "}
//                 {sample.productName}
//                 <div className={`text-xs ${theme?.textMuted}`}>
//                   {sample.brand || sample.productType?.name || "-"}
//                 </div>
//               </div>
//               <div className="text-sm mb-1">
//                 <span className="font-semibold">Location:</span> {sample.lga},{" "}
//                 {sample.state?.name || "-"}
//                 <div className={`text-xs ${theme?.textMuted}`}>
//                   {sample.market?.name || "-"}
//                 </div>
//               </div>
//               <div className="text-sm mb-1">
//                 <span className="font-semibold">Lead Level:</span>{" "}
//                 <span
//                   className={
//                     sample.leadLevel > 1000 ? "text-red-400" : "text-green-400"
//                   }
//                 >
//                   {sample.leadLevel?.toLocaleString() || "-"} ppm
//                 </span>
//               </div>
//               <div className="text-sm mb-1">
//                 <span className="font-semibold">Status:</span>{" "}
//                 <span
//                   className={`px-2 py-[2px] text-xs font-bold rounded-full ${
//                     sample.status === "safe"
//                       ? "bg-green-500/20 text-green-400"
//                       : sample.status === "contaminated"
//                       ? "bg-red-500/20 text-red-400"
//                       : "bg-yellow-500/20 text-yellow-400"
//                   }`}
//                 >
//                   {sample.status?.toUpperCase() || "-"}
//                 </span>
//               </div>
//               <div className="text-sm mb-1">
//                 <span className="font-semibold">Date:</span>{" "}
//                 {sample.date || "-"}
//               </div>
//               <button
//                 onClick={() => setSelectedSample(sample)}
//                 className="mt-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
//               >
//                 View Details
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Database;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchSamples } from "../../redux/slice/samplesSlice";
// import { Search, Download } from "lucide-react";
// import { handleExcelExport } from "../../utils/helpers";

// const Database = ({ theme }) => {
//   const dispatch = useDispatch();
//   const { samples, loading } = useSelector((state) => state.samples);

//   // Filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterState, setFilterState] = useState("all");
//   const [filterProduct, setFilterProduct] = useState("all");
//   const [filterStatus, setFilterStatus] = useState("all");

//   const [selectedSample, setSelectedSample] = useState(null);

//   // Fetch samples on mount
//   useEffect(() => {
//     dispatch(fetchSamples({ page: 1, limit: 100 }));
//   }, [dispatch]);

//   // Extract unique state options
//   const uniqueStates = [
//     ...new Map(
//       samples.filter((s) => s.state?.name).map((s) => [s.state.id, s.state])
//     ).values(),
//   ];

//   // Extract unique product types
//   const uniqueProductTypes = [
//     ...new Map(
//       samples
//         .filter((s) => s.productType?.name)
//         .map((s) => [s.productType.id, s.productType])
//     ).values(),
//   ];

//   // Local filtering
//   const filteredSamples = samples.filter((sample) => {
//     const matchesSearch =
//       sample.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       sample.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesState =
//       filterState === "all" || sample.state?.name === filterState;

//     const matchesProduct =
//       filterProduct === "all" || sample.productType?.name === filterProduct;

//     const matchesStatus =
//       filterStatus === "all" || sample.status === filterStatus;

//     return matchesSearch && matchesState && matchesProduct && matchesStatus;
//   });

//   return (
//     <div className={`space-y-4 ${theme?.text} text-base`}>
//       {loading && <p className="text-center py-4">Loading samples...</p>}

//       {/* ===================== FILTERS CARD ===================== */}
//       <div
//         className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-4`}
//       >
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {/* Search */}
//           <div className="relative">
//             <Search
//               className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme?.textMuted}`}
//             />
//             <input
//               type="text"
//               placeholder="Search samples..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className={`w-full pl-10 pr-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
//             />
//           </div>

//           {/* State Filter */}
//           <select
//             value={filterState}
//             onChange={(e) => setFilterState(e.target.value)}
//             className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
//           >
//             <option value="all">All States</option>
//             {uniqueStates.map((stateObj) => (
//               <option key={stateObj.id} value={stateObj.name}>
//                 {stateObj.name}
//               </option>
//             ))}
//           </select>

//           {/* Product Filter */}
//           <select
//             value={filterProduct}
//             onChange={(e) => setFilterProduct(e.target.value)}
//             className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
//           >
//             <option value="all">All Products</option>
//             {uniqueProductTypes.map((p) => (
//               <option key={p.id} value={p.name}>
//                 {p.name}
//               </option>
//             ))}
//           </select>

//           {/* Status Filter */}
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
//           >
//             <option value="all">All Status</option>
//             <option value="safe">Safe</option>
//             <option value="contaminated">Contaminated</option>
//             <option value="pending">Pending</option>
//           </select>
//         </div>

//         <div className="flex justify-end mt-4">
//           <button
//             onClick={() => handleExcelExport(filteredSamples)}
//             className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
//           >
//             <Download className="w-4 h-4" />
//             Export Excel
//           </button>
//         </div>
//       </div>

//       {/* ===================== TABLE ===================== */}
//       <div
//         className={`${theme?.card} rounded-lg shadow-md border ${theme?.border}`}
//       >
//         <div className="hidden sm:block overflow-x-auto">
//           <table className="w-full min-w-[800px] text-sm">
//             <thead
//               className={
//                 theme?.card === "bg-gray-800" ? "bg-gray-700" : "bg-gray-100"
//               }
//             >
//               <tr>
//                 {[
//                   "Sample ID",
//                   "Product",
//                   "Location",
//                   "Lead Level (ppm)",
//                   "Status",
//                   "Date",
//                   "Actions",
//                 ].map((header) => (
//                   <th
//                     key={header}
//                     className={`px-4 py-3 text-left font-semibold ${theme?.textMuted}`}
//                   >
//                     {header}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {filteredSamples.map((sample) => (
//                 <tr key={sample.id} className={`${theme?.hover}`}>
//                   <td className="px-4 py-3 font-medium">{sample.id}</td>

//                   {/* Product */}
//                   <td className="px-4 py-3">
//                     <div className={`${theme?.text}`}>
//                       <div className="font-medium">{sample.productName}</div>
//                       <div className={`text-xs ${theme?.textMuted}`}>
//                         {sample.brand || sample.productType?.name || "-"}
//                       </div>
//                     </div>
//                   </td>

//                   {/* Location */}
//                   <td className="px-4 py-3">
//                     <div className={`${theme?.text}`}>
//                       {sample.lga}, {sample.state?.name || "-"}
//                       <div className={`text-xs ${theme?.textMuted}`}>
//                         {sample.market?.name || "-"}
//                       </div>
//                     </div>
//                   </td>

//                   {/* Lead Level */}
//                   <td className="px-4 py-3 font-semibold">
//                     <span
//                       className={
//                         sample.leadLevel > 1000
//                           ? "text-red-400"
//                           : "text-green-400"
//                       }
//                     >
//                       {sample.leadLevel?.toLocaleString() || "-"}
//                     </span>
//                   </td>

//                   {/* Status */}
//                   <td className="px-4 py-3">
//                     <span
//                       className={`px-2 py-1 text-xs font-bold rounded-full ${
//                         sample.status === "safe"
//                           ? "bg-green-500/20 text-green-400"
//                           : sample.status === "contaminated"
//                           ? "bg-red-500/20 text-red-400"
//                           : "bg-yellow-500/20 text-yellow-400"
//                       }`}
//                     >
//                       {sample.status?.toUpperCase() || "-"}
//                     </span>
//                   </td>

//                   {/* Date */}
//                   <td className="px-4 py-3">{sample.date || "-"}</td>

//                   {/* Action */}
//                   <td className="px-4 py-3">
//                     <button
//                       onClick={() => setSelectedSample(sample)}
//                       className="text-emerald-400 hover:text-emerald-300 font-medium"
//                     >
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* ===================== MOBILE VIEW ===================== */}
//         <div className="block sm:hidden space-y-4 p-3">
//           {filteredSamples.map((sample) => (
//             <div
//               key={sample.id}
//               className={`${theme?.card} border ${theme?.border} rounded-lg p-4 shadow`}
//             >
//               <div className="font-semibold text-sm mb-2">
//                 Sample ID: {sample.id}
//               </div>

//               <div className="text-sm mb-1">
//                 <span className="font-semibold">Product:</span>{" "}
//                 {sample.productName}
//                 <div className={`text-xs ${theme?.textMuted}`}>
//                   {sample.brand || sample.productType?.name || "-"}
//                 </div>
//               </div>

//               <div className="text-sm mb-1">
//                 <span className="font-semibold">Location:</span> {sample.lga},{" "}
//                 {sample.state?.name || "-"}
//                 <div className={`text-xs ${theme?.textMuted}`}>
//                   {sample.market?.name || "-"}
//                 </div>
//               </div>

//               <div className="text-sm mb-1">
//                 <span className="font-semibold">Lead Level:</span>{" "}
//                 {sample.leadLevel?.toLocaleString() || "-"} ppm
//               </div>

//               <div className="text-sm mb-2">
//                 <span className="font-semibold">Status:</span>{" "}
//                 {sample.status?.toUpperCase()}
//               </div>

//               <button
//                 onClick={() => setSelectedSample(sample)}
//                 className="text-emerald-400 hover:text-emerald-300 font-medium"
//               >
//                 View
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Database;
