import { useState } from "react";
import { mockVerifications } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import { icons } from "../utils/icons";
import StatCard from "../components/StatCard";
import Icon from "../components/icons/Icon";
import { Table } from "lucide-react";
import Badge from "../components/Badge";
import Btn from "../components/Btn";

const VerificationLogs = () => {

  const [dateFrom, setDateFrom] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = mockVerifications.filter(v =>
    statusFilter === "ALL" || v.status === statusFilter
  );

  return (
    <div>
      <PageHeader
        title="Verification Logs"
        subtitle="Real-time operational visibility into all sample verifications across Nigeria."
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Verifications" value="1,284" sub="All time" icon="activity" />
        <StatCard label="Verified" value="1,091" sub="84.9% match rate" icon="check" color="emerald" />
        <StatCard label="Failed" value="143" sub="11.1% no match" icon="x" color="red" />
        <StatCard label="Pending" value="50" sub="Awaiting result" icon="refresh" color="sky" />
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className="p-4 border-b border-slate-50 flex items-center gap-3">
          <Icon d={icons.filter} size={15} className="text-slate-400" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-300" />
          <div className="flex gap-2 ml-auto">
            {["ALL", "VERIFIED", "FAILED", "PENDING"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${statusFilter === s ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-500 hover:border-emerald-300 bg-white"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <Table
            headers={["Sample ID", "Product", "NAFDAC No.", "State", "Date", "Status", "Outcome", ""]}
            rows={filtered.map(v => [
              <code className="text-xs font-mono text-slate-500">{v.id}</code>,
              <span className="font-medium text-slate-700">{v.product}</span>,
              <code className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{v.nafdacNumber}</code>,
              v.state,
              v.date,
              <Badge status={v.status} />,
              <Badge status={v.outcome} />,
              <Btn variant="ghost" icon="eye" small>Details</Btn>,
            ])}
          />
        </div>
      </div>
    </div>
  );
};

export default VerificationLogs;