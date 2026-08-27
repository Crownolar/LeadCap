import { useTheme } from "../../../context/ThemeContext";

export const MetricCard = ({
  label,
  value,
  sub,
  color,
  clickable = false,
  onClick,
}) => {
  const { theme } = useTheme();

  return (
    <div
      onClick={onClick}
      className={`
        ${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm
        ${clickable ? `cursor-pointer ${theme.hover}` : ""}
        transition
      `}
    >
      <p className={`text-xs ${theme.textMuted} mb-1`}>{label}</p>
      <h2 className={`text-2xl font-bold ${color || theme.text}`}>{value}</h2>
      <p className={`text-xs mt-1 ${theme.textMuted}`}>{sub}</p>
    </div>
  );
};