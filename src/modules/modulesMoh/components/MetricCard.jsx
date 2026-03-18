export function MetricCard({ label, value, sub, color = "text-gray-900", clickable, onClick }) {
  return (
    <div
      className={`bg-white rounded-xl p-4 border border-gray-200 ${
        clickable ? "cursor-pointer hover:border-green-400 transition-colors" : ""
      }`}
      onClick={onClick}
    >
      <div className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">{label}</div>
      <div className={`text-2xl font-medium ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}