export default function MapSampleDetails({ samples }) {
  return (
    <>
      {samples.map((s) => (
        <div className='max-w-sm w-full bg-white rounded-2xl shadow-lg p-4 m-2'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-lg font-semibold text-gray-800'>Test Sample</h2>
            <span className='text-xl'>🧪</span>
          </div>
          <div className='mb-2 text-gray-500'>
            <span className='font-medium'>ID: </span>12345
          </div>
          <div className='flex flex-col justify-between gap-4 text-gray-700'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-400'>Status</span>
              <span className='font-medium'>Pending</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-400'>Location</span>
              <span className='font-medium'>
                {s.coordinates.lat}| {s.coordinates.lng}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-400'>Date</span>
              <span className='font-medium'>13 Nov 2025</span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
