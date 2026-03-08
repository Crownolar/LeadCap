import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, Send, Loader, Lock } from "lucide-react";
import Comments from "./Comments";
import api from "../../utils/api";
import { useSelector } from "react-redux";

function CommentSection({ commentSectionView, setCommentSectionView }) {
  const { sample } = commentSectionView;
  const { currentUser } = useSelector((state) => state.auth);

  // Only these roles can add comments
  const COMMENT_ROLES = [
    "SUPER_ADMIN",
    "HEAD_RESEARCHER",
    "SUPERVISOR",
    "POLICY_MAKER_SON",
    "POLICY_MAKER_NAFDAC",
    "POLICY_MAKER_RESOLVE",
    "POLICY_MAKER_UNIVERSITY",
  ];

  const canComment = COMMENT_ROLES.includes(currentUser?.role);
  const [fetchedComments, setFetchedComments] = useState([]);
  const [requestMessage, setRequestMessage] = useState({
    error: false,
    loading: false,
  });
  const [writtenComment, setWrittenComment] = useState("");

  const handleSubmitComment = async () => {
    if (!writtenComment.trim()) return;

    try {
      setRequestMessage((prev) => ({ ...prev, loading: true }));
      await api.post(`/samples/${sample.id}/comments`, {
        commentText: writtenComment,
      });
      setWrittenComment("");
      await fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      setRequestMessage((prev) => ({
        ...prev,
        loading: false,
        error: true,
      }));
    }
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
      setRequestMessage((prev) => ({ ...prev, loading: false, error: true }));
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);
  console.log(sample);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      {/* Header */}
      <div className='text-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 shadow-lg'>
        <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6'>
          <button
            onClick={() =>
              setCommentSectionView({ isOpen: false, sample: null })
            }
            className='flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors'
          >
            <ArrowLeft className='w-4 h-4 sm:w-5 sm:h-5' />
            <span className='font-semibold text-sm sm:text-base'>
              Back to Samples
            </span>
          </button>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Sample Information Card */}
        <div className='bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8'>
          <h2 className='text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 pb-2 border-b-2 border-blue-600'>
            Sample Information
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
            <div className='space-y-1.5 sm:space-y-2'>
              <label className='block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide'>
                Sample ID
              </label>
              <p className='text-sm sm:text-base text-gray-900 dark:text-white font-medium px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
                {sample.sampleId}
              </p>
            </div>

            <div className='space-y-1.5 sm:space-y-2'>
              <label className='block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide'>
                Date
              </label>
              <p className='text-sm sm:text-base text-gray-900 dark:text-white font-medium px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
                {sample.date || "14 / 03 / 2025"}
              </p>
            </div>

            <div className='space-y-1.5 sm:space-y-2 sm:col-span-2 lg:col-span-1'>
              <label className='block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide'>
                Variant
              </label>
              <p className='text-sm sm:text-base text-gray-900 dark:text-white font-medium px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
                {sample?.productVariant.displayName}
              </p>
            </div>

            <div className='space-y-1.5 sm:space-y-2 sm:col-span-2 lg:col-span-3'>
              <label className='block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide'>
                Location
              </label>
              <p className='text-sm sm:text-base text-gray-900 dark:text-white font-medium px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
                {sample?.state?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className='bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700/50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2'>
              <MessageSquare className='w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0' />
              <span className='flex-1 min-w-0 truncate'>
                Comments & Remarks
              </span>
              <span className='text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400 whitespace-nowrap'>
                {fetchedComments.length}{" "}
                {fetchedComments.length === 1 ? "comment" : "comments"}
              </span>
            </h2>
          </div>

          {/* Comments List */}
          <div className='p-4 sm:p-6 min-h-[250px] sm:min-h-[300px] max-h-[400px] sm:max-h-[500px] overflow-y-auto'>
            {requestMessage.loading && (
              <div className='flex flex-col items-center justify-center py-8 sm:py-12'>
                <Loader className='w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-spin mb-2 sm:mb-3' />
                <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium'>
                  Loading comments...
                </p>
              </div>
            )}

            {requestMessage.error && (
              <div className='flex flex-col items-center justify-center py-8 sm:py-12'>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-2 sm:mb-3'>
                  <svg
                    className='w-6 h-6 sm:w-8 sm:h-8 text-red-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <p className='text-sm sm:text-base text-red-600 dark:text-red-400 font-semibold'>
                  Error loading comments
                </p>
              </div>
            )}

            {!requestMessage.loading &&
              !requestMessage.error &&
              fetchedComments.length === 0 && (
                <div className='flex flex-col items-center justify-center py-8 sm:py-12'>
                  <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 sm:mb-3'>
                    <MessageSquare className='w-6 h-6 sm:w-8 sm:h-8 text-gray-400' />
                  </div>
                  <p className='text-base sm:text-lg text-gray-500 dark:text-gray-400 font-semibold'>
                    No Comments Yet
                  </p>
                  <p className='text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1'>
                    Be the first to add a comment
                  </p>
                </div>
              )}

            {fetchedComments.length > 0 && (
              <div className='space-y-3 sm:space-y-4'>
                {fetchedComments.map((comment) => (
                  <Comments
                    key={comment.id}
                    comment={comment}
                    fetchComments={fetchComments}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Add Comment Form */}
          <div className='bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700'>
            {!canComment ? (
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg'>
                <Lock className='w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0' />
                <p className='text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 font-medium'>
                  Only supervisors, researchers, and policy makers can add
                  comments
                </p>
              </div>
            ) : (
              <>
                <label className='block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3'>
                  Add a Comment
                </label>
                <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                  <input
                    type='text'
                    placeholder='Write your comment or remark...'
                    className='flex-1 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-600 focus:outline-none font-medium transition-all'
                    value={writtenComment}
                    onChange={(e) => setWrittenComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && writtenComment.trim()) {
                        handleSubmitComment();
                      }
                    }}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!writtenComment.trim()}
                    className='px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto'
                  >
                    <Send className='w-4 h-4 sm:w-5 sm:h-5' />
                    <span>Comment</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentSection;
