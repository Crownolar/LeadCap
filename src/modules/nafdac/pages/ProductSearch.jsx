import { Table } from "lucide-react";
import Badge from "../components/Badge";
import Btn from "../components/Btn";
import PageHeader from "../components/PageHeader";
import { mockProducts } from "../data/mockData";
import { useState } from "react";
import { icons } from "../utils/icons";
import Icon from "../components/icons/Icon";

const ProductSearch = () => {

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const filtered = mockProducts.filter(p =>
    (filter === "ALL" || p.status === filter) &&
    (p.productName.toLowerCase().includes(query.toLowerCase()) ||
      p.nafdacNumber.toLowerCase().includes(query.toLowerCase()) ||
      p.brandName.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Product Registry Search"
        subtitle="Search and verify registered products. Used for investigation, legal checks, and cross-agency confirmation."
      />

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Icon d={icons.search} size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by NAFDAC number, product name, or brand..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        {["ALL", "APPROVED", "SUSPENDED"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all ${filter === s ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-500 hover:border-emerald-300 bg-white"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50">
          <p className="text-xs text-slate-400">{filtered.length} results found</p>
        </div>
        <Table
          headers={["NAFDAC No.", "Product Name", "Brand", "Manufacturer", "Category", "Status", ""]}
          rows={filtered.map(p => [
            <code className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{p.nafdacNumber}</code>,
            <span className="font-medium text-slate-700">{p.productName}</span>,
            p.brandName,
            p.manufacturer,
            p.category,
            <Badge status={p.status} />,
            <Btn variant="ghost" icon="eye" small>View</Btn>,
          ])}
        />
      </div>
    </div>
  );
};

export default ProductSearch;