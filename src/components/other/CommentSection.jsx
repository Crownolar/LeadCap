import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, Send, Loader } from "lucide-react";
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
      setRequestMessage((prev) => ({ ...prev, loading: false, error: true }));
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() =>
              setCommentSectionView({ isOpen: false, sample: null })
            }
            className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Samples</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Sample Details</h1>
              <p className="text-blue-100 text-sm">Comments & Remarks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sample Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-600">
            Sample Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Sample ID
              </label>
              <p className="text-gray-900 dark:text-white font-medium text-base px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {sample.sampleId}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Date
              </label>
              <p className="text-gray-900 dark:text-white font-medium text-base px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {sample.date || "14 / 03 / 2025"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Product Type
              </label>
              <p className="text-gray-900 dark:text-white font-medium text-base px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {sample?.productType}
              </p>
            </div>

            <div className="space-y-2 md:col-span-3">
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Location
              </label>
              <p className="text-gray-900 dark:text-white font-medium text-base px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {sample?.state?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Comments & Remarks
              <span className="ml-auto text-sm font-normal text-gray-600 dark:text-gray-400">
                {fetchedComments.length}{" "}
                {fetchedComments.length === 1 ? "comment" : "comments"}
              </span>
            </h2>
          </div>

          {/* Comments List */}
          <div className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto">
            {requestMessage.loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Loading comments...
                </p>
              </div>
            )}

            {requestMessage.error && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-red-600 dark:text-red-400 font-semibold">
                  Error loading comments
                </p>
              </div>
            )}

            {!requestMessage.loading &&
              !requestMessage.error &&
              fetchedComments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-semibold text-lg">
                    No Comments Yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Be the first to add a comment
                  </p>
                </div>
              )}

            {fetchedComments.length > 0 && (
              <div className="space-y-4">
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
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Add a Comment
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Write your comment or remark..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-600 focus:outline-none font-medium transition-all"
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
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Comment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentSection;
