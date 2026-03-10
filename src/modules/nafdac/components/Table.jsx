const Table = ({ headers, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100">
          {headers.map(h => (
            <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-widest py-3 px-4 first:pl-0">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors group">
            {row.map((cell, j) => (
              <td key={j} className="py-3.5 px-4 first:pl-0 text-slate-700">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;