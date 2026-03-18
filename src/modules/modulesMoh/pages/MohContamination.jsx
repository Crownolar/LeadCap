import { useEffect, useRef } from "react";
import { BtnPrimary, TH, TD } from "../utils/MohUI";
import { FilterBar } from "../components/FilterBar";
import { WhiteCard } from "../components/WhiteCard";
import { SectionLabel } from "../components/SectionLabel";
import { RateBadge } from "../components/RateBadge";

const LGA_ROWS  = [["Alimosho","1,204","212","17.6%"],["Oshodi-Isolo","987","145","14.7%"],["Ikeja","843","98","11.6%"],["Agege","721","67","9.3%"]];
const PROD_ROWS = [["Antibiotics","2,100","489","23.3%"],["Analgesics","1,800","310","17.2%"],["Supplements","1,420","201","14.2%"],["Gastro","890","89","10.0%"]];
const HIGH_RISK = [
  { label: "Lagos — SMX-00398",  value: "Lead: 4.2 ppm", color: "text-red-600"   },
  { label: "Kano — SMX-00412",   value: "Lead: 3.8 ppm", color: "text-red-600"   },
  { label: "Rivers — SMX-00387", value: "Lead: 2.1 ppm", color: "text-amber-600" },
  { label: "Oyo — SMX-00365",    value: "Lead: 1.9 ppm", color: "text-amber-600" },
];

const SUMMARY_CARDS = [
  { label: "Total samples", value: "8,210",  color: "text-gray-900"  },
  { label: "Contaminated",  value: "1,430",  color: "text-red-600"   },
  { label: "High risk",     value: "342",    color: "text-amber-600" },
];

const Contamination = () => {
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  useEffect(() => {
    if (!window.Chart || !chartRef.current) return;
    chartInst.current?.destroy();
    chartInst.current = new window.Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: ["Lagos","Kano","Rivers","Oyo","Kaduna","Abuja","Enugu","Anambra"],
        datasets: [{
          label: "Risk score",
          data: [9.2,7.9,6.6,5.1,4.3,3.8,3.2,2.9],
          backgroundColor: ["#dc2626","#dc2626","#d97706","#d97706","#059669","#059669","#059669","#059669"],
        }],
      },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { max: 10, grid: { color: "#f3f4f6" } }, y: { grid: { display: false } } },
      },
    });
    return () => chartInst.current?.destroy();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">

      {/* LEFT: Contamination Summary */}
      <div>
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-900">Contamination summary</div>
          <div className="text-xs text-gray-400">By state and date range</div>
        </div>

        <FilterBar>
          <label className="text-xs text-gray-500">State</label>
          <select className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500">
            <option>All States</option>
            <option>Lagos</option>
            <option>Kano</option>
            <option>Oyo</option>
          </select>
          <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
          <input type="date" defaultValue="2025-01-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
          <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
          <input type="date" defaultValue="2025-06-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
          <BtnPrimary>Load</BtnPrimary>
        </FilterBar>

        <div className="grid grid-cols-3 gap-3 mb-3">
          {SUMMARY_CARDS.map((c) => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">{c.label}</div>
              <div className={`text-xl font-medium ${c.color}`}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* By LGA */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-3">
          <div className="px-4 py-2.5 border-b border-gray-100 text-sm font-medium text-gray-900">Breakdown by LGA</div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>{["LGA","Samples","Contaminated","Rate"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {LGA_ROWS.map(([l, s, c, r]) => (
                <tr key={l} className="hover:bg-gray-50">
                  <td className={TD}>{l}</td>
                  <td className={TD}>{s}</td>
                  <td className={TD}>{c}</td>
                  <td className={TD}><RateBadge rate={r} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* By product type */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 text-sm font-medium text-gray-900">Breakdown by product type</div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>{["Category","Samples","Contaminated","Rate"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {PROD_ROWS.map(([l, s, c, r]) => (
                <tr key={l} className="hover:bg-gray-50">
                  <td className={TD}>{l}</td>
                  <td className={TD}>{s}</td>
                  <td className={TD}>{c}</td>
                  <td className={TD}><RateBadge rate={r} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: Risk Hotspots */}
      <div>
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-900">Risk hotspot rankings</div>
          <div className="text-xs text-gray-400">All regions · sorted by risk score</div>
        </div>

        <FilterBar>
          <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
          <input type="date" defaultValue="2025-01-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
          <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
          <input type="date" defaultValue="2025-06-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
          <BtnPrimary>Load</BtnPrimary>
        </FilterBar>

        <WhiteCard className="mb-3">
          <SectionLabel>Risk scores by state</SectionLabel>
          <div className="relative w-full" style={{ height: 260 }}>
            <canvas ref={chartRef} />
          </div>
        </WhiteCard>

        <WhiteCard>
          <SectionLabel>High-risk samples</SectionLabel>
          {HIGH_RISK.map((h) => (
            <div key={h.label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-xs">
              <span className="text-gray-500">{h.label}</span>
              <span className={`font-medium ${h.color}`}>{h.value}</span>
            </div>
          ))}
        </WhiteCard>
      </div>

    </div>
  );
}

export default Contamination;