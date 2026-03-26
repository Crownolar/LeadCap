// import { useEffect, useState } from "react";
// import { TypeBadge } from "../../../../components/TypeBadge";
// import {
//   getSavedReports,
//   getReportById,
// } from "../../../../../../services/mohReportService";
// import SavedReportPreview from "./SavedReportPreview";
// import ReportViewerModal from "./ReportViewerModal";

// const formatReportType = (type) => {
//   if (!type) return "Unknown";
//   return type
//     .replace(/_/g, " ")
//     .toLowerCase()
//     .replace(/\b\w/g, (char) => char.toUpperCase());
// };

// const buildReportTitle = (report) => {
//   const type = formatReportType(report?.reportType);

//   if (report?.summary?.state) {
//     return `${type} — ${report.summary.state}`;
//   }

//   if (report?.filters?.state) {
//     return `${type} — ${report.filters.state}`;
//   }

//   return type;
// };

// const buildReportSub = (report) => {
//   const generatedAt = report?.generatedAt
//     ? new Date(report.generatedAt).toLocaleString()
//     : "Unknown date";

//   return `Generated ${generatedAt}`;
// };

// const SavedReports = () => {
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [openingId, setOpeningId] = useState("");
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);
//   const [previewError, setPreviewError] = useState("");

//   // useEffect(() => {
//   //   const fetchReports = async () => {
//   //     try {
//   //       setLoading(true);
//   //       setError("");

//   //       const data = await getSavedReports();
//   //       console.log("Saved reports list:", data);

//   //       const reportList = Array.isArray(data?.items)
//   //         ? data.items
//   //         : Array.isArray(data?.data)
//   //           ? data.data
//   //           : Array.isArray(data?.reports)
//   //             ? data.reports
//   //             : Array.isArray(data)
//   //               ? data
//   //               : [];

//   //       setReports(reportList);
//   //     } catch (err) {
//   //       console.error("Failed to fetch saved reports:", err);

//   //       const message =
//   //         err.response?.data?.message ||
//   //         err.response?.data?.error ||
//   //         "Failed to fetch saved reports.";

//   //       setError(message);
//   //       setReports([]);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchReports();
//   // }, []);

//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const data = await getSavedReports();
//         console.log("Saved reports list:", data);

//         const reportList = Array.isArray(data?.items)
//           ? data.items
//           : Array.isArray(data?.data)
//             ? data.data
//             : Array.isArray(data?.reports)
//               ? data.reports
//               : Array.isArray(data)
//                 ? data
//                 : [];

//         if (reportList.length > 0) {
//           setReports(reportList);
//         } else {
//           setReports([
//             {
//               id: "mock-state-summary-1",
//               reportType: "STATE_SUMMARY",
//               generatedAt: new Date().toISOString(),
//               filters: {
//                 state: "Kano",
//                 dateFrom: "2026-03-13",
//                 dateTo: "2026-03-14",
//               },
//               summary: {
//                 state: "Kano",
//               },
//               isMock: true,
//             },
//           ]);
//         }
//       } catch (err) {
//         console.error("Failed to fetch saved reports:", err);
//         setError("Failed to fetch saved reports.");
//         setReports([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReports();
//   }, []);

//   // const handleOpenReport = async (id) => {
//   //   try {
//   //     setOpeningId(id);
//   //     setPreviewError("");

//   //     const data = await getReportById(id);
//   //     console.log("Opened full report:", data);

//   //     setSelectedReport(data?.data || data);
//   //     setShowPreview(true);
//   //   } catch (err) {
//   //     console.error("Failed to fetch report by ID:", err);

//   //     const message =
//   //       err.response?.data?.message ||
//   //       err.response?.data?.error ||
//   //       "Failed to open report.";

//   //     setPreviewError(message);
//   //   } finally {
//   //     setOpeningId("");
//   //   }
//   // };

//   const handleOpenReport = async (id) => {
//     try {
//       setOpeningId(id);
//       setPreviewError("");

