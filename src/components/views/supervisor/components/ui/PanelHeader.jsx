import React from "react";
import { useTheme } from "../../../../../context/ThemeContext";

const PanelHeader = ({ title }) => {
    const { theme } = useTheme();
    
  return (
    <div className={`flex items-center gap-2 pb-2 border-b ${theme.border}`}>
      <div className="w-1 h-5 rounded-full bg-emerald-500" />
      <h3 className={`text-sm font-semibold uppercase tracking-widest ${theme.text}`}>
        {title}
      </h3>
    </div>
  );
};

export default PanelHeader;