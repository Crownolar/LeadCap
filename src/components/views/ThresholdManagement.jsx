import React, { useState, useEffect } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import api from '../../utils/api'

const ThresholdManagement = ({ theme, darkMode }) => {
  const [thresholds, setThresholds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterMetal, setFilterMetal] = useState('all')
  const [filterProduct, setFilterProduct] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})

  const heavyMetals = [
    'LEAD', 'CADMIUM', 'CHROMIUM', 'NICKEL', 'ARSENIC', 'MERCURY', 'COPPER', 'ZINC', 'COBALT', 'MANGANESE'
  ]

  const products = [
    'TIRO', 'TIRO_RGSTD', 'CULTURAL_POWDER', 'LIPSTICK', 'HAIR_DYE', 'EYE_PENCIL', 'NAIL_POLISH', 'SKIN_LOTION'
  ]

  useEffect(() => {
    fetchThresholds()
  }, [])

  const fetchThresholds = async () => {
    try {
      setLoading(true)
      const response = await api.get('/thresholds')
      setThresholds(response.data.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch thresholds: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (threshold) => {
    setEditingId(threshold.id)
    setEditValues({
      heavyMetal: threshold.heavyMetal,
      productType: threshold.productType,
      safeLimit: threshold.safeLimit,
      warningLimit: threshold.warningLimit,
      dangerLimit: threshold.dangerLimit
    })
  }

  const handleSave = async (id) => {
    try {
      // Validate inputs
      const safeLimit = parseFloat(editValues.safeLimit)
      const warningLimit = editValues.warningLimit ? parseFloat(editValues.warningLimit) : null
      const dangerLimit = parseFloat(editValues.dangerLimit)

      // Check for valid numbers
      if (isNaN(safeLimit) || isNaN(dangerLimit) || (warningLimit && isNaN(warningLimit))) {
        setError('All limits must be valid numbers')
        return
      }

      // Check for negative values
      if (safeLimit < 0 || dangerLimit < 0 || (warningLimit && warningLimit < 0)) {
        setError('Limits must be positive numbers')
        return
      }

      // Validate order: safe < warning (if exists) < danger
      if (safeLimit >= (warningLimit || dangerLimit)) {
        setError('Safe limit must be less than warning limit (if provided) and danger limit')
        return
      }

      if (warningLimit && warningLimit >= dangerLimit) {
        setError('Warning limit must be less than danger limit')
        return
      }

      await api.patch('/thresholds', {
        heavyMetal: editValues.heavyMetal,
        productType: editValues.productType,
        safeLimit: safeLimit,
        warningLimit: warningLimit,
        dangerLimit: dangerLimit
      })
      fetchThresholds()
      setEditingId(null)
      setError(null) // Clear any previous errors
    } catch (err) {
      setError('Failed to update threshold: ' + (err.response?.data?.error || err.message))
    }
  }

  const filteredThresholds = thresholds.filter(t => {
    const matchesMetal = filterMetal === 'all' || t.heavyMetal === filterMetal
    const matchesProduct = filterProduct === 'all' || t.productType === filterProduct
    return matchesMetal && matchesProduct
  })

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
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className={`flex-1 px-4 py-2 border ${theme?.border} rounded-lg ${theme?.input}`}
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p} value={p}>{p}</option>
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
                  <th className={`px-6 py-3 text-left ${theme?.text}`}>Product Type</th>
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
                    <td className={`px-6 py-3 ${theme?.text}`}>{threshold.productType}</td>
                    <td className={`px-6 py-3 text-center`}>
                      {editingId === threshold.id ? (
                        <input
                          type="number"
                          step="0.001"
                          value={editValues.safeLimit}
                          onChange={(e) =>
                            setEditValues({ ...editValues, safeLimit: parseFloat(e.target.value) })
                          }
                          className={`w-20 px-2 py-1 border ${theme?.border} rounded ${theme?.input} text-center`}
                        />
                      ) : (
                        <span className={`${theme?.text}`}>{parseFloat(threshold.safeLimit).toFixed(3)}</span>
                      )}
                    </td>
                    <td className={`px-6 py-3 text-center`}>
                      {editingId === threshold.id ? (
                        <input
                          type="number"
                          step="0.001"
                          value={editValues.warningLimit}
                          onChange={(e) =>
                            setEditValues({ ...editValues, warningLimit: parseFloat(e.target.value) })
                          }
                          className={`w-20 px-2 py-1 border ${theme?.border} rounded ${theme?.input} text-center`}
                        />
                      ) : (
                        <span className={`${theme?.text}`}>
                          {threshold.warningLimit ? parseFloat(threshold.warningLimit).toFixed(3) : '-'}
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
                            setEditValues({ ...editValues, dangerLimit: parseFloat(e.target.value) })
                          }
                          className={`w-20 px-2 py-1 border ${theme?.border} rounded ${theme?.input} text-center`}
                        />
                      ) : (
                        <span className={`${theme?.text}`}>{parseFloat(threshold.dangerLimit).toFixed(3)}</span>
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
