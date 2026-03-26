const SummaryCards = ({
  items = [],
  columns = "grid-cols-2 xl:grid-cols-3",
}) => {
  if (!items.length) return null;

  return (
    <div className={`grid ${columns} gap-3`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-gray-200 bg-white p-3"
        >
          <div className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-500">
            {item.label}
          </div>
          <div
            className={`text-xl font-medium ${item.color || "text-gray-900"}`}
          >
            {item.value}
          </div>
          {item.subtext ? (
            <div className="mt-1 text-xs text-gray-400">{item.subtext}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
