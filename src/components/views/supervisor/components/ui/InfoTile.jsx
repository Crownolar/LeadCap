import React from "react";
import { useTheme } from "../../../../../context/ThemeContext";

const InfoTile = ({ icon, label, children }) => {
    const { theme } = useTheme();
    
  return (
    <div className={`rounded-2xl border ${theme.border} ${theme.bg} p-4 shadow-sm`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
};

export default InfoTile;