import { useState, useRef } from "react";
import { LogOut, User, Menu, X } from "lucide-react";
import HeavyMetalFormModal from "../modals/lab-result_modal/HeavyMetalFormModal";
import LogoutConfirmModal from "../../pages/LogoutConfirmModal";

const DataCollectorDashboard = ({ currentUser, handleLogout, theme }) => {
  const [showModal, setShowModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const excelImportRef = useRef(null);

  const confirmLogout = () => {
    handleLogout();
    setShowLogoutConfirm(false);
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
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-6 h-6 lg:w-8 lg:h-8 text-white"
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
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold text-white mb-1">
                    Data Collection Center
                  </h1>
                  <p className="text-emerald-100 text-sm lg:text-lg">
                    National Health Laboratory Information System
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 lg:px-6 py-2 lg:py-3 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <User className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold text-sm lg:text-base">
                        {currentUser?.fullName || "User Name"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-emerald-100">
                        <span>{currentUser?.state || "State"}</span>
                        <span>•</span>
                        <span>{currentUser?.lga || "LGA"}</span>
                        <span>•</span>
                        <span>
                          {currentUser?.organisation || "Organization"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 lg:p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 group"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="lg:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg
                      className="w-6 h-6 text-white"
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
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                      Data Collection
                    </h1>
                    <p className="text-emerald-100 text-xs sm:text-sm">NHLIS</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200"
                >
                  {showMobileMenu ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>

              {showMobileMenu && (
                <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/20">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">
                        {currentUser?.fullName || "User Name"}
                      </p>
                      <p className="text-emerald-100 text-xs">
                        {currentUser?.state || "State"} •{" "}
                        {currentUser?.lga || "LGA"}
                      </p>
                      <p className="text-emerald-100 text-xs">
                        {currentUser?.organisation || "Organization"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowLogoutConfirm(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 text-white font-semibold"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 lg:mb-8">
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
                <p className="text-emerald-100 text-xs sm:text-sm">
                  Add or update heavy metal analysis records individually
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <ul className="space-y-2 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Enter individual test results
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Update existing records
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Real-time validation
                  </li>
                </ul>
                <button
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                  onClick={() => setShowModal(true)}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Add / Update Heavy Metal
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Bulk Import
                  </h3>
                </div>
                <p className="text-blue-100 text-xs sm:text-sm">
                  Upload Excel files for batch processing
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <ul className="space-y-2 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Import multiple records at once
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Support for .xlsx and .xls files
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Automatic data validation
                  </li>
                </ul>
                <button
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                  onClick={() => excelImportRef.current.click()}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Import Excel File
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
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

        <input type="file" ref={excelImportRef} className="hidden" />
      </div>
    </>
  );
};

export default DataCollectorDashboard;
