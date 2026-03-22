import { Search, Download, Lock, Loader } from "lucide-react";
import api from "../../utils/api";

import { getContaminationStatus } from "../../utils/chartDataHelpers";
import SampleDetailModal from "../modals/SampleDetailModal";
import { useTheme } from "../../context/ThemeContext";
import { useState } from "react";
import { useNavigate } from "react-router";

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

const DatabaseView = ({
  theme,
  loading,
  samples,
  states,
  currentUser,
  searchTerm,
  setSearchTerm,
  filterState,
  setFilterState,
  filterProductVariant,
  setFilterProductVariant,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  filteredSamples,
  selectedSample,
  setSelectedSample,
  fetchStateError,
}) => {
  const isDataCollector =
    currentUser?.role?.toLowerCase().replace(/[\s_]/g, "") === "datacollector";

  if (isDataCollector) {
    return (
      <div
        className={`${theme?.bg} min-h-screen flex items-center justify-center p-4`}
      >
        <div
          className={`${theme?.card} rounded-lg border ${theme?.border} shadow-md p-8 text-center max-w-md`}
        >
          <Lock className='w-16 h-16 mx-auto mb-4 text-yellow-600' />
          <h2 className={`${theme?.text} text-2xl font-bold mb-2`}>
            Access Restricted
          </h2>
          <p className={theme?.textMuted}>
            Data collectors can only view their own collected samples in the{" "}
            <strong>My Samples</strong> section.
          </p>
        </div>
      </div>
    );
  }

  const normalizedRole =
    currentUser?.role?.toLowerCase().replace(/[\s_]/g, "") ?? "";
  const isHeadResearcher = normalizedRole === "headresearcher";
  const isSuperAdmin = normalizedRole === "superadmin";
  const canSeeCollector = isSuperAdmin || isHeadResearcher;

  const handleExcelExportClick = async () => {
    try {
      const response = await api.get("/samples/export/data", {
        params: { format: "excel" },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `samples-export-${new Date().toISOString().split("T")[0]}.xlsx`,
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
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    sample: null,
  });
  const navigate = useNavigate();
  const handleDeleteSample = (sample) => {
    console.log(sample);
    api
      .delete(`samples/${sample.id}`)
      .then((res) => {
        console.log(res.data);
        setTimeout(() => {
          setDeleteConfirmModal({ isOpen: false, sample: null });
        }, 1000);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const DeleteConfirmModalComp = ({
    show,
    action,
    onConfirm,
    onCancel,
    theme,
  }) => {
    if (!show) return null;

    return (
      <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50'>
        <div
          className={`${theme?.card} border ${theme?.border} ${theme?.text} rounded-xl p-6 shadow-xl max-w-sm w-full`}
        >
          <h2 className='text-lg font-semibold mb-3 text-center'>
            {`Are you sure you want to ${action}`}?
          </h2>
          <div className='flex justify-center gap-3 mt-4'>
            <button
              onClick={onConfirm}
              className='bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg'
            >
              {`Yes, ${action}`}
            </button>
            <button
              onClick={onCancel}
              className='bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-lg'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className={`space-y-4 ${theme?.text} text-base`}>
      <div
        className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-4`}
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
          <div className='relative'>
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme?.textMuted}`}
            />
            <input
              type='text'
              disabled={loading}
              placeholder='Search samples...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
            />
          </div>

          <div className='w-full max-w-full sm:max-w-[100%]'>
            <select
              value={filterState}
              disabled={loading}
              onChange={(e) => setFilterState(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base`}
            >
              <option value='all'>All States</option>
              {states &&
                states.length > 0 &&
                states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
            </select>
          </div>

          <select
            value={filterCategory}
            disabled={loading}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value='all'>All Categories</option>
            {[
              ...new Set(
                samples && samples.length > 0
                  ? samples.map((s) => s.productVariant?.categoryId)
                  : [],
              ),
            ]
              .filter(Boolean)
              .map((categoryId) => {
                const category = samples.find(
                  (s) => s.productVariant?.categoryId === categoryId,
                )?.productVariant?.category;
                return (
                  <option key={categoryId} value={categoryId}>
                    {category?.displayName || "Unknown"}
                  </option>
                );
              })}
          </select>

          <select
            value={filterProductVariant}
            disabled={loading}
            onChange={(e) => setFilterProductVariant(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value='all'>All Products</option>
            {[
              ...new Set(
                samples && samples.length > 0
                  ? samples.map((s) => s.productVariant?.categoryId)
                  : [],
              ),
            ]
              .filter(Boolean)
              .map((variantId) => {
                const variant = samples.find(
                  (s) => s.productVariant?.id === variantId,
                )?.productVariant;
                return (
                  <option key={variantId} value={variantId}>
                    {variant?.displayName || variant?.name || "Unknown"}
                  </option>
                );
              })}
          </select>

          <select
            value={filterStatus}
            disabled={loading}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
          >
            <option value='all'>All Status</option>
            <option value='safe'>Safe</option>
            <option value='moderate'>Moderate</option>
            <option value='contaminated'>Contaminated</option>
            <option value='pending'>Pending</option>
          </select>
        </div>

        <div className='flex justify-end mt-4'>
          <button
            onClick={() => handleExcelExportClick()}
            disabled={loading}
            className='flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors'
          >
            <Download className='w-4 h-4' />
            Export Excel
          </button>
        </div>
        {fetchStateError && (
          <p className='text-sm mt-1 text-red-600'>
            Error occurred while fetching states. Check connection and refresh
          </p>
        )}
      </div>
      {/* samples */}
      {deleteConfirmModal.isOpen && (
        <DeleteConfirmModalComp
          show={deleteConfirmModal.isOpen}
          action={"delete"}
          onConfirm={() => handleDeleteSample(deleteConfirmModal.sample)}
          onCancel={() =>
            setDeleteConfirmModal({ isOpen: false, sample: null })
          }
          theme={theme}
        />
      )}

      {loading && (
        <div className='flex items-center justify-center h-48'>
          <Loader className='animate-spin mr-2  size-10' />
        </div>
      )}
      {!loading && (
        <>
          <div
            className={`${theme?.card} rounded-lg shadow-md border ${theme?.border}`}
          >
            <div className='hidden sm:block overflow-x-auto'>
              <table className='w-full min-w-[800px] text-sm'>
                <thead className={theme?.card}>
                  <tr>
                    {[
                      "Sample ID",
                      "Product",
                      "Location",
                      ...(canSeeCollector ? ["Collector"] : []),
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

                <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                  {filteredSamples?.map((sample) => {
                    const maxReading = getMaxReading(
                      sample?.heavyMetalReadings,
                    );
                    const sampleStatus =
                      getContaminationStatus(sample).toLowerCase();
                    return (
                      <tr key={sample?.id} className={theme?.hover}>
                        <td className='px-4 py-3 whitespace-nowrap font-medium'>
                          {sample?.sampleId}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          <div>
                            <div className='font-medium'>
                              {sample?.productName}
                            </div>
                            <div className={`text-xs ${theme?.textMuted}`}>
                              {sample?.brandName || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          <div>
                            <div>
                              {sample?.lga?.name}, {sample?.state?.name}
                            </div>
                            <div className={`text-xs ${theme.textMuted}`}>
                              {sample?.marketName ||
                                sample?.market?.name ||
                                "N/A"}
                            </div>
                          </div>
                        </td>
                        {canSeeCollector && (
                          <td className='px-4 py-3 whitespace-nowrap'>
                            <div className='font-medium text-sm'>
                              {sample?.creator?.fullName ||
                                sample?.creator?.email ||
                                "Unknown"}
                            </div>
                            <div className={`text-xs ${theme?.textMuted}`}>
                              {sample?.creator?.role?.replace(/_/g, " ") ||
                                "N/A"}
                            </div>
                          </td>
                        )}
                        <td className='px-4 py-3 whitespace-nowrap font-semibold'>
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
                            <span className='text-gray-400'>—</span>
                          )}
                        </td>

                        <td className='px-4 py-3'>
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
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {sample?.createdAt
                            ? new Date(sample?.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          <button
                            onClick={() => setSelectedSample(sample)}
                            className='text-emerald-400 hover:text-emerald-300 font-medium'
                          >
                            View
                          </button>
                        </td>
                        {/* delete */}
                        <td className='px-4 py-3 whitespace-nowrap'>
                          {isSuperAdmin && (
                            <button
                              onClick={() =>
                                setDeleteConfirmModal({
                                  isOpen: true,
                                  sample: sample,
                                })
                              }
                              className='mt-2 text-red-400 hover:text-red-300 text-sm font-medium'
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className='block sm:hidden space-y-4 p-2 '>
              {filteredSamples.length > 0 &&
                filteredSamples?.map((sample) => {
                  const maxReading = getMaxReading(sample?.heavyMetalReadings);
                  const sampleStatus =
                    getContaminationStatus(sample).toLowerCase();
                  return (
                    <div
                      key={sample.id}
                      className={`${theme?.card} border ${theme?.border} rounded-lg p-4 shadow`}
                    >
                      <div className='flex justify-between items-center mb-1'>
                        <span className='text-xs font-semibold text-gray-500'>
                          Sample ID
                        </span>
                        <span className='text-sm font-medium'>
                          {sample?.sampleId}
                        </span>
                      </div>

                      <div className='text-sm mb-1'>
                        <span className='font-semibold'>Product:</span>{" "}
                        {sample?.productName}{" "}
                        <span className={`block text-xs ${theme?.textMuted}`}>
                          {sample?.brandName || "N/A"}
                        </span>
                      </div>

                      <div className='text-sm mb-1'>
                        <span className='font-semibold'>Location:</span>{" "}
                        {sample?.lga?.name}, {sample?.state?.name}
                        <div className={`text-xs ${theme?.textMuted}`}>
                          {sample?.marketName || sample?.market?.name || "N/A"}
                        </div>
                      </div>

                      {canSeeCollector && (
                        <div className='text-sm mb-1'>
                          <span className='font-semibold'>Collector:</span>{" "}
                          {sample?.creator?.fullName ||
                            sample?.creator?.email ||
                            "Unknown"}
                          <div className={`text-xs ${theme?.textMuted}`}>
                            {sample?.creator?.role?.replace(/_/g, " ") || "N/A"}
                          </div>
                        </div>
                      )}

                      <div className='text-sm mb-1'>
                        <span className='font-semibold'>Max Reading:</span>{" "}
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
                          <span className='text-gray-400'>No readings</span>
                        )}
                      </div>

                      <div className='text-sm mb-1'>
                        <span className='font-semibold'>Status:</span>{" "}
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

                      <div className='text-sm mb-1'>
                        <span className='font-semibold'>Date:</span>{" "}
                        {sample?.createdAt
                          ? new Date(sample?.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>

                      <button
                        onClick={() => setSelectedSample(sample)}
                        className='mt-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium'
                      >
                        View Details
                      </button>
                      {/* delete */}

                      {isSuperAdmin && (
                        <button
                          onClick={() =>
                            setDeleteConfirmModal({
                              isOpen: true,
                              sample: sample,
                            })
                          }
                          className='mt-2 text-red-400 hover:text-red-300 text-sm font-medium'
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
          {filteredSamples?.length === 0 && (
            <h2 className='text-center text-gray-500'>
              No samples found matching the criteria.
            </h2>
          )}
        </>
      )}

      {selectedSample && (
        <SampleDetailModal
          theme={theme}
          sample={selectedSample}
          onClose={() => setSelectedSample(null)}
        />
      )}
    </div>
  );
};

export default DatabaseView;
