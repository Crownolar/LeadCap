import React, { useEffect } from "react";
import { FileText, BarChart3, Package, AlertTriangle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../../redux/slice/samplesSlice";
import { useTheme } from "../../hooks/useTheme";

const Reports = ({ theme: propTheme, samples: propSamples }) => {
  const dispatch = useDispatch();
  const { theme: hookTheme } = useTheme();
  const { samples: reduxSamples } = useSelector((state) => state.samples);

  // Use props if provided, otherwise fall back to Redux
  const theme = propTheme || hookTheme;
  const samples = propSamples || reduxSamples || [];

  // Fetch samples on mount if not provided via props
  useEffect(() => {
    if (!propSamples) {
      dispatch(fetchSamples());
    }
  }, [dispatch, propSamples]);

  return (
    <div
      className={`${theme?.card} ${theme?.text} rounded-lg shadow-md p-6 border ${theme?.border}`}
    >
      <h2 className="text-xl font-semibold mb-4">Generate Reports</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            disabled
            className="p-6 border-2 border-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left opacity-50 cursor-not-allowed"
          >
            <FileText className="w-8 h-8 text-emerald-500 mb-2" />
            <h3 className="font-semibold mb-1">State Summary Report</h3>
            <p className={`text-sm ${theme?.textMuted}`}>
              Comprehensive analysis by state
            </p>
          </button>
          <button
            disabled
            className="p-6 border-2 border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left opacity-50 cursor-not-allowed"
          >
            <BarChart3 className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Contamination Analysis</h3>
            <p className={`text-sm ${theme?.textMuted}`}>
              Detailed lead level statistics
            </p>
          </button>
          <button
            disabled
            className="p-6 border-2 border-purple-500 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left opacity-50 cursor-not-allowed"
          >
            <Package className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="font-semibold mb-1">Product Type Report</h3>
            <p className={`text-sm ${theme?.textMuted}`}>
              Analysis by product category
            </p>
          </button>
          <button
            disabled
            className="p-6 border-2 border-orange-500 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-left opacity-50 cursor-not-allowed"
          >
            <AlertTriangle className="w-8 h-8 text-orange-500 mb-2" />
            <h3 className="font-semibold mb-1">Risk Assessment</h3>
            <p className={`text-sm ${theme?.textMuted}`}>
              High-risk products and areas
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
