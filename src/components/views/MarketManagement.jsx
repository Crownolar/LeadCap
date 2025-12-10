import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, AlertTriangle, ChevronDown } from 'lucide-react'
import api from '../../utils/api'

const MarketManagement = ({ theme, darkMode }) => {
  const [markets, setMarkets] = useState([])
  const [states, setStates] = useState([])
  const [lgas, setLgas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ stateId: '', lgaId: '', name: '', latitude: '', longitude: '' })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedState, setExpandedState] = useState(null)
  const [expandedLga, setExpandedLga] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (formData.stateId) {
      const stateLgas = lgas.filter(lga => lga.stateId === formData.stateId)
      if (stateLgas.length > 0 && !formData.lgaId) {
        setFormData(prev => ({ ...prev, lgaId: stateLgas[0].id }))
      }
    }
  }, [formData.stateId, lgas])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [marketsRes, statesRes, lgasRes] = await Promise.all([
        api.get('/management/markets'),
        api.get('/management/states'),
        api.get('/management/lgas')
      ])
      setMarkets(marketsRes.data.data || [])
      setStates(statesRes.data.data || [])
      setLgas(lgasRes.data.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.stateId || !formData.lgaId || !formData.name) {
      setError('State, LGA, and name are required')
      return
    }

    setSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/management/markets/${editingId}`, formData)
      } else {
        await api.post('/management/markets', formData)
      }
      setFormData({ stateId: '', lgaId: '', name: '', latitude: '', longitude: '' })
      setEditingId(null)
      setShowForm(false)
      await fetchData()
      setError(null)
    } catch (err) {
      setError('Failed to save market: ' + (err.response?.data?.error || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (market) => {
    setFormData({
      stateId: market.stateId,
      lgaId: market.lgaId,
      name: market.name,
      latitude: market.latitude || '',
      longitude: market.longitude || ''
    })
    setEditingId(market.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/management/markets/${id}`)
      await fetchData()
      setDeleteConfirm(null)
      setError(null)
    } catch (err) {
      setError('Failed to delete market: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ stateId: '', lgaId: '', name: '', latitude: '', longitude: '' })
  }

  const getStateLgas = (stateId) => lgas.filter(lga => lga.stateId === stateId)
  const getLgaMarkets = (lgaId) => markets.filter(m => m.lgaId === lgaId)

  const groupedMarkets = states.map(state => ({
    ...state,
    lgas: getStateLgas(state.id).map(lga => ({
      ...lga,
      markets: getLgaMarkets(lga.id)
    }))
  }))

  if (loading) {
    return <div className={`p-6 ${theme?.text}`}>Loading markets...</div>
  }

  return (
    <div className={`p-6 ${theme?.bg}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${theme?.text} mb-2`}>Market Management</h1>
        <p className={`${theme?.textMuted}`}>Manage markets by state and LGA</p>
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
              setFormData({ stateId: '', lgaId: '', name: '', latitude: '', longitude: '' })
              setEditingId(null)
            }
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add Market
        </button>
      </div>

      {showForm && (
        <div className={`mb-6 p-4 rounded-lg border ${theme?.border} ${theme?.card}`}>
          <h3 className={`text-lg font-semibold ${theme?.text} mb-4`}>
            {editingId ? 'Edit Market' : 'Add New Market'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${theme?.text} mb-1`}>
                  State *
                </label>
                <select
                  value={formData.stateId}
                  onChange={(e) => setFormData({ ...formData, stateId: e.target.value, lgaId: '' })}
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
                  LGA *
                </label>
                <select
                  value={formData.lgaId}
                  onChange={(e) => setFormData({ ...formData, lgaId: e.target.value })}
                  disabled={!formData.stateId}
                  className={`w-full px-3 py-2 rounded-lg border ${theme?.border} ${theme?.input} disabled:opacity-50`}
                >
                  <option value="">Select an LGA</option>
                  {getStateLgas(formData.stateId).map(lga => (
                    <option key={lga.id} value={lga.id}>{lga.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme?.text} mb-1`}>
                Market Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Lekki Market"
                className={`w-full px-3 py-2 rounded-lg border ${theme?.border} ${theme?.input}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${theme?.text} mb-1`}>
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="e.g., 6.5244"
                  className={`w-full px-3 py-2 rounded-lg border ${theme?.border} ${theme?.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme?.text} mb-1`}>
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="e.g., 3.7679"
                  className={`w-full px-3 py-2 rounded-lg border ${theme?.border} ${theme?.input}`}
                />
              </div>
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
        {groupedMarkets.length === 0 ? (
          <div className={`p-8 text-center ${theme?.card} rounded-lg`}>
            <p className={theme?.textMuted}>No states found</p>
          </div>
        ) : (
          groupedMarkets.map((state) => (
            <div key={state.id} className={`${theme?.card} rounded-lg border ${theme?.border}`}>
              <button
                onClick={() => setExpandedState(expandedState === state.id ? null : state.id)}
                className={`w-full p-4 flex justify-between items-center hover:${theme?.hover} transition`}
              >
                <div className="text-left">
                  <h3 className={`font-semibold ${theme?.text}`}>{state.name}</h3>
                  <p className={`text-sm ${theme?.textMuted}`}>{state.lgas.reduce((sum, lga) => sum + lga.markets.length, 0)} markets</p>
                </div>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${expandedState === state.id ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedState === state.id && (
                <div className={`border-t ${theme?.border} p-4 space-y-3`}>
                  {state.lgas.length === 0 ? (
                    <p className={`text-sm ${theme?.textMuted} text-center py-4`}>No LGAs in this state</p>
                  ) : (
                    state.lgas.map((lga) => (
                      <div key={lga.id} className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg`}>
                        <button
                          onClick={() => setExpandedLga(expandedLga === lga.id ? null : lga.id)}
                          className={`w-full p-3 flex justify-between items-center hover:${theme?.hover} transition`}
                        >
                          <div className="text-left">
                            <p className={`font-medium ${theme?.text}`}>{lga.name}</p>
                            <p className={`text-sm ${theme?.textMuted}`}>{lga.markets.length} market{lga.markets.length !== 1 ? 's' : ''}</p>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${expandedLga === lga.id ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {expandedLga === lga.id && (
                          <div className={`border-t ${theme?.border} p-3 space-y-2`}>
                            {lga.markets.length === 0 ? (
                              <p className={`text-sm ${theme?.textMuted} text-center py-2`}>No markets</p>
                            ) : (
                              lga.markets.map((market) => (
                                <div
                                  key={market.id}
                                  className={`p-2 rounded flex justify-between items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                                >
                                  <div className="text-left text-sm">
                                    <p className={`font-medium ${theme?.text}`}>{market.name}</p>
                                    {(market.latitude || market.longitude) && (
                                      <p className={`text-xs ${theme?.textMuted}`}>
                                        {market.latitude}, {market.longitude}
                                      </p>
                                    )}
                                    <p className={`text-xs ${theme?.textMuted}`}>Samples: {market._count?.samples || 0}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEdit(market)}
                                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600 transition"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(market.id)}
                                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 transition"
                                    >
                                      <Trash2 size={16} />
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
              Are you sure you want to delete this market? This action cannot be undone.
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

export default MarketManagement
