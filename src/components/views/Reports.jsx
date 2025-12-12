import React, { useEffect, useState } from "react";
import { FileText, BarChart3, Package, AlertTriangle, Loader, Download, X, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../../redux/slice/samplesSlice";
import { useTheme } from "../../hooks/useTheme";
import api from "../../utils/api";
import { generatePDFFromHTML, generateTablePDF } from "../../utils/pdfGenerator";

const Reports = ({ theme: propTheme, samples: propSamples }) => {
  const dispatch = useDispatch();
  const { theme: hookTheme } = useTheme();
  const { samples: reduxSamples } = useSelector((state) => state.samples);
  const { currentUser } = useSelector((state) => state.auth);

  // Use props if provided, otherwise fall back to Redux
  const theme = propTheme || hookTheme;
  const samples = propSamples || reduxSamples || [];

  // Role-based access control
  const normalizedRole = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "");
  const allowedRoles = ["superadmin", "headresearcher"];
  
  if (!allowedRoles.includes(normalizedRole)) {
    return (
      <div className={`${theme?.bg} min-h-screen flex items-center justify-center p-4`}>
        <div className={`${theme?.card} rounded-lg border ${theme?.border} shadow-md p-8 text-center max-w-md`}>
          <Lock className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <h2 className={`${theme?.text} text-2xl font-bold mb-2`}>Access Restricted</h2>
          <p className={theme?.textMuted}>
            You do not have permission to view reports. Only Super Admin and Head Researcher can access this section.
          </p>
        </div>
      </div>
    );
  }

  // State management
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [states, setStates] = useState([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [productTypes] = useState([
    { key: "TIRO", label: "TIRO" },
    { key: "TIRO_RGSTD", label: "TIRO RGSTD" },
    { key: "CULTURAL_POWDER", label: "Cultural Powder" },
    { key: "LIPSTICK", label: "Lipstick" },
    { key: "HAIR_DYE", label: "Hair Dye" },
    { key: "EYE_PENCIL", label: "Eye Pencil" },
    { key: "NAIL_POLISH", label: "Nail Polish" },
    { key: "SKIN_LOTION", label: "Skin Lotion" },
  ]);
  const [reportFilters, setReportFilters] = useState({
    state: "",
    states: [],
    productTypes: [],
    dateFrom: "",
    dateTo: "",
    minLeadLevel: 10,
  });

  // Fetch samples and states on mount if not provided via props
  useEffect(() => {
    if (!propSamples) {
      dispatch(fetchSamples());
    }
    fetchStates();
  }, [dispatch, propSamples]);

  const fetchStates = async () => {
    try {
      const response = await api.get("/samples/states/all");
      setStates(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch states:", err);
    }
  };

  const generateReport = async (reportType, filters) => {
    // Validate required filters before submitting
    if ((reportType === "state-summary" || reportType === "product-type") && !filters.state) {
      alert("Please select a state to generate this report");
      return;
    }

    setLoading(true);
    setGenerationProgress(10);

    try {
      setGenerationProgress(20);

      // Filter samples based on criteria
      let filteredSamples = [...samples];

      // Filter by state - use state.name from the included state object
      if (filters.state) {
        filteredSamples = filteredSamples.filter(s => {
          const stateName = typeof s.state === 'object' ? s.state.name : s.state;
          return stateName === filters.state;
        });
      }

      // Filter by multiple states
      if (filters.states && filters.states.length > 0) {
        filteredSamples = filteredSamples.filter(s => {
          const stateName = typeof s.state === 'object' ? s.state.name : s.state;
          return filters.states.includes(stateName);
        });
      }

      // Filter by product types
      if (filters.productTypes && filters.productTypes.length > 0) {
        filteredSamples = filteredSamples.filter(s => filters.productTypes.includes(s.productType));
      }

      // Filter by date range
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredSamples = filteredSamples.filter(s => new Date(s.createdAt) >= fromDate);
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredSamples = filteredSamples.filter(s => new Date(s.createdAt) <= toDate);
      }

      // Filter by contamination level
      if (reportType === "risk-assessment" && filters.minLeadLevel) {
        filteredSamples = filteredSamples.filter(s => {
          const leadLevel = getLeadLevel(s);
          return leadLevel >= filters.minLeadLevel;
        });
      }

      setGenerationProgress(40);

      // Generate appropriate report based on type
      const filename = `${reportType}-report-${new Date().toISOString().split("T")[0]}.pdf`;

      switch (reportType) {
        case "state-summary":
          await generateStateSummaryReport(filteredSamples, filters, filename);
          break;
        case "product-type":
          await generateProductTypeReport(filteredSamples, filters, filename);
          break;
        case "contamination-analysis":
          await generateContaminationAnalysisReport(filteredSamples, filters, filename);
          break;
        case "risk-assessment":
          await generateRiskAssessmentReport(filteredSamples, filters, filename);
          break;
        default:
          await generateGenericReport(filteredSamples, filename);
      }

      setGenerationProgress(100);
      alert("Report generated and downloaded successfully!");
      setSelectedReport(null);
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Failed to generate report. Please try again.");
      setGenerationProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get lead level from heavy metal readings
  const getLeadLevel = (sample) => {
    if (!sample.heavyMetalReadings || sample.heavyMetalReadings.length === 0) {
      return 0;
    }
    const leadReading = sample.heavyMetalReadings.find(r => r.heavyMetal === 'LEAD');
    if (!leadReading) return 0;
    const reading = leadReading.xrfReading || leadReading.aasReading || 0;
    return parseFloat(reading);
  };

  // Helper function to get contamination status
  const getContaminationStatus = (sample) => {
    if (!sample.heavyMetalReadings || sample.heavyMetalReadings.length === 0) {
      return 'PENDING';
    }
    const hasContaminated = sample.heavyMetalReadings.some(r => r.status === 'CONTAMINATED');
    if (hasContaminated) return 'CONTAMINATED';
    const hasModeriate = sample.heavyMetalReadings.some(r => r.status === 'MODERATE');
    if (hasModeriate) return 'MODERATE';
    const hasSafe = sample.heavyMetalReadings.some(r => r.status === 'SAFE');
    if (hasSafe) return 'SAFE';
    return 'PENDING';
  };

  const generateStateSummaryReport = async (filteredSamples, filters, filename) => {
    const columns = [
      { key: "sampleId", label: "Sample Code" },
      { key: "productType", label: "Product Category" },
      { key: "leadLevel", label: "Lead Level (ppm)" },
      { key: "contaminationStatus", label: "Status" },
      { key: "createdAt", label: "Collection Date" },
    ];

    const reportData = filteredSamples.map(s => ({
      sampleId: s.sampleId || "N/A",
      productType: s.productType || "N/A",
      leadLevel: `${getLeadLevel(s).toFixed(2)} ppm`,
      contaminationStatus: getContaminationStatus(s),
      createdAt: new Date(s.createdAt).toLocaleDateString() || "N/A",
    }));

    setGenerationProgress(60);

    await generateTablePDF(reportData, columns, filename, {
      title: "State Summary Report",
      subtitle: `State: ${filters.state} | Generated: ${new Date().toLocaleDateString()}`,
      orientation: "landscape",
    });
  };

  const generateProductTypeReport = async (filteredSamples, filters, filename) => {
    // Group samples by product type
    const groupedByProduct = {};
    filteredSamples.forEach(s => {
      const product = s.productType || "Unknown";
      if (!groupedByProduct[product]) {
        groupedByProduct[product] = [];
      }
      groupedByProduct[product].push(s);
    });

    setGenerationProgress(60);

    // Create summary data
    const reportData = Object.entries(groupedByProduct).map(([product, items]) => ({
      product,
      totalSamples: items.length,
      contaminated: items.filter(s => getContaminationStatus(s) === "CONTAMINATED").length,
      safe: items.filter(s => getContaminationStatus(s) === "SAFE").length,
      avgLeadLevel: `${(items.reduce((sum, s) => sum + getLeadLevel(s), 0) / items.length).toFixed(2)} ppm`,
    }));

    const columns = [
      { key: "product", label: "Product Type" },
      { key: "totalSamples", label: "Total Samples" },
      { key: "contaminated", label: "Contaminated" },
      { key: "safe", label: "Safe" },
      { key: "avgLeadLevel", label: "Avg Lead Level" },
    ];

    await generateTablePDF(reportData, columns, filename, {
      title: "Product Type Analysis Report",
      subtitle: `State: ${filters.state} | Generated: ${new Date().toLocaleDateString()}`,
      orientation: "landscape",
    });
  };

  const generateContaminationAnalysisReport = async (filteredSamples, filters, filename) => {
    const columns = [
      { key: "sampleId", label: "Sample Code" },
      { key: "state", label: "State" },
      { key: "productType", label: "Product" },
      { key: "leadLevel", label: "Lead Level (ppm)" },
      { key: "contaminationStatus", label: "Status" },
    ];

    const reportData = filteredSamples.map(s => ({
      sampleId: s.sampleId || "N/A",
      state: typeof s.state === 'object' ? s.state.name : s.state || "N/A",
      productType: s.productType || "N/A",
      leadLevel: `${getLeadLevel(s).toFixed(2)}`,
      contaminationStatus: getContaminationStatus(s),
    }));

    setGenerationProgress(60);

    await generateTablePDF(reportData, columns, filename, {
      title: "Contamination Analysis Report",
      subtitle: `Generated: ${new Date().toLocaleDateString()} | Total Samples: ${reportData.length}`,
      orientation: "landscape",
    });
  };

  const generateRiskAssessmentReport = async (filteredSamples, filters, filename) => {
    const riskyItems = filteredSamples.filter(s => getLeadLevel(s) >= filters.minLeadLevel);

    const columns = [
      { key: "sampleId", label: "Sample Code" },
      { key: "productType", label: "Product" },
      { key: "leadLevel", label: "Lead Level (ppm)" },
      { key: "riskLevel", label: "Risk Level" },
      { key: "createdAt", label: "Date" },
    ];

    const reportData = riskyItems.map(s => {
      const leadLevel = getLeadLevel(s);
      let riskLevel = "Low";
      if (leadLevel >= 100) riskLevel = "Critical";
      else if (leadLevel >= 50) riskLevel = "High";
      else if (leadLevel >= 10) riskLevel = "Medium";

      return {
        sampleId: s.sampleId || "N/A",
        productType: s.productType || "N/A",
        leadLevel: `${leadLevel.toFixed(2)} ppm`,
        riskLevel,
        createdAt: new Date(s.createdAt).toLocaleDateString() || "N/A",
      };
    });

    setGenerationProgress(60);

    await generateTablePDF(reportData, columns, filename, {
      title: "Risk Assessment Report",
      subtitle: `Minimum Lead Level: ${filters.minLeadLevel} ppm | High Risk Items: ${reportData.length}`,
      orientation: "landscape",
    });
  };

  const generateGenericReport = async (filteredSamples, filename) => {
    const columns = [
      { key: "sampleId", label: "Sample Code" },
      { key: "productType", label: "Product" },
      { key: "leadLevel", label: "Lead Level (ppm)" },
      { key: "contaminationStatus", label: "Status" },
    ];

    const reportData = filteredSamples.map(s => ({
      sampleId: s.sampleId || "N/A",
      productType: s.productType || "N/A",
      leadLevel: `${getLeadLevel(s).toFixed(2)}`,
      contaminationStatus: getContaminationStatus(s),
    }));

    setGenerationProgress(60);

    await generateTablePDF(reportData, columns, filename, {
      title: "General Report",
      subtitle: `Generated: ${new Date().toLocaleDateString()} | Total Records: ${reportData.length}`,
      orientation: "landscape",
    });
  };

  const ReportModal = ({ report, onClose }) => {
    const [filters, setFilters] = useState(reportFilters);

    // Check if required fields are filled
    const isFormValid = () => {
      if (report.type === "state-summary" || report.type === "product-type") {
        return filters.state !== "";
      }
      return true; // Other reports don't have required fields
    };

    const handleSubmit = async () => {
      // Pass the local filters directly to generateReport
      await generateReport(report.type, filters);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div
          className={`${theme?.card} rounded-lg shadow-xl max-w-md w-full border ${theme?.border}`}
        >
          <div className={`p-6 border-b ${theme?.border} flex items-center justify-between`}>
            <h2 className="text-lg font-bold">{report.title}</h2>
            <button onClick={onClose} className={`p-2 rounded-lg ${theme?.hover}`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* State Filter (for State Summary and Product Type) */}
            {(report.type === "state-summary" || report.type === "product-type") && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme?.text}`}>
                  Select State
                </label>
                <select
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
                >
                  <option value="">-- Select a state --</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Multiple States Filter (for Contamination Analysis) */}
            {report.type === "contamination-analysis" && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme?.text}`}>
                  Select States (optional)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {states.map((state) => (
                    <label key={state.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.states.includes(state.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              states: [...filters.states, state.name],
                            });
                          } else {
                            setFilters({
                              ...filters,
                              states: filters.states.filter((s) => s !== state.name),
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{state.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Product Types Filter */}
            {report.type === "contamination-analysis" && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme?.text}`}>
                  Select Product Types (optional)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {productTypes.map((type) => (
                    <label key={type.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.productTypes.includes(type.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              productTypes: [...filters.productTypes, type.key],
                            });
                          } else {
                            setFilters({
                              ...filters,
                              productTypes: filters.productTypes.filter((p) => p !== type.key),
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme?.text}`}>
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme?.text}`}>
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
                />
              </div>
            </div>

            {/* Min Lead Level for Risk Assessment */}
            {report.type === "risk-assessment" && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme?.text}`}>
                  Minimum Contamination Level (ppm)
                </label>
                <input
                  type="number"
                  value={filters.minLeadLevel}
                  onChange={(e) => setFilters({ ...filters, minLeadLevel: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${theme?.input} focus:ring-2 focus:ring-emerald-500`}
                  min="1"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !isFormValid()}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors relative overflow-hidden"
                title={!isFormValid() ? "Please select a state" : ""}
              >
                {/* Progress bar overlay */}
                {loading && generationProgress > 0 && (
                  <div 
                    className="absolute left-0 top-0 h-full bg-emerald-600/50 transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      {generationProgress > 0 ? `${generationProgress}%` : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Generate & Download
                    </>
                  )}
                </span>
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className={`flex-1 border rounded-lg font-medium ${theme?.hover}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const reportOptions = [
    {
      type: "state-summary",
      title: "State Summary Report",
      description: "Comprehensive analysis by state",
      icon: FileText,
      color: "border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    },
    {
      type: "contamination-analysis",
      title: "Contamination Analysis",
      description: "Detailed contamination statistics and trends",
      icon: BarChart3,
      color: "border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    },
    {
      type: "product-type",
      title: "Product Type Report",
      description: "Analysis by product category",
      icon: Package,
      color: "border-purple-500 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    },
    {
      type: "risk-assessment",
      title: "Risk Assessment",
      description: "High-risk products and areas",
      icon: AlertTriangle,
      color: "border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20",
    },
  ];

  return (
    <div
      className={`${theme?.card} ${theme?.text} rounded-lg shadow-md p-6 border ${theme?.border}`}
    >
      <h2 className="text-2xl font-semibold mb-6">Generate Reports</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportOptions.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.type}
                onClick={() => setSelectedReport(report)}
                className={`p-6 border-2 ${report.color} rounded-lg transition-colors text-left`}
              >
                <Icon className={`w-8 h-8 mb-2 ${report.color.split(" ")[1]}`} />
                <h3 className="font-semibold mb-1">{report.title}</h3>
                <p className={`text-sm ${theme?.textMuted}`}>{report.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {selectedReport && (
        <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
};

export default Reports;
