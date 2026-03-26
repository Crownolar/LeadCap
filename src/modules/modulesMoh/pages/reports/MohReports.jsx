// import { useState } from "react";
// import StateSummaryReport from "../reports/components/reports/StateSummaryReport";
// import ContaminationAnalysisReport from "../reports/components/reports/ContaminationAnalysisReport";
// import ProductTypeReport from "../reports/components/reports/ProductTypeReport";
// import RiskAssessmentReport from "../reports/components/reports/RiskAssessmentReport";
// import SavedReports from "../reports/components/reports/SavedReports";

// const TABS = [
//   "State summary",
//   "Contamination analysis",
//   "Product type",
//   "Risk assessment",
// ];

// const Reports = () => {
//   const [activeTab, setActiveTab] = useState("State summary");

//   const renderActiveTab = () => {
//     switch (activeTab) {
//       case "State summary":
//         return <StateSummaryReport />;
//       case "Contamination analysis":
//         return <ContaminationAnalysisReport />;
//       case "Product type":
//         return <ProductTypeReport />;
//       case "Risk assessment":
//         return <RiskAssessmentReport />;
//       default:
//         return <StateSummaryReport />;
//     }
//   };

//   return (
//     <div>
//       {/* Tab bar */}
//       <div className="flex border-b-2 border-gray-200 mb-5">
//         {TABS.map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`px-5 py-2.5 text-sm font-medium cursor-pointer border-b-2 -mb-px bg-transparent ${
//               activeTab === tab
//                 ? "text-green-700 border-green-600"
//                 : "text-gray-500 border-transparent hover:text-green-600"
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {renderActiveTab()}

//       <SavedReports />
//     </div>
//   );
// };

// export default Reports;


import { useState } from "react";
import StateSummaryReport from "../reports/components/reports/StateSummaryReport";
import ContaminationAnalysisReport from "../reports/components/reports/ContaminationAnalysisReport";
import ProductTypeReport from "../reports/components/reports/ProductTypeReport";
import RiskAssessmentReport from "../reports/components/reports/RiskAssessmentReport";
import SavedReports from "../reports/components/reports/SavedReports";

const TABS = [
  "State summary",
  "Contamination analysis",
  "Product type",
  "Risk assessment",
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState("State summary");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "State summary":
        return <StateSummaryReport />;
      case "Contamination analysis":
        return <ContaminationAnalysisReport />;
      case "Product type":
        return <ProductTypeReport />;
      case "Risk assessment":
        return <RiskAssessmentReport />;
      default:
        return <StateSummaryReport />;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* Tab bar */}
      <div className="flex flex-wrap border-b-2 border-gray-200 mb-5 gap-y-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium cursor-pointer border-b-2 -mb-px bg-transparent whitespace-nowrap ${
              activeTab === tab
                ? "text-green-700 border-green-600"
                : "text-gray-500 border-transparent hover:text-green-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full overflow-x-auto">
        {renderActiveTab()}
      </div>

      <SavedReports />
    </div>
  );
};

export default Reports;