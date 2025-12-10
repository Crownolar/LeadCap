import api from "../../utils/api";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Edit2, Trash2, X, Check } from "lucide-react";

export default function Comments({ comment, fetchComments }) {
  const { currentUser } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.commentText);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user owns this comment or is admin/researcher
  const isOwner = currentUser?.id === comment.user.id;
  const isAdmin = ["SUPER_ADMIN", "HEAD_RESEARCHER"].includes(currentUser?.role);
  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    setIsLoading(true);
    try {
      await api.delete(`/comments/${comment.id}`);
      fetchComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditText(comment.commentText);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      await api.put(`/comments/${comment.id}`, { commentText: editText });
      setIsEditing(false);
      fetchComments();
    } catch (error) {
      console.error("Failed to update comment:", error);
      alert("Failed to update comment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col border-l-4 border-emerald-500 bg-white dark:bg-gray-800 rounded-lg p-4 gap-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with user info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold px-3 py-2 rounded-lg min-w-max">
            {comment.user.fullName}
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
            {comment?.user?.role}
          </span>
        </div>

        {/* Action buttons */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={handleEditToggle}
                disabled={isLoading}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                title="Edit comment"
              >
                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                title="Delete comment"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Comment content - display or edit mode */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleEditToggle}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="font-medium text-gray-900 dark:text-white leading-relaxed">
          {comment.commentText}
        </p>
      )}

      {/* Footer with timestamp */}
      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
        <span>
          {comment.createdAt.split("T")[0]}
        </span>
        <span>
          {comment.createdAt.split("T")[1].split(":").slice(0, 2).join(":")}
        </span>
        {comment.updatedAt !== comment.createdAt && (
          <span className="italic">(edited)</span>
        )}
      </div>
    </div>
  );
}
