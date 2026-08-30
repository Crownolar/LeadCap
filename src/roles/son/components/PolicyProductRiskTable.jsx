import React from "react";
import { Package, ArrowUpRight } from "lucide-react";
const risk = {
  High: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  Low: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
};
const PolicyProductRiskTable = ({ theme, rows = [] }) => (
  <section
    className={`${theme.card} ${theme.border} border rounded-2xl shadow-sm overflow-hidden`}
  >
    <div className="p-5 border-b ${theme.border}">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-emerald-600" />
        <div>
          <p className="text-sm font-bold">Product risk profile</p>
          <p className={`text-xs ${theme.textMuted}`}>
            Product groups carrying the highest contamination burden
          </p>
        </div>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px]">
        <thead className={theme.bg}>
          <tr>
            {[
              "Product type",
              "Samples",
              "Contaminated",
              "Risk",
              "Recommendation",
            ].map((h) => (
              <th
                key={h}
                className={`px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold ${theme.textMuted}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r, i) => (
              <tr
                key={`${r.productType || "unknown"}-${i}`}
                className={`border-t ${theme.border}`}
              >
                <td className="px-5 py-4 text-sm font-semibold">
                  {r.productType || "-"}
                </td>
                <td className={`px-5 py-4 text-sm ${theme.textMuted}`}>
                  {r.samples ?? 0}
                </td>
                <td className="px-5 py-4 text-sm font-bold text-red-600">
                  {r.contaminated ?? 0}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${risk[r.riskLevel] || "bg-gray-100 text-gray-700"}`}
                  >
                    {r.riskLevel || "Unknown"}
                  </span>
                </td>
                <td className={`px-5 py-4 text-xs ${theme.textMuted}`}>
                  {r.recommendation || "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className={`px-5 py-10 text-center text-sm ${theme.textMuted}`}
              >
                No product risk data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
);
export default PolicyProductRiskTable;
