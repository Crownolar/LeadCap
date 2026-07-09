const riskBadgeMap = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-orange-100 text-orange-700",
  Low: "bg-green-100 text-green-700",
};

const PolicyProductRiskTable = ({ theme, rows = [] }) => {

  return (
    <div
      className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}
    >
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${theme.text}`}>
          Product Risk Summary
        </h3>
        <p className={`text-sm ${theme.textMuted}`}>
          Product groups with the highest contamination burden
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className={`border-b ${theme.border}`}>
              <th className={`text-left py-3 pr-4 text-sm font-semibold ${theme.text}`}>
                Product Type
              </th>
              <th className={`text-left py-3 pr-4 text-sm font-semibold ${theme.text}`}>
                Samples
              </th>
              <th className={`text-left py-3 pr-4 text-sm font-semibold ${theme.text}`}>
                Contaminated
              </th>
              <th className={`text-left py-3 pr-4 text-sm font-semibold ${theme.text}`}>
                Risk Level
              </th>
              <th className={`text-left py-3 text-sm font-semibold ${theme.text}`}>
                Recommendation
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className={`py-6 text-sm ${theme.textMuted}`}>
                  No product risk data available.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={`${row.productType || "unknown"}-${index}`}
                  className={`border-b ${theme.border} `}
                >
                  <td className={`py-4 pr-4 text-sm font-medium ${theme.text}`}>
                    {row.productType || "-"}
                  </td>
                  <td className={`py-4 pr-4 text-sm ${theme.text}`}>
                    {row.samples ?? 0}
                  </td>
                  <td className={`py-4 pr-4 text-sm ${theme.text}`}>
                    {row.contaminated ?? 0}
                  </td>
                  <td className="py-4 pr-4 text-sm">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        riskBadgeMap[row.riskLevel] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {row.riskLevel || "Unknown"}
                    </span>
                  </td>
                  <td className={`py-4 text-sm ${theme.textMuted}`}>
                    {row.recommendation || "-"}
                  </td>
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