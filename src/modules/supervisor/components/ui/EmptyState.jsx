import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

const EmptyState = ({ title, description, icon, minHeight = "min-h-[240px]" }) => {
  const { theme } = useTheme();
  return (
    <div className={`text-center ${minHeight} flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed ${theme.border}`}>
      {icon && <div className="mb-2 opacity-70">{icon}</div>}
      <p className={`text-sm font-semibold ${theme.text}`}>{title}</p>
      {description && <p className={`text-xs ${theme.textMuted}`}>{description}</p>}
    </div>
  );
};
export default EmptyState;