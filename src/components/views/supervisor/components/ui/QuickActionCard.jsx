import React from "react";
import { ChevronRight } from "lucide-react";
import { useTheme } from "../../../../../context/ThemeContext";

const QuickActionCard = ({ label, sub, icon, onClick }) => {
  const { theme } = useTheme();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${theme.card}
        border ${theme.border}
        rounded-2xl
        p-4
        text-left
        shadow-sm
        hover:shadow-md hover:-translate-y-[1px]
        transition-all duration-200
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.bg}`}>
              {icon}
            </div>
            <p className="text-sm font-semibold">{label}</p>
          </div>

          <p className={`text-xs ${theme.textMuted}`}>{sub}</p>
        </div>

        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
      </div>
    </button>
  );
};

export default QuickActionCard;