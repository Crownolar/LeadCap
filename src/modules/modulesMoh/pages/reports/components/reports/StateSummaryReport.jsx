import { useState } from "react";
import { FilterBar } from "../../../../components/FilterBar";
import { SectionLabel } from "../../../../components/SectionLabel";
import { RateBadge } from "../../../../components/RateBadge";
import { FilterSep, BtnPrimary, TH, TD } from "../../../../utils/MohUI";
import { getStateSummaryReport } from "../../../../../../services/mohReportService";
import {
  exportStateSummaryExcel,
  exportStateSummaryPdf,
} from "../../../../utils/reportExport";
import ReportHeader from "./ReportHeader";

const StateSummaryReport = () => {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);

  const [filters, setFilters] = useState({
    state: "",
    dateFrom: "2026-03-13",
    dateTo: "2026-03-14",
  });

  const handleGenerateReport = async () => {
    if (!filters.state) {
      setError("Please select a state.");
      setGenerated(false);
      return;
    }

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

      const data = await getStateSummaryReport(filters);
      setReportData(data?.data || data);
      setGenerated(true);
    } catch (err) {
      console.error("Failed to fetch state summary report:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to generate state summary report.";

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
  const contaminationBreakdown = summary?.contaminationBreakdown || {};
  const verificationBreakdown = summary?.verificationBreakdown || {};
  const recommendations = reportData?.recommendations || [];
  const registrationStatus = reportData?.registrationStatus || {};
  const vendorType = reportData?.vendorType || {};

  const topLgas = Object.entries(reportData?.byLGA || {})
    .map(([lgaName, stats]) => {
      const contaminated = stats?.contaminated || 0;
      const total = stats?.total || 0;
      const rate =
        total > 0 ? `${((contaminated / total) * 100).toFixed(1)}%` : "0%";

      return {
        lgaName,
        samples: total,
        contaminated,
        pending: stats?.pending || 0,
        safe: stats?.safe || 0,
        moderate: stats?.moderate || 0,
        rate,
      };
    })
    .sort((a, b) => b.samples - a.samples);

  const handleExportExcel = () => {
    exportStateSummaryExcel({
      fileName: `state-summary-${summary.state || filters.state || "report"}-${summary?.dateRange?.from || filters.dateFrom}-${summary?.dateRange?.to || filters.dateTo}.xlsx`,
      generatedAt,
      state: summary.state || filters.state,
      dateFrom: summary?.dateRange?.from || filters.dateFrom,
      dateTo: summary?.dateRange?.to || filters.dateTo,
      summary,
      contaminationBreakdown,
      registrationStatus,
      vendorType,
      verificationBreakdown,
      topLgas,
      recommendations,
    });
  };

  const handleExportPdf = () => {
    exportStateSummaryPdf({
      fileName: `state-summary-${summary.state || filters.state || "report"}-${summary?.dateRange?.from || filters.dateFrom}-${summary?.dateRange?.to || filters.dateTo}.pdf`,
      generatedAt,
      state: summary.state || filters.state,
      dateFrom: summary?.dateRange?.from || filters.dateFrom,
      dateTo: summary?.dateRange?.to || filters.dateTo,
      summary,
      contaminationBreakdown,
      registrationStatus,
      vendorType,
      verificationBreakdown,
      topLgas,
      recommendations,
    });
  };

  return (
    <>
      <FilterBar>
        <label className="text-xs text-gray-500">State (required)</label>
        <select
          value={filters.state}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, state: e.target.value }))
          }
          className="w-full sm:w-auto text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500"
        >
          <option value="">— Select state —</option>
          <option value="Lagos">Lagos</option>
          <option value="Kano">Kano</option>
          <option value="Oyo">Oyo</option>
          <option value="Abuja">Abuja</option>
        </select>

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
        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 w-full">
          <ReportHeader
            title="State summary"
            subtitle={`Generated: ${generatedAt || "—"} · ${summary.state || filters.state} · ${
              summary?.dateRange?.from || filters.dateFrom
            } to ${summary?.dateRange?.to || filters.dateTo}`}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
          />

          <div className="bg-white">
            <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
              <SectionLabel>Summary</SectionLabel>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">State</span>
                <span className="font-medium text-gray-900">
                  {summary.state || filters.state}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Total samples</span>
                <span className="font-medium text-gray-900">
                  {summary.totalSamples ?? 0}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Safe</span>
                <span className="font-medium text-green-700">
                  {contaminationBreakdown.SAFE ?? 0}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Moderate</span>
                <span className="font-medium text-amber-600">
                  {contaminationBreakdown.MODERATE ?? 0}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Contaminated</span>
                <span className="font-medium text-red-600">
                  {contaminationBreakdown.CONTAMINATED ?? 0}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium text-amber-600">
                  {contaminationBreakdown.PENDING ?? 0}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Contamination rate</span>
                <span className="font-medium text-red-600">
                  {summary.percentageContaminated ?? "0.00"}%
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Registered products</span>
                <span className="font-medium text-gray-900">
                  {registrationStatus.registered ?? 0}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Unregistered products</span>
                <span className="font-medium text-gray-900">
                  {registrationStatus.unregistered ?? 0}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Formal vendors</span>
                <span className="font-medium text-gray-900">
                  {vendorType.formal ?? 0}
                </span>
              </div>

              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-gray-500">Informal vendors</span>
                <span className="font-medium text-gray-900">
                  {vendorType.informal ?? 0}
                </span>
              </div>
            </div>

            <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
              <SectionLabel>Verification breakdown</SectionLabel>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Verified original</span>
                <span className="font-medium text-green-700">
                  {verificationBreakdown.VERIFIED_ORIGINAL ?? 0}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Verified fake</span>
                <span className="font-medium text-red-600">
                  {verificationBreakdown.VERIFIED_FAKE ?? 0}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
                <span className="text-gray-500">Unverified</span>
                <span className="font-medium text-amber-600">
                  {verificationBreakdown.UNVERIFIED ?? 0}
                </span>
              </div>

              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-gray-500">Verification pending</span>
                <span className="font-medium text-gray-900">
                  {verificationBreakdown.VERIFICATION_PENDING ?? 0}
                </span>
              </div>
            </div>

            <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
              <SectionLabel>Top LGAs by activity</SectionLabel>

              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[360px] border-collapse text-xs">
                  <thead>
                    <tr>
                      {["LGA", "Samples", "Contaminated", "Rate"].map((h) => (
                        <th key={h} className={TH}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topLgas.length > 0 ? (
                      topLgas.map((item, index) => (
                        <tr
                          key={item.lgaName || index}
                          className="hover:bg-gray-50"
                        >
                          <td className={TD}>{item.lgaName}</td>
                          <td className={TD}>{item.samples}</td>
                          <td className={TD}>{item.contaminated}</td>
                          <td className={TD}>
                            <RateBadge rate={item.rate} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className={TD} colSpan={4}>
                          No LGA data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-4 sm:px-5 py-4">
              <SectionLabel>Recommendations</SectionLabel>
              <div className="text-sm leading-relaxed text-gray-500">
                {recommendations.length > 0 ? (
                  recommendations.map((item, index) => (
                    <div key={index}>
                      {index + 1}. {item}
                    </div>
                  ))
                ) : (
                  <div>No recommendations available.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StateSummaryReport;