import { SectionLabel } from "../../../../components/SectionLabel";

const ReportListSection = ({
  title,
  subtitle,
  actions,
  items = [],
  renderItem,
  emptyMessage = "No data available.",
  className = "",
}) => {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <SectionLabel>{title}</SectionLabel>
          {subtitle ? (
            <div className="mt-0.5 text-xs text-gray-400">{subtitle}</div>
          ) : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>

      <div className="mt-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={index}
              className="border-b border-gray-50 py-1.5 last:border-0"
            >
              {renderItem(item, index)}
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-500">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
};

export default ReportListSection;