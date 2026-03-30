import { useEffect, useMemo, useState } from "react";
import { FilterBar } from "../../../../components/FilterBar";
import { SectionLabel } from "../../../../components/SectionLabel";
import { FilterSep, BtnPrimary, TH, TD } from "../../../../utils/MohUI";
import { getProductTypeReport } from "../../../../../../services/mohReportService";
import {
  exportProductTypeExcel,
  exportProductTypePdf,
} from "../../../../utils/reportExport";
import ReportHeader from "./ReportHeader";
import api from "../../../../../../utils/api";
import { useTheme } from "../../../../../../context/ThemeContext";

const STATES_CACHE_KEY = "moh_report_states_cache_v1";

const ProductTypeReport = () => {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);
  const [states, setStates] = useState([]);
  const { theme } = useTheme();

  const [filters, setFilters] = useState({
    state: "",
    dateFrom: "2026-03-13",
    dateTo: "2026-03-14",
  });

  const normalizeStates = (payload) => {
    const rows = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.states)
        ? payload.states
        : Array.isArray(payload?.data?.states)
          ? payload.data.states
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload)
              ? payload
              : [];

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
      console.error("Failed to fetch product type report states:", err);
      setStates([]);
    } finally {
      setStatesLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

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

      const data = await getProductTypeReport({
        state: filters.state,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });

      console.log("Product type report response:", data);

      setReportData(data?.data || data);
      setGenerated(true);
    } catch (err) {
      console.error("Failed to fetch product type report:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to generate product type report.";

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
  const recommendations = reportData?.recommendations || [];
  const byProductType = reportData?.byProductType || {};

  const rows = useMemo(() => {
    return Object.entries(byProductType)
      .map(([productType, stats]) => ({
        productType,
        totalSamples: stats?.totalSamples || 0,
        registered: stats?.registered || 0,
        unregistered: stats?.unregistered || 0,
        verifiedOriginal: stats?.verifications?.VERIFIED_ORIGINAL || 0,
        verifiedFake: stats?.verifications?.VERIFIED_FAKE || 0,
        unverified: stats?.verifications?.UNVERIFIED || 0,
        verificationPending: stats?.verifications?.VERIFICATION_PENDING || 0,
        local: stats?.origins?.LOCAL || 0,
        imported: stats?.origins?.IMPORTED || 0,
      }))
      .sort((a, b) => b.totalSamples - a.totalSamples);
  }, [byProductType]);

  const handleExportExcel = () => {
    exportProductTypeExcel({
      fileName: `product-type-report-${filters.state || "all-states"}-${filters.dateFrom}-${filters.dateTo}.xlsx`,
      generatedAt,
      state: filters.state,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      summary,
      rows,
      recommendations,
    });
  };

  const handleExportPdf = () => {
    exportProductTypePdf({
      fileName: `product-type-report-${filters.state || "all-states"}-${filters.dateFrom}-${filters.dateTo}.pdf`,
      generatedAt,
      state: filters.state,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      summary,
      rows,
      recommendations,
    });
  };

  console.log("product type recommendations:", recommendations);

  return (
    <>
      <FilterBar>
        <label className={`text-xs ${theme.textMuted}`}>State (optional)</label>
        <select
          value={filters.state}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, state: e.target.value }))
          }
          disabled={statesLoading}
          className={`w-full sm:w-auto min-w-[220px] text-xs px-2 py-1.5 border ${theme.border} ${theme.input}  rounded-md outline-none focus:border-green-500 disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <option value="">
            {statesLoading ? "Loading states..." : "All States"}
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
          className={`w-full sm:w-auto text-xs px-2 py-1.5 border ${theme.border} ${theme.input} rounded-md outline-none focus:border-green-500`}
        />

        <label className={`text-xs ${theme.textMuted} whitespace-nowrap`}>To</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
          }
          className={`w-full sm:w-auto text-xs px-2 py-1.5 border ${theme.border} ${theme.input}  rounded-md outline-none focus:border-green-500`}
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
        <div className={`mt-5 overflow-hidden rounded-xl border ${theme.border} ${theme.bg} w-full`}>
          <ReportHeader
            title="Product type report"
            subtitle={`Generated: ${generatedAt || "—"} · ${
              filters.state || "All States"
            } · ${filters.dateFrom} to ${filters.dateTo}`}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
          />

          <div className={`border-b ${theme.border} px-4 sm:px-5 py-4`}>
            <SectionLabel>Summary</SectionLabel>

            <div className="flex justify-between border-b border-gray-50 py-1.5 text-sm">
              <span className={`text-${theme.textMuted}`}>Total product types</span>
              <span className={`font-medium ${theme.text}`}>
                {summary.totalProductTypes ?? 0}
              </span>
            </div>

            <div className="flex justify-between py-1.5 text-sm">
              <span className={`text-${theme.textMuted}`}>Total samples</span>
              <span className={`font-medium ${theme.text}`}>
                {summary.totalSamples ?? 0}
              </span>
            </div>
          </div>

          <div className="px-4 sm:px-5 py-4">
            <SectionLabel>Breakdown by product type</SectionLabel>

            <div className="overflow-x-auto w-full mt-3">
              <table className="w-full min-w-[720px] border-collapse text-xs">
                <thead>
                  <tr>
                    {[
                      "Product Type",
                      "Samples",
                      "Registered",
                      "Unregistered",
                      "Verified Original",
                      "Verified Fake",
                      "Unverified",
                      "Local",
                      "Imported",
                    ].map((h) => (
                      <th key={h} className={TH}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length > 0 ? (
                    rows.map((item, index) => (
                      <tr
                        key={`${item.productType}-${index}`}
                        className={`hover:bg-${theme.hover}`}
                      >
                        <td className={TD}>{item.productType}</td>
                        <td className={TD}>{item.totalSamples}</td>
                        <td className={TD}>{item.registered}</td>
                        <td className={TD}>{item.unregistered}</td>
                        <td className={TD}>{item.verifiedOriginal}</td>
                        <td className={TD}>{item.verifiedFake}</td>
                        <td className={TD}>{item.unverified}</td>
                        <td className={TD}>{item.local}</td>
                        <td className={TD}>{item.imported}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className={TD} colSpan={9}>
                        No product type data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-gray-100 px-4 sm:px-5 py-4">
            <SectionLabel>Recommendations</SectionLabel>

            <div className={`text-sm leading-relaxed ${theme.textMuted} space-y-3`}>
              {recommendations.length > 0 ? (
                recommendations.map((item, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border ${theme.border} ${theme.bg} px-3 py-3`}
                  >
                    <div className="font-medium text-gray-900">
                      {index + 1}. {item.productType || "Recommendation"}
                    </div>

                    {item.priority && (
                      <div className="mt-1 text-xs font-medium text-red-600">
                        Priority: {item.priority}
                      </div>
                    )}

                    {item.findings && (
                      <div className="mt-2">
                        <span className={`font-medium ${theme.text}`}>
                          Findings:
                        </span>{" "}
                        <span>{item.findings}</span>
                      </div>
                    )}

                    {item.recommendation && (
                      <div className="mt-1">
                        <span className={`font-medium ${theme.text}`}>
                          Recommendation:
                        </span>{" "}
                        <span>{item.recommendation}</span>
                      </div>
                    )}

                    {item.action && (
                      <div className="mt-1">
                        <span className={`font-medium ${theme.text}`}>
                          Action:
                        </span>{" "}
                        <span>{item.action}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div>No recommendations available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductTypeReport;
