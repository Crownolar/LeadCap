import { useTheme } from "../../../context/ThemeContext";

export function FilterBar({ children }) {
  const theme = useTheme();
  return (
    <div className={` ${theme.bg} ${theme.border} rounded-xl px-4 py-3 mb-4 flex items-center gap-2 flex-wrap`}>
      {children}
    </div>
  );
}