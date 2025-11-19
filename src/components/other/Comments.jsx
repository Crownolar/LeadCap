export default function Comments({ comment }) {
  return (
    <div className='flex flex-col  border-green-900 border-2 p-3 gap-2'>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold'>
            {comment.name[0]}
          </div>
          <h2 className='text-lg font-bold text-gray-400'>{comment.name}</h2>
        </div>
        <span className='text-xl'>🎆</span>
      </div>
      <p className='font-semibold text-lg text-white'>{comment.comment}</p>
      <div className='flex gap-5'>
        <span className='text-gray-400'>{comment.date}</span>
        <span className='text-gray-400'>{comment.time}</span>
        <span className='text-gray-400'>👍</span>
      </div>
    </div>
  );
} 
