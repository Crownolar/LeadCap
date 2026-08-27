const STATUS_META = {
  PASS: {
    label: "Pass",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  FAIL: {
    label: "Fail",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  NOT_TESTED: {
    label: "Not Tested",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  INCONCLUSIVE: {
    label: "Inconclusive",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

const HeavyMetalStatusBadge = ({ status = "PENDING", size = "sm" }) => {
  const meta = STATUS_META[status] || STATUS_META.PENDING;

  const sizeClass =
    size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${sizeClass} ${meta.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
};

export default HeavyMetalStatusBadge;