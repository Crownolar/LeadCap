import { X, AlertTriangle, Pencil } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const formatVendorType = (vendorType, vendorTypeOther) => {
  if (vendorType === "OTHER" && vendorTypeOther) return vendorTypeOther;
  return vendorType?.replace(/_/g, " ") || "-";
};

const getContaminationInfo = (heavyMetalReadings) => {
  if (!heavyMetalReadings?.length) {
    return { hasReadings: false };
  }

  const getReadingStatus = (r) =>
    r.finalStatus || r.aasStatus || r.xrfStatus || "PENDING";

  const readings = heavyMetalReadings.map((r) => ({
    metal: r.heavyMetal,
    xrf: r.xrfReading ? parseFloat(r.xrfReading) : null,
    aas: r.aasReading ? parseFloat(r.aasReading) : null,
    status: getReadingStatus(r),
  }));

  return {
    hasReadings: true,
    readings,
  };
};

const InfoRow = ({ label, value, theme }) => (
  <div className="flex justify-between items-start gap-3">
    <span className={`${theme.textMuted} text-xs sm:text-sm`}>{label}</span>
    <span className="font-medium text-right text-xs sm:text-sm break-words">
      {value}
    </span>
  </div>
);

const Card = ({ title, children }) => (
  <div className="rounded-xl border p-4 sm:p-5 space-y-3 bg-transparent">
    <h3 className="text-sm sm:text-base font-semibold text-emerald-500">
      {title}
    </h3>
    {children}
  </div>
);

const SampleDetailModal = ({ sample, onClose, onEditRequest }) => {
  const { theme } = useTheme();
  const contaminationInfo = getContaminationInfo(sample?.heavyMetalReadings);

  const handleEdit = () => {
    onEditRequest?.(sample);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[5000] ${theme.text}`}
    >
      <div
        className={`${theme.card} rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b ${theme.border} flex justify-between items-center`}
        >
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate">
              {sample?.productName}
            </h2>
            <p className={`text-xs ${theme.textMuted}`}>{sample?.code}</p>
          </div>

          <div className="flex items-center gap-2">
            {onEditRequest && (
              <button
                onClick={handleEdit}
                className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${theme.hover}`}
              >
                <Pencil size={16} />
                Edit
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${theme.hover}`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto scrollbar-hide p-5 space-y-6">
          {/* Top Grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Sample Info */}
            <Card title="Sample Information">
              <InfoRow
                label="Serial ID"
                value={sample?.code || "-"}
                theme={theme}
              />
              <InfoRow
                label="Category"
                value={sample?.productVariant?.category?.name || "-"}
                theme={theme}
              />
              <InfoRow
                label="Variant"
                value={sample?.productVariant?.name?.replace(/_/g, " ") || "-"}
                theme={theme}
              />
              <InfoRow
                label="Brand"
                value={sample?.brandName || "-"}
                theme={theme}
              />
              <InfoRow
                label="Batch"
                value={sample?.batchNumber || "-"}
                theme={theme}
              />
              <InfoRow
                label="Manufacturer"
                value={sample?.manufacturerName || "-"}
                theme={theme}
              />
              <InfoRow
                label="Origin"
                value={sample?.productOrigin?.replace(/_/g, " ") || "-"}
                theme={theme}
              />
              <InfoRow
                label="Price"
                value={
                  sample?.price ? `₦${sample.price.toLocaleString()}` : "-"
                }
                theme={theme}
              />
            </Card>

            {/* Location */}
            <Card title="Location Details">
              <InfoRow
                label="State"
                value={sample?.state?.name || "-"}
                theme={theme}
              />
              <InfoRow
                label="LGA"
                value={sample?.lga?.name || "-"}
                theme={theme}
              />
              <InfoRow
                label="Market"
                value={sample?.market?.name || sample?.marketName || "-"}
                theme={theme}
              />
              <InfoRow
                label="Vendor"
                value={formatVendorType(
                  sample?.vendorType,
                  sample?.vendorTypeOther,
                )}
                theme={theme}
              />
              <InfoRow
                label="Collected By"
                value={sample?.creator?.fullName || "-"}
                theme={theme}
              />
            </Card>
          </div>

          {/* Heavy Metal Table */}
          {contaminationInfo.hasReadings && (
            <div className="rounded-xl border p-4">
              <h3 className="text-sm font-semibold text-emerald-500 mb-3">
                Heavy Metal Analysis
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className={`border-b ${theme.border}`}>
                    <tr>
                      <th className="text-left py-2">Metal</th>
                      <th className="text-left py-2">XRF</th>
                      <th className="text-left py-2">AAS</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contaminationInfo.readings.map((r, i) => (
                      <tr key={i} className={`border-b ${theme.border}`}>
                        <td className="py-2">{r.metal}</td>
                        <td>{r.xrf ? `${r.xrf} ppm` : "—"}</td>
                        <td>{r.aas ? `${r.aas} ppm` : "—"}</td>
                        <td>
                          <span
                            className={`px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-full inline-flex items-center gap-1 ${
                              r.status === "SAFE"
                                ? "bg-green-100 text-green-700"
                                : r.status === "CONTAMINATED"
                                  ? "bg-red-100 text-red-700"
                                  : r.status === "MODERATE"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {r.status || "PENDING"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Images */}
          {(sample?.productPhotoUrl || sample?.calibrationCurve?.fileUrl) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {sample?.productPhotoUrl && (
                <img
                  src={sample.productPhotoUrl}
                  className="rounded-xl h-52 w-full object-cover"
                />
              )}
              {sample?.calibrationCurve?.fileUrl && (
                <img
                  src={sample.calibrationCurve.fileUrl}
                  className="rounded-xl h-52 w-full object-cover"
                />
              )}
            </div>
          )}

          {/* Warning */}
          {sample?.status === "contaminated" && (
            <div className="border border-red-500 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="text-red-500" size={18} />
              <div>
                <p className="text-sm font-semibold text-red-500">
                  Contaminated Product
                </p>
                <p className="text-xs text-red-400">
                  Unsafe for consumption. Immediate action required.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SampleDetailModal;
