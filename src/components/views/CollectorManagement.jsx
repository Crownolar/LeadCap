import React, { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import api from "../../utils/api";

const CollectorManagement = ({ theme: propTheme }) => {
  const { theme: hookTheme } = useTheme();
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [states, setStates] = useState([]);
  const [lgas, setLGAs] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedLGAs, setSelectedLGAs] = useState([]);
  const [updating, setUpdating] = useState(false);

  const theme = propTheme || hookTheme;

  useEffect(() => {
    fetchCollectors();
    fetchStatesAndLGAs();
  }, []);

  const fetchCollectors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/supervisors/collectors");

      if (response.data.success) {
        setCollectors(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching collectors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatesAndLGAs = async () => {
    try {
      const statesRes = await api.get("/samples/states/all");
      const lgasRes = await api.get("/samples/lgas/all");

      if (statesRes.data.success) setStates(statesRes.data.data);
      if (lgasRes.data.success) setLGAs(lgasRes.data.data);
    } catch (err) {
      console.error("Error fetching states/lgas:", err);
    }
  };

  const handleSelectCollector = (collector) => {
    setSelectedCollector(collector);
    setSelectedStates(collector.assignedStates || []);
    setSelectedLGAs(collector.assignedLGAs || []);
  };

  const handleStateToggle = (stateId) => {
    setSelectedStates((prev) =>
      prev.includes(stateId)
        ? prev.filter((id) => id !== stateId)
        : [...prev, stateId]
    );
  };

  const handleLGAToggle = (lgaId) => {
    setSelectedLGAs((prev) =>
      prev.includes(lgaId)
        ? prev.filter((id) => id !== lgaId)
        : [...prev, lgaId]
    );
  };

  const handleUpdateAssignment = async () => {
    if (!selectedCollector) return;

    try {
      setUpdating(true);
      const response = await api.put(
        `/supervisors/collectors/${selectedCollector.id}/assignment`,
        {
          assignedStates: selectedStates,
          assignedLGAs: selectedLGAs,
        }
      );

      if (response.data.success) {
        // Update local state
        setCollectors((prev) =>
          prev.map((c) =>
            c.id === selectedCollector.id
              ? {
                  ...c,
                  assignedStates: selectedStates,
                  assignedLGAs: selectedLGAs,
                }
              : c
          )
        );
        setSelectedCollector({
          ...selectedCollector,
          assignedStates: selectedStates,
          assignedLGAs: selectedLGAs,
        });
        alert("Assignment updated successfully!");
      }
    } catch (err) {
      console.error("Error updating assignment:", err);
      alert("Failed to update assignment: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={`${theme?.card} rounded-lg p-8 text-center`}>
        <p className={theme?.textMuted}>Loading collectors...</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collectors List */}
        <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
          <h3 className="text-lg font-semibold mb-4">Your Data Collectors</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {collectors.length === 0 ? (
              <p className={theme?.textMuted}>No collectors assigned</p>
            ) : (
              collectors.map((collector) => (
                <button
                  key={collector.id}
                  onClick={() => handleSelectCollector(collector)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedCollector?.id === collector.id
                      ? `${theme?.card} border-emerald-500 bg-emerald-50`
                      : `border ${theme?.border} hover:bg-opacity-50`
                  }`}
                >
                  <p className="font-semibold text-sm">{collector.name}</p>
                  <p className={`text-xs ${theme?.textMuted}`}>{collector.email}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      {collector.totalSamples} samples
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded">
                      {collector.assignedStates.length} states
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Assignment Editor */}
        <div className="lg:col-span-2">
          {selectedCollector ? (
            <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
              <h3 className="text-lg font-semibold mb-4">
                Edit Assignment: {selectedCollector.name}
              </h3>

              {/* States */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Assign States</h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {states.map((state) => (
                    <label
                      key={state.id}
                      className="flex items-center gap-2 p-2 hover:bg-opacity-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStates.includes(state.id)}
                        onChange={() => handleStateToggle(state.id)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span className="text-sm">{state.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* LGAs */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Assign LGAs</h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {lgas.map((lga) => (
                    <label
                      key={lga.id}
                      className="flex items-center gap-2 p-2 hover:bg-opacity-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLGAs.includes(lga.id)}
                        onChange={() => handleLGAToggle(lga.id)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span className="text-sm">{lga.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className={`${theme?.border} border rounded-lg p-3 mb-4`}>
                <p className="text-sm">
                  <span className="font-semibold">Selected:</span>{" "}
                  {selectedStates.length} states, {selectedLGAs.length} LGAs
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleUpdateAssignment}
                disabled={updating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {updating ? "Updating..." : "Save Assignment"}
              </button>
            </div>
          ) : (
            <div
              className={`${theme?.card} rounded-lg p-6 border ${theme?.border} text-center`}
            >
              <p className={theme?.textMuted}>
                Select a collector to manage their assignment
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      {selectedCollector && (
        <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
          <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>Total Samples</p>
              <p className="text-2xl font-bold text-blue-600">
                {selectedCollector.totalSamples}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {selectedCollector.reviewStats.approved}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                {selectedCollector.reviewStats.pending}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {selectedCollector.reviewStats.rejected}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>Flagged</p>
              <p className="text-2xl font-bold text-purple-600">
                {selectedCollector.reviewStats.flagged}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorManagement;
