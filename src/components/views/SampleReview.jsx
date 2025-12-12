import React, { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import api from "../../utils/api";

const SampleReview = ({ theme: propTheme }) => {
  const { theme: hookTheme } = useTheme();
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [reviewing, setReviewing] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: "APPROVED",
    comments: "",
    issues: [],
    requestedChanges: "",
  });

  const theme = propTheme || hookTheme;

  const ISSUE_OPTIONS = [
    "Incomplete GPS location",
    "Missing product photo",
    "Invalid batch number",
    "Incorrect vendor type",
    "Suspicious pricing",
    "Poor data quality",
    "Missing heavy metal readings",
    "Other",
  ];

  useEffect(() => {
    fetchSamples();
  }, [filterStatus]);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/supervisor/samples?status=${filterStatus}`
      );

      if (response.data.success) {
        setSamples(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching samples:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setReviewForm({
      status: sample.review?.status || "APPROVED",
      comments: sample.review?.comments || "",
      issues: sample.review?.issues || [],
      requestedChanges: sample.review?.requestedChanges || "",
    });
  };

  const handleIssueToggle = (issue) => {
    setReviewForm((prev) => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter((i) => i !== issue)
        : [...prev.issues, issue],
    }));
  };

  const handleSubmitReview = async () => {
    if (!selectedSample) return;

    try {
      setReviewing(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `/api/supervisor/samples/${selectedSample.id}/review`,
        {
          status: reviewForm.status,
          comments: reviewForm.comments,
          issues: reviewForm.issues,
          requestedChanges: reviewForm.requestedChanges,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(`Sample ${reviewForm.status.toLowerCase()}!`);
        fetchSamples();
        setSelectedSample(null);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review: " + err.message);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className={`${theme?.card} rounded-lg p-8 text-center`}>
        <p className={theme?.textMuted}>Loading samples...</p>
      </div>
    );
  }

  return (
    <div className={`${theme?.text} space-y-6`}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["PENDING", "APPROVED", "REJECTED", "FLAGGED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterStatus === status
                ? "bg-emerald-600 text-white"
                : `${theme?.card} border ${theme?.border} hover:bg-opacity-50`
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Samples List */}
        <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
          <h3 className="text-lg font-semibold mb-4">
            {filterStatus} Samples ({samples.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {samples.length === 0 ? (
              <p className={`${theme?.textMuted} text-center py-8`}>
                No {filterStatus.toLowerCase()} samples
              </p>
            ) : (
              samples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedSample?.id === sample.id
                      ? `${theme?.card} border-emerald-500 bg-emerald-50`
                      : `border ${theme?.border} hover:bg-opacity-50`
                  }`}
                >
                  <p className="font-semibold text-sm">{sample.productName}</p>
                  <p className={`text-xs ${theme?.textMuted}`}>
                    {sample.sampleId}
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      {sample.state?.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      sample.verificationStatus === "VERIFIED_ORIGINAL"
                        ? "bg-green-100 text-green-700"
                        : sample.verificationStatus === "VERIFIED_FAKE"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {sample.verificationStatus}
                    </span>
                  </div>
                  <p className={`text-xs ${theme?.textMuted} mt-2`}>
                    by {sample.creator?.fullName}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Sample Details & Review Form */}
        <div className="lg:col-span-2">
          {selectedSample ? (
            <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border} space-y-6`}>
              {/* Sample Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Sample Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={theme?.textMuted}>Sample ID</p>
                    <p className="font-semibold">{selectedSample.sampleId}</p>
                  </div>
                  <div>
                    <p className={theme?.textMuted}>Product</p>
                    <p className="font-semibold">{selectedSample.productName}</p>
                  </div>
                  <div>
                    <p className={theme?.textMuted}>Location</p>
                    <p className="font-semibold">
                      {selectedSample.state?.name} - {selectedSample.lga?.name} -{" "}
                      {selectedSample.market?.name}
                    </p>
                  </div>
                  <div>
                    <p className={theme?.textMuted}>Collected By</p>
                    <p className="font-semibold">{selectedSample.creator?.fullName}</p>
                  </div>
                  <div>
                    <p className={theme?.textMuted}>Brand</p>
                    <p className="font-semibold">{selectedSample.brandName || "-"}</p>
                  </div>
                  <div>
                    <p className={theme?.textMuted}>Batch Number</p>
                    <p className="font-semibold">{selectedSample.batchNumber || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Heavy Metals Readings */}
              {selectedSample.heavyMetalReadings && selectedSample.heavyMetalReadings.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Heavy Metal Readings</h4>
                  <div className="space-y-2">
                    {selectedSample.heavyMetalReadings.map((reading, idx) => (
                      <div key={idx} className={`border ${theme?.border} rounded p-2 text-sm`}>
                        <p className="font-semibold">{reading.heavyMetal}</p>
                        <p className={theme?.textMuted}>
                          XRF: {reading.xrfReading || "-"} | AAS: {reading.aasReading || "-"}
                        </p>
                        <p className={`text-xs ${reading.status === "SAFE" ? "text-green-600" : "text-red-600"}`}>
                          Status: {reading.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Form */}
              <div className={`border-t ${theme?.border} pt-4`}>
                <h4 className="font-semibold mb-3">Review Sample</h4>

                {/* Status */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">
                    Decision
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["APPROVED", "REJECTED", "FLAGGED", "CORRECTION_REQUESTED"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            setReviewForm((prev) => ({ ...prev, status }))
                          }
                          className={`py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                            reviewForm.status === status
                              ? "bg-emerald-600 text-white"
                              : `border ${theme?.border} hover:bg-opacity-50`
                          }`}
                        >
                          {status.replace(/_/g, " ")}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Issues */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">
                    Flag Issues (if any)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ISSUE_OPTIONS.map((issue) => (
                      <label
                        key={issue}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={reviewForm.issues.includes(issue)}
                          onChange={() => handleIssueToggle(issue)}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        {issue}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">
                    Comments
                  </label>
                  <textarea
                    value={reviewForm.comments}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comments: e.target.value,
                      }))
                    }
                    rows="3"
                    placeholder="Add notes or observations..."
                    className={`w-full px-3 py-2 border ${theme?.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                </div>

                {/* Requested Changes */}
                {reviewForm.status === "CORRECTION_REQUESTED" && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">
                      What needs to be corrected?
                    </label>
                    <textarea
                      value={reviewForm.requestedChanges}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          requestedChanges: e.target.value,
                        }))
                      }
                      rows="3"
                      placeholder="Describe what the collector needs to fix..."
                      className={`w-full px-3 py-2 border ${theme?.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {reviewing ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`${theme?.card} rounded-lg p-6 border ${theme?.border} text-center`}
            >
              <p className={theme?.textMuted}>
                Select a sample to review
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SampleReview;
