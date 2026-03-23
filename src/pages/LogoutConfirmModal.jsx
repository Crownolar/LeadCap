import React from "react";

const LogoutConfirmModal = ({ show, onConfirm, onCancel, theme }) => {
  if (!show) return null;

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-[3000]'>
      <div
        className={`${theme?.card} border ${theme?.border} ${theme?.text} rounded-xl p-6 shadow-xl max-w-sm w-full`}
      >
        <h2 className='text-lg font-semibold mb-3 text-center'>
          Are you sure you want to logout?
        </h2>
        <div className='flex justify-center gap-3 mt-4'>
          <button
            onClick={onConfirm}
            className='bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg'
          >
            Yes, Logout
          </button>
          <button
            onClick={onCancel}
            className='bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-lg'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
