import { useState } from "react";
import { mockVersions } from "../data/mockData";
import Badge from "../components/Badge";
import Btn from "../components/Btn";
import PageHeader from "../components/PageHeader";
import { icons } from "../utils/icons";
import Icon from "../components/icons/Icon";

const RegistryHistory = () => {

  const [selected, setSelected] = useState(null);
  return (
    <div>
      <PageHeader
        title="Registry Versions"
        subtitle="Full audit trail of all uploaded registries. Rollback to any previous version."
      />
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <p className="font-semibold text-slate-700 text-sm">
            Version History
          </p>
          <Btn variant="outline" icon="download" small>
            Export Log
          </Btn>
        </div>
        <div className="divide-y divide-slate-50">
          {mockVersions.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelected(v.id === selected ? null : v.id)}
              className={`p-5 cursor-pointer transition-colors ${selected === v.id ? "bg-emerald-50/60" : "hover:bg-slate-50"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${v.active ? "bg-emerald-500" : "bg-slate-300"}`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 text-sm">
                        {v.id}
                      </span>
                      {v.active && <Badge status="ACTIVE" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Uploaded {v.date} by {v.uploadedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-700">
                      {v.records.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">records</p>
                  </div>
                  <Icon
                    d={icons.chevronDown}
                    size={16}
                    className={`text-slate-300 transition-transform ${selected === v.id ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {selected === v.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <Btn variant="outline" icon="eye" small>
                    View Version
                  </Btn>
                  {!v.active && (
                    <Btn variant="outline" icon="refresh" small>
                      Rollback to This Version
                    </Btn>
                  )}
                  <Btn variant="ghost" icon="download" small>
                    Download CSV
                  </Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegistryHistory;
