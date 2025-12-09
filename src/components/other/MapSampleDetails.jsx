export default function MapSampleDetails({ samples, setCommentSectionView }) {
  function getColorBasedOnContamination(level) {
    if (level === "CONTAMINATED") return "text-red-600";
    if (level === "MODERATE") return "text-yellow-500";
    if (level === "PENDING") return "text-blue-500";
    if (level === "SAFE") return "text-green-600";
    return "text-gray-500";
  }

  return (
    <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6 p-4 bg-gray-50">
      {samples.map((s) => (
        <div
          key={s.id}
          className="w-full bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-emerald-600">
              Test Sample
            </h2>
            <span className="text-2xl">🧪</span>
          </div>

          {/* Sample Details */}
          <div className="mb-4 text-gray-600">
            <span className="font-medium text-gray-500">ID: </span>
            <span className="font-semibold">{s.sampleId}</span>
          </div>

          <div className="flex flex-col gap-3 text-gray-700">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Product Type</span>
              <span className="font-medium">{s.productType}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <span
                className={`font-semibold ${getColorBasedOnContamination(
                  s.contaminationStatus
                )}`}
              >
                {s.contaminationStatus}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Location</span>
              <span className="font-medium">
                {s.gpsLatitude} | {s.gpsLongitude}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Date</span>
              <span className="font-medium text-gray-600">13 Nov 2025</span>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => setCommentSectionView({ isOpen: true, sample: s })}
            className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-semibold py-2 rounded-xl"
          >
            View Comments
          </button>
        </div>
      ))}
    </div>
  );
}
