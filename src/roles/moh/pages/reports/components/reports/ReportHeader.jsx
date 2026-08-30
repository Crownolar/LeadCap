const ReportHeader = ({
  title,
  subtitle,
  onExportPdf,
  onExportExcel,
  extraActions,
}) => {
  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4"
      style={{ background: "#065f46" }}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-white">{title}</div>
        {subtitle && (
          <div className="mt-1 text-xs text-green-200 break-words">{subtitle}</div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center sm:shrink-0">
        {extraActions}

        {onExportPdf && (
          <button
            type="button"
            onClick={onExportPdf}
            className="text-xs px-3 py-1.5 rounded-md cursor-pointer text-white border border-white/30 bg-white/10"
          >
            Export PDF
          </button>
        )}

        {onExportExcel && (
          <button
            type="button"
            onClick={onExportExcel}
            className="text-xs px-3 py-1.5 rounded-md cursor-pointer text-white border border-white/30 bg-white/10"
          >
            Export Excel
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportHeader;