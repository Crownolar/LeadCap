import { AlertTriangle, MapPin, Package, Zap, Calendar, User, Building2 } from "lucide-react";

export default function MapSampleDetails({ samples, setCommentSectionView }) {
  function getColorBasedOnContamination(level) {
    if (level === "CONTAMINATED") return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800";
    if (level === "MODERATE") return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800";
    if (level === "PENDING") return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800";
    if (level === "SAFE") return "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800";
    return "text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-800";
  }

  function getStatusIcon(level) {
    if (level === "CONTAMINATED") return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />;
    if (level === "MODERATE") return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />;
    if (level === "SAFE") return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />;
    return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />;
  }
 
  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          Sample Details ({samples.length} {samples.length === 1 ? "sample" : "samples"})
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Location: <span className="font-semibold">{samples[0]?.state?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
        {samples.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Top Status Bar */}
            <div className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 border-b-2 ${getColorBasedOnContamination(s.status)}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {getStatusIcon(s.status)}
                  <span className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                    {s.status || 'PENDING'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[120px] sm:max-w-none">
                  {s.sampleId}
                </span>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-3 sm:p-4 md:p-5">
              {/* Product Section */}
              <div className="mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2 truncate">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">{s.productName}</span>
                </h2>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold">
                    {s.productVariant?.displayName || s.productVariant?.name || "Unknown"}
                  </span>
                  {s.isRegistered && (
                    <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold">
                      ✓ Registered
                    </span>
                  )}
                  {s.productOrigin === "IMPORTED" && (
                    <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold">
                      🌍 Imported
                    </span>
                  )}
                </div>
              </div>

              {/* Location Section */}
              <div className="mb-4 sm:mb-5 space-y-2">
                <div className="flex items-start gap-2 sm:gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">MARKET</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {s.market?.name || "N/A"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 sm:gap-3">
                  <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">LOCATION</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {s.lga?.name || "N/A"}, {s.state?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-0.5 sm:mb-1">
                    VENDOR TYPE
                  </p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white capitalize truncate">
                    {s.vendorType?.replace(/_/g, " ") || "N/A"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-0.5 sm:mb-1">
                    PRICE
                  </p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    ₦{typeof s.price === 'number' ? s.price.toLocaleString() : s.price}
                  </p>
                </div>
                {s.brandName && (
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-0.5 sm:mb-1">
                      BRAND
                    </p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {s.brandName}
                    </p>
                  </div>
                )}
                {s.batchNumber && (
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-0.5 sm:mb-1">
                      BATCH
                    </p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {s.batchNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Dates Section */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-600 dark:text-gray-400 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200 dark:border-gray-700">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">
                  Collected on <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(s.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </span>
              </div>

              {/* Verification Status */}
              {s.verificationStatus && s.verificationStatus !== "UNVERIFIED" && (
                <div className={`mb-4 sm:mb-5 p-2.5 sm:p-3 rounded-lg border ${
                  s.verificationStatus === "VERIFIED_ORIGINAL" 
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-1 text-gray-700 dark:text-gray-300">
                    Verification Status
                  </p>
                  <p className={`text-xs sm:text-sm font-semibold ${
                    s.verificationStatus === "VERIFIED_ORIGINAL" 
                      ? "text-green-700 dark:text-green-300" 
                      : "text-red-700 dark:text-red-300"
                  }`}>
                    {s.verificationStatus === "VERIFIED_ORIGINAL" ? "✓ Original Product" : "✗ Counterfeit Detected"}
                  </p>
                  {s.navdacNumber && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                      <span className="font-semibold">NAFDAC:</span> {s.navdacNumber}
                    </p>
                  )}
                  {s.sonNumber && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      <span className="font-semibold">SON:</span> {s.sonNumber}
                    </p>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => setCommentSectionView({ isOpen: true, sample: s })}
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 dark:from-emerald-700 dark:to-cyan-700 dark:hover:from-emerald-800 dark:hover:to-cyan-800 text-white font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>💬</span> View Comments
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}