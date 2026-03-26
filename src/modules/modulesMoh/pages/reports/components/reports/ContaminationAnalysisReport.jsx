// import { useState } from "react";
// import { FilterBar } from "../../../../components/FilterBar";
// import { SectionLabel } from "../../../../components/SectionLabel";
// import { FilterSep, BtnPrimary, TH, TD } from "../../../../utils/MohUI";
// import { RateBadge } from "../../../../components/RateBadge";
// import { getContaminationAnalysisReport } from "../../../../../../services/mohReportService";
// import {
//   exportContaminationAnalysisExcel,
//   exportContaminationAnalysisPdf,
// } from "../../../../utils/reportExport";
// import ReportHeader from "./ReportHeader";

// const ContaminationAnalysisReport = () => {
//   const [generated, setGenerated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [reportData, setReportData] = useState(null);

//   const [filters, setFilters] = useState({
//     states: "",
//     productVariantIds: "",
//     dateFrom: "2026-03-13",
//     dateTo: "2026-03-14",
//   });

//   const handleGenerateReport = async () => {
//     if (!filters.dateFrom || !filters.dateTo) {
//       setError("Please select both date range fields.");
//       setGenerated(false);
//       return;
//     }

//     if (filters.dateFrom > filters.dateTo) {
//       setError("'From' date cannot be later than 'To' date.");
//       setGenerated(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");
//       setGenerated(false);

//       const data = await getContaminationAnalysisReport({
//         states: filters.states,
//         productVariantIds: filters.productVariantIds,
//         dateFrom: filters.dateFrom,
//         dateTo: filters.dateTo,
//       });

//       console.log("Contamination analysis response:", data);

//       setReportData(data?.data || data);
//       setGenerated(true);
//     } catch (err) {
//       console.error("Failed to fetch contamination analysis report:", err);

//       const message =
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         "Failed to generate contamination analysis report.";

//       setError(message);
//       setReportData(null);
//       setGenerated(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generatedAt = reportData?.generatedAt
//     ? new Date(reportData.generatedAt).toLocaleString()
//     : "";

//   const summary = reportData?.summary || {};
//   const distribution = reportData?.distribution || {};
//   const byState = reportData?.byState || {};
//   const byProductType = reportData?.byProductType || {};
//   const topContaminated = reportData?.topContaminated || [];
//   const trendAnalysis = reportData?.trendAnalysis || {};

//   const stateRows = Object.entries(byState)
//     .map(([stateName, stats]) => ({
//       stateName,
//       count: stats?.count || 0,
//       contaminationRate: stats?.contaminationRate || "0%",
//       safe: stats?.statuses?.SAFE || 0,
//       moderate: stats?.statuses?.MODERATE || 0,
//       contaminated: stats?.statuses?.CONTAMINATED || 0,
//       pending: stats?.statuses?.PENDING || 0,
//     }))
//     .sort((a, b) => b.count - a.count);

//   const productTypeRows = Object.entries(byProductType)
//     .map(([productType, stats]) => ({
//       productType,
//       count: stats?.count || 0,
//       contaminationRate: stats?.contaminationRate || "0%",
//       safe: stats?.statuses?.SAFE || 0,
//       moderate: stats?.statuses?.MODERATE || 0,
//       contaminated: stats?.statuses?.CONTAMINATED || 0,
//       pending: stats?.statuses?.PENDING || 0,
//       unverified: stats?.verifications?.UNVERIFIED || 0,
//     }))
//     .sort((a, b) => b.count - a.count);

//   const trendRows = Object.entries(trendAnalysis)
//     .map(([period, stats]) => ({
//       period,
//       count: stats?.count || 0,
//       contaminationRate: stats?.contaminationRate || "0%",
//     }))
//     .sort((a, b) => a.period.localeCompare(b.period));

//   const hasData = (summary.totalSamples || 0) > 0;

