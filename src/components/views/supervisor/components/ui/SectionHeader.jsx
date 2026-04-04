import React from "react";
import { useTheme } from "../../../../../context/ThemeContext";

const SectionHeader = ({ title, subtitle, icon, badge, action }) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.emerald}`}>
            {icon}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-semibold tracking-tight ${theme.text}`}>
              {title}
            </h3>
            {badge}
          </div>

          {subtitle && (
            <p className={`text-sm ${theme.textMuted}`}>{subtitle}</p>
          )}
        </div>
      </div>

      {action && <div>{action}</div>}
    </div>
  );
};

export default SectionHeader;