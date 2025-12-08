export default function MapSampleDetails({ samples, setCommentSectionView }) {
  function getColorBasedOnConatamination(level) {
    if (level == "CONTAMINATED") return "text-red-600";
    if (level == "MODERATE") return "text-yellow-600";
    if (level == "PENDING") return "text-blue-600";
    if (level == "SAFE") return "text-green-600";
    return "";
  }
  return (
    <div className='grid md:grid-cols-2 sm:grid-cols-1'>
      {samples.map((s) => (
        <div
          key={s.id}
          className='max-w-sm w-full bg-white rounded-2xl shadow-lg p-4 m-2'
        >
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-lg font-semibold text-gray-800'>Test Sample</h2>
            <span className='text-xl'>🧪</span>
          </div>
          <div className='mb-2 text-gray-500'>
            <span className='font-medium'>ID: </span>
            {s.sampleId}
          </div>
          <div className='flex flex-col justify-between gap-4 text-gray-700'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-400'>Prduct Type</span>
              <span className='font-medium'>{s.productType}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-400'>Status</span>
              <span
                className={`font-medium ${getColorBasedOnConatamination(
                  s.contaminationStatus
                )}`}
              >
                {s.contaminationStatus}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-400'>Location</span>
              <span className='font-medium'>
                {s.gpsLatitude} | {s.gpsLongitude}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-400'>Date</span>
              <span className='font-medium'>13 Nov 2025</span>
            </div>
            <button
              onClick={() => setCommentSectionView({ isOpen: true, sample: s })}
              className='bg-green-700 p-1 text-lg text-white font-semibold '
            >
              View Comments
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
