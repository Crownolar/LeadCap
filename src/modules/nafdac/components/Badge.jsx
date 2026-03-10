export default function Badge({ status }) {
  const map = {
    APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    VERIFIED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    MATCH: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    ACTIVE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    SUSPENDED: "bg-amber-50 text-amber-700 border border-amber-200",
    PENDING: "bg-sky-50 text-sky-700 border border-sky-200",
    FAILED: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}