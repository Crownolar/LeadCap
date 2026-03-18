import { useState } from "react";
import { FilterBar } from "../components/FilterBar";
import {  SectionLabel } from "../components/SectionLabel";
import { FilterSep, BtnPrimary, TH, TD } from "../utils/MohUI";
import { RateBadge } from "../components/RateBadge";
import {TypeBadge } from "../components/TypeBadge";

const TABS = ["State summary", "Contamination analysis", "Product type", "Risk assessment"];

const SAVED_REPORTS = [
  { title: "State summary — Lagos",                sub: "Generated 10 Jun 2025", type: "State summary"    },
  { title: "Risk assessment — Q1 2025",            sub: "Generated 3 Apr 2025",  type: "Risk assessment"  },
  { title: "Contamination analysis — Kano, Rivers",sub: "Generated 21 Mar 2025", type: "Contamination"    },
];

const RESULT_SUMMARY = [
  { key: "Total samples",      value: "8,210",         color: "text-gray-900"  },
  { key: "Verified",           value: "5,340 (65.0%)", color: "text-green-700" },
  { key: "Failed",             value: "712 (8.7%)",    color: "text-red-600"   },
  { key: "Pending",            value: "2,158 (26.3%)", color: "text-amber-600" },
  { key: "Contamination rate", value: "17.4%",         color: "text-red-600"   },
  { key: "Avg lead level",     value: "1.8 ppm",       color: "text-gray-900"  },
];

const RESULT_LGA = [
  ["Alimosho","1,204","212","17.6%"],
  ["Oshodi-Isolo","987","145","14.7%"],
  ["Ikeja","843","98","11.6%"],
];

const ReportFilters = ({ activeTab }) => {
  if (activeTab === "State summary") return (
    <>
      <label className="text-xs text-gray-500">State (required)</label>
      <select className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500">
        <option>— Select state —</option>
        <option>Lagos</option><option>Kano</option><option>Oyo</option><option>Abuja</option>
      </select>
      <FilterSep />
      <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
      <input type="date" defaultValue="2025-01-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
      <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
      <input type="date" defaultValue="2025-06-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
    </>
  );

  if (activeTab === "Contamination analysis") return (
    <>
      <label className="text-xs text-gray-500">States</label>
      <select className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500">
        <option>All States</option><option>Lagos</option><option>Kano</option>
      </select>
      <label className="text-xs text-gray-500">Product variant IDs</label>
      <input type="text" placeholder="e.g. PV-001, PV-002" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" style={{ minWidth: 160 }} />
      <FilterSep />
      <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
      <input type="date" defaultValue="2025-01-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
      <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
      <input type="date" defaultValue="2025-06-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
    </>
  );

  if (activeTab === "Product type") return (
    <>
      <label className="text-xs text-gray-500">State (optional)</label>
      <select className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500">
        <option>All States</option><option>Lagos</option><option>Kano</option>
      </select>
      <FilterSep />
      <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
      <input type="date" defaultValue="2025-01-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
      <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
      <input type="date" defaultValue="2025-06-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
    </>
  );

  return (
    <>
      <label className="text-xs text-gray-500 whitespace-nowrap">Min lead level (ppm)</label>
      <input type="number" placeholder="0.0" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" style={{ width: 80 }} />
      <FilterSep />
      <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
      <input type="date" defaultValue="2025-01-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
      <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
      <input type="date" defaultValue="2025-06-01" className="text-xs px-2 py-1.5 border border-gray-200 rounded-md outline-none focus:border-green-500" />
    </>
  );
}

 const Reports = () => {
  const [activeTab, setActiveTab] = useState("State summary");
  const [generated, setGenerated] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setGenerated(false);
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b-2 border-gray-200 mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-5 py-2.5 text-sm font-medium cursor-pointer border-b-2 -mb-px bg-transparent ${
              activeTab === t
                ? "text-green-700 border-green-600"
                : "text-gray-500 border-transparent hover:text-green-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Filters */}
      <FilterBar>
        <ReportFilters activeTab={activeTab} />
        <FilterSep />
        <BtnPrimary onClick={() => setGenerated(true)}>Generate report</BtnPrimary>
      </FilterBar>

      {/* Result block */}
      {generated && (
        <div className="rounded-xl border border-gray-200 overflow-hidden mt-5">
          <div className="px-5 py-4 flex items-center justify-between" style={{ background: "#065f46" }}>
            <div>
              <div className="text-sm font-medium text-white">{activeTab}</div>
              <div className="text-xs text-green-200 mt-0.5">Generated: 15 Jun 2025 · Lagos State · Jan–Jun 2025</div>
            </div>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 rounded-md cursor-pointer text-white border border-white border-opacity-30 bg-white bg-opacity-10">
                Export PDF
              </button>
              <button className="text-xs px-3 py-1.5 rounded-md cursor-pointer text-white border border-white border-opacity-30 bg-white bg-opacity-10">
                Export Excel
              </button>
            </div>
          </div>

          <div className="bg-white">
            {/* Summary */}
            <div className="px-5 py-4 border-b border-gray-100">
              <SectionLabel>Summary</SectionLabel>
              {RESULT_SUMMARY.map(({ key, value, color }) => (
                <div key={key} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm">
                  <span className="text-gray-500">{key}</span>
                  <span className={`font-medium ${color}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Top LGAs */}
            <div className="px-5 py-4 border-b border-gray-100">
              <SectionLabel>Top LGAs by activity</SectionLabel>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>{["LGA","Samples","Contaminated","Rate"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {RESULT_LGA.map(([l, s, c, r]) => (
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

            {/* Recommendations */}
            <div className="px-5 py-4">
              <SectionLabel>Recommendations</SectionLabel>
              <div className="text-sm text-gray-500 leading-relaxed">
                1. Intensify NAFDAC inspection in Alimosho and Oshodi-Isolo LGAs.<br />
                2. Enforce stricter import controls on antibiotic products from China.<br />
                3. Issue public health advisory for markets with &gt;15% contamination rate.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved reports */}
      <div className="mt-5">
        <div className="text-sm font-medium text-gray-900 mb-3">Saved reports</div>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {SAVED_REPORTS.map((r) => (
            <div key={r.title} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="text-sm font-medium text-gray-900">{r.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{r.sub}</div>
              </div>
              <div className="flex items-center gap-2">
                <TypeBadge type={r.type} />
                <button className="text-xs px-3 py-1.5 border border-gray-200 rounded-md bg-white text-gray-500 hover:border-green-400 hover:text-green-700 cursor-pointer">
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;