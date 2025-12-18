import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import api from "../../utils/api";

const LabConfirmationForm = ({ theme: propTheme }) => {
  const { sampleId } = useParams();
  const navigate = useNavigate();
  const { theme: hookTheme } = useTheme();
  const theme = propTheme || hookTheme;

  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchSample = async () => {
      try {
        // Check if token exists before making request
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          setError("Access token not found. Please log in again.");
          setLoading(false);
          return;
        }

        setLoading(true);
        const res = await api.get(`/lab/sample/${sampleId}`);
        setSample(res.data.data);
        
        // Initialize form with readings pending AAS
        const initialData = {};
        res.data.data?.heavyMetalReadings?.forEach((reading) => {
          if (reading.requiresLabConfirmation && reading.aasStatus === 'PENDING') {
            initialData[reading.id] = {
              readingId: reading.id,
              aasReading: '',
              aasNotes: '',
              heavyMetal: reading.heavyMetal,
              xrfReading: reading.xrfReading
            };
          }
        });
        setFormData(initialData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch sample:", err);
        setError(err.response?.data?.message || "Failed to load sample data");
      } finally {
        setLoading(false);
      }
    };

    fetchSample();
  }, [sampleId]);

  const handleInputChange = (readingId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [readingId]: {
        ...prev[readingId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);

      // Submit each AAS reading
      const submissions = Object.values(formData).map(data => 
        api.post('/lab/record-aas-reading', {
          readingId: data.readingId,
          aasReading: parseFloat(data.aasReading),
          aasNotes: data.aasNotes
        })
      );

      await Promise.all(submissions);
      
      // Success - navigate back
      navigate('/lab/dashboard');
    } catch (err) {
      console.error("Failed to submit readings:", err);
      setError(err.response?.data?.message || "Failed to submit AAS readings");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className={`text-center mt-10 text-lg animate-pulse ${theme?.text}`}>
        Loading sample data...
      </p>
    );
  }

  if (error && !sample) {
    return (
      <div className="w-full flex justify-center mt-10">
        <div className={`border-l-4 border-red-600 bg-red-50 text-red-700 p-4 rounded shadow max-w-xl`}>
          <h2 className="font-semibold text-lg">{error}</h2>
        </div>
      </div>
    );
  }

  const readingsToConfirm = sample?.heavyMetalReadings?.filter(
    r => r.requiresLabConfirmation && r.aasStatus === 'PENDING'
  ) || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/lab/dashboard')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className={`text-2xl font-bold ${theme?.text}`}>Lab Confirmation (AAS Testing)</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex gap-2">
          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* SAMPLE INFO */}
      <div className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-6 mb-6`}>
        <h2 className="text-lg font-semibold mb-4">Sample Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className={`text-sm ${theme?.textMuted}`}>Sample ID</p>
            <p className="font-semibold">{sample?.sampleId}</p>
          </div>
          <div>
            <p className={`text-sm ${theme?.textMuted}`}>Product</p>
            <p className="font-semibold">{sample?.productName}</p>
          </div>
          <div>
            <p className={`text-sm ${theme?.textMuted}`}>Brand</p>
            <p className="font-semibold">{sample?.brandName || "N/A"}</p>
          </div>
          <div>
            <p className={`text-sm ${theme?.textMuted}`}>Location</p>
            <p className="font-semibold">{sample?.lga?.name}, {sample?.state?.name}</p>
          </div>
          <div>
            <p className={`text-sm ${theme?.textMuted}`}>Sample Type</p>
            <p className="font-semibold">{sample?.sampleType}</p>
          </div>
          <div>
            <p className={`text-sm ${theme?.textMuted}`}>Date Collected</p>
            <p className="font-semibold">
              {sample?.createdAt ? new Date(sample.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* AAS READINGS FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {readingsToConfirm.length > 0 ? (
          readingsToConfirm.map((reading) => (
            <div key={reading.id} className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-6`}>
              <h3 className="text-lg font-semibold mb-4">{reading.heavyMetal} Testing</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* XRF Reading (Read-only) */}
                <div>
                  <label className={`text-sm font-semibold ${theme?.textMuted} block mb-1`}>
                    XRF Screening Result (mg/kg or mg/L)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={reading.xrfReading || '—'}
                    className={`w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed`}
                  />
                </div>

                {/* AAS Reading (Required) */}
                <div>
                  <label className={`text-sm font-semibold block mb-1`}>
                    AAS Lab Result (mg/kg or mg/L) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    value={formData[reading.id]?.aasReading || ''}
                    onChange={(e) =>
                      handleInputChange(reading.id, 'aasReading', e.target.value)
                    }
                    placeholder="Enter AAS reading"
                    className={`w-full px-3 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>
              </div>

              {/* AAS Notes */}
              <div className="mb-4">
                <label className={`text-sm font-semibold block mb-1`}>
                  Lab Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  value={formData[reading.id]?.aasNotes || ''}
                  onChange={(e) =>
                    handleInputChange(reading.id, 'aasNotes', e.target.value)
                  }
                  placeholder="Add any observations, anomalies, or testing conditions..."
                  className={`w-full px-3 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* Status Indicator */}
              <div className={`p-3 rounded-lg ${theme?.bg === 'bg-gray-100' ? 'bg-blue-50' : 'bg-blue-900'}`}>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Status:</strong> Pending AAS confirmation
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className={`${theme?.card} rounded-lg shadow-md border ${theme?.border} p-6 text-center`}>
            <p className={theme?.textMuted}>
              No readings pending AAS confirmation for this sample
            </p>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        {readingsToConfirm.length > 0 && (
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/lab/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition"
            >
              <Save size={18} />
              {submitting ? "Submitting..." : "Submit AAS Results"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default LabConfirmationForm;
