import React from "react";
import { useTheme } from "../../../../../context/ThemeContext";

const SurfaceCard = ({ children, className = "", padding = "p-6" }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`
        ${theme.card}
        ${theme.border} border
        rounded-2xl
        ${padding}
        shadow-sm hover:shadow-md
        transition-all duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default SurfaceCard;