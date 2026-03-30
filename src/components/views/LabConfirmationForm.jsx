import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";

const LabConfirmationForm = () => {
  const { sampleId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  // Debug: Log sampleId from URL params
  useEffect(() => {
    console.log("🔵 [LabConfirmationForm] Component mounted");
    console.log("   URL Parameters:", { sampleId });
    console.log("   sampleId type:", typeof sampleId);
    console.log("   sampleId value:", sampleId);
  }, []);

  useEffect(() => {
    const fetchSample = async () => {
      console.log("🟢 [fetchSample] Starting fetch");
      console.log("   sampleId from params:", sampleId);
      console.log("   sampleId === undefined:", sampleId === undefined);

      try {
        // Check if token exists before making request
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          console.error("❌ [fetchSample] No access token found");
          setError("Access token not found. Please log in again.");
          setLoading(false);
          return;
        }

        if (!sampleId) {
          console.error("❌ [fetchSample] sampleId is missing or undefined");
          setError("Sample ID is missing from URL");
          setLoading(false);
          return;
        }

        setLoading(true);
        console.log(
          "🔵 [fetchSample] Making API request to /lab/sample/" + sampleId,
        );
        const res = await api.get(`/lab/sample/${sampleId}`);
        console.log(
          "✅ [fetchSample] Sample fetched successfully:",
          res.data.data,
        );
        setSample(res.data.data);

        // Initialize form with readings pending AAS (Lead only - AAS not enforced for other metals)
        const initialData = {};
        res.data.data?.heavyMetalReadings?.forEach((reading) => {
          if (
            reading.heavyMetal === "LEAD" &&
            reading.requiresLabConfirmation &&
            reading.aasStatus === "PENDING"
          ) {
            initialData[reading.id] = {
              readingId: reading.id,
              aasReading: "",
              aasNotes: "",
              heavyMetal: reading.heavyMetal,
              xrfReading: reading.xrfReading,
            };
          }
        });
        console.log("🔵 [fetchSample] Form data initialized:", initialData);
        setFormData(initialData);
        setError(null);
      } catch (err) {
        console.error("❌ [fetchSample] Failed to fetch sample:", err);
        console.error("   Error message:", err.message);
        console.error("   Error response:", err.response?.data);
        console.error("   API URL attempted:", `/lab/sample/${sampleId}`);
        setError(err.response?.data?.message || "Failed to load sample data");
      } finally {
        setLoading(false);
      }
    };

    fetchSample();
  }, [sampleId]);

  const handleInputChange = (readingId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [readingId]: {
        ...prev[readingId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      console.log("🟡 [handleSubmit] Starting submission");
      console.log("   formData:", formData);

      // Validate form data
      const entries = Object.values(formData);
      console.log(`   Found ${entries.length} readings to submit`);

      entries.forEach((data, idx) => {
        console.log(`   Reading ${idx}:`, {
          readingId: data.readingId,
          aasReadingValue: parseFloat(data.aasReading),
          aasNotes: data.aasNotes,
          aasReadingType: typeof data.aasReading,
          aasReadingParsed: parseFloat(data.aasReading),
        });
      });

      // Submit each AAS reading
      const submissions = Object.values(formData).map((data) => {
        const payload = {
          readingId: data.readingId,
          aasReadingValue: parseFloat(data.aasReading),
          aasNotes: data.aasNotes,
        };
        console.log("🔵 [handleSubmit] Submitting payload:", payload);
        return api.post("/lab/record-aas-reading", payload);
      });

      const results = await Promise.all(submissions);
      console.log("✅ [handleSubmit] All submissions successful:", results);

      // Success - navigate back
      navigate("/lab-samples");
    } catch (err) {
      console.error("❌ [handleSubmit] Failed to submit readings:", err);
      console.error("   Error message:", err.message);
      console.error("   Error response data:", err.response?.data);
      console.error("   Error status:", err.response?.status);
      const backendMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join(", ")
          : null);
      setError(backendMessage || "Failed to submit AAS readings");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p
        className={`text-center mt-6 sm:mt-10 text-base sm:text-lg animate-pulse ${theme.text} px-4`}
      >
        Loading sample data...
      </p>
    );
  }

  if (error && !sample) {
    return (
      <div className='w-full flex justify-center mt-6 sm:mt-10 px-3 sm:px-4'>
        <div
          className={`border-l-4 p-3 sm:p-4 rounded shadow max-w-xl w-full ${theme.danger}`}
        >
          <h2 className='font-semibold text-base sm:text-lg'>{error}</h2>
        </div>
      </div>
    );
  }

  // AAS is only required for Lead; do not show or enforce AAS for other metals
  const readingsToConfirm =
    sample?.heavyMetalReadings?.filter(
      (r) =>
        r.heavyMetal === "LEAD" &&
        r.requiresLabConfirmation &&
        r.aasStatus === "PENDING",
    ) || [];

  return (
    <div className='max-w-4xl mx-auto px-3 sm:px-4 lg:px-6'>
      {/* HEADER */}
      <div className='flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6'>
        <button
          type='button'
          onClick={() => navigate("/lab-samples")}
          className={`p-1.5 sm:p-2 rounded-lg transition ${theme.hover}`}
          title='Back to lab samples'
          aria-label='Back to lab samples'
        >
          <ArrowLeft size={18} className={`sm:w-5 sm:h-5 ${theme.text}`} />
        </button>

        <h1
          className={`text-lg sm:text-xl md:text-2xl font-bold ${theme?.text}`}
        >
          Lab Confirmation (AAS Testing)
        </h1>
      </div>

      {error && (
        <div className='mb-4 p-3 sm:p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex gap-2 text-sm sm:text-base'>
          <AlertTriangle
            size={18}
            className='sm:w-5 sm:h-5 flex-shrink-0 mt-0.5'
          />
          <p className='break-words'>{error}</p>
        </div>
      )}

      {/* SAMPLE INFO */}
      <div
        className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-4 sm:p-6 mb-4 sm:mb-6`}
      >
        <h2
          className={`text-base sm:text-lg ${theme?.text} font-semibold mb-3 sm:mb-4`}
        >
          Sample Information
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
          <div className='min-w-0'>
            <p className={`text-xs sm:text-sm ${theme?.text}`}>Sample ID</p>
            <p
              className={`text-sm sm:text-base ${theme?.textMuted} font-semibold truncate`}
            >
              {sample?.sampleId}
            </p>
          </div>
          <div className='min-w-0'>
            <p className={`text-xs sm:text-sm ${theme?.text}`}>Product</p>
            <p
              className={`text-sm sm:text-base ${theme?.textMuted} font-semibold truncate`}
            >
              {sample?.productName}
            </p>
          </div>
          <div className='min-w-0'>
            <p className={`text-xs sm:text-sm ${theme?.text}`}>Brand</p>
            <p
              className={`text-sm sm:text-base ${theme?.textMuted} font-semibold truncate`}
            >
              {sample?.brandName || "N/A"}
            </p>
          </div>
          <div className='min-w-0'>
            <p className={`text-xs sm:text-sm ${theme?.text}`}>Location</p>
            <p
              className={`text-sm sm:text-base ${theme?.textMuted} font-semibold truncate`}
            >
              {sample?.lga?.name && sample?.state?.name
                ? `${sample.lga.name}, ${sample.state.name}`
                : sample?.state?.name
                  ? sample.state.name
                  : "N/A"}
            </p>
          </div>
          <div className='min-w-0'>
            <p className={`text-xs sm:text-sm ${theme?.text}`}>Sample Type</p>
            <p
              className={`text-sm sm:text-base ${theme?.textMuted} font-semibold`}
            >
              {sample?.sampleType}
            </p>
          </div>
          <div className='min-w-0'>
            <p className={`text-xs sm:text-sm ${theme?.text}`}>
              Date Collected
            </p>
            <p
              className={`text-sm sm:text-base ${theme?.textMuted} font-semibold`}
            >
              {sample?.createdAt
                ? new Date(sample.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* AAS READINGS FORM */}
      <form onSubmit={handleSubmit} className='space-y-3 sm:space-y-4'>
        {readingsToConfirm.length > 0 ? (
          readingsToConfirm.map((reading) => (
            <div
              key={reading.id}
              className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-4 sm:p-6`}
            >
              <h3
                className={`${theme?.text} text-base sm:text-lg font-semibold mb-3 sm:mb-4`}
              >
                {reading.heavyMetal} Testing
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4'>
                {/* XRF Reading (Read-only) */}
                <div>
                  <label
                    className={`text-xs sm:text-sm font-semibold ${theme?.text} block mb-1 sm:mb-1.5`}
                  >
                    XRF Screening Result (ppm)
                  </label>
                  <input
                    type='number'
                    disabled
                    value={reading.xrfReading || "—"}
                    className={`${theme?.input} ${theme?.textMuted} w-full px-2.5 py-2 sm:px-3 text-sm sm:text-base border rounded-lg cursor-not-allowed`}
                  />
                </div>

                {/* AAS Reading (Required) */}
                <div>
                  <label
                    className={`text-xs sm:text-sm ${theme?.text} font-semibold block mb-1 sm:mb-1.5`}
                  >
                    AAS Lab Result (ppm) *
                  </label>
                  <input
                    type='number'
                    step='0.001'
                    min='0'
                    required
                    value={formData[reading.id]?.aasReading || ""}
                    onChange={(e) =>
                      handleInputChange(
                        reading.id,
                        "aasReading",
                        e.target.value,
                      )
                    }
                    placeholder='Enter AAS reading'
                    className={`w-full px-2.5 py-2 sm:px-3 text-sm sm:text-base border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
              </div>

              {/* AAS Notes */}
              <div className='mb-3 sm:mb-4'>
                <label
                  className={`${theme?.text} text-xs sm:text-sm font-semibold block mb-1 sm:mb-1.5`}
                >
                  Lab Notes (Optional)
                </label>
                <textarea
                  rows='3'
                  value={formData[reading.id]?.aasNotes || ""}
                  onChange={(e) =>
                    handleInputChange(reading.id, "aasNotes", e.target.value)
                  }
                  placeholder='Add any observations, anomalies, or testing conditions...'
                  className={`w-full px-2.5 py-2 sm:px-3 text-sm sm:text-base border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* Status Indicator */}
              <div
                className={`p-2.5 sm:p-3 rounded-lg ${
                  theme?.bg === "bg-gray-100" ? "bg-blue-50" : "bg-blue-900"
                }`}
              >
                <p className='text-xs text-blue-700 dark:text-blue-300'>
                  <strong>Status:</strong> Pending AAS confirmation
                </p>
              </div>
            </div>
          ))
        ) : (
          <div
            className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-6 sm:p-8 text-center`}
          >
            <p className={`text-sm sm:text-base ${theme?.textMuted}`}>
              No readings pending AAS confirmation for this sample
            </p>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        {readingsToConfirm.length > 0 && (
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6'>
            <button
              type='button'
              onClick={() => navigate("/lab-samples")}
              className={`px-4 py-2 border ${theme?.hover} ${theme?.text} ${theme?.bg} ${theme?.border} rounded-lg text-sm sm:text-base font-medium transition-colors`}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm sm:text-base font-medium'
            >
              <Save size={16} className='sm:w-[18px] sm:h-[18px]' />
              {submitting ? "Submitting..." : "Submit AAS Results"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default LabConfirmationForm;
