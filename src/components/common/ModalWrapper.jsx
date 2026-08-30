import { X } from "lucide-react";

function Modal({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 '
    >
      <button
        onClick={onClose}
        className='absolute right-2 top-24 z-10 rounded-full p-1 transition hover:bg-gray-100 dark:hover:bg-gray-800 '
      >
        <X size={25} color='white' />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className=' flex max-h-[60vh] w-full  flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-900 dark:text-white'
      >
        <div className='overflow-y-auto  '>{children}</div>{" "}
      </div>
    </div>
  );
}

export default Modal;
