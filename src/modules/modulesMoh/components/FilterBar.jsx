export function FilterBar({ children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 flex-wrap">
      {children}
    </div>
  );
}