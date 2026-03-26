import { SectionLabel } from "../../../../components/SectionLabel";
import { TH, TD } from "../../../../utils/MohUI";

const ReportTableSection = ({
  title,
  subtitle,
  actions,
  headers = [],
  rows = [],
  renderRow,
  emptyMessage = "No data available.",
  className = "",
}) => {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${className}`}>
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
        <div>
          <SectionLabel>{title}</SectionLabel>
          {subtitle ? (
            <div className="mt-0.5 text-xs text-gray-400">{subtitle}</div>
          ) : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className={TH}>
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((row, index) => renderRow(row, index))
          ) : (
            <tr>
              <td className={TD} colSpan={headers.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTableSection;