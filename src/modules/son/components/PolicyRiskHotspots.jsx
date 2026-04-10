import React from "react";

const badgeMap = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-orange-100 text-orange-700",
  Low: "bg-green-100 text-green-700",
};

const barMap = {
  High: "bg-red-500",
  Medium: "bg-orange-500",
  Low: "bg-green-500",
};

const PolicyRiskHotspots = ({ theme, hotspots = [] }) => {
  return (
    <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">High-Risk Hotspots</h3>
        <p className={`text-sm ${theme.textMuted}`}>States requiring closer policy attention</p>
      </div>

      <div className="space-y-3">
        {hotspots.length === 0 ? (
          <p className={`text-sm ${theme.textMuted}`}>No hotspot data available.</p>
        ) : (
          hotspots.map((item, index) => (
            <div key={item.state} className={`border ${theme.border} rounded-xl p-4`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-medium truncate">{item.state}</h4>
                    <p className={`text-sm ${theme.textMuted}`}>
                      {item.contaminated} contaminated out of {item.total} samples
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeMap[item.riskLevel]}`}>
                  {item.riskLevel}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className={theme.textMuted}>Contamination Rate</span>
                <span className="font-semibold">{item.contaminationRate.toFixed(1)}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${barMap[item.riskLevel]}`}
                  style={{ width: `${Math.min(item.contaminationRate, 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PolicyRiskHotspots;