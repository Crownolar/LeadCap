import { X, AlertTriangle } from "lucide-react";
import { productTypes } from "../../utils/constants";

// Helper to format vendor type for display
const formatVendorType = (vendorType, vendorTypeOther) => {
  if (vendorType === "OTHER" && vendorTypeOther) {
    return vendorTypeOther;
  }
  return vendorType?.replace(/_/g, " ") || "N/A";
};

// Helper to get contamination info from heavy metal readings
const getContaminationInfo = (heavyMetalReadings) => {
  if (!heavyMetalReadings || heavyMetalReadings.length === 0) {
    return { hasReadings: false, maxReading: null, contaminatedMetals: [] };
  }
  
  const contaminatedMetals = heavyMetalReadings.filter(r => r.status === "CONTAMINATED");
  const allReadings = heavyMetalReadings.map(r => ({
    metal: r.heavyMetal,
    xrf: r.xrfReading ? parseFloat(r.xrfReading) : null,
    aas: r.aasReading ? parseFloat(r.aasReading) : null,
    status: r.status
  }));
  
  return { 
    hasReadings: true, 
    readings: allReadings,
    contaminatedMetals 
  };
};

const SampleDetailModal = ({ theme, sample, onClose }) => {
  const contaminationInfo = getContaminationInfo(sample?.heavyMetalReadings);
  
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50${theme.text}`}
    >
      <div
        className={`${theme.card} rounded-xl shadow-2xl w-full max-w-3xl max-h-[100vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`p-3 sm:p-4 md:p-6 border-b ${theme.border} flex items-center justify-between`}
        >
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words leading-tight">
              {sample?.productName}
            </h2>
            <p
              className={`text-xs sm:text-sm ${theme.textMuted} mt-1 truncate`}
            >
              {sample?.sampleId}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${theme.hover} flex-shrink-0`}
            aria-label="Close"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {/* Body */}
          <div className="p-3 sm:p-4 md:p-6 space-y-6 bg-transparent">
            {/* Information Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Sample Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 text-emerald-500">
                  Sample Information
                </h3>
                <div className="space-y-2 text-sm sm:text-base">
                  {[
                    ["Product Type:", productTypes[sample?.productType] || sample?.productType],
                    ["Brand:", sample?.brandName || "N/A"],
                    ["Batch Number:", sample?.batchNumber || "N/A"],
                    ["Product Origin:", sample?.productOrigin?.replace(/_/g, " ") || "N/A"],
                    [
                      "Registered:",
                      sample?.isRegistered ? "Yes (NAFDAC/SON)" : "No",
                    ],
                    ["NAFDAC Number:", sample?.navdacNumber || "N/A"],
                    ["SON Number:", sample?.sonNumber || "N/A"],
                    ["Price:", sample?.price ? `₦${sample?.price?.toLocaleString()}` : "N/A"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between flex-wrap gap-x-2 text-xs sm:text-sm"
                    >
                      <span className={`${theme.textMuted} min-w-[110px]`}>
                        {label}
                      </span>
                      <span className="font-medium text-right break-words">
                        {value}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between flex-wrap gap-x-2 text-xs sm:text-sm">
                    <span className={theme.textMuted}>Status:</span>
                    <span
                      className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
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
                </div>
              </div>

              {/* Location Details */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 text-emerald-500">
                  Location Details
                </h3>
                <div className="space-y-2 text-sm sm:text-base">
                  {[
                    ["State:", sample?.state?.name || "N/A"],
                    ["LGA:", sample?.lga?.name || "N/A"],
                    ["Market:", sample?.market?.name || "N/A"],
                    ["Vendor Type:", formatVendorType(sample?.vendorType, sample?.vendorTypeOther)],
                    ["Collection Date:", sample?.createdAt ? new Date(sample?.createdAt).toLocaleDateString() : "N/A"],
                    ["Collected By:", sample?.creator?.fullName || "N/A"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between flex-wrap gap-x-2 text-xs sm:text-sm"
                    >
                      <span className={`${theme.textMuted} min-w-[110px]`}>
                        {label}
                      </span>
                      <span className="font-medium text-right break-words">
                        {value}
                      </span>
                    </div>
                  ))}

                  {sample?.gpsLatitude && sample?.gpsLongitude && (
                    <div className="flex justify-between flex-wrap gap-x-2 text-xs sm:text-sm">
                      <span className={theme.textMuted}>GPS:</span>
                      <span className="font-medium text-xs text-right break-words">
                        {sample?.gpsLatitude}, {sample?.gpsLongitude}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Heavy Metal Readings */}
            {contaminationInfo.hasReadings && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 text-emerald-500">
                  Heavy Metal Analysis
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className={`border-b ${theme.border}`}>
                        <th className="text-left py-2 px-2">Metal</th>
                        <th className="text-left py-2 px-2">XRF Reading</th>
                        <th className="text-left py-2 px-2">AAS Reading</th>
                        <th className="text-left py-2 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contaminationInfo.readings?.map((reading, idx) => (
                        <tr key={idx} className={`border-b ${theme.border}`}>
                          <td className="py-2 px-2 font-medium">{reading.metal}</td>
                          <td className="py-2 px-2">{reading.xrf ? `${reading.xrf} ppm` : "—"}</td>
                          <td className="py-2 px-2">{reading.aas ? `${reading.aas} ppm` : "—"}</td>
                          <td className="py-2 px-2">
                            <span
                              className={`px-2 py-1 text-[10px] font-semibold rounded-full ${
                                reading.status === "SAFE"
                                  ? "bg-green-100 text-green-800"
                                  : reading.status === "CONTAMINATED"
                                  ? "bg-red-100 text-red-800"
                                  : reading.status === "MODERATE"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {reading.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Product Photo */}
            {sample?.productPhotoUrl && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 text-emerald-500">
                  Documentation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className={`text-xs sm:text-sm ${theme.textMuted} mb-2`}>
                      Product Photo
                    </p>
                    <img
                      src={sample?.productPhotoUrl}
                      alt="Product"
                      className="w-full h-44 sm:h-56 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            {sample?.comments && sample?.comments.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 text-emerald-500">
                  Comments ({sample?.comments.length})
                </h3>
                <div className="space-y-3">
                  {sample?.comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`p-3 rounded-lg border ${theme.border} ${theme.card}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">
                          {comment.user?.fullName || "Unknown"}
                        </span>
                        <span className={`text-xs ${theme.textMuted}`}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.commentText}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Box */}
            {sample?.status === "contaminated" && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-1 text-sm sm:text-base">
                      Contaminated Product Alert
                    </h4>
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                      This product has been found to contain heavy metals exceeding safe limits.
                      Immediate action required. Do not use or distribute this product.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleDetailModal;