//   const handleExportExcel = () => {
//     exportContaminationAnalysisExcel({
//       fileName: `contamination-analysis-${filters.dateFrom}-${filters.dateTo}.xlsx`,
//       generatedAt,
//       dateFrom: filters.dateFrom,
//       dateTo: filters.dateTo,
//       states: filters.states,
//       productVariantIds: filters.productVariantIds,
//       summary,
//       distribution,
//       stateRows,
//       productTypeRows,
//       trendRows,
//       topContaminated,
//     });
//   };

//   const handleExportPdf = () => {
//     exportContaminationAnalysisPdf({
//       fileName: `contamination-analysis-${filters.dateFrom}-${filters.dateTo}.pdf`,
//       generatedAt,
//       dateFrom: filters.dateFrom,
//       dateTo: filters.dateTo,
//       states: filters.states,
//       productVariantIds: filters.productVariantIds,
//       summary,
//       distribution,
//       stateRows,
//       productTypeRows,
//       trendRows,
//       topContaminated,
//     });
//   };

//   return (
//     <>
//       <FilterBar>
//         <label className="text-xs text-gray-500">States</label>
//         <input
//           type="text"
//           value={filters.states}
//           onChange={(e) =>
//             setFilters((prev) => ({ ...prev, states: e.target.value }))
//           }
//           placeholder="Comma-separated state IDs"
//           className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
//           style={{ minWidth: 180 }}
//         />

//         <label className="text-xs text-gray-500">Product variant IDs</label>
//         <input
//           type="text"
//           value={filters.productVariantIds}
//           onChange={(e) =>
//             setFilters((prev) => ({
//               ...prev,
//               productVariantIds: e.target.value,
//             }))
//           }
//           placeholder="Comma-separated variant IDs"
//           className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
//           style={{ minWidth: 180 }}
//         />

//         <FilterSep />

//         <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
//         <input
//           type="date"
//           value={filters.dateFrom}
//           onChange={(e) =>
//             setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
//           }
//           className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
//         />

//         <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
//         <input
//           type="date"
//           value={filters.dateTo}
//           onChange={(e) =>
//             setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
//           }
//           className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
//         />

//         <FilterSep />

//         <BtnPrimary onClick={handleGenerateReport} disabled={loading}>
//           {loading ? "Generating..." : "Generate report"}
//         </BtnPrimary>
//       </FilterBar>

//       {error && (
//         <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {generated && reportData && (
//         <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
//           <ReportHeader
//             title="Contamination analysis"
//             subtitle={`Generated: ${generatedAt || "—"} · ${filters.dateFrom} to ${
//               filters.dateTo
//             }${filters.states ? ` · States: ${filters.states}` : ""}${
//               filters.productVariantIds
//                 ? ` · Variants: ${filters.productVariantIds}`
//                 : ""
//             }`}
//             onExportPdf={handleExportPdf}
//             onExportExcel={handleExportExcel}
//           />

//           <div className="border-b border-gray-100 px-5 py-4">
//             <SectionLabel>Summary</SectionLabel>

//             <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
//               <span className="text-gray-500">Total samples</span>
//               <span className="font-medium text-gray-900">
//                 {summary.totalSamples ?? 0}
//               </span>
//             </div>

//             <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
//               <span className="text-gray-500">Total readings</span>
//               <span className="font-medium text-gray-900">
//                 {summary.totalReadings ?? 0}
//               </span>
//             </div>

//             <div className="flex justify-between py-1.5 text-sm">
//               <span className="text-gray-500">Overall contamination rate</span>
//               <span className="font-medium text-red-600">
//                 {summary.overallContaminationRate ?? "0%"}
//               </span>
//             </div>
//           </div>

//           <div className="border-b border-gray-100 px-5 py-4">
//             <SectionLabel>Distribution</SectionLabel>

//             <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
//               <span className="text-gray-500">Safe</span>
//               <span className="font-medium text-green-700">
//                 {distribution.safe ?? 0}
//               </span>
//             </div>

