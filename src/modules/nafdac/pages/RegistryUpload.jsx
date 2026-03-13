import { useState, useEffect, useRef } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Btn from "../components/Btn";
import Badge from "../components/Badge";
import { icons } from "../utils/icons";
import Icon from "../components/icons/Icon";
import { getRegistrySummary, uploadRegistryFile, activateRegistryVersion } from "../api/nafdacService";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : "—");

const RegistryUpload = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activating, setActivating] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getRegistrySummary()
      .then((data) => { if (!cancelled) setSummary(data); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.error || err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [uploadResult]);

  const handleFileSelect = (file) => {
    if (!file) return;
    setError(null);
    setUploadResult(null);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const versionLabel = new Date().toISOString().slice(0, 10);
    formData.append("versionLabel", versionLabel);
    uploadRegistryFile(formData)
      .then((data) => setUploadResult(data))
      .catch((err) => setError(err.response?.data?.error || err.message || "Upload failed"))
      .finally(() => setUploading(false));
  };

  const handleActivate = () => {
    if (!uploadResult?.versionId) return;
    setActivating(true);
    activateRegistryVersion(uploadResult.versionId)
      .then(() => {
        setUploadResult(null);
        setSummary((s) => (s ? { ...s, status: "ACTIVE", versionLabel: uploadResult.versionLabel } : s));
      })
      .catch((err) => setError(err.response?.data?.error || err.message || "Activate failed"))
      .finally(() => setActivating(false));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  };

  const onBrowse = () => fileInputRef.current?.click();
  const onInputChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

  return (
    <div>
      <PageHeader
        title="Registry Upload"
        subtitle="Upload and publish the NAFDAC product registry. Only active version is used for verification."
        action={summary?.status ? <Badge status={summary.status} /> : null}
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Current Registry"
          value={loading ? "…" : (summary?.currentRegistryCount ?? 0).toLocaleString()}
          sub="Active records"
          icon="upload"
        />
        <StatCard
          label="Last Published"
          value={loading ? "…" : formatDate(summary?.lastPublishedDate)}
          sub={summary?.versionLabel ?? "—"}
          icon="history"
          color="sky"
        />
        <StatCard
          label="Pending Errors"
          value={loading ? "…" : (summary?.pendingErrors ?? 0)}
          sub="From last upload"
          icon="alert"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragOver ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={onInputChange}
              disabled={uploading}
            />
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon d={icons.upload} size={26} className="text-emerald-600" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">Drop registry file here</p>
            <p className="text-xs text-slate-400 mb-4">Supports .csv — max 50MB</p>
            <Btn variant="outline" icon="upload" onClick={onBrowse} disabled={uploading}>
              {uploading ? "Uploading…" : "Browse File"}
            </Btn>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-2">
              <Icon d={icons.alert} size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {uploadResult && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="font-semibold text-slate-700 mb-4">Upload complete</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                  <span className="text-slate-500">Records processed</span>
                  <span className="font-semibold text-slate-700">{uploadResult.recordsProcessed?.toLocaleString() ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                  <span className="text-slate-500">Errors</span>
                  <span className="font-semibold text-slate-700">{uploadResult.errorsCount ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                  <span className="text-slate-500">Version</span>
                  <span className="font-semibold text-slate-700">{uploadResult.versionLabel ?? uploadResult.versionId}</span>
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <Btn variant="primary" icon="refresh" onClick={handleActivate} disabled={activating}>
                  {activating ? "Activating…" : "Activate this version"}
                </Btn>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-2 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">API Endpoints</p>
          {[
            { method: "GET", path: "/api/nafdac/registry/summary", desc: "Summary and active registry stats" },
            { method: "POST", path: "/api/nafdac/registry/upload", desc: "Upload CSV file (multipart)" },
            { method: "GET", path: "/api/nafdac/registry/versions", desc: "List registry versions" },
            { method: "POST", path: "/api/nafdac/registry/versions/:id/activate", desc: "Make a version live" },
          ].map((e) => (
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
              <p className="text-xs text-amber-700">Activating a version makes it the one used for verification. You can switch to another version from Registry History.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistryUpload;
