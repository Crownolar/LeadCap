import React from "react";
import { Search, Download } from "lucide-react";
import { statesData, productTypes } from "../../utils/constants";
import { handleExcelExport } from "../../utils/helpers";

const Database = ({
  theme,
  searchTerm,
  setSearchTerm,
  filterState,
  setFilterState,
  filterProduct,
  setFilterProduct,
  filterStatus,
  setFilterStatus,
  filteredSamples,
  setSelectedSample,
}) => {
  return (
    <div className={`space-y-4 ${theme?.text} text-base`}>
      
      <div className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme?.textMuted}`} />
            <input
              type="text"
              placeholder="Search samples..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
            />
          </div>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value="all">All States</option>
            {Object.keys(statesData).map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value="all">All Products</option>
            {Object.entries(productTypes).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
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
            onClick={() => handleExcelExport(filteredSamples)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      <div className={`${theme?.card} rounded-lg shadow-md border ${theme?.border}`}>
        
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className={theme?.card === "bg-gray-800" ? "bg-gray-700" : "bg-gray-100"}>
              <tr>
                {["Sample ID", "Product", "Location", "Lead Level (ppm)", "Status", "Date", "Actions"].map((header) => (
                  <th key={header} className={`px-4 py-3 text-left font-semibold ${theme?.textMuted}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredSamples?.map((sample) => (
                <tr key={sample.id} className={`${theme?.hover}`}>
                  <td className="px-4 py-3 font-medium">{sample.id}</td>

                  <td className="px-4 py-3">
                    <div className={`${theme?.text}`}>
                      <div className="font-medium">{sample.productName}</div>
                      <div className={`text-xs ${theme?.textMuted}`}>{sample.brand}</div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className={`${theme?.text}`}>
                      {sample.lga}, {sample.state}
                      <div className={`text-xs ${theme?.textMuted}`}>{sample.market}</div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    <span className={sample.leadLevel > 1000 ? "text-red-400" : "text-green-400"}>
                      {sample.leadLevel?.toLocaleString()}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`
                        px-2 py-1 text-xs font-bold rounded-full
                        ${
                          sample.status === "safe"
                            ? "bg-green-500/20 text-green-400"
                            : sample.status === "contaminated"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }
                      `}
                    >
                      {sample.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-3">{sample.date}</td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedSample(sample)}
                      className="text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        <div className="block sm:hidden space-y-4 p-3">
          {filteredSamples?.map((sample) => (
            <div key={sample.id} className={`${theme?.card} border ${theme?.border} rounded-lg p-4 shadow`}>
              
              <div className="font-semibold text-sm mb-2">Sample ID: {sample.id}</div>

              <div className="text-sm mb-1">
                <span className="font-semibold">Product:</span> {sample.productName}
                <div className={`text-xs ${theme?.textMuted}`}>{sample.brand}</div>
              </div>

              <div className="text-sm mb-1">
                <span className="font-semibold">Location:</span> {sample.lga}, {sample.state}
                <div className={`text-xs ${theme?.textMuted}`}>{sample.market}</div>
              </div>

              <div className="text-sm mb-1">
                <span className="font-semibold">Lead Level:</span>{" "}
                <span className={sample.leadLevel > 1000 ? "text-red-400" : "text-green-400"}>
                  {sample.leadLevel?.toLocaleString()} ppm
                </span>
              </div>

              <div className="text-sm mb-1">
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`
                    px-2 py-[2px] text-xs font-bold rounded-full
                    ${
                      sample.status === "safe"
                        ? "bg-green-500/20 text-green-400"
                        : sample.status === "contaminated"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }
                  `}
                >
                  {sample.status.toUpperCase()}
                </span>
              </div>

              <div className="text-sm mb-1">
                <span className="font-semibold">Date:</span> {sample.date}
              </div>

              <button
                onClick={() => setSelectedSample(sample)}
                className="mt-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Database;
