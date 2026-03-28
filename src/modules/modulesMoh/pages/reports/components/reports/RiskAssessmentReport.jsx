import { useState } from "react";
import { FilterBar } from "../../../../components/FilterBar";
import { SectionLabel } from "../../../../components/SectionLabel";
import { FilterSep, BtnPrimary, TH, TD } from "../../../../utils/MohUI";
import { getRiskAssessmentReport } from "../../../../../../services/mohReportService";
import {
  exportRiskAssessmentExcel,
  exportRiskAssessmentPdf,
} from "../../../../utils/reportExport";
import ReportHeader from "./ReportHeader";

const RiskAssessmentReport = () => {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);
  const actionItems = reportData?.actionItems || [];

  const [filters, setFilters] = useState({
    minLeadLevel: "",
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

      const data = await getRiskAssessmentReport({
        minLeadLevel: filters.minLeadLevel || undefined,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });

      console.log("Risk assessment response:", data);

      setReportData(data?.data || data);
      setGenerated(true);
    } catch (err) {
      console.error("Failed to fetch risk assessment report:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to generate risk assessment report.";

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
  const topRiskAreas = reportData?.topRiskAreas || [];
  const criticalSamples = reportData?.criticalSamples || [];
  const unregisteredHighRisk = reportData?.unregisteredHighRisk || [];
  const counterfeitsHighRisk = reportData?.counterfeitsHighRisk || [];
  const riskByProductType = reportData?.riskByProductType || [];
  //   const actionItems = reportData?.actionItems || [];

  const hasAnyData =
    topRiskAreas.length > 0 ||
    criticalSamples.length > 0 ||
    unregisteredHighRisk.length > 0 ||
    counterfeitsHighRisk.length > 0 ||
    riskByProductType.length > 0 ||
    actionItems.length > 0;

  const handleExportExcel = () => {
    exportRiskAssessmentExcel({
      fileName: `risk-assessment-${filters.dateFrom}-${filters.dateTo}.xlsx`,
      generatedAt,
      minLeadLevel: filters.minLeadLevel,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      summary,
      topRiskAreas,
      criticalSamples,
      unregisteredHighRisk,
      counterfeitsHighRisk,
      riskByProductType,
      actionItems,
    });
  };

  const handleExportPdf = () => {
    exportRiskAssessmentPdf({
      fileName: `risk-assessment-${filters.dateFrom}-${filters.dateTo}.pdf`,
      generatedAt,
      minLeadLevel: filters.minLeadLevel,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      summary,
      topRiskAreas,
      criticalSamples,
      unregisteredHighRisk,
      counterfeitsHighRisk,
      riskByProductType,
      actionItems,
    });
  };

  return (
    <>
      <FilterBar>
        <label className="text-xs text-gray-500 whitespace-nowrap">
          Min lead level (ppm)
        </label>
        <input
          type="number"
          value={filters.minLeadLevel}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, minLeadLevel: e.target.value }))
          }
          placeholder="0.0"
          className="w-full sm:w-auto text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
          style={{ width: 100 }}
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
            title="Risk assessment"
            subtitle={`Generated: ${generatedAt || "—"} · Lead threshold: ${
              filters.minLeadLevel || "Not specified"
            } ppm · ${filters.dateFrom} to ${filters.dateTo}`}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
          />

          <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
            <SectionLabel>Summary</SectionLabel>

            <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
              <span className="text-gray-500">Total high-risk samples</span>
              <span className="font-medium text-red-600">
                {summary.totalHighRiskSamples ?? 0}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
              <span className="text-gray-500">Critical samples</span>
              <span className="font-medium text-red-600">
                {summary.criticalSamplesCount ?? 0}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
              <span className="text-gray-500">High-risk areas</span>
              <span className="font-medium text-amber-600">
                {summary.highRiskAreasCount ?? 0}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
              <span className="text-gray-500">Unregistered high-risk</span>
              <span className="font-medium text-gray-900">
                {summary.unregisteredHighRiskCount ?? 0}
              </span>
            </div>

            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-500">Counterfeits high-risk</span>
              <span className="font-medium text-gray-900">
                {summary.counterfeitsHighRiskCount ?? 0}
              </span>
            </div>
          </div>

          {!hasAnyData ? (
            <div className="px-4 sm:px-5 py-8 text-sm text-gray-500">
              No risk assessment data is available for the selected filters.
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
                <SectionLabel>Top risk areas</SectionLabel>
                <div className="overflow-x-auto w-full mt-3">
                  <table className="w-full min-w-[360px] border-collapse text-xs">
                    <thead>
                      <tr>
                        {["Area", "State", "Count", "Risk level"].map((h) => (
                          <th key={h} className={TH}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topRiskAreas.length > 0 ? (
                        topRiskAreas.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className={TD}>
                              {item.area ||
                                item.location ||
                                item.market ||
                                item.name ||
                                "-"}
                            </td>
                            <td className={TD}>
                              {item.state || item.stateName || "-"}
                            </td>
                            <td className={TD}>
                              {item.count ?? item.total ?? 0}
                            </td>
                            <td className={TD}>
                              {item.riskLevel || item.risk || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={TD} colSpan={4}>
                            No top risk areas available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
                <SectionLabel>Critical samples</SectionLabel>
                <div className="overflow-x-auto w-full mt-3">
                  <table className="w-full min-w-[360px] border-collapse text-xs">
                    <thead>
                      <tr>
                        {["Sample", "State", "Lead level", "Status"].map(
                          (h) => (
                            <th key={h} className={TH}>
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {criticalSamples.length > 0 ? (
                        criticalSamples.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className={TD}>
                              {item.sampleId ||
                                item.sampleCode ||
                                item.sampleName ||
                                "-"}
                            </td>
                            <td className={TD}>
                              {item.state || item.stateName || "-"}
                            </td>
                            <td className={TD}>
                              {item.leadLevel ?? item.reading ?? "-"}
                            </td>
                            <td className={TD}>
                              {item.status || item.riskLevel || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={TD} colSpan={4}>
                            No critical samples available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
                <SectionLabel>Unregistered high-risk products</SectionLabel>
                <div className="overflow-x-auto w-full mt-3">
                  <table className="w-full min-w-[360px] border-collapse text-xs">
                    <thead>
                      <tr>
                        {["Product", "Sample", "State", "Lead level"].map(
                          (h) => (
                            <th key={h} className={TH}>
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {unregisteredHighRisk.length > 0 ? (
                        unregisteredHighRisk.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className={TD}>
                              {item.productName ||
                                item.product ||
                                item.name ||
                                "-"}
                            </td>
                            <td className={TD}>
                              {item.sampleId || item.sampleCode || "-"}
                            </td>
                            <td className={TD}>
                              {item.state || item.stateName || "-"}
                            </td>
                            <td className={TD}>
                              {item.leadLevel ?? item.reading ?? "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={TD} colSpan={4}>
                            No unregistered high-risk products available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
                <SectionLabel>Counterfeit high-risk products</SectionLabel>
                <div className="overflow-x-auto w-full mt-3">
                  <table className="w-full min-w-[360px] border-collapse text-xs">
                    <thead>
                      <tr>
                        {["Product", "Sample", "State", "Lead level"].map(
                          (h) => (
                            <th key={h} className={TH}>
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {counterfeitsHighRisk.length > 0 ? (
                        counterfeitsHighRisk.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className={TD}>
                              {item.productName ||
                                item.product ||
                                item.name ||
                                "-"}
                            </td>
                            <td className={TD}>
                              {item.sampleId || item.sampleCode || "-"}
                            </td>
                            <td className={TD}>
                              {item.state || item.stateName || "-"}
                            </td>
                            <td className={TD}>
                              {item.leadLevel ?? item.reading ?? "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={TD} colSpan={4}>
                            No counterfeit high-risk products available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
                <SectionLabel>Risk by product type</SectionLabel>
                <div className="overflow-x-auto w-full mt-3">
                  <table className="w-full min-w-[280px] border-collapse text-xs">
                    <thead>
                      <tr>
                        {["Product Type", "Count", "Risk level"].map((h) => (
                          <th key={h} className={TH}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {riskByProductType.length > 0 ? (
                        riskByProductType.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className={TD}>
                              {item.productType ||
                                item.type ||
                                item.name ||
                                "-"}
                            </td>
                            <td className={TD}>
                              {item.count ?? item.total ?? 0}
                            </td>
                            <td className={TD}>
                              {item.riskLevel || item.risk || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className={TD} colSpan={3}>
                            No risk-by-product-type data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-4 sm:px-5 py-4">
                <SectionLabel>Action items</SectionLabel>
                <div className="text-sm leading-relaxed text-gray-500">
                  {actionItems.length > 0 ? (
                    actionItems.map((item, index) => (
                      <div key={index}>
                        {index + 1}.{" "}
                        {typeof item === "string"
                          ? item
                          : item.action || item.title || "Action item"}
                      </div>
                    ))
                  ) : (
                    <div>No action items available.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default RiskAssessmentReport;