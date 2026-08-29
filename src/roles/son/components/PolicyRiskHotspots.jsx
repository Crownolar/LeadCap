import React from "react";
import { MapPin, ArrowUpRight } from "lucide-react";
const badge = {
  High: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  Low: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
};
const bar = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-emerald-500",
};
const PolicyRiskHotspots = ({ theme, hotspots = [] }) => (
  <section
    className={`${theme.card} ${theme.border} border rounded-2xl p-5 shadow-sm`}
  >
    <div className="flex justify-between mb-4">
      <div>
        <p className="text-sm font-bold">Risk hotspots</p>
        <p className={`mt-1 text-xs ${theme.textMuted}`}>
          States requiring closer policy attention
        </p>
      </div>
      <MapPin className="h-4 w-4 text-emerald-600" />
    </div>
    <div className="space-y-2.5">
      {hotspots.length ? (
        hotspots.map((x, i) => (
          <div
            key={x.state}
            className={`${theme.bg} ${theme.border} border rounded-xl p-3.5`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{x.state}</p>
                  <p className={`text-[11px] ${theme.textMuted}`}>
                    {x.contaminated} contaminated / {x.total} samples
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-bold ${badge[x.riskLevel] || badge.Low}`}
              >
                {x.riskLevel}
              </span>
            </div>
            <div className="mt-3 flex justify-between text-[11px]">
              <span className={theme.textMuted}>Contamination rate</span>
              <b>{Number(x.contaminationRate || 0).toFixed(1)}%</b>
            </div>
            <div
              className={`mt-1.5 h-1.5 rounded-full overflow-hidden ${theme.border} border`}
            >
              <div
                className={`h-full rounded-full ${bar[x.riskLevel] || bar.Low}`}
                style={{
                  width: `${Math.min(Number(x.contaminationRate) || 0, 100)}%`,
                }}
              />
            </div>
          </div>
        ))
      ) : (
        <p className={`py-8 text-sm ${theme.textMuted}`}>
          No hotspot data available.
        </p>
      )}
    </div>
  </section>
);
export default PolicyRiskHotspots;
