import React from "react";
import { AlertTriangle } from "lucide-react";

const ErrorBanner = ({ message, onRetry }) => {
  return (
    <div className="w-full bg-red-500/10 border border-red-500 text-red-600 px-4 py-3 rounded-lg flex items-start gap-3 shadow-md animate-fadeIn">
      <AlertTriangle className="w-5 h-5 mt-1" />
      <div className="flex-1">
        <p className="font-semibold text-sm">Error</p>
        <p className="text-sm">{message}</p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-600 font-medium underline text-sm hover:text-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