//             <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
//               <span className="text-gray-500">Moderate</span>
//               <span className="font-medium text-amber-600">
//                 {distribution.moderate ?? 0}
//               </span>
//             </div>

//             <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
//               <span className="text-gray-500">Contaminated</span>
//               <span className="font-medium text-red-600">
//                 {distribution.contaminated ?? 0}
//               </span>
//             </div>

//             <div className="flex justify-between py-1.5 text-sm">
//               <span className="text-gray-500">Pending</span>
//               <span className="font-medium text-amber-600">
//                 {distribution.pending ?? 0}
//               </span>
//             </div>
//           </div>

//           {!hasData ? (
//             <div className="px-5 py-8 text-sm text-gray-500">
//               No contamination analysis data is available for the selected
//               filters.
//             </div>
//           ) : (
//             <>
//               <div className="border-b border-gray-100 px-5 py-4">
//                 <SectionLabel>Breakdown by state</SectionLabel>

//                 <table className="w-full border-collapse text-xs">
//                   <thead>
//                     <tr>
//                       {[
//                         "State",
//                         "Samples",
//                         "Safe",
//                         "Moderate",
//                         "Contaminated",
//                         "Pending",
//                         "Rate",
//                       ].map((h) => (
//                         <th key={h} className={TH}>
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {stateRows.length > 0 ? (
//                       stateRows.map((item, index) => (
//                         <tr
//                           key={`${item.stateName}-${index}`}
//                           className="hover:bg-gray-50"
//                         >
//                           <td className={TD}>{item.stateName}</td>
//                           <td className={TD}>{item.count}</td>
//                           <td className={TD}>{item.safe}</td>
//                           <td className={TD}>{item.moderate}</td>
//                           <td className={TD}>{item.contaminated}</td>
//                           <td className={TD}>{item.pending}</td>
//                           <td className={TD}>
//                             <RateBadge rate={item.contaminationRate} />
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td className={TD} colSpan={7}>
//                           No state breakdown available.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="border-b border-gray-100 px-5 py-4">
//                 <SectionLabel>Breakdown by product type</SectionLabel>

//                 <table className="w-full border-collapse text-xs">
//                   <thead>
//                     <tr>
//                       {[
//                         "Product type",
//                         "Samples",
//                         "Safe",
//                         "Moderate",
//                         "Contaminated",
//                         "Pending",
//                         "Unverified",
//                         "Rate",
//                       ].map((h) => (
//                         <th key={h} className={TH}>
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {productTypeRows.length > 0 ? (
//                       productTypeRows.map((item, index) => (
//                         <tr
//                           key={`${item.productType}-${index}`}
//                           className="hover:bg-gray-50"
//                         >
//                           <td className={TD}>{item.productType}</td>
//                           <td className={TD}>{item.count}</td>
//                           <td className={TD}>{item.safe}</td>
//                           <td className={TD}>{item.moderate}</td>
//                           <td className={TD}>{item.contaminated}</td>
//                           <td className={TD}>{item.pending}</td>
//                           <td className={TD}>{item.unverified}</td>
//                           <td className={TD}>
//                             <RateBadge rate={item.contaminationRate} />
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td className={TD} colSpan={8}>
//                           No product type breakdown available.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="border-b border-gray-100 px-5 py-4">
//                 <SectionLabel>Trend analysis</SectionLabel>

//                 <table className="w-full border-collapse text-xs">
//                   <thead>
//                     <tr>
//                       {["Period", "Samples", "Rate"].map((h) => (
//                         <th key={h} className={TH}>
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {trendRows.length > 0 ? (
//                       trendRows.map((item, index) => (
//                         <tr
//                           key={`${item.period}-${index}`}
//                           className="hover:bg-gray-50"
//                         >
//                           <td className={TD}>{item.period}</td>
//                           <td className={TD}>{item.count}</td>
//                           <td className={TD}>
//                             <RateBadge rate={item.contaminationRate} />
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td className={TD} colSpan={3}>
//                           No trend analysis available.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="px-5 py-4">
//                 <SectionLabel>Top contaminated samples</SectionLabel>

//                 <table className="w-full border-collapse text-xs">
//                   <thead>
//                     <tr>
//                       {[
//                         "Sample",
//                         "State",
//                         "Heavy Metal",
//                         "Reading",
//                         "Status",
//                       ].map((h) => (
//                         <th key={h} className={TH}>
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {topContaminated.length > 0 ? (
//                       topContaminated.map((item, index) => (
//                         <tr key={index} className="hover:bg-gray-50">
//                           <td className={TD}>
//                             {item.sampleId ||
//                               item.sampleCode ||
//                               item.sampleName ||
//                               "-"}
//                           </td>
//                           <td className={TD}>{item.state || "-"}</td>
//                           <td className={TD}>{item.heavyMetal || "-"}</td>
//                           <td className={TD}>{item.reading ?? "-"}</td>
//                           <td className={TD}>{item.status || "-"}</td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td className={TD} colSpan={5}>
//                           No top contaminated samples available.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </>
//   );
// };

// export default ContaminationAnalysisReport;


import { useState } from "react";
import { FilterBar } from "../../../../components/FilterBar";
import { SectionLabel } from "../../../../components/SectionLabel";
import { FilterSep, BtnPrimary, TH, TD } from "../../../../utils/MohUI";
import { RateBadge } from "../../../../components/RateBadge";
import { getContaminationAnalysisReport } from "../../../../../../services/mohReportService";
import {
  exportContaminationAnalysisExcel,
  exportContaminationAnalysisPdf,
} from "../../../../utils/reportExport";
import ReportHeader from "./ReportHeader";

const ContaminationAnalysisReport = () => {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);

  const [filters, setFilters] = useState({
    states: "",
    productVariantIds: "",
    dateFrom: "2026-03-13",
    dateTo: "2026-03-14",
  });

  const handleGenerateReport = async () => {
    if (!filters.dateFrom || !filters.dateTo) {
      setError("Please select both date range fields.");
      setGenerated(false);
      return;
    }

    if (filters.dateFrom > filters.dateTo) {
      setError("'From' date cannot be later than 'To' date.");
      setGenerated(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setGenerated(false);

      const data = await getContaminationAnalysisReport({
        states: filters.states,
        productVariantIds: filters.productVariantIds,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });

      console.log("Contamination analysis response:", data);

      setReportData(data?.data || data);
      setGenerated(true);
    } catch (err) {
      console.error("Failed to fetch contamination analysis report:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to generate contamination analysis report.";

      setError(message);
      setReportData(null);
      setGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  const generatedAt = reportData?.generatedAt
    ? new Date(reportData.generatedAt).toLocaleString()
    : "";

  const summary = reportData?.summary || {};
  const distribution = reportData?.distribution || {};
  const byState = reportData?.byState || {};
  const byProductType = reportData?.byProductType || {};
  const topContaminated = reportData?.topContaminated || [];
  const trendAnalysis = reportData?.trendAnalysis || {};

  const stateRows = Object.entries(byState)
    .map(([stateName, stats]) => ({
      stateName,
      count: stats?.count || 0,
      contaminationRate: stats?.contaminationRate || "0%",
      safe: stats?.statuses?.SAFE || 0,
      moderate: stats?.statuses?.MODERATE || 0,
      contaminated: stats?.statuses?.CONTAMINATED || 0,
      pending: stats?.statuses?.PENDING || 0,
    }))
    .sort((a, b) => b.count - a.count);

  const productTypeRows = Object.entries(byProductType)
    .map(([productType, stats]) => ({
      productType,
      count: stats?.count || 0,
      contaminationRate: stats?.contaminationRate || "0%",
      safe: stats?.statuses?.SAFE || 0,
      moderate: stats?.statuses?.MODERATE || 0,
      contaminated: stats?.statuses?.CONTAMINATED || 0,
      pending: stats?.statuses?.PENDING || 0,
      unverified: stats?.verifications?.UNVERIFIED || 0,
    }))
    .sort((a, b) => b.count - a.count);

  const trendRows = Object.entries(trendAnalysis)
    .map(([period, stats]) => ({
      period,
      count: stats?.count || 0,
      contaminationRate: stats?.contaminationRate || "0%",
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  const hasData = (summary.totalSamples || 0) > 0;

  const handleExportExcel = () => {
    exportContaminationAnalysisExcel({
      fileName: `contamination-analysis-${filters.dateFrom}-${filters.dateTo}.xlsx`,
      generatedAt,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      states: filters.states,
      productVariantIds: filters.productVariantIds,
      summary,
      distribution,
      stateRows,
      productTypeRows,
      trendRows,
      topContaminated,
    });
  };

  const handleExportPdf = () => {
    exportContaminationAnalysisPdf({
      fileName: `contamination-analysis-${filters.dateFrom}-${filters.dateTo}.pdf`,
      generatedAt,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      states: filters.states,
      productVariantIds: filters.productVariantIds,
      summary,
      distribution,
      stateRows,
      productTypeRows,
      trendRows,
      topContaminated,
    });
  };

  return (
    <>
      <FilterBar>
        <label className="text-xs text-gray-500">States</label>
        <input
          type="text"
          value={filters.states}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, states: e.target.value }))
          }
          placeholder="Comma-separated state IDs"
          className="w-full sm:w-auto text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
          style={{ minWidth: 180 }}
        />

        <label className="text-xs text-gray-500">Product variant IDs</label>
        <input
          type="text"
          value={filters.productVariantIds}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              productVariantIds: e.target.value,
            }))
          }
          placeholder="Comma-separated variant IDs"
          className="w-full sm:w-auto text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
          style={{ minWidth: 180 }}
        />

        <FilterSep />

        <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
          }
          className="w-full sm:w-auto text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
        />

        <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
          }
          className="w-full sm:w-auto text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
        />

        <FilterSep />

        <BtnPrimary onClick={handleGenerateReport} disabled={loading}>
          {loading ? "Generating..." : "Generate report"}
        </BtnPrimary>
      </FilterBar>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {generated && reportData && (
        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white w-full">
          <ReportHeader
            title="Contamination analysis"
            subtitle={`Generated: ${generatedAt || "—"} · ${filters.dateFrom} to ${
              filters.dateTo
            }${filters.states ? ` · States: ${filters.states}` : ""}${
              filters.productVariantIds
                ? ` · Variants: ${filters.productVariantIds}`
                : ""
            }`}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
          />

          <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
            <SectionLabel>Summary</SectionLabel>

            <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
              <span className="text-gray-500">Total samples</span>
              <span className="font-medium text-gray-900">
                {summary.totalSamples ?? 0}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
              <span className="text-gray-500">Total readings</span>
              <span className="font-medium text-gray-900">
                {summary.totalReadings ?? 0}
              </span>
            </div>

            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-500">Overall contamination rate</span>
              <span className="font-medium text-red-600">
                {summary.overallContaminationRate ?? "0%"}
              </span>
            </div>
          </div>

          <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
            <SectionLabel>Distribution</SectionLabel>

            <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
              <span className="text-gray-500">Safe</span>
              <span className="font-medium text-green-700">
                {distribution.safe ?? 0}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
              <span className="text-gray-500">Moderate</span>
              <span className="font-medium text-amber-600">
                {distribution.moderate ?? 0}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
              <span className="text-gray-500">Contaminated</span>
              <span className="font-medium text-red-600">
                {distribution.contaminated ?? 0}
              </span>
            </div>

            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-500">Pending</span>
              <span className="font-medium text-amber-600">
                {distribution.pending ?? 0}
              </span>
            </div>
          </div>

          {!hasData ? (
            <div className="px-4 sm:px-5 py-8 text-sm text-gray-500">
              No contamination analysis data is available for the selected
              filters.
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
                <SectionLabel>Breakdown by state</SectionLabel>

                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[560px] border-collapse text-xs">
                    <thead>
                      <tr>
                        {[
                          "State",
                          "Samples",
                          "Safe",
                          "Moderate",
                          "Contaminated",
                          "Pending",
                          "Rate",
                        ].map((h) => (
                          <th key={h} className={TH}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stateRows.length > 0 ? (
                        stateRows.map((item, index) => (
                          <tr
                            key={`${item.stateName}-${index}`}
                            className="hover:bg-gray-50"
                          >
                            <td className={TD}>{item.stateName}</td>
                            <td className={TD}>{item.count}</td>
                            <td className={TD}>{item.safe}</td>
                            <td className={TD}>{item.moderate}</td>
                            <td className={TD}>{item.contaminated}</td>
                            <td className={TD}>{item.pending}</td>
                            <td className={TD}>
                              <RateBadge rate={item.contaminationRate} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={TD} colSpan={7}>
                            No state breakdown available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
                <SectionLabel>Breakdown by product type</SectionLabel>

                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[640px] border-collapse text-xs">
                    <thead>
                      <tr>
                        {[
                          "Product type",
                          "Samples",
                          "Safe",
                          "Moderate",
                          "Contaminated",
                          "Pending",
                          "Unverified",
                          "Rate",
                        ].map((h) => (
                          <th key={h} className={TH}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {productTypeRows.length > 0 ? (
                        productTypeRows.map((item, index) => (
                          <tr
                            key={`${item.productType}-${index}`}
                            className="hover:bg-gray-50"
                          >
                            <td className={TD}>{item.productType}</td>
                            <td className={TD}>{item.count}</td>
                            <td className={TD}>{item.safe}</td>
                            <td className={TD}>{item.moderate}</td>
                            <td className={TD}>{item.contaminated}</td>
                            <td className={TD}>{item.pending}</td>
                            <td className={TD}>{item.unverified}</td>
                            <td className={TD}>
                              <RateBadge rate={item.contaminationRate} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={TD} colSpan={8}>
                            No product type breakdown available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
                <SectionLabel>Trend analysis</SectionLabel>

                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[300px] border-collapse text-xs">
                    <thead>
                      <tr>
                        {["Period", "Samples", "Rate"].map((h) => (
                          <th key={h} className={TH}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trendRows.length > 0 ? (
                        trendRows.map((item, index) => (
                          <tr
                            key={`${item.period}-${index}`}
                            className="hover:bg-gray-50"
                          >
                            <td className={TD}>{item.period}</td>
                            <td className={TD}>{item.count}</td>
                            <td className={TD}>
                              <RateBadge rate={item.contaminationRate} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={TD} colSpan={3}>
                            No trend analysis available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-4 sm:px-5 py-4">
                <SectionLabel>Top contaminated samples</SectionLabel>

                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[480px] border-collapse text-xs">
                    <thead>
                      <tr>
                        {[
                          "Sample",
                          "State",
                          "Heavy Metal",
                          "Reading",
                          "Status",
                        ].map((h) => (
                          <th key={h} className={TH}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topContaminated.length > 0 ? (
                        topContaminated.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className={TD}>
                              {item.sampleId ||
                                item.sampleCode ||
                                item.sampleName ||
                                "-"}
                            </td>
                            <td className={TD}>{item.state || "-"}</td>
                            <td className={TD}>{item.heavyMetal || "-"}</td>
                            <td className={TD}>{item.reading ?? "-"}</td>
                            <td className={TD}>{item.status || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={TD} colSpan={5}>
                            No top contaminated samples available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ContaminationAnalysisReport;