//       if (id === "mock-state-summary-1") {
//         setSelectedReport({
//           id: "mock-state-summary-1",
//           reportType: "STATE_SUMMARY",
//           generatedAt: new Date().toISOString(),
//           filters: {
//             state: "Kano",
//             dateFrom: "2026-03-13",
//             dateTo: "2026-03-14",
//           },
//           summary: {
//             state: "Kano",
//             totalSamples: 16,
//             percentageContaminated: "0.00",
//             contaminationBreakdown: {
//               SAFE: 0,
//               MODERATE: 0,
//               CONTAMINATED: 0,
//               PENDING: 16,
//             },
//             verificationBreakdown: {
//               VERIFIED_ORIGINAL: 0,
//               VERIFIED_FAKE: 0,
//               UNVERIFIED: 16,
//               VERIFICATION_PENDING: 0,
//             },
//           },
//           byLGA: {
//             Dala: {
//               total: 5,
//               safe: 0,
//               moderate: 0,
//               contaminated: 0,
//               pending: 5,
//             },
//             Tarauni: {
//               total: 4,
//               safe: 0,
//               moderate: 0,
//               contaminated: 0,
//               pending: 4,
//             },
//           },
//           registrationStatus: {
//             registered: 15,
//             unregistered: 1,
//           },
//           vendorType: {
//             formal: 0,
//             informal: 16,
//             total: 16,
//             byType: { OTHER: 16 },
//           },
//           recommendations: [],
//         });
//         setShowPreview(true);
//         return;
//       }

//       const data = await getReportById(id);
//       console.log("Opened full report:", data);

//       setSelectedReport(data?.data || data);
//       setShowPreview(true);
//     } catch (err) {
//       console.error("Failed to fetch report by ID:", err);

//       const message =
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         "Failed to open report.";

//       setPreviewError(message);
//     } finally {
//       setOpeningId("");
//     }
//   };
//   return (
//     <>
//       <div className="mt-5">
//         <div className="mb-3 text-sm font-medium text-gray-900">
//           Saved reports
//         </div>

//         <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
//           {loading ? (
//             <div className="px-4 py-6 text-sm text-gray-500">
//               Loading saved reports...
//             </div>
//           ) : error ? (
//             <div className="px-4 py-6 text-sm text-red-600">{error}</div>
//           ) : reports.length === 0 ? (
//             <div className="px-4 py-6 text-sm text-gray-500">
//               No saved reports available.
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-100">
//               {reports.map((report, index) => {
//                 const reportId =
//                   report?.id ||
//                   report?._id ||
//                   report?.reportId ||
//                   String(index);

