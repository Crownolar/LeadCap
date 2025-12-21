// import React, { useEffect } from "react";

// const PopupModal = ({
//   show,
//   message,
//   type = "error",
//   onClose,
//   autoClose = 4000,
// }) => {
//   useEffect(() => {
//     if (show && autoClose) {
//       const timer = setTimeout(onClose, autoClose);
//       return () => clearTimeout(timer);
//     }
//   }, [show, autoClose, onClose]);

//   if (!show) return null;

//   const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div
//         className={`rounded-lg shadow-lg p-6 max-w-sm w-full relative ${bgColor} text-white`}
//       >
//         <button
//           className="absolute top-2 right-2 text-white hover:text-gray-200 font-bold"
//           onClick={onClose}
//         >
//           &times;
//         </button>
//         <h2 className="text-lg font-semibold mb-2">
//           {type === "success" ? "Success" : "Error"}
//         </h2>
//         <p className="text-sm">{message}</p>
//       </div>
//     </div>
//   );
// };

// export default PopupModal;

import React, { useEffect } from "react";

const PopupModal = ({
  show,
  message,
  type = "error",
  onClose,
  autoClose = 4000,
}) => {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, onClose]);

  if (!show) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full relative border-t-4 border-l-4 border-emerald-500">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-light leading-none"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              isSuccess ? "bg-emerald-100" : "bg-red-100"
            }`}
          >
            {isSuccess ? (
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <div className="flex-1 pt-1">
            <h2
              className={`text-lg font-semibold mb-1 ${
                isSuccess ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {isSuccess ? "Success" : "Error"}
            </h2>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
