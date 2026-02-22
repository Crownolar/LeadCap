import React, { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import api from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";

const StateActivation = ({ theme: themeProp, darkMode }) => {
  const { theme: contextTheme } = useTheme();
  const theme = themeProp || contextTheme;

  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await api.get("/management/states");
      setStates(response.data.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch states: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const handleToggleOne = async (state) => {
    setBusyId(state.id);
    try {
      await api.patch(`/management/states/${state.id}/active`, {
        isActive: !state.isActive,
      });
      await fetchStates();
      setSelectedIds((prev) => prev.filter((id) => id !== state.id));
      setError(null);
    } catch (err) {
      setError("Failed to update: " + (err.response?.data?.error || err.message));
    } finally {
      setBusyId(null);
    }
  };

  const handleBulk = async (isActive) => {
    if (selectedIds.length === 0) return;
    setBulkBusy(true);
    try {
      await api.patch("/management/states/bulk-active", {
        stateIds: selectedIds,
        isActive,
      });
      await fetchStates();
      setSelectedIds([]);
      setError(null);
    } catch (err) {
      setError("Bulk update failed: " + (err.response?.data?.error || err.message));
    } finally {
      setBulkBusy(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === states.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(states.map((s) => s.id));
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${theme?.text} flex items-center gap-2`}>
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading states...
      </div>
    );
  }

  return (
    <div className={`p-6 ${theme?.bg}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${theme?.text} mb-2`}>
          State activation
        </h1>
        <p className={theme?.textMuted}>
          Activate or deactivate states. Only active states appear in dropdowns (e.g. Add Sample).
        </p>
      </div>

      {error && (
        <div className={`mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm`}>
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          disabled={selectedIds.length === 0 || bulkBusy}
          onClick={() => handleBulk(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center gap-2"
        >
          {bulkBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Activate selected ({selectedIds.length})
        </button>
        <button
          type="button"
          disabled={selectedIds.length === 0 || bulkBusy}
          onClick={() => handleBulk(false)}
          className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium flex items-center gap-2"
        >
          {bulkBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          Deactivate selected ({selectedIds.length})
        </button>
      </div>

      <div className={`rounded-lg border ${theme?.border} overflow-hidden ${theme?.card}`}>
        <table className="w-full text-sm">
          <thead className={theme?.card === "bg-gray-800" ? "bg-gray-700" : "bg-gray-100"}>
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={states.length > 0 && selectedIds.length === states.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className={`px-4 py-3 text-left font-semibold ${theme?.textMuted}`}>Name</th>
              <th className={`px-4 py-3 text-left font-semibold ${theme?.textMuted}`}>Code</th>
              <th className={`px-4 py-3 text-left font-semibold ${theme?.textMuted}`}>Status</th>
              <th className={`px-4 py-3 text-left font-semibold ${theme?.textMuted}`}>Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme?.border}`}>
            {states.map((state) => (
              <tr key={state.id} className={theme?.hover}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(state.id)}
                    onChange={() => toggleSelect(state.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className={`px-4 py-3 font-medium ${theme?.text}`}>{state.name}</td>
                <td className={`px-4 py-3 ${theme?.textMuted}`}>{state.code}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      state.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {state.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={busyId === state.id}
                    onClick={() => handleToggleOne(state)}
                    className={`text-sm font-medium ${
                      state.isActive
                        ? "text-amber-600 hover:text-amber-700"
                        : "text-emerald-600 hover:text-emerald-700"
                    } disabled:opacity-50 flex items-center gap-1`}
                  >
                    {busyId === state.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : state.isActive ? (
                      "Deactivate"
                    ) : (
                      "Activate"
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {states.length === 0 && (
          <div className={`px-4 py-8 text-center ${theme?.textMuted}`}>
            No states found.
          </div>
        )}
      </div>
    </div>
  );
};

export default StateActivation;
