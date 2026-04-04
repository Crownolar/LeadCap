import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const themes = {
  light: {
    bg: "bg-gray-50",
    card: "bg-white",
    text: "text-gray-900",
    textMuted: "text-gray-500",
    border: "border-gray-200",
    hover: "hover:bg-gray-100",
    input: "bg-white border-gray-300 text-gray-900",

    safe: "bg-green-100 text-green-700",
    moderate: "bg-orange-100 text-orange-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-50 text-blue-700",

    emerald: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    emeraldText: "text-emerald-700",
    emeraldBorder: "border border-emerald-200 bg-emerald-50",
  },

  dark: {
    bg: "bg-gray-900",
    card: "bg-gray-800",
    text: "text-gray-100",
    textMuted: "text-gray-400",
    border: "border-gray-700",
    hover: "hover:bg-gray-700",
    input: "bg-gray-700 border-gray-600 text-gray-100",

    safe: "bg-green-900/30 text-green-300",
    moderate: "bg-orange-900/30 text-orange-300",
    danger: "bg-red-900/30 text-red-300",
    info: "bg-blue-900/30 text-blue-300",

    emerald: "border border-emerald-900/40 bg-emerald-900/20 text-emerald-300",
    emeraldText: "text-emerald-300",
    emeraldBorder: "border border-emerald-900/40 bg-emerald-900/20",
  },
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const theme = darkMode ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ theme, darkMode, toggleDarkMode }}>
      <div
        className={`${theme.bg} min-h-screen transition-colors duration-300`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
