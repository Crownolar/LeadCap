import api from "../../utils/api";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Edit2,
  Trash2,
  X,
  Check,
  UserRound,
  Clock3,
  MoreHorizontal,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRole = (role) => {
  if (!role) return "User";

  return String(role)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

export default function Comments({
  comment,
  fetchComments,
}) {
  const { currentUser } = useSelector(
    (state) => state.auth
  );

  const { theme } = useTheme();

  const [isEditing, setIsEditing] =
    useState(false);

  const [editText, setEditText] = useState(
    comment?.commentText || ""
  );

  const [isLoading, setIsLoading] =
    useState(false);

  /* ---------------------------------------------------------------------- */
  /* Permissions                                                            */
  /* ---------------------------------------------------------------------- */

  const isOwner =
    currentUser?.id === comment?.user?.id;

  const isAdmin = [
    "SUPER_ADMIN",
    "HEAD_RESEARCHER",
  ].includes(currentUser?.role);

  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner;

  /* ---------------------------------------------------------------------- */
  /* Delete                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this comment?"
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      await api.delete(
        `/comments/${comment.id}`
      );

      await fetchComments();
    } catch (error) {
      console.error(
        "Failed to delete comment:",
        error
      );

      alert("Failed to delete comment");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Edit toggle                                                            */
  /* ---------------------------------------------------------------------- */

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }

    setEditText(
      comment?.commentText || ""
    );

    setIsEditing(true);
  };

  /* ---------------------------------------------------------------------- */
  /* Save edit                                                              */
  /* ---------------------------------------------------------------------- */

  const handleSaveEdit = async () => {
    const trimmedText =
      editText.trim();

    if (!trimmedText) {
      alert("Comment cannot be empty");
      return;
    }

    setIsLoading(true);

    try {
      await api.put(
        `/comments/${comment.id}`,
        {
          commentText: trimmedText,
        }
      );

      setIsEditing(false);

      await fetchComments();
    } catch (error) {
      console.error(
        "Failed to update comment:",
        error
      );

      alert("Failed to update comment");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  const fullName =
    comment?.user?.fullName ||
    "Unknown user";

  const role = formatRole(
    comment?.user?.role
  );

  const wasEdited =
    comment?.updatedAt &&
    comment?.createdAt &&
    comment.updatedAt !== comment.createdAt;

  return (
    <article
      className={`
        group relative
        rounded-xl border
        p-3.5 sm:p-4
        ${theme.card}
        ${theme.border}
        transition-all duration-200
        hover:shadow-sm
      `}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex items-start gap-3">
        {/* User avatar */}

        <div
          className={`
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-xl
            ${theme.emerald}
            ${theme.emeraldText}
          `}
        >
          <UserRound size={15} />
        </div>

        {/* Identity */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p
              className={`
                truncate text-[12px]
                font-bold
                ${theme.text}
              `}
            >
              {fullName}
            </p>

            <span
              className={`
                rounded-md border
                px-1.5 py-0.5
                text-[8px] font-semibold
                uppercase tracking-wide
                ${theme.border}
                ${theme.bg}
                ${theme.textMuted}
              `}
            >
              {role}
            </span>
          </div>

          {/* Timestamp */}

          <div
            className={`
              mt-1 flex flex-wrap
              items-center gap-x-2 gap-y-1
              text-[9px]
              ${theme.textMuted}
            `}
          >
            <span className="inline-flex items-center gap-1">
              <Clock3 size={10} />

              {formatDate(
                comment?.createdAt
              )}
            </span>

            <span>
              {formatTime(
                comment?.createdAt
              )}
            </span>

            {wasEdited && (
              <span className="italic">
                Edited
              </span>
            )}
          </div>
        </div>

        {/* Actions */}

        {!isEditing &&
          (canEdit || canDelete) && (
            <div
              className="
                flex shrink-0
                items-center gap-0.5
              "
            >
              {canEdit && (
                <button
                  type="button"
                  onClick={
                    handleEditToggle
                  }
                  disabled={isLoading}
                  title="Edit comment"
                  className={`
                    flex h-7 w-7
                    items-center justify-center
                    rounded-lg
                    ${theme.textMuted}
                    hover:${theme.text}
                    ${theme.hover}
                    disabled:opacity-40
                  `}
                >
                  <Edit2 size={13} />
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  onClick={
                    handleDelete
                  }
                  disabled={isLoading}
                  title="Delete comment"
                  className="
                    flex h-7 w-7
                    items-center justify-center
                    rounded-lg
                    text-slate-400
                    hover:bg-red-50
                    hover:text-red-600
                    dark:hover:bg-red-950/30
                    dark:hover:text-red-400
                    disabled:opacity-40
                  "
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Comment content                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div className="ml-0 mt-3 sm:ml-12">
        {isEditing ? (
          <div className="space-y-2.5">
            <textarea
              value={editText}
              onChange={(event) =>
                setEditText(
                  event.target.value
                )
              }
              rows={4}
              autoFocus
              disabled={isLoading}
              className={`
                w-full resize-none
                rounded-xl border
                px-3.5 py-3
                text-sm leading-relaxed
                outline-none
                transition
                ${theme.border}
                ${theme.bg}
                ${theme.text}
                focus:ring-2
                focus:ring-emerald-500/20
                disabled:opacity-60
              `}
              placeholder="Edit your comment…"
            />

            <div
              className="
                flex items-center
                justify-end gap-2
              "
            >
              <button
                type="button"
                onClick={
                  handleEditToggle
                }
                disabled={isLoading}
                className={`
                  inline-flex
                  items-center gap-1.5
                  rounded-lg
                  border
                  px-3 py-1.5
                  text-[10px] font-semibold
                  ${theme.border}
                  ${theme.textMuted}
                  ${theme.hover}
                  disabled:opacity-40
                `}
              >
                <X size={12} />

                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveEdit
                }
                disabled={
                  isLoading ||
                  !editText.trim()
                }
                className="
                  inline-flex
                  items-center gap-1.5
                  rounded-lg
                  bg-emerald-600
                  px-3 py-1.5
                  text-[10px] font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-emerald-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {isLoading ? (
                  <span
                    className="
                      h-3 w-3
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                ) : (
                  <Check size={12} />
                )}

                Save changes
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`
              rounded-xl
              border
              px-3.5 py-3
              ${theme.border}
              ${theme.bg}
            `}
          >
            <p
              className={`
                whitespace-pre-wrap
                break-words
                text-[12px]
                font-medium
                leading-relaxed
                ${theme.text}
              `}
            >
              {comment?.commentText ||
                "No comment text."}
            </p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Loading indicator                                                  */}
      {/* ------------------------------------------------------------------ */}

      {isLoading && !isEditing && (
        <div
          className="
            pointer-events-none
            absolute inset-0
            flex items-center
            justify-center
            rounded-xl
            bg-white/40
            backdrop-blur-[1px]
            dark:bg-black/20
          "
        >
          <div
            className="
              h-5 w-5 animate-spin
              rounded-full
              border-2
              border-emerald-500/30
              border-t-emerald-600
            "
          />
        </div>
      )}
    </article>
  );
}