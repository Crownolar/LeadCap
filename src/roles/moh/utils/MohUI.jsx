import { useTheme } from "../../../context/ThemeContext";

export function FilterSep() {
  const { theme } = useTheme();
  return <div className={`w-px h-6 ${theme.bg}`} />;
}

export function BtnPrimary({ children, onClick, disabled = false }) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-1.5 rounded-md text-xs font-medium whitespace-nowrap border-0 ${
        disabled
          ? `bg-green-400 ${theme.textMuted} cursor-not-allowed`
          : `bg-green-700 hover:bg-green-800 ${theme.text} cursor-pointer`
      }`}
    >
      {children}
    </button>
  );
}

export function BtnGhost({ children, onClick }) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`${theme.bg} ${theme.textMuted} ${theme.border} border hover:border-green-400 hover:text-green-700 px-3 py-1.5 rounded-md text-xs cursor-pointer ${theme.hover}`}
    >
      {children}
    </button>
  );
}

export const TH =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b border-gray-200";

export const TD =
  "px-4 py-3 border-b border-gray-100 text-gray-400";