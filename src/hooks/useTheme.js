import { useState } from "react";

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = { 
    bg: darkMode ? "bg-gray-900" : "bg-gray-50",
    card: darkMode ? "bg-gray-800" : "bg-white",
    text: darkMode ? "text-gray-100" : "text-gray-900",
    textMuted: darkMode ? "text-gray-400" : "text-gray-600",
    border: darkMode ? "border-gray-700" : "border-gray-200",
    input: darkMode
      ? "bg-gray-700 border-gray-600 text-gray-100"
      : "bg-white border-gray-300 text-gray-900",
    hover: darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100",
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return {
    darkMode,
    theme,
    toggleDarkMode,
  };
};
