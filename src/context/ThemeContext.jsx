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
  },
  dark: {
    bg: "bg-gray-900",
    card: "bg-gray-800",
    text: "text-gray-100",
    textMuted: "text-gray-400",
    border: "border-gray-700",
    hover: "hover:bg-gray-700",
    input: "bg-gray-700 border-gray-600 text-gray-100",
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
