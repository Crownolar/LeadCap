import { useTheme } from "../../context/ThemeContext";

const StatCard = ({ title, label, value, subtitle, icon, onClick, theme }) => {
  const { theme: appTheme } = useTheme();
  const content = (
    <div className='flex items-start justify-between gap-4'>
      <div>
        <p
          className={`text-sm font-medium ${theme.textMuted || appTheme.textMuted}`}
        >
          {title || label}
        </p>
        <p className='text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1'>
          {value}
        </p>
        {subtitle && (
          <p
            className={`text-xs mt-2 ${theme.textMuted || appTheme.textMuted}`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {icon && (
        <div className='h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300'>
          {icon}
        </div>
      )}
    </div>
  );
  const base = `${theme.card || appTheme.card} ${theme.border || appTheme.textMuted} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200`;
  if (onClick)
    return (
      <button onClick={onClick} className={`${base} text-left`}>
        {content}
      </button>
    );
  return <div className={base}>{content}</div>;
};
export default StatCard;
