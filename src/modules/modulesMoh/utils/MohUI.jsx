export function FilterSep() {
  return <div className="w-px h-6 bg-gray-200" />;
}

export function BtnPrimary({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-green-700 hover:bg-green-800 text-white px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap border-0"
    >
      {children}
    </button>
  );
}

export function BtnGhost({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white text-gray-500 border border-gray-200 hover:border-green-400 hover:text-green-700 px-3 py-1.5 rounded-md text-xs cursor-pointer"
    >
      {children}
    </button>
  );
}

export const TH =
  "bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200 whitespace-nowrap";
export const TD =
  "px-3 py-2.5 border-b border-gray-100 text-gray-900 whitespace-nowrap";
