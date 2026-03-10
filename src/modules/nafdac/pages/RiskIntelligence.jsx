import Btn from "../components/Btn";
import Icon from "../components/icons/Icon";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { mockRiskData } from "../data/mockData";
import { icons } from "../utils/icons";

const RiskIntelligence = () => {

//   const maxScore = Math.max(...mockRiskData.map((d) => d.riskScore));
  return (
    <div>
      <PageHeader
        title="Risk & Fraud Intelligence"
        subtitle="Counterfeit detection, high-risk market analysis, and reused NAFDAC number alerts."
        action={
          <Btn variant="outline" icon="refresh" small>
            Refresh Analysis
          </Btn>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="High-Risk Regions"
          value="3"
          sub="Above threshold"
          icon="alert"
          color="red"
        />
        <StatCard
          label="Reused NAFDAC Numbers"
          value="31"
          sub="Detected this quarter"
          icon="shield"
          color="amber"
        />
        <StatCard
          label="Fake Products Flagged"
          value="97"
          sub="Confirmed counterfeits"
          icon="x"
          color="red"
        />
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Risk Heatmap */}
        <div className="col-span-3 bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <p className="font-semibold text-slate-700 text-sm mb-4">
            Regional Risk Scores
          </p>
          <div className="space-y-4">
            {mockRiskData
              .sort((a, b) => b.riskScore - a.riskScore)
              .map((d) => (
                <div key={d.region}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">
                      {d.region}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${d.riskScore > 70 ? "text-red-600" : d.riskScore > 50 ? "text-amber-600" : "text-emerald-600"}`}
                      >
                        {d.riskScore}
                      </span>
                      <Icon
                        d={icons.trending}
                        size={13}
                        className={
                          d.trend === "up"
                            ? "text-red-400 rotate-0"
                            : d.trend === "down"
                              ? "text-emerald-400 rotate-180"
                              : "text-slate-300"
                        }
                      />
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${d.riskScore > 70 ? "bg-red-400" : d.riskScore > 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                      style={{ width: `${(d.riskScore / 100) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-2 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-3">
              ⚠ Reused NAFDAC Numbers
            </p>
            <div className="space-y-2">
              {[
                "A7-0327 (used by 3 products)",
                "B3-1194 (used by 2 products)",
                "XX-9999 (flagged — unregistered)",
              ].map((n) => (
                <div
                  key={n}
                  className="flex items-center gap-2 text-xs text-red-700 bg-white rounded-lg px-3 py-2 border border-red-100"
                >
                  <Icon
                    d={icons.alert}
                    size={13}
                    className="text-red-400 flex-shrink-0"
                  />
                  <code className="font-mono">{n}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Fake Products by Category
            </p>
            {[
              { cat: "Antimalarials", count: 28, pct: 65 },
              { cat: "Antibiotics", count: 19, pct: 45 },
              { cat: "Supplements", count: 14, pct: 32 },
            ].map((c) => (
              <div key={c.cat} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{c.cat}</span>
                  <span className="text-slate-400">{c.count} cases</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskIntelligence;
