import Comments from "./Comments";

function CommentSection({ commentSectionView, setCommentSectionView }) {
  const { sample } = commentSectionView;

  return (
    <>
      <div className='flex flex-col bg-white p-5 gap-5'>
        <span
          onClick={() => setCommentSectionView({ isOpen: false, sample: null })}
          className='text-gray-500 cursor-pointer'
        >{`<-Back to Samples`}</span>
        <div className='flex justify-between'>
          <div className='flex flex-col'>
            <span className='text-lg font-semibold text-gray-800'>Date</span>
            <span className='font-medium'>
              {sample.date || "14 / 03 / 2025"}
            </span>
          </div>
          <div className='flex flex-col'>
            <span className='text-lg font-semibold text-gray-800'>Name</span>
            <span className='font-medium'>{sample?.market}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-lg font-semibold text-gray-800'>
              Location
            </span>
            <span className='font-medium'>{sample?.state}</span>
          </div>
        </div>
        <div className='flex flex-col'>
          <span className='text-lg font-semibold text-gray-800'>Sample ID</span>
          <span className='font-medium'>RTX-342</span>
        </div>
      </div>
      {/* comment */}
      <div className='flex flex-col mt-10  '>
        <h1 className='text-white font-bold text-3xl pb-2'>
          Comments & Remarks
        </h1>
        <div className='flex flex-col min-h-12 max-h-44 overflow-y-auto '>
          {sample?.comments.length > 0 ? (
            sample.comments.map((comment) => <Comments comment={comment} />)
          ) : (
            <h2 className='text-gray-400 font-semibold text-xl'>
              No Comments Yet
            </h2>
          )}
        </div>
      </div>
      <div className='flex flex-col mt-5 '>
        <input type='text' className='p-2 border-none outline-none' />
        <button className='bg-green-700 p-3 text-xl font-semibold'>
          Comment
        </button>
      </div>
    </>
  );
}

export default CommentSection;
