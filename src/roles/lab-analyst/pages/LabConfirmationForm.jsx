/**
 * LabConfirmationForm.jsx
 * ─────────────────────────
 * Thin orchestrator. Data via useLabConfirmationForm.
 * No API calls or business logic here.
 */

import React from "react";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { useLabConfirmationForm } from "../hooks/useLabConfirmationForm";

const LabConfirmationForm = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    sample, loading, submitting, error,
    formData, readingsToConfirm,
    handleInputChange, handleSubmit,
  } = useLabConfirmationForm();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!submitting) handleSubmit();
  };

  if (loading) {
    return (
      <p className={`text-center mt-6 sm:mt-10 text-base sm:text-lg animate-pulse ${theme.text} px-4`}>
        Loading sample data...
      </p>
    );
  }

  if (error && !sample) {
    return (
      <div className="w-full flex justify-center mt-6 sm:mt-10 px-3 sm:px-4">
        <div className={`border-l-4 p-3 sm:p-4 rounded shadow max-w-xl w-full ${theme.danger}`}>
          <h2 className="font-semibold text-base sm:text-lg">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          type="button"
          onClick={() => navigate("/lab-samples")}
          className={`p-1.5 sm:p-2 rounded-lg transition ${theme.hover}`}
          title="Back to lab samples"
          aria-label="Back to lab samples"
        >
          <ArrowLeft size={18} className={`sm:w-5 sm:h-5 ${theme.text}`} />
        </button>
        <h1 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme?.text}`}>
          Lab Confirmation (AAS Testing)
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 sm:p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex gap-2 text-sm sm:text-base">
          <AlertTriangle size={18} className="sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
          <p className="break-words">{error}</p>
        </div>
      )}

      {/* Sample info */}
      <div className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-4 sm:p-6 mb-4 sm:mb-6`}>
        <h2 className={`text-base sm:text-lg ${theme?.text} font-semibold mb-3 sm:mb-4`}>Sample Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            { label: "Sample ID", value: sample?.sampleId },
            { label: "Product", value: sample?.productName },
            { label: "Brand", value: sample?.brandName || "N/A" },
            {
              label: "Location",
              value: sample?.lga?.name && sample?.state?.name
                ? `${sample.lga.name}, ${sample.state.name}`
                : sample?.state?.name || "N/A",
            },
            { label: "Sample Type", value: sample?.sampleType },
            { label: "Date Collected", value: sample?.createdAt ? new Date(sample.createdAt).toLocaleDateString() : "N/A" },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <p className={`text-xs sm:text-sm ${theme?.text}`}>{label}</p>
              <p className={`text-sm sm:text-base ${theme?.textMuted} font-semibold truncate`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AAS readings form */}
      <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
        {readingsToConfirm.length > 0 ? (
          readingsToConfirm.map((reading) => (
            <div key={reading.id} className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-4 sm:p-6`}>
              <h3 className={`${theme?.text} text-base sm:text-lg font-semibold mb-3 sm:mb-4`}>
                {reading.heavyMetal} Testing
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <label className={`text-xs sm:text-sm font-semibold ${theme?.text} block mb-1 sm:mb-1.5`}>
                    XRF Screening Result (ppm)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={reading.xrfReading || "—"}
                    className={`${theme?.input} ${theme?.textMuted} w-full px-2.5 py-2 sm:px-3 text-sm sm:text-base border rounded-lg cursor-not-allowed`}
                  />
                </div>

                <div>
                  <label className={`text-xs sm:text-sm ${theme?.text} font-semibold block mb-1 sm:mb-1.5`}>
                    AAS Lab Result (ppm) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    value={formData[reading.id]?.aasReading || ""}
                    onChange={(e) => handleInputChange(reading.id, "aasReading", e.target.value)}
                    placeholder="Enter AAS reading"
                    className={`w-full px-2.5 py-2 sm:px-3 text-sm sm:text-base border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <label className={`${theme?.text} text-xs sm:text-sm font-semibold block mb-1 sm:mb-1.5`}>
                  Lab Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  value={formData[reading.id]?.aasNotes || ""}
                  onChange={(e) => handleInputChange(reading.id, "aasNotes", e.target.value)}
                  placeholder="Add any observations, anomalies, or testing conditions..."
                  className={`w-full px-2.5 py-2 sm:px-3 text-sm sm:text-base border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              <div className={`p-2.5 sm:p-3 rounded-lg ${theme?.bg === "bg-gray-100" ? "bg-blue-50" : "bg-blue-900"}`}>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Status:</strong> Pending AAS confirmation
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-6 sm:p-8 text-center`}>
            <p className={`text-sm sm:text-base ${theme?.textMuted}`}>
              No readings pending AAS confirmation for this sample
            </p>
          </div>
        )}

        {readingsToConfirm.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={() => navigate("/lab-samples")}
              className={`px-4 py-2 border ${theme?.hover} ${theme?.text} ${theme?.bg} ${theme?.border} rounded-lg text-sm sm:text-base font-medium transition-colors`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm sm:text-base font-medium"
            >
              <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
              {submitting ? "Submitting..." : "Submit AAS Results"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default LabConfirmationForm;