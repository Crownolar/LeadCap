import { useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Btn from "../components/Btn";
import Badge from "../components/Badge";
import { icons } from "../utils/icons";
import Icon from "../components/icons/Icon";

const RegistryUpload = () => {
  const [stage, setStage] = useState("idle"); // idle | validating | validated | publishing
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = () => {
    setStage("validating");
    setTimeout(() => setStage("validated"), 1500);
  };

  const handlePublish = () => {
    setStage("publishing");
    setTimeout(() => setStage("idle"), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Registry Upload"
        subtitle="Upload and publish the NAFDAC product registry. Only active version is used for verification."
        action={<Badge status="ACTIVE" />}
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Current Registry" value="48,293" sub="Active records" icon="upload" />
        <StatCard label="Last Published" value="Dec 1, 2024" sub="v2024-12" icon="history" color="sky" />
        <StatCard label="Pending Errors" value="0" sub="From last upload" icon="alert" color="amber" />
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Upload Zone */}
        <div className="col-span-3 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(); }}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragOver ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"}`}
          >
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon d={icons.upload} size={26} className="text-emerald-600" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">Drop registry file here</p>
            <p className="text-xs text-slate-400 mb-4">Supports .csv, .xlsx — max 50MB</p>
            <Btn variant="outline" icon="upload" onClick={handleUpload}>Browse File</Btn>
          </div>

          {/* Validation Preview */}
          {(stage === "validating" || stage === "validated") && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-slate-700">Validation Results</p>
                {stage === "validating" ? (
                  <span className="text-xs text-sky-600 font-medium animate-pulse">● Validating...</span>
                ) : (
                  <span className="text-xs text-emerald-600 font-medium">● Ready to publish</span>
                )}
              </div>
              {stage === "validated" && (
                <div className="space-y-2">
                  {[
                    { label: "Total Records", value: "49,102", ok: true },
                    { label: "Valid Rows", value: "49,098", ok: true },
                    { label: "Duplicate NAFDAC Numbers", value: "4", ok: false },
                    { label: "Missing Required Fields", value: "0", ok: true },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                      <span className="text-slate-500">{r.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{r.value}</span>
                        <Icon d={r.ok ? icons.check : icons.alert} size={14} className={r.ok ? "text-emerald-500" : "text-amber-500"} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 flex gap-3">
                    <Btn variant="primary" icon="upload" onClick={handlePublish}>
                      {stage === "publishing" ? "Publishing..." : "Publish Registry"}
                    </Btn>
                    <Btn variant="outline" icon="download">Download Error Report</Btn>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Endpoint Reference */}
        <div className="col-span-2 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">API Endpoints</p>
          {[
            { method: "POST", path: "/api/nafdac/registry/upload", desc: "Upload CSV / Excel file" },
            { method: "GET", path: "/api/nafdac/registry/validate", desc: "Preview errors before publish" },
            { method: "POST", path: "/api/nafdac/registry/publish", desc: "Make registry live" },
          ].map(e => (
            <div key={e.path} className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${e.method === "POST" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>{e.method}</span>
                <code className="text-xs text-slate-600 font-mono">{e.path}</code>
              </div>
              <p className="text-xs text-slate-400">{e.desc}</p>
            </div>
          ))}
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex gap-2">
              <Icon d={icons.alert} size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Publishing triggers re-verification of all samples. This cannot be undone without a rollback.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistryUpload;