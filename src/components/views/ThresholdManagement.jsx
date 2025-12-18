import React, { useState, useEffect } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import api from '../../utils/api'
import { validateThresholdLimits, formatDecimal } from '../../utils/thresholdUtils'

const ThresholdManagement = ({ theme, darkMode }) => {
  const [thresholds, setThresholds] = useState([])
  const [categories, setCategories] = useState([])
  const [heavyMetals, setHeavyMetals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterMetal, setFilterMetal] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})

  useEffect(() => {
    Promise.all([fetchThresholds(), fetchCategories(), fetchHeavyMetals()])
  }, [])

  const fetchThresholds = async () => {
    try {
      const response = await api.get('/thresholds')
      setThresholds(response.data.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch thresholds: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories')
      setCategories(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchHeavyMetals = async () => {
    try {
      // Fetch all thresholds to extract unique heavy metals
      const response = await api.get('/thresholds')
      const metals = [...new Set(response.data.data.map(t => t.heavyMetal))].sort()
      setHeavyMetals(metals)
    } catch (err) {
      console.error('Failed to fetch heavy metals:', err)
      setHeavyMetals(['LEAD', 'CADMIUM', 'CHROMIUM', 'NICKEL', 'ARSENIC', 'MERCURY', 'COPPER', 'ZINC', 'COBALT', 'MANGANESE'])
    }
  }

  const handleEdit = (threshold) => {
    setEditingId(threshold.id)
    const categoryId = threshold.productCategoryId || threshold.productCategory?.id
    setEditValues({
      heavyMetal: threshold.heavyMetal,
      productCategoryId: categoryId,
      safeLimit: threshold.safeLimit,
      warningLimit: threshold.warningLimit,
      dangerLimit: threshold.dangerLimit
    })
  }

  const handleSave = async (id) => {
    try {
      const safeLimit = parseFloat(editValues.safeLimit)
      const warningLimit = editValues.warningLimit ? parseFloat(editValues.warningLimit) : null
      const dangerLimit = parseFloat(editValues.dangerLimit)

      const validation = validateThresholdLimits({
        safeLimit,
        warningLimit,
        dangerLimit
      })

      if (!validation.valid) {
        setError(validation.error)
        return
      }

      await api.patch(`/thresholds/${id}`, {
        safeLimit: safeLimit,
        warningLimit: warningLimit,
        dangerLimit: dangerLimit
      })
      fetchThresholds()
      setEditingId(null)
      setError(null)
    } catch (err) {
      setError('Failed to update threshold: ' + (err.response?.data?.error || err.message))
    }
  }

  const filteredThresholds = thresholds.filter(t => {
    const matchesMetal = filterMetal === 'all' || t.heavyMetal === filterMetal
    const categoryId = t.productCategoryId || t.productCategory?.id
    const matchesCategory = filterCategory === 'all' || categoryId === filterCategory
    return matchesMetal && matchesCategory
  })

  const getCategoryName = (threshold) => {
    // Check if productCategory object is included in response
    if (threshold.productCategory?.displayName) {
      return threshold.productCategory.displayName
    }
    // Fallback to finding category from categories list by ID
    const categoryId = threshold.productCategoryId || threshold.productCategory?.id
    return categories.find(c => c.id === categoryId)?.displayName || 'Unknown'
  }

  return (
    <div className={`p-6 ${theme?.bg}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${theme?.text} mb-4`}>Threshold Management</h1>
          <p className={theme?.textMuted}>
            Set safe, warning, and danger limits for heavy metals in products (in ppm)
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <X size={20} />
            </button>
          </div>
        )}

        <div className={`p-4 ${theme?.card} border ${theme?.border} rounded-lg mb-6 flex gap-4`}>
          <select
            value={filterMetal}
            onChange={(e) => setFilterMetal(e.target.value)}
            className={`flex-1 px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
          >
            <option value="all">All Heavy Metals</option>
            {heavyMetals.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`flex-1 px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.displayName}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={`text-center text-lg ${theme?.text}`}>Loading thresholds...</div>
        ) : filteredThresholds.length === 0 ? (
          <div className={`text-center text-lg ${theme?.text}`}>No thresholds found</div>
        ) : (
          <div className={`overflow-x-auto border ${theme?.border} rounded-lg`}>
            <table className="w-full">
              <thead className={theme?.card}>
                <tr className={`border-b ${theme?.border}`}>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>Heavy Metal</th>
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>Product Category</th>
                  <th className={`px-6 py-3 text-center ${theme?.text}`}>Safe Limit (ppm)</th>
                  <th className={`px-6 py-3 text-center ${theme?.text}`}>Warning Limit (ppm)</th>
                  <th className={`px-6 py-3 text-center ${theme?.text}`}>Danger Limit (ppm)</th>
                  <th className={`px-6 py-3 text-center ${theme?.text}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredThresholds.map((threshold) => (
                  <tr key={threshold.id} className={`border-b ${theme?.border} hover:${theme?.hover}`}>
                    <td className={`px-6 py-3 ${theme?.text} font-semibold`}>{threshold.heavyMetal}</td>
                    <td className={`px-6 py-3 ${theme?.text}`}>{getCategoryName(threshold)}</td>
                    <td className={`px-6 py-3 text-center`}>
                      {editingId === threshold.id ? (
                        <input
                          type="number"
                          step="0.001"
                          value={editValues.safeLimit}
                          onChange={(e) =>
                            setEditValues({ ...editValues, safeLimit: e.target.value })
                          }
                          className={`w-20 px-2 py-1 border ${theme?.border} rounded ${theme?.input} text-center`}
                        />
                      ) : (
                        <span className={`${theme?.text}`}>{formatDecimal(threshold.safeLimit)}</span>
                      )}
                    </td>
                    <td className={`px-6 py-3 text-center`}>
                      {editingId === threshold.id ? (
                        <input
                          type="number"
                          step="0.001"
                          value={editValues.warningLimit}
                          onChange={(e) =>
                            setEditValues({ ...editValues, warningLimit: e.target.value })
                          }
                          className={`w-20 px-2 py-1 border ${theme?.border} rounded ${theme?.input} text-center`}
                        />
                      ) : (
                        <span className={`${theme?.text}`}>
                          {threshold.warningLimit ? formatDecimal(threshold.warningLimit) : '-'}
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-3 text-center`}>
                      {editingId === threshold.id ? (
                        <input
                          type="number"
                          step="0.001"
                          value={editValues.dangerLimit}
                          onChange={(e) =>
                            setEditValues({ ...editValues, dangerLimit: e.target.value })
                          }
                          className={`w-20 px-2 py-1 border ${theme?.border} rounded ${theme?.input} text-center`}
                        />
                      ) : (
                        <span className={`${theme?.text}`}>{formatDecimal(threshold.dangerLimit)}</span>
                      )}
                    </td>
                    <td className={`px-6 py-3 text-center`}>
                      {editingId === threshold.id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleSave(threshold.id)}
                            className="text-green-500 hover:text-green-700 transition"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(threshold)}
                          className="text-blue-500 hover:text-blue-700 transition"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={`mt-6 p-4 ${theme?.card} border ${theme?.border} rounded-lg`}>
          <h3 className={`font-semibold ${theme?.text} mb-2`}>Legend:</h3>
          <ul className={`space-y-1 ${theme?.textMuted}`}>
            <li>• <strong>Safe Limit:</strong> Concentration below which the product is safe for use</li>
            <li>• <strong>Warning Limit:</strong> Concentration at which caution is advised</li>
            <li>• <strong>Danger Limit:</strong> Concentration at which the product is unsafe</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ThresholdManagement
