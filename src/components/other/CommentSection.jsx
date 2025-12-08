import { useEffect, useState } from "react";
import Comments from "./Comments";
import { api } from "../../redux/slice/samplesSlice";

function CommentSection({ commentSectionView, setCommentSectionView }) {
  const { sample } = commentSectionView;
  const [fetchedComments, setFetchedComments] = useState([]);
  const [requestMessage, setRequestMessage] = useState({
    error: false,
    loading: false,
  });
  const [writtenComment, setWrittenComment] = useState("");

  const handleSubmitComment = () => {
    api.post(`/samples/${sample.id}/comments`, { commentText: writtenComment });
    setWrittenComment("");
    fetchComments();
  };

  const fetchComments = async () => {
    setRequestMessage((prev) => ({ ...prev, loading: true }));

    try {
      await api
        .get(`/samples/${sample.id}/comments`)
        .then((result) => result.data.data)
        .then((comments) => setFetchedComments(comments));
      setRequestMessage((prev) => ({ ...prev, loading: false }));
    } catch {
      setRequestMessage((prev) => ({ ...prev, laoding: false }));
      setRequestMessage((prev) => ({ ...prev, error: true }));
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

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
            <span className='text-lg font-semibold text-gray-800'>
              ProductType
            </span>
            <span className='font-medium'>{sample?.productType}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-lg font-semibold text-gray-800'>
              Location
            </span>
            <span className='font-medium'>{sample?.state?.name}</span>
          </div>
        </div>
        <div className='flex flex-col'>
          <span className='text-lg font-semibold text-gray-800'>Sample ID</span>
          <span className='font-medium'>{sample.sampleId}</span>
        </div>
      </div>
      {/* comment */}
      <div className='flex flex-col mt-10  '>
        <h1 className='text-white font-bold text-3xl pb-2'>
          Comments & Remarks
        </h1>
        <div className='flex flex-col min-h-12 max-h-44 overflow-y-auto '>
          {requestMessage.loading && (
            <h5 className='text-white text-center font-bold'>Loading...</h5>
          )}
          {requestMessage.error && (
            <h5 className='text-white text-center font-bold'>Error ocurred</h5>
          )}
          {!requestMessage.loading &&
            !requestMessage.error &&
            fetchedComments.length == 0 && (
              <h2 className='text-gray-400 font-semibold text-xl'>
                No Comments Yet
              </h2>
            )}
          {fetchedComments.length > 0 &&
            fetchedComments.map((comment) => (
              <Comments comment={comment} fetchComments={fetchComments} />
            ))}
        </div>
      </div>
      <div className='flex flex-col mt-5 '>
        <input
          type='text'
          className='p-2 border-none outline-none'
          value={writtenComment}
          onChange={(e) => setWrittenComment(e.target.value)}
        />
        <button
          className='bg-green-700 p-3 text-xl font-semibold'
          onClick={handleSubmitComment}
        >
          Comment
        </button>
      </div>
    </>
  );
}

export default CommentSection;
