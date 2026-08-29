import { useTheme } from "../../../context/ThemeContext";

export const WhiteCard = ({ children, className = "" }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};