//                 return (
//                   <div
//                     key={reportId}
//                     className="flex items-center justify-between px-4 py-3"
//                   >
//                     <div>
//                       <div className="text-sm font-medium text-gray-900">
//                         {buildReportTitle(report)}
//                       </div>
//                       <div className="mt-0.5 text-xs text-gray-400">
//                         {buildReportSub(report)}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <TypeBadge type={formatReportType(report?.reportType)} />
//                       <button
//                         type="button"
//                         onClick={() => handleOpenReport(reportId)}
//                         disabled={openingId === reportId}
//                         className={`rounded-md border px-3 py-1.5 text-xs ${
//                           openingId === reportId
//                             ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
//                             : "cursor-pointer border-gray-200 bg-white text-gray-500 hover:border-green-400 hover:text-green-700"
//                         }`}
//                       >
//                         {openingId === reportId ? "Opening..." : "Open"}
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {previewError && (
//           <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {previewError}
//           </div>
//         )}
//       </div>

//       <ReportViewerModal
//         isOpen={showPreview && !!selectedReport}
//         onClose={() => {
//           setShowPreview(false);
//           setSelectedReport(null);
//         }}
//         title={buildReportTitle(selectedReport)}
//         subtitle={buildReportSub(selectedReport)}
//       >
//         <SavedReportPreview report={selectedReport} />
//       </ReportViewerModal>
//     </>
//   );
// };

// export default SavedReports;



import { useEffect, useState } from "react";
import { TypeBadge } from "../../../../components/TypeBadge";
import {
  getSavedReports,
  getReportById,
} from "../../../../../../services/mohReportService";
import SavedReportPreview from "./SavedReportPreview";
import ReportViewerModal from "./ReportViewerModal";

const formatReportType = (type) => {
  if (!type) return "Unknown";
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const buildReportTitle = (report) => {
  const type = formatReportType(report?.reportType);

  if (report?.summary?.state) {
    return `${type} — ${report.summary.state}`;
  }

  if (report?.filters?.state) {
    return `${type} — ${report.filters.state}`;
  }

  return type;
};

const buildReportSub = (report) => {
  const generatedAt = report?.generatedAt
    ? new Date(report.generatedAt).toLocaleString()
    : "Unknown date";

  return `Generated ${generatedAt}`;
};

const SavedReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openingId, setOpeningId] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSavedReports();
        console.log("Saved reports list:", data);

        const reportList = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.reports)
              ? data.reports
              : Array.isArray(data)
                ? data
                : [];

        if (reportList.length > 0) {
          setReports(reportList);
        } else {
          setReports([
            {
              id: "mock-state-summary-1",
              reportType: "STATE_SUMMARY",
              generatedAt: new Date().toISOString(),
              filters: {
                state: "Kano",
                dateFrom: "2026-03-13",
                dateTo: "2026-03-14",
              },
              summary: {
                state: "Kano",
              },
              isMock: true,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch saved reports:", err);
        setError("Failed to fetch saved reports.");
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleOpenReport = async (id) => {
    try {
      setOpeningId(id);
      setPreviewError("");

      if (id === "mock-state-summary-1") {
        setSelectedReport({
          id: "mock-state-summary-1",
          reportType: "STATE_SUMMARY",
          generatedAt: new Date().toISOString(),
          filters: {
            state: "Kano",
            dateFrom: "2026-03-13",
            dateTo: "2026-03-14",
          },
          summary: {
            state: "Kano",
            totalSamples: 16,
            percentageContaminated: "0.00",
            contaminationBreakdown: {
              SAFE: 0,
              MODERATE: 0,
              CONTAMINATED: 0,
              PENDING: 16,
            },
            verificationBreakdown: {
              VERIFIED_ORIGINAL: 0,
              VERIFIED_FAKE: 0,
              UNVERIFIED: 16,
              VERIFICATION_PENDING: 0,
            },
          },
          byLGA: {
            Dala: {
              total: 5,
              safe: 0,
              moderate: 0,
              contaminated: 0,
              pending: 5,
            },
            Tarauni: {
              total: 4,
              safe: 0,
              moderate: 0,
              contaminated: 0,
              pending: 4,
            },
          },
          registrationStatus: {
            registered: 15,
            unregistered: 1,
          },
          vendorType: {
            formal: 0,
            informal: 16,
            total: 16,
            byType: { OTHER: 16 },
          },
          recommendations: [],
        });
        setShowPreview(true);
        return;
      }

      const data = await getReportById(id);
      console.log("Opened full report:", data);

      setSelectedReport(data?.data || data);
      setShowPreview(true);
    } catch (err) {
      console.error("Failed to fetch report by ID:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to open report.";

      setPreviewError(message);
    } finally {
      setOpeningId("");
    }
  };

  return (
    <>
      <div className="mt-5">
        <div className="mb-3 text-sm font-medium text-gray-900">
          Saved reports
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {loading ? (
            <div className="px-4 py-6 text-sm text-gray-500">
              Loading saved reports...
            </div>
          ) : error ? (
            <div className="px-4 py-6 text-sm text-red-600">{error}</div>
          ) : reports.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500">
              No saved reports available.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reports.map((report, index) => {
                const reportId =
                  report?.id ||
                  report?._id ||
                  report?.reportId ||
                  String(index);

                return (
                  <div
                    key={reportId}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 break-words">
                        {buildReportTitle(report)}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-400">
                        {buildReportSub(report)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <TypeBadge type={formatReportType(report?.reportType)} />
                      <button
                        type="button"
                        onClick={() => handleOpenReport(reportId)}
                        disabled={openingId === reportId}
                        className={`rounded-md border px-3 py-1.5 text-xs ${
                          openingId === reportId
                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                            : "cursor-pointer border-gray-200 bg-white text-gray-500 hover:border-green-400 hover:text-green-700"
                        }`}
                      >
                        {openingId === reportId ? "Opening..." : "Open"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {previewError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {previewError}
          </div>
        )}
      </div>

      <ReportViewerModal
        isOpen={showPreview && !!selectedReport}
        onClose={() => {
          setShowPreview(false);
          setSelectedReport(null);
        }}
        title={buildReportTitle(selectedReport)}
        subtitle={buildReportSub(selectedReport)}
      >
        <SavedReportPreview report={selectedReport} />
      </ReportViewerModal>
    </>
  );
};

export default SavedReports;