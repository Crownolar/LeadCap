import React, { useState, useEffect } from "react";
import { Edit2, Save, X } from "lucide-react";
import api from "../../utils/api";
import {
  validateThresholdLimits,
  formatDecimal,
} from "../../utils/thresholdUtils";
import { useTheme } from "../../context/ThemeContext";
import { useEnums } from "../../context/EnumsContext";

const ThresholdManagement = () => {
  const [thresholds, setThresholds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heavyMetals, setHeavyMetals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMetal, setFilterMetal] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const { theme } = useTheme();
  const { heavyMetals: enumsHeavyMetals } = useEnums();

  useEffect(() => {
    Promise.all([fetchThresholds(), fetchCategories(), fetchHeavyMetals()]);
  }, []);

  const fetchThresholds = async () => {
    try {
      const response = await api.get("/thresholds");
      setThresholds(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch thresholds: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/products/categories");
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchHeavyMetals = async () => {
    try {
      const response = await api.get("/thresholds");
      const metals = [
        ...new Set(response.data.data.map((t) => t.heavyMetal)),
      ].sort();
      setHeavyMetals(metals);
    } catch (err) {
      console.error("Failed to fetch heavy metals:", err);
      setHeavyMetals(enumsHeavyMetals?.length ? enumsHeavyMetals : [
        "LEAD", "CADMIUM", "CHROMIUM", "NICKEL", "ARSENIC", "MERCURY",
        "COPPER", "ZINC", "COBALT", "MANGANESE",
      ]);
    }
  };

  const handleEdit = (threshold) => {
    setEditingId(threshold.id);
    const categoryId =
      threshold.productCategoryId || threshold.productCategory?.id;
    setEditValues({
      heavyMetal: threshold.heavyMetal,
      productCategoryId: categoryId,
      safeLimit: threshold.safeLimit,
      warningLimit: threshold.warningLimit,
      dangerLimit: threshold.dangerLimit,
    });
  };

  const handleSave = async (id) => {
    try {
      const safeLimit = parseFloat(editValues.safeLimit);
      const warningLimit = editValues.warningLimit
        ? parseFloat(editValues.warningLimit)
        : null;
      const dangerLimit = parseFloat(editValues.dangerLimit);

      const validation = validateThresholdLimits({
        safeLimit,
        warningLimit,
        dangerLimit,
      });

      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      await api.patch(`/thresholds/${id}`, {
        safeLimit: safeLimit,
        warningLimit: warningLimit,
        dangerLimit: dangerLimit,
      });
      fetchThresholds();
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(
        "Failed to update threshold: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  const filteredThresholds = thresholds.filter((t) => {
    const matchesMetal = filterMetal === "all" || t.heavyMetal === filterMetal;
    const categoryId = t.productCategoryId || t.productCategory?.id;
    const matchesCategory =
      filterCategory === "all" || categoryId === filterCategory;
    return matchesMetal && matchesCategory;
  });

  const getCategoryName = (threshold) => {
    if (threshold.productCategory?.displayName) {
      return threshold.productCategory.displayName;
    }
    const categoryId =
      threshold.productCategoryId || threshold.productCategory?.id;
    return (
      categories.find((c) => c.id === categoryId)?.displayName || "Unknown"
    );
  };

  return (
    <div className={`p-3 sm:p-4 md:p-6 ${theme?.bg}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1
            className={`text-xl sm:text-2xl md:text-3xl font-bold ${theme?.text} mb-2 sm:mb-4`}
          >
            Threshold Management
          </h1>
          <p className={`${theme?.textMuted} text-sm sm:text-base`}>
            Set safe, warning, and danger limits for heavy metals in products
            (in ppm).
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg flex justify-between items-start gap-2 text-sm sm:text-base">
            <span className="break-words flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 flex-shrink-0"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        <div
          className={`p-3 sm:p-4 ${theme?.card} border ${theme?.border} rounded-lg mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4`}
        >
          <select
            value={filterMetal}
            onChange={(e) => setFilterMetal(e.target.value)}
            className={`flex-1 px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
          >
            <option value="all">All Heavy Metals</option>
            {heavyMetals.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`flex-1 px-3 py-2 sm:px-4 text-sm sm:text-base border ${theme?.border} rounded-lg ${theme?.input}`}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div
            className={`text-center text-base sm:text-lg ${theme?.text} py-8`}
          >
            Loading thresholds...
          </div>
        ) : filteredThresholds.length === 0 ? (
          <div
            className={`text-center text-base sm:text-lg ${theme?.text} py-8`}
          >
            No thresholds found
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div
              className={`hidden lg:block overflow-x-auto border ${theme?.border} rounded-lg`}
            >
              <table className="w-full">
                <thead className={theme?.card}>
                  <tr className={`border-b ${theme?.border}`}>
                    <th
                      className={`px-4 py-3 text-left text-sm ${theme?.text}`}
                    >
                      Heavy Metal
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-sm ${theme?.text}`}
                    >
                      Product Category
                    </th>
                    <th
                      className={`px-4 py-3 text-center text-sm ${theme?.text}`}
                    >
                      Safe Limit (ppm)
                    </th>
                    <th
                      className={`px-4 py-3 text-center text-sm ${theme?.text}`}
                    >
                      Warning Limit (ppm)
                    </th>
                    <th
                      className={`px-4 py-3 text-center text-sm ${theme?.text}`}
                    >
                      Danger Limit (ppm)
                    </th>
                    <th
                      className={`px-4 py-3 text-center text-sm ${theme?.text}`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredThresholds.map((threshold) => (
                    <tr
                      key={threshold.id}
                      className={`border-b ${theme?.border} hover:${theme?.hover}`}
                    >
                      <td
                        className={`px-4 py-3 text-sm ${theme?.text} font-semibold`}
                      >
                        {threshold.heavyMetal}
                      </td>
                      <td className={`px-4 py-3 text-sm ${theme?.text}`}>
                        {getCategoryName(threshold)}
                      </td>
                      <td className={`px-4 py-3 text-center`}>
                        {editingId === threshold.id ? (
                          <input
                            type="number"
                            step="0.001"
                            value={editValues.safeLimit}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                safeLimit: e.target.value,
                              })
                            }
                            className={`w-20 px-2 py-1 text-sm border ${theme?.border} rounded ${theme?.input} text-center`}
                          />
                        ) : (
                          <span className={`${theme?.text} text-sm`}>
                            {formatDecimal(threshold.safeLimit)}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-center`}>
                        {editingId === threshold.id ? (
                          <input
                            type="number"
                            step="0.001"
                            value={editValues.warningLimit}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                warningLimit: e.target.value,
                              })
                            }
                            className={`w-20 px-2 py-1 text-sm border ${theme?.border} rounded ${theme?.input} text-center`}
                          />
                        ) : (
                          <span className={`${theme?.text} text-sm`}>
                            {threshold.warningLimit
                              ? formatDecimal(threshold.warningLimit)
                              : "-"}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-center`}>
                        {editingId === threshold.id ? (
                          <input
                            type="number"
                            step="0.001"
                            value={editValues.dangerLimit}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                dangerLimit: e.target.value,
                              })
                            }
                            className={`w-20 px-2 py-1 text-sm border ${theme?.border} rounded ${theme?.input} text-center`}
                          />
                        ) : (
                          <span className={`${theme?.text} text-sm`}>
                            {formatDecimal(threshold.dangerLimit)}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-center`}>
                        {editingId === threshold.id ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleSave(threshold.id)}
                              className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(threshold)}
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
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

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              {filteredThresholds.map((threshold) => (
                <div
                  key={threshold.id}
                  className={`${theme?.card} border ${theme?.border} rounded-lg p-4 space-y-3`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`${theme?.text} font-bold text-base sm:text-lg`}
                      >
                        {threshold.heavyMetal}
                      </h3>
                      <p className={`${theme?.textMuted} text-sm truncate`}>
                        {getCategoryName(threshold)}
                      </p>
                    </div>
                    {editingId !== threshold.id && (
                      <button
                        onClick={() => handleEdit(threshold)}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition p-2"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Threshold Values */}
                  <div className="space-y-2">
                    {/* Safe Limit */}
                    <div className="flex justify-between items-center">
                      <span
                        className={`${theme?.textMuted} text-xs sm:text-sm font-semibold uppercase`}
                      >
                        Safe Limit (ppm)
                      </span>
                      {editingId === threshold.id ? (
                        <input
                          type="number"
                          step="0.001"
                          value={editValues.safeLimit}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              safeLimit: e.target.value,
                            })
                          }
                          className={`w-24 px-2 py-1 text-sm border ${theme?.border} rounded ${theme?.input} text-right`}
                        />
                      ) : (
                        <span
                          className={`${theme?.text} font-medium text-sm sm:text-base`}
                        >
                          {formatDecimal(threshold.safeLimit)}
                        </span>
                      )}
                    </div>

                    {/* Warning Limit */}
                    <div className="flex justify-between items-center">
                      <span
                        className={`${theme?.textMuted} text-xs sm:text-sm font-semibold uppercase`}
                      >
                        Warning Limit (ppm)
                      </span>
                      {editingId === threshold.id ? (
                        <input
                          type="number"
                          step="0.001"
                          value={editValues.warningLimit}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              warningLimit: e.target.value,
                            })
                          }
                          className={`w-24 px-2 py-1 text-sm border ${theme?.border} rounded ${theme?.input} text-right`}
                        />
                      ) : (
                        <span
                          className={`${theme?.text} font-medium text-sm sm:text-base`}
                        >
                          {threshold.warningLimit
                            ? formatDecimal(threshold.warningLimit)
                            : "-"}
                        </span>
                      )}
                    </div>

                    {/* Danger Limit */}
                    <div className="flex justify-between items-center">
                      <span
                        className={`${theme?.textMuted} text-xs sm:text-sm font-semibold uppercase`}
                      >
                        Danger Limit (ppm)
                      </span>
                      {editingId === threshold.id ? (
                        <input
                          type="number"
                          step="0.001"
                          value={editValues.dangerLimit}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              dangerLimit: e.target.value,
                            })
                          }
                          className={`w-24 px-2 py-1 text-sm border ${theme?.border} rounded ${theme?.input} text-right`}
                        />
                      ) : (
                        <span
                          className={`${theme?.text} font-medium text-sm sm:text-base`}
                        >
                          {formatDecimal(threshold.dangerLimit)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons (Edit Mode) */}
                  {editingId === threshold.id && (
                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleSave(threshold.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div
          className={`mt-4 sm:mt-6 p-3 sm:p-4 ${theme?.card} border ${theme?.border} rounded-lg`}
        >
          <h3
            className={`font-semibold ${theme?.text} mb-2 text-sm sm:text-base`}
          >
            Legend:
          </h3>
          <ul className={`space-y-1 ${theme?.textMuted} text-xs sm:text-sm`}>
            <li>
              • <strong>Safe Limit:</strong> Concentration below which the
              product is safe for use
            </li>
            <li>
              • <strong>Warning Limit:</strong> Concentration at which caution
              is advised
            </li>
            <li>
              • <strong>Danger Limit:</strong> Concentration at which the
              product is unsafe
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThresholdManagement;
