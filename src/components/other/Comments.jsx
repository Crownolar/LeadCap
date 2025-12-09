import { api } from "../../redux/slice/samplesSlice";

export default function Comments({ comment, fetchComments }) {
  const handleDelete = () => {
    api
      .delete(`/comments/${comment.id}/`)
      .then((results) => console.log(results.data.message))
      .then(() => fetchComments());
    fetchComments;
  };

  return (
    <div className="flex flex-col  border-green-900 border-2 p-3 gap-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 mb-2">
          <h2 className=" bg-emerald-500 flex items-center justify-center text-white font-bold p-2">
            {comment.user.fullName}
          </h2>
          <h2 className="text-lg font-bold text-gray-400">
            {comment?.user?.role}
          </h2>
        </div>
        <span className="text-xl" onClick={handleDelete}>
          🎆
        </span>
      </div>
      <p className="font-semibold text-lg text-white">{comment.commentText}</p>
      <div className="flex gap-5">
        <span className="text-gray-400">{comment.createdAt.split("T")[0]}</span>
        <span className="text-gray-400">
          {comment.createdAt.split("T")[1].split(":").splice(0, 2).join(":")}
        </span>
        <span className="text-gray-400">👍</span>
      </div>
    </div>
  );
}
