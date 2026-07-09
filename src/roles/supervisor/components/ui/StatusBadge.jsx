import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

const StatusBadge = ({ children, type = "info", className = "" }) => {
  const { theme } = useTheme();
  const map = {
    safe: theme.safe,
    moderate: theme.moderate,
    danger: theme.danger,
    info: theme.info,
    neutral: theme.textMuted,
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${map[type] || map.info} ${className}`}>
      {children}
    </span>
  );
};
export default StatusBadge;