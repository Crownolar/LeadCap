import React from "react";
import { useTheme } from "../../../../../context/ThemeContext";

const ActionButton = ({
  children,
  onClick,
  variant = "primary",
  disabled,
}) => {
  const { theme } = useTheme();
  const styles = {
    primary:
      `${theme.emerald} ${theme.emeraldText} ${theme.emeraldBorder}`,
    secondary:
      `${theme.bg} ${theme.text} ${theme.border} hover:bg-gray-50 dark:hover:bg-gray-600`,
    danger:
      "bg-red-600 hover:bg-red-700 text-white border-red-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2.5 rounded-xl border text-sm font-medium
        transition-all duration-200
        ${styles[variant]}
        disabled:opacity-50
      `}
    >
      {children}
    </button>
  );
};

export default ActionButton;