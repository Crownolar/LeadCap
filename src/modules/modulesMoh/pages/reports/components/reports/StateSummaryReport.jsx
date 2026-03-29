import { useEffect, useMemo, useState } from "react";
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
import api from "../../../../../../utils/api";
import { useTheme } from "../../../../../../context/ThemeContext";

const STATES_CACHE_KEY = "moh_report_states_cache_v1";

const StateSummaryReport = () => {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);
  const [states, setStates] = useState([]);
  const {theme} = useTheme();

  const [filters, setFilters] = useState({
    state: "",
    dateFrom: "2026-01-01",
    dateTo: "2026-03-14",
  });

  const normalizeStates = (payload) => {
    const rows =
      Array.isArray(payload?.data) ? payload.data :
      Array.isArray(payload?.states) ? payload.states :
      Array.isArray(payload?.data?.states) ? payload.data.states :
      Array.isArray(payload?.items) ? payload.items :
      Array.isArray(payload) ? payload :
      [];

    return rows
      .map((state) => ({
        id: state?.id || state?.stateId || state?.value || "",
        name: state?.name || state?.stateName || state?.label || "",
        code: state?.code || "",
        isActive: state?.isActive,
      }))
      .filter((state) => state.id && state.name)
      .filter((state) => state.isActive !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const fetchStates = async () => {
    try {
      const cached = sessionStorage.getItem(STATES_CACHE_KEY);
      if (cached) {
        setStates(JSON.parse(cached));
        return;
      }

      setStatesLoading(true);

      const res = await api.get("/management/states", {
        params: {
          page: 1,
          pageSize: 100,
        },
      });

      const normalized = normalizeStates(res.data);
      setStates(normalized);
      sessionStorage.setItem(STATES_CACHE_KEY, JSON.stringify(normalized));
    } catch (err) {
      console.error("Failed to fetch report states:", err);
      setStates([]);
    } finally {
      setStatesLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

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
        err?.response?.data?.message ||
        err?.response?.data?.error ||
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

  const topLgas = useMemo(() => {
    return Object.entries(reportData?.byLGA || {})
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
  }, [reportData]);

  const handleExportExcel = () => {
    exportStateSummaryExcel({
      fileName: `state-summary-${summary.state || filters.state || "report"}-${
        summary?.dateRange?.from || filters.dateFrom
      }-${summary?.dateRange?.to || filters.dateTo}.xlsx`,
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
      fileName: `state-summary-${summary.state || filters.state || "report"}-${
        summary?.dateRange?.from || filters.dateFrom
      }-${summary?.dateRange?.to || filters.dateTo}.pdf`,
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
          disabled={statesLoading}
          className={`w-full sm:w-auto min-w-[220px] text-xs px-2 py-1.5 ${theme.border} ${theme.input} rounded-md outline-none focus:border-green-500 disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <option value="">
            {statesLoading ? "Loading states..." : "— Select state —"}
          </option>

          {states.map((state) => (
            <option key={state.id} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>

        <FilterSep />

        <label className={`text-xs ${theme.textMuted} whitespace-nowrap`}>From</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
          }
          className={`w-full sm:w-auto text-xs px-2 py-1.5 ${theme.border} ${theme.input} rounded-md outline-none focus:border-green-500`}
        />

        <label className={`text-xs ${theme.textMuted} whitespace-nowrap`}>To</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
          }
          className={`w-full sm:w-auto text-xs px-2 py-1.5 ${theme.border} ${theme.input} rounded-md outline-none focus:border-green-500`}
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
        <div className="mt-5 overflow-hidden rounded-xl border ${theme.border} w-full">
          <ReportHeader
            title="State summary"
            subtitle={`Generated: ${generatedAt || "—"} · ${
              summary.state || filters.state
            } · ${summary?.dateRange?.from || filters.dateFrom} to ${
              summary?.dateRange?.to || filters.dateTo
            }`}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
          />

          <div className={`${theme.bg}`}>
            <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
              <SectionLabel>Summary</SectionLabel>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>State</span>
                <span className={`font-medium ${theme.text}`}>
                  {summary.state || filters.state}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span cclassName={`${theme.textMuted}`}>Total samples</span>
                <span className={`font-medium ${theme.text}`}>
                  {summary.totalSamples ?? 0}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Safe</span>
                <span className="font-medium text-green-700">
                  {contaminationBreakdown.SAFE ?? 0}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Moderate</span>
                <span className="font-medium text-amber-600">
                  {contaminationBreakdown.MODERATE ?? 0}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Contaminated</span>
                <span className="font-medium text-red-600">
                  {contaminationBreakdown.CONTAMINATED ?? 0}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Pending</span>
                <span className="font-medium text-amber-600">
                  {contaminationBreakdown.PENDING ?? 0}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Contamination rate</span>
                <span className="font-medium text-red-600">
                  {summary.percentageContaminated ?? "0.00"}%
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Registered products</span>
                <span className={`font-medium ${theme.text}`}>
                  {registrationStatus.registered ?? 0}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Unregistered products</span>
                <span className={`font-medium ${theme.text}`}>
                  {registrationStatus.unregistered ?? 0}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Formal vendors</span>
                <span className={`font-medium ${theme.text}`}>
                  {vendorType.formal ?? 0}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Informal vendors</span>
                <span className={`font-medium ${theme.text}`}>
                  {vendorType.informal ?? 0}
                </span>
              </div>
            </div>

            <div className="border-b border-gray-100 px-4 sm:px-5 py-4">
              <SectionLabel>Verification breakdown</SectionLabel>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Verified original</span>
                <span className="font-medium text-green-700">
                  {verificationBreakdown.VERIFIED_ORIGINAL ?? 0}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Verified fake</span>
                <span className="font-medium text-red-600">
                  {verificationBreakdown.VERIFIED_FAKE ?? 0}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`${theme.textMuted}`}>Unverified</span>
                <span className="font-medium text-amber-600">
                  {verificationBreakdown.UNVERIFIED ?? 0}
                </span>
              </div>

              <div className={`flex justify-between border-b ${theme.border} py-1.5 text-sm`}>
                <span className={`text-gray-500`}>Verification pending</span>
                <span className="font-medium text-gray-900">
                  {verificationBreakdown.VERIFICATION_PENDING ?? 0}
                </span>
              </div>
            </div>

            <div className={`border-b ${theme.border} px-4 sm:px-5 py-4`}>
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
                          className={`${theme.hover}`}
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
              <div className={`text-sm leading-relaxed ${theme.textMuted}`}>
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