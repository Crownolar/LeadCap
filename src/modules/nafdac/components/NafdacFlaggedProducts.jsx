import React from "react";

const statusBadge = (status) => {
  const upper = String(status || "").toUpperCase();

  if (["VERIFIED_FAKE", "MISMATCH", "FLAGGED"].includes(upper)) {
    return "bg-red-100 text-red-700";
  }

  if (["VERIFICATION_PENDING", "UNVERIFIED", "PENDING"].includes(upper)) {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-blue-100 text-blue-700";
};

const NafdacFlaggedProducts = ({ theme, rows = [] }) => {
  return (
    <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Recent Flagged Products</h3>
        <p className={`text-sm ${theme.textMuted}`}>
          Latest records that may require verification or compliance review
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className={`border-b ${theme.border}`}>
              <th className="text-left py-3 pr-4 text-sm font-semibold">Product</th>
              <th className="text-left py-3 pr-4 text-sm font-semibold">Brand</th>
              <th className="text-left py-3 pr-4 text-sm font-semibold">State</th>
              <th className="text-left py-3 pr-4 text-sm font-semibold">Verification</th>
              <th className="text-left py-3 text-sm font-semibold">Contamination</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="5" className={`py-6 text-sm ${theme.textMuted}`}>
                  No flagged products found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className={`border-b ${theme.border}`}>
                  <td className="py-4 pr-4 text-sm font-medium">{row.productName}</td>
                  <td className={`py-4 pr-4 text-sm ${theme.textMuted}`}>{row.brandName}</td>
                  <td className="py-4 pr-4 text-sm">{row.state}</td>
                  <td className="py-4 pr-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm capitalize">{row.contaminationStatus}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NafdacFlaggedProducts;