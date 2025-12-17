import React, { useEffect, useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import api from "../../utils/api";

const CollectorManagement = ({ theme: propTheme }) => {
  const { theme: hookTheme } = useTheme();
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = propTheme || hookTheme;

  useEffect(() => {
    fetchCollectors();
  }, []);

  const fetchCollectors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/supervisor/collectors");

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

  const handleSelectCollector = (collector) => {
    setSelectedCollector(collector);
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
          <h3 className="text-lg font-semibold mb-4">Your Data Collectors ({collectors.length})</h3>
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
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Collector Details */}
        <div className="lg:col-span-2">
          {selectedCollector ? (
            <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border} space-y-4`}>
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Collector Details: {selectedCollector.name}
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={theme?.textMuted}>Name</p>
                      <p className="font-semibold">{selectedCollector.name}</p>
                    </div>
                    <div>
                      <p className={theme?.textMuted}>Email</p>
                      <p className="font-semibold">{selectedCollector.email}</p>
                    </div>
                    <div>
                      <p className={theme?.textMuted}>Organization</p>
                      <p className="font-semibold">{selectedCollector.organization || "N/A"}</p>
                    </div>
                    <div>
                      <p className={theme?.textMuted}>Joined</p>
                      <p className="font-semibold">
                        {new Date(selectedCollector.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`${theme?.card} rounded-lg p-6 border ${theme?.border} text-center`}
            >
              <p className={theme?.textMuted}>
                Select a collector to view their details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      {selectedCollector && (
        <div className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}>
          <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>Total Samples</p>
              <p className="text-2xl font-bold text-blue-600">
                {selectedCollector.totalSamples}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>This Month</p>
              <p className="text-2xl font-bold text-green-600">
                {selectedCollector.samplesThisMonth}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>States Covered</p>
              <p className="text-2xl font-bold text-purple-600">
                {Object.keys(selectedCollector.samplesByState || {}).length}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>Status</p>
              <p className={`text-2xl font-bold ${selectedCollector.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                {selectedCollector.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          {/* Samples by State */}
          {selectedCollector.samplesByState && Object.keys(selectedCollector.samplesByState).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-4">Samples by State</h4>
              <div className="space-y-2">
                {Object.entries(selectedCollector.samplesByState).map(([state, count]) => (
                  <div key={state} className="flex justify-between items-center text-sm">
                    <span className={theme?.textMuted}>{state}</span>
                    <span className="font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                      {count} samples
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectorManagement;
