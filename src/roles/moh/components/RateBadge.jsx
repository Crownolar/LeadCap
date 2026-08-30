export function RateBadge({ rate }) {
  const val = parseFloat(rate);
  const cls =
    val > 15
      ? "bg-red-50 text-red-800 border border-red-200"
      : val > 10
      ? "bg-amber-50 text-amber-800 border border-yellow-200"
      : "bg-green-50 text-green-700 border border-green-200";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {rate}
    </span>
  );
}