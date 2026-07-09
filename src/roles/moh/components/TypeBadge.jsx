export function TypeBadge({ type }) {
  const map = {
    "State summary":   "bg-blue-50 text-blue-700 border border-blue-200",
    "Risk assessment": "bg-red-50 text-red-700 border border-red-200",
    Contamination:     "bg-amber-50 text-amber-700 border border-yellow-200",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[type] || map["State summary"]}`}>
      {type}
    </span>
  );
}