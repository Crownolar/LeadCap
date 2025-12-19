import React, { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import api from "../../utils/api";
import { CheckCircle } from "lucide-react";

const SampleReview = ({ theme: propTheme }) => {
  const { theme: hookTheme } = useTheme();
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [reviewing, setReviewing] = useState(false);
  const [bulkSelection, setBulkSelection] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
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
      const response = await api.get(`/supervisor/samples`);

      if (response.data.success) {
        // Filter samples by review status on frontend since backend doesn't support status param
        const filtered = response.data.data.filter(sample => {
          const reviewStatus = sample.review?.status || 'PENDING';
          return reviewStatus === filterStatus;
        });
        setSamples(filtered);
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
      const response = await api.post(
        `/supervisor/samples/${selectedSample.id}/review`,
        {
          status: reviewForm.status,
          comments: reviewForm.requestedChanges || reviewForm.comments,
          issues: reviewForm.issues,
        }
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

  const handleToggleBulkSelection = (sampleId) => {
    const newSelection = new Set(bulkSelection);
    if (newSelection.has(sampleId)) {
      newSelection.delete(sampleId);
    } else {
      newSelection.add(sampleId);
    }
    setBulkSelection(newSelection);
  };

  const handleSelectAll = () => {
    if (bulkSelection.size === samples.length) {
      setBulkSelection(new Set());
    } else {
      setBulkSelection(new Set(samples.map(s => s.id)));
    }
  };

  const handleBulkAction = async (status) => {
    if (bulkSelection.size === 0) {
      alert("Please select at least one sample");
      return;
    }

    if (!window.confirm(`Are you sure you want to mark ${bulkSelection.size} sample(s) as ${status}?`)) {
      return;
    }

    try {
      setBulkProcessing(true);
      let successCount = 0;
      let errorCount = 0;

      for (const sampleId of bulkSelection) {
        try {
          await api.post(`/supervisor/samples/${sampleId}/review`, {
            status,
            comments: "",
            issues: [],
          });
          successCount++;
        } catch (err) {
          errorCount++;
        }
      }

      alert(`Completed: ${successCount} approved, ${errorCount} failed`);
      setBulkSelection(new Set());
      fetchSamples();
    } catch (err) {
      console.error("Error in bulk action:", err);
      alert("Error processing bulk action");
    } finally {
      setBulkProcessing(false);
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

      {/* Filter Tabs & Bulk Actions */}
      <div className="space-y-4">
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

        {/* Bulk Actions Bar */}
        {bulkSelection.size > 0 && (
          <div className={`${theme?.card} border ${theme?.border} rounded-lg p-4 flex items-center justify-between flex-wrap gap-3`}>
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-600" />
              <span className="font-semibold">{bulkSelection.size} sample(s) selected</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleBulkAction("APPROVED")}
                disabled={bulkProcessing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                ✓ Approve All
              </button>
              <button
                onClick={() => handleBulkAction("REJECTED")}
                disabled={bulkProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                ✗ Reject All
              </button>
              <button
                onClick={() => handleBulkAction("FLAGGED")}
                disabled={bulkProcessing}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                ⚠ Flag All
              </button>
              <button
                onClick={() => setBulkSelection(new Set())}
                disabled={bulkProcessing}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Samples List */}
        <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {filterStatus} Samples ({samples.length})
            </h3>
            {samples.length > 0 && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulkSelection.size === samples.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>Select All</span>
              </label>
            )}
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {samples.length === 0 ? (
              <p className={`${theme?.textMuted} text-center py-8`}>
                No {filterStatus.toLowerCase()} samples
              </p>
            ) : (
              samples.map((sample) => (
                <div
                  key={sample.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    selectedSample?.id === sample.id
                      ? `${theme?.card} border-emerald-500 bg-emerald-50`
                      : `border ${theme?.border} hover:bg-opacity-50`
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={bulkSelection.has(sample.id)}
                    onChange={() => handleToggleBulkSelection(sample.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded text-emerald-600 mt-1 flex-shrink-0"
                  />
                  <button
                    onClick={() => handleSelectSample(sample)}
                    className="flex-1 text-left"
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
                </div>
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
