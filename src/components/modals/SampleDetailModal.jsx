import { X, AlertTriangle, Pencil } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { buildFieldSampleId } from "../../utils/formHelpers";

const formatVendorType = (vendorType, vendorTypeOther) => {
  if (vendorType === "OTHER" && vendorTypeOther) {
    return vendorTypeOther;
  }
  return vendorType?.replace(/_/g, " ") || "-";
};

const getContaminationInfo = (heavyMetalReadings) => {
  if (!heavyMetalReadings || heavyMetalReadings.length === 0) {
    return { hasReadings: false, maxReading: null, contaminatedMetals: [] };
  }

  const getReadingStatus = (r) =>
    r.finalStatus || r.aasStatus || r.xrfStatus || "PENDING";
  console.log(getReadingStatus);

  const contaminatedMetals = heavyMetalReadings.filter(
    (r) => getReadingStatus(r) === "CONTAMINATED",
  );
  const allReadings = heavyMetalReadings.map((r) => ({
    metal: r.heavyMetal,
    xrf: r.xrfReading ? parseFloat(r.xrfReading) : null,
    aas: r.aasReading ? parseFloat(r.aasReading) : null,
    status: getReadingStatus(r),
  }));

  return {
    hasReadings: true,
    readings: allReadings,
    contaminatedMetals,
  };
};

