export function Pagination({ page, setPage, totalPages }) {
  const pages = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(String(i));
  } else {
    pages.push("1", "2", "3", "…", String(totalPages));
  }

  return (
    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-1">
        <div
          className={`w-7 h-7 rounded flex items-center justify-center border cursor-pointer text-xs ${
            page === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-200 hover:bg-gray-100"
          }`}
          onClick={() => page > 1 && setPage(page - 1)}
        >
          ‹
        </div>

        {pages.map((p, i) => {
          if (p === "…") {
            return (
              <div key={i} className="w-7 h-7 flex items-center justify-center text-xs">
                …
              </div>
            );
          }

          const pageNum = Number(p);
          return (
            <div
              key={i}
              className={`w-7 h-7 rounded flex items-center justify-center border cursor-pointer text-xs ${
                pageNum === page
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white border-gray-200 hover:bg-gray-100"
              }`}
              onClick={() => setPage(pageNum)}
            >
              {p}
            </div>
          );
        })}

        <div
          className={`w-7 h-7 rounded flex items-center justify-center border cursor-pointer text-xs ${
            page === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-200 hover:bg-gray-100"
          }`}
          onClick={() => page < totalPages && setPage(page + 1)}
        >
          ›
        </div>
      </div>
    </div>
  );
}