import React from "react";

const riskBadgeMap = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-orange-100 text-orange-700",
  Low: "bg-green-100 text-green-700",
};

const PolicyProductRiskTable = ({ theme, rows = [] }) => {
  return (
    <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Product Risk Summary</h3>
        <p className={`text-sm ${theme.textMuted}`}>
          Product groups with the highest contamination burden
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className={`border-b ${theme.border}`}>
              <th className="text-left py-3 pr-4 text-sm font-semibold">Product Type</th>
              <th className="text-left py-3 pr-4 text-sm font-semibold">Samples</th>
              <th className="text-left py-3 pr-4 text-sm font-semibold">Contaminated</th>
              <th className="text-left py-3 pr-4 text-sm font-semibold">Risk Level</th>
              <th className="text-left py-3 text-sm font-semibold">Recommendation</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="5" className={`py-6 text-sm ${theme.textMuted}`}>
                  No product risk data available.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.productType} className={`border-b ${theme.border}`}>
                  <td className="py-4 pr-4 text-sm font-medium">{row.productType}</td>
                  <td className="py-4 pr-4 text-sm">{row.samples}</td>
                  <td className="py-4 pr-4 text-sm">{row.contaminated}</td>
                  <td className="py-4 pr-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${riskBadgeMap[row.riskLevel]}`}>
                      {row.riskLevel}
                    </span>
                  </td>
                  <td className={`py-4 text-sm ${theme.textMuted}`}>{row.recommendation}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PolicyProductRiskTable;