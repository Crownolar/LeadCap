import { useTheme } from "../../../../../../context/ThemeContext";

const SummaryCards = ({
  items = [],
  columns = "grid-cols-2 xl:grid-cols-3",
}) => {
  const {theme} = useTheme();
  if (!items.length) return null;

  return (
    <div className={`grid ${columns} gap-3`}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl border ${theme.border} ${theme.card} p-3`}
        >
          <div className={`mb-1 text-xs font-medium uppercase tracking-widest ${theme.textMuted}`}>
            {item.label}
          </div>
          <div
            className={`text-xl font-medium ${item.color || "text-gray-900"}`}
          >
            {item.value}
          </div>
          {item.subtext ? (
            <div className={`mt-1 text-xs ${theme.textMuted}`}>{item.subtext}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
