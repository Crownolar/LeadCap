import React from "react";
import { useTheme } from "../../../../../context/ThemeContext";

const MetricTile = ({ icon, label, value, valueClass = "text-emerald-600 dark:text-emerald-400" }) => {
  const { theme } = useTheme();

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${theme.border} ${theme.bg}`}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>
          {label}
        </p>
      </div>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
};

export default MetricTile;