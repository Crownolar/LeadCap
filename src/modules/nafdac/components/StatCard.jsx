import { useTheme } from "../../../context/ThemeContext";
import { icons } from "../utils/icons";

const Icon = ({ d, size = 20, className = "" }) => {
  if (!d) return null;

  
  return (
    <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      >
      <path d={d} />
    </svg>
  );
};

const StatCard = ({ label, value, sub, color = "emerald", icon }) => {
  const { theme } = useTheme()
  const iconPath = icons[icon] || icons.activity;
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  };

  const style = colors[color] || colors.emerald;

  return (
    <div className={`${theme.card} rounded-2xl border ${theme.border} shadow-sm p-5 flex items-start gap-4`}>
      <div
        className={`w-11 h-11 rounded-xl bg-${color}-50 flex items-center justify-center flex-shrink-0`}
      >
        <Icon d={iconPath} size={20} className={style} />
      </div>

      <div>
        <p className={`text-xs font-medium ${theme.textMuted} uppercase tracking-widest mb-0.5`}>
          {label}
        </p>

        <p className={`text-2xl font-bold ${theme.text} leading-none`}>
          {value}
        </p>

        {sub && <p className={`text-xs ${theme.textMuted} mt-1`}>{sub}</p>}
      </div>
    </div>
  );
};

export default StatCard;
