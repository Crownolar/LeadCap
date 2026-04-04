import React from "react";
import { useTheme } from "../../../../../context/ThemeContext";

const StatusBadge = ({ children, type = "info" }) => {
  const { theme } = useTheme();

  const map = {
    safe: theme.safe,
    moderate: theme.moderate,
    danger: theme.danger,
    info: theme.info,
  };

  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full ${map[type]}`}
    >
      {children}
    </span>
  );
};

export default StatusBadge;