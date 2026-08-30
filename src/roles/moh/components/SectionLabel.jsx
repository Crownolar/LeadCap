import { useTheme } from "../../../context/ThemeContext";

export const SectionLabel = ({ children }) => {
  const { theme } = useTheme();

  return (
    <h3 className={`text-xs font-medium mb-3 uppercase tracking-wide ${theme.text}`}>
      {children}
    </h3>
  );
};