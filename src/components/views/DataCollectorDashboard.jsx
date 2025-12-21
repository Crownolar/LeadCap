import { useState, useRef } from "react";
import {
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Trash2,
  Download,
  CheckCircle,
} from "lucide-react";
import HeavyMetalFormModal from "../modals/lab-result_modal/HeavyMetalFormModal";
import LogoutConfirmModal from "../../pages/LogoutConfirmModal";

const DataCollectorDashboard = ({
  currentUser,
  handleLogout,
  theme,
  darkMode,
  toggleDarkMode,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [showImportedData, setShowImportedData] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const excelImportRef = useRef(null);

  const confirmLogout = () => {
    handleLogout();
    setShowLogoutConfirm(false);
  };

  const handleFileImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    // Simulate file processing - Replace with actual Excel parsing using SheetJS
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          sampleId: "HM-2024-001",
          testDate: "2024-12-09",
          metal: "Lead",
          concentration: "15.2 µg/dL",
          status: "Above Threshold",
        },
        {
          id: 2,
          sampleId: "HM-2024-002",
          testDate: "2024-12-09",
          metal: "Mercury",
          concentration: "3.5 µg/L",
          status: "Normal",
        },
        {
          id: 3,
          sampleId: "HM-2024-003",
          testDate: "2024-12-08",
          metal: "Cadmium",
          concentration: "2.1 µg/L",
          status: "Normal",
        },
        {
          id: 4,
          sampleId: "HM-2024-004",
          testDate: "2024-12-08",
          metal: "Lead",
          concentration: "8.7 µg/dL",
          status: "Normal",
        },
        {
          id: 5,
          sampleId: "HM-2024-005",
          testDate: "2024-12-07",
          metal: "Arsenic",
          concentration: "12.3 µg/L",
          status: "Above Threshold",
        },
      ];

      setImportedData(mockData);
      setShowImportedData(true);
      setIsProcessing(false);
      event.target.value = "";
    }, 1500);
  };

  const handleDeleteRecord = (id) => {
    setImportedData(importedData.filter((record) => record.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all imported data?")) {
      setImportedData([]);
      setShowImportedData(false);
    }
  };

  const handleSubmitData = () => {
    // Mock submit functionality
    alert(`Submitting ${importedData.length} records to database...`);
    console.log("Submitting data:", importedData);
  };

  return (
    <>
      <LogoutConfirmModal
        show={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        theme={theme}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-[5000]">
          <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Data Collection Center
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Lead Exposure Data Capacity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {currentUser?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {currentUser?.fullName || "User Name"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {currentUser?.state} • {currentUser?.lga}
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {showMobileMenu ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {showMobileMenu && (
              <div className="lg:hidden mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    {currentUser?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      {currentUser?.fullName || "User Name"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {currentUser?.state} • {currentUser?.lga}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
            <div className="flex items-start gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Data Collection Operations
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  Manage heavy metal analysis data and import laboratory
                  results. Use the tools below to add new entries or bulk import
                  data from Excel files.
                </p>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 lg:mb-8">
            {/* Manual Data Entry Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Manual Data Entry
                  </h3>
                </div>
                <p className="text-white text-xs sm:text-sm">
                  Add or update heavy metal analysis records individually
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <ul className="space-y-2 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Enter individual test results
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Update existing records
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Real-time validation
                  </li>
                </ul>
                <button
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                  onClick={() => setShowModal(true)}
                >
                  Add / Update Heavy Metal
                </button>
              </div>
            </div>

            {/* Bulk Import Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Bulk Import
                  </h3>
                </div>
                <p className="text-white text-xs sm:text-sm">
                  Upload Excel files for batch processing
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <ul className="space-y-2 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Import multiple records at once
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Support for .xlsx and .xls files
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    Automatic data validation
                  </li>
                </ul>
                <button
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => excelImportRef.current?.click()}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Import Excel File
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Guidelines Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Data Collection Guidelines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Accuracy
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Double-check all measurements and ensure proper unit
                  conversions
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Completeness
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill in all required fields and provide complete sample
                  information
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Timeliness
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Submit data within 24 hours of laboratory analysis completion
                </p>
              </div>
            </div>
          </div>

          {/* Imported Data Section */}
          {importedData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 sm:p-6 cursor-pointer hover:from-emerald-600 hover:to-emerald-700 transition-all"
                onClick={() => setShowImportedData(!showImportedData)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Imported Excel Data
                        <span className="text-sm font-normal bg-white/20 px-2 py-1 rounded-full">
                          {importedData.length} records
                        </span>
                      </h3>
                      <p className="text-white text-xs">
                        Click to {showImportedData ? "collapse" : "expand"}{" "}
                        records
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearAll();
                      }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="Clear All"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                    {showImportedData ? (
                      <ChevronUp className="w-6 h-6 text-white" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
              </div>

              {showImportedData && (
                <div className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Sample ID
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Test Date
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Metal
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Concentration
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Status
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {importedData.map((record) => (
                          <tr
                            key={record.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                              {record.sampleId}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {record.testDate}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {record.metal}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {record.concentration}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  record.status === "Above Threshold"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleDeleteRecord(record.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={handleClearAll}
                      className="px-6 py-2.5 border-2 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-semibold transition-all duration-200"
                    >
                      Clear All Data
                    </button>
                    <button
                      onClick={handleSubmitData}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Submit to Database
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {showModal && (
          <HeavyMetalFormModal
            theme={{
              card: "bg-white dark:bg-gray-800",
              border: "border-gray-200 dark:border-gray-700",
              input:
                "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
              text: "text-gray-900 dark:text-gray-100",
              textMuted: "text-gray-600 dark:text-gray-400",
              hover: "hover:bg-gray-100 dark:hover:bg-gray-700",
            }}
            onClose={() => setShowModal(false)}
          />
        )}

        <input
          type="file"
          ref={excelImportRef}
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileImport}
        />
      </div>
    </>
  );
};

export default DataCollectorDashboard;
