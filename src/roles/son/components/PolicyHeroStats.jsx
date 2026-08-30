import React from "react";
import { AlertTriangle, CheckCircle, Clock, MapPinned } from "lucide-react";
const cards = [
  {
    key: "total",
    label: "Samples reviewed",
    sub: "Across selected filters",
    Icon: CheckCircle,
  },
  {
    key: "rate",
    label: "Contamination rate",
    sub: "Requires close attention",
    Icon: AlertTriangle,
  },
  {
    key: "states",
    label: "High-risk states",
    sub: "Above intervention threshold",
    Icon: MapPinned,
  },
  {
    key: "pending",
    label: "Action needed",
    sub: "Pending review or verification",
    Icon: Clock,
  },
];
const PolicyHeroStats = ({
  theme,
  total,
  contaminationRateText,
  highRiskStates,
  pending,
}) => {
  const vals = {
    total,
    rate: contaminationRateText,
    states: highRiskStates,
    pending,
  };
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {cards.map(({ key, label, sub, Icon }) => (
        <div
          key={key}
          className={`${theme.card} ${theme.border} border rounded-2xl p-4 sm:p-5 shadow-sm`}
        >
          <div className="flex items-start justify-between">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <Icon className="h-4 w-4 text-emerald-600" />
            </div>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider ${theme.textMuted}`}
            >
              Live
            </span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-black">{vals[key]}</p>
          <p className="mt-1 text-sm font-semibold">{label}</p>
          <p className={`mt-1 text-xs ${theme.textMuted}`}>{sub}</p>
        </div>
      ))}
    </div>
  );
};
export default PolicyHeroStats;
