import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";
import api from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";

const StateManagement = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await api.get("/management/states");
      setStates(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch states: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      setError("Name and code are required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/management/states/${editingId}`, formData);
      } else {
        await api.post("/management/states", formData);
      }
      setFormData({ name: "", code: "" });
      setEditingId(null);
      setShowForm(false);
      await fetchStates();
      setError(null);
    } catch (err) {
      setError(
        "Failed to save state: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (state) => {
    setFormData({ name: state.name, code: state.code });
    setEditingId(state.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/management/states/${id}`);
      await fetchStates();
      setDeleteConfirm(null);
      setError(null);
    } catch (err) {
      setError(
        "Failed to delete state: " + (err.response?.data?.error || err.message)
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", code: "" });
  };

  if (loading) {
    return <div className={`p-6 ${theme?.text}`}>Loading states...</div>;
  }

  return (
    <div className={`p-6 ${theme?.bg}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${theme?.text} mb-2`}>
          State Management
        </h1>
        <p className={`${theme?.textMuted}`}>Manage all states in the system</p>
      </div>

      {error && (
        <div
          className={`mb-4 p-4 rounded-lg border-l-4 border-red-500 ${
            darkMode ? "bg-red-900/20" : "bg-red-50"
          }`}
        >
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setFormData({ name: "", code: "" });
              setEditingId(null);
            }
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add State
        </button>
      </div>

      {showForm && (
        <div
          className={`mb-6 p-4 rounded-lg border ${theme?.border} ${theme?.card}`}
        >
          <h3 className={`text-lg font-semibold ${theme?.text} mb-4`}>
            {editingId ? "Edit State" : "Add New State"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium ${theme?.text} mb-1`}
              >
                State Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Lagos"
                className={`w-full px-3 py-2 rounded-lg border ${theme?.border} ${theme?.input}`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${theme?.text} mb-1`}
              >
                State Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g., LA"
                className={`w-full px-3 py-2 rounded-lg border ${theme?.border} ${theme?.input}`}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
              >
                {submitting ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={`border ${theme?.border} ${theme?.text} px-4 py-2 rounded-lg hover:${theme?.hover} transition`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {states.length === 0 ? (
          <div className={`p-8 text-center ${theme?.card} rounded-lg`}>
            <p className={theme?.textMuted}>No states found</p>
          </div>
        ) : (
          states.map((state) => (
            <div
              key={state.id}
              className={`p-4 rounded-lg border ${theme?.border} ${theme?.card} flex justify-between items-center`}
            >
              <div>
                <h3 className={`font-semibold ${theme?.text}`}>{state.name}</h3>
                <p className={`text-sm ${theme?.textMuted}`}>
                  Code: {state.code}
                </p>
                <p className={`text-sm ${theme?.textMuted}`}>
                  LGAs: {state._count?.lgas || 0} | Markets:{" "}
                  {state._count?.markets || 0} | Samples:{" "}
                  {state._count?.samples || 0}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(state)}
                  className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600 transition"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(state.id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${theme?.card} p-6 rounded-lg shadow-lg max-w-sm`}>
            <div className="flex gap-2 mb-4">
              <AlertTriangle className="text-red-600" size={24} />
              <h3 className={`text-lg font-semibold ${theme?.text}`}>
                Confirm Delete
              </h3>
            </div>
            <p className={`${theme?.textMuted} mb-6`}>
              Are you sure you want to delete this state? This action cannot be
              undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className={`flex-1 border ${theme?.border} ${theme?.text} px-4 py-2 rounded-lg hover:${theme?.hover} transition`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateManagement;