const SampleDetailModal = ({ sample, onClose, onEditRequest }) => {
  const contaminationInfo = getContaminationInfo(sample?.heavyMetalReadings);

  const { theme } = useTheme();

  const handleEdit = () => {
    if (onEditRequest && sample) {
      onEditRequest(sample);
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[5000] ${theme.text}`}
    >
      <div
        className={`${theme.card} rounded-xl shadow-2xl w-full max-w-3xl max-h-[100vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`p-3 sm:p-4 md:p-6 border-b ${theme.border} flex items-center justify-between`}
        >
          <div className='min-w-0'>
            <h2 className='text-lg sm:text-xl md:text-2xl font-bold break-words leading-tight'>
              {sample?.productName}
            </h2>
            <p
              className={`text-xs sm:text-sm ${theme.textMuted} mt-1 truncate`}
            >
              {sample?.code}
            </p>
          </div>
          <div className='flex items-center gap-2 flex-shrink-0'>
            {onEditRequest && (
              <button
                type='button'
                onClick={handleEdit}
                className={`p-2 rounded-lg ${theme.hover} flex items-center gap-1.5 text-sm font-medium`}
                aria-label='Edit sample'
              >
                <Pencil className='w-4 h-4 md:w-5 md:h-5' />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${theme.hover}`}
              aria-label='Close'
            >
              <X className='w-5 h-5 md:w-6 md:h-6' />
            </button>
          </div>
        </div>

        <div className='overflow-y-auto p-4 flex-1'>
          {/* Body */}
          <div className='p-3 sm:p-4 md:p-6 space-y-6 bg-transparent'>
            {/* Information Grids */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
              {/* Sample Information */}
              <div>
                <h3 className='text-base sm:text-lg font-semibold mb-3 text-emerald-500'>
                  Sample Information
                </h3>
                <div className='space-y-2 text-sm sm:text-base'>
                  {[
                    ["Serial Sample ID:", sample?.code || "-"],
                    [
                      "Product Category:",
                      sample?.productVariant?.category?.name || "Unknown",
                    ],
                    [
                      "Product Variant:",
                      sample?.productVariant?.name.replace(/_/g, " ") ||
                        sample?.productVariant?.displayName.replace(
                          /_/g,
                          " ",
                        ) ||
                        "-",
                    ],
                    ["Brand:", sample?.brandName || "-"],
                    ["Batch Number:", sample?.batchNumber || "-"],
                    ["Manufacturer Name:", sample?.manufacturerName || "-"],
                    ["Batch Number:", sample?.batchNumber || "-"],
                    [
                      "Product Origin:",
                      sample?.productOrigin?.replace(/_/g, " ") || "-",
                    ],
                    [
                      "Registered:",
                      sample?.isRegistered ? "Yes (NAFDAC/SON)" : "No",
                    ],
                    ...(sample?.isRegistered
                      ? [
                          ["NAFDAC Number:", sample?.nafdacNumber || "-"],
                          ["SON Number:", sample?.sonNumber || "-"],
                        ]
                      : []),
                    [
                      "Price:",
                      sample?.price
                        ? `₦${sample?.price?.toLocaleString()}`
                        : "-",
                    ],
                    ["Notes:", sample?.notes || "-"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className='flex justify-between flex-wrap gap-x-2 text-xs sm:text-sm'
                    >
                      <span className={`${theme.textMuted} min-w-[110px]`}>
                        {label}
                      </span>
                      <span className='font-medium text-right break-words'>
                        {value}
                      </span>
                    </div>
                  ))}

                  <div className='flex justify-between flex-wrap gap-x-2 text-xs sm:text-sm'>
                    <span className={theme.textMuted}>Status:</span>
                    <span
                      className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
                        sample?.status?.toUpperCase() === "SAFE"
                          ? "bg-green-100 text-green-800"
                          : sample?.status?.toUpperCase() === "CONTAMINATED"
                            ? "bg-red-100 text-red-800"
                            : sample?.status?.toUpperCase() === "MODERATE"
                              ? "bg-orange-100 text-orange-800"
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
                <h3 className='text-base sm:text-lg font-semibold mb-3 text-emerald-500'>
                  Location Details
                </h3>
                <div className='space-y-2 text-sm sm:text-base'>
                  {[
                    ["State:", sample?.state?.name || "-"],
                    ["LGA:", sample?.lga?.name || "-"],
                    [
                      "Market:",
                      sample?.marketId
                        ? sample?.market?.name
                        : sample?.marketName || "-",
                    ],
                    [
                      "Vendor Type:",
                      formatVendorType(
                        sample?.vendorType,
                        sample?.vendorTypeOther,
                      ),
                    ],
                    [
                      "Collection Date:",
                      sample?.createdAt
                        ? new Date(sample?.createdAt).toLocaleDateString()
                        : "-",
                    ],
                    ["Collected By:", sample?.creator?.fullName || "-"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className='flex justify-between flex-wrap gap-x-2 text-xs sm:text-sm'
                    >
                      <span className={`${theme.textMuted} min-w-[110px]`}>
                        {label}
                      </span>
                      <span className='font-medium text-right break-words'>
                        {value}
                      </span>
                    </div>
                  ))}

                  {sample?.gpsLatitude && sample?.gpsLongitude && (
                    <div className='flex justify-between flex-wrap gap-x-2 text-xs sm:text-sm'>
                      <span className={theme.textMuted}>GPS:</span>
                      <span className='font-medium text-xs text-right break-words'>
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
                <h3 className='text-base sm:text-lg font-semibold mb-3 text-emerald-500'>
                  Heavy Metal Analysis
                </h3>
                <div className='overflow-x-auto'>
                  <table className='w-full text-xs sm:text-sm'>
                    <thead>
                      <tr className={`border-b ${theme.border}`}>
                        <th className='text-left py-2 px-2'>Metal</th>
                        <th className='text-left py-2 px-2'>XRF Reading</th>
                        <th className='text-left py-2 px-2'>AAS Reading</th>
                        <th className='text-left py-2 px-2'>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contaminationInfo.readings?.map((reading, idx) => (
                        <tr key={idx} className={`border-b ${theme.border}`}>
                          <td className='py-2 px-2 font-medium'>
                            {reading.metal}
                          </td>
                          <td className='py-2 px-2'>
                            {reading.xrf ? `${reading.xrf} ppm` : "—"}
                          </td>
                          <td className='py-2 px-2'>
                            {reading.aas ? `${reading.aas} ppm` : "—"}
                          </td>
                          <td className='py-2 px-2'>
                            <span
                              className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${
                                reading.status === "SAFE"
                                  ? "bg-green-100 text-green-800"
                                  : reading.status === "CONTAMINATED"
                                    ? "bg-red-100 text-red-800"
                                    : reading.status === "MODERATE"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {reading.status || "PENDING"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Product Photo & Calibration Curve */}
            {(sample?.productPhotoUrl || sample?.calibrationCurve?.fileUrl) && (
              <div>
                <h3 className='text-base sm:text-lg font-semibold mb-3 text-emerald-500'>
                  Documentation
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                  {sample?.productPhotoUrl && (
                    <div>
                      <p
                        className={`text-xs sm:text-sm ${theme.textMuted} mb-2`}
                      >
                        Product Photo
                      </p>
                      <img
                        src={sample?.productPhotoUrl}
                        alt='Product'
                        className='w-full h-44 sm:h-56 object-cover rounded-lg'
                      />
                    </div>
                  )}
                  {sample?.calibrationCurve?.fileUrl && (
                    <div>
                      <p
                        className={`text-xs sm:text-sm ${theme.textMuted} mb-2`}
                      >
                        Calibration Curve ({sample?.calibrationCurve?.fileType})
                      </p>
                      <img
                        src={sample?.calibrationCurve?.fileUrl}
                        alt='Calibration Curve'
                        className='w-full h-44 sm:h-56 object-cover rounded-lg'
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comments Section */}
            {sample?.comments && sample?.comments.length > 0 && (
              <div>
                <h3 className='text-base sm:text-lg font-semibold mb-3 text-emerald-500'>
                  Comments ({sample?.comments.length})
                </h3>
                <div className='space-y-3'>
                  {sample?.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-lg border ${theme.border} ${theme.card}`}
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <span className='font-medium text-sm'>
                          {comment.user?.fullName || "Unknown"}
                        </span>
                        <span className={`text-xs ${theme.textMuted}`}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className='text-sm'>{comment.commentText}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Box */}
            {sample?.status === "contaminated" && (
              <div className='bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3 sm:p-4'>
                <div className='flex items-start gap-2 sm:gap-3'>
                  <AlertTriangle className='w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5' />
                  <div>
                    <h4 className='font-semibold text-red-600 dark:text-red-400 mb-1 text-sm sm:text-base'>
                      Contaminated Product Alert
                    </h4>
                    <p className='text-xs sm:text-sm text-red-600 dark:text-red-400'>
                      This product has been found to contain heavy metals
                      exceeding safe limits. Immediate action required. Do not
                      use or distribute this product.
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
