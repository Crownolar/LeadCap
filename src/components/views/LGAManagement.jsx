import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle, ChevronDown } from 'lucide-react'
import api from '../../utils/api'

const LGAManagement = ({ theme, darkMode }) => {
  const [lgas, setLgas] = useState([])
  const [states, setStates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ stateId: '', name: '', code: '' })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedState, setExpandedState] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [lgasRes, statesRes] = await Promise.all([
        api.get('/management/lgas'),
        api.get('/management/states')
      ])
      setLgas(lgasRes.data.data || [])
      setStates(statesRes.data.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.stateId || !formData.name || !formData.code) {
      setError('State, name, and code are required')
      return
    }

    setSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/management/lgas/${editingId}`, formData)
      } else {
        await api.post('/management/lgas', formData)
      }
      setFormData({ stateId: '', name: '', code: '' })
      setEditingId(null)
      setShowForm(false)
      await fetchData()
      setError(null)
    } catch (err) {
      setError('Failed to save LGA: ' + (err.response?.data?.error || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (lga) => {
    setFormData({ stateId: lga.stateId, name: lga.name, code: lga.code })
    setEditingId(lga.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/management/lgas/${id}`)
      await fetchData()
      setDeleteConfirm(null)
      setError(null)
    } catch (err) {
      setError('Failed to delete LGA: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ stateId: '', name: '', code: '' })
  }

  const groupedLgas = states.map(state => ({
    ...state,
    lgas: lgas.filter(lga => lga.stateId === state.id)
  }))

  if (loading) {
    return <div className={`p-6 ${theme?.text}`}>Loading LGAs...</div>
  }

  return (
    <div className={`p-6 ${theme?.bg}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${theme?.text} mb-2`}>LGA Management</h1>
        <p className={`${theme?.textMuted}`}>Manage Local Government Areas by state</p>
      </div>

      {error && (
        <div className={`mb-4 p-4 rounded-lg border-l-4 border-red-500 ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm)
            if (!showForm) {
              setFormData({ stateId: '', name: '', code: '' })
              setEditingId(null)
            }
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add LGA
        </button>
      </div>

      {showForm && (
        <div className={`mb-6 p-4 rounded-lg border ${theme?.border} ${theme?.card}`}>
          <h3 className={`text-lg font-semibold ${theme?.text} mb-4`}>
            {editingId ? 'Edit LGA' : 'Add New LGA'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme?.text} mb-1`}>
                State *
              </label>
              <select
                value={formData.stateId}
                onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${theme?.border} ${theme?.input}`}
              >
                <option value="">Select a state</option>
                {states.map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme?.text} mb-1`}>
                LGA Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Ikeja"
                className={`w-full px-3 py-2 rounded-lg border ${theme?.border} ${theme?.input}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme?.text} mb-1`}>
                LGA Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., IKJ"
                className={`w-full px-3 py-2 rounded-lg border ${theme?.border} ${theme?.input}`}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
              >
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
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

      <div className="space-y-4">
        {groupedLgas.length === 0 ? (
          <div className={`p-8 text-center ${theme?.card} rounded-lg`}>
            <p className={theme?.textMuted}>No states found</p>
          </div>
        ) : (
          groupedLgas.map((state) => (
            <div key={state.id} className={`${theme?.card} rounded-lg border ${theme?.border}`}>
              <button
                onClick={() => setExpandedState(expandedState === state.id ? null : state.id)}
                className={`w-full p-4 flex justify-between items-center hover:${theme?.hover} transition`}
              >
                <div className="text-left">
                  <h3 className={`font-semibold ${theme?.text}`}>{state.name}</h3>
                  <p className={`text-sm ${theme?.textMuted}`}>{state.lgas.length} LGA{state.lgas.length !== 1 ? 's' : ''}</p>
                </div>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${expandedState === state.id ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedState === state.id && (
                <div className={`border-t ${theme?.border} p-4 space-y-2`}>
                  {state.lgas.length === 0 ? (
                    <p className={`text-sm ${theme?.textMuted} text-center py-4`}>No LGAs in this state</p>
                  ) : (
                    state.lgas.map((lga) => (
                      <div
                        key={lga.id}
                        className={`p-3 rounded-lg flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                      >
                        <div className="text-left">
                          <p className={`font-medium ${theme?.text}`}>{lga.name}</p>
                          <p className={`text-sm ${theme?.textMuted}`}>Code: {lga.code} | Markets: {lga._count?.markets || 0} | Samples: {lga._count?.samples || 0}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(lga)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600 transition"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(lga.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${theme?.card} p-6 rounded-lg shadow-lg max-w-sm`}>
            <div className="flex gap-2 mb-4">
              <AlertTriangle className="text-red-600" size={24} />
              <h3 className={`text-lg font-semibold ${theme?.text}`}>Confirm Delete</h3>
            </div>
            <p className={`${theme?.textMuted} mb-6`}>
              Are you sure you want to delete this LGA? This action cannot be undone.
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
  )
}

export default LGAManagement
