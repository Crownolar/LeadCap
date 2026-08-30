import { useState, useEffect, useRef } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Btn from "../components/Btn";
import Badge from "../components/Badge";
import { icons } from "../utils/icons";
import Icon from "../components/icons/Icon";
import {
  getRegistrySummary,
  uploadRegistryFile,
  activateRegistryVersion,
  getRegistryVersions,
} from "../api/nafdacService";
import { LoaderSpinner } from "../utils/iconComponent";
import api from "../../../utils/api";
import { useTheme } from "../../../context/ThemeContext";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const RegistryUpload = () => {
  const [summary, setSummary] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [versions, setVersions] = useState(null);
  const [version, setVersion] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [clickedVersion, setClickedVersion] = useState(null);
  const { theme } = useTheme();

  const handleVerifySamples = () => {
    if (!version) return alert("No active registry version found for verification");

    api
      .post(`/nafdac/verification/registry/${version.id}/verify-samples`)
      .then(() => {
        alert("Samples have been verified against the active registry version.👍✔");
      })
      .catch((err) => {
        alert(err.response?.data?.error || err.message || "Verification failed");
      });
  };

  useEffect(() => {
    if (!version && versions?.length) {
      setVersion(versions.find((v) => v.isActive) || versions[0]);
    }
  }, [versions, version]);

  useEffect(() => {
    getRegistryVersions()
      .then(setVersions)
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getRegistrySummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.error || err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uploadResult, version]);

  const handleFileSelect = (file) => {
    if (!file) return;

    const allowed = [".csv", ".xlsx", ".xls"];
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;

    if (!allowed.includes(ext)) {
      setError("Please select a CSV, XLSX, or XLS registry file.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("The registry file must be 50MB or smaller.");
      return;
    }

    setError(null);
    setUploadResult(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("versionLabel", new Date().toISOString().slice(0, 10));

    uploadRegistryFile(formData)
      .then(setUploadResult)
      .catch((err) =>
        setError(err.response?.data?.error || err.message || "Upload failed")
      )
      .finally(() => setUploading(false));
  };

  const handleActivateRecentUpload = () => {
    if (!uploadResult?.versionId) return;

    setActivating(true);
    activateRegistryVersion(uploadResult.versionId)
      .then(() => {
        setUploadResult(null);
        setVersions((prev) =>
          prev
            ? prev.map((v) => ({
                ...v,
                isActive: v.id === uploadResult.versionId,
              }))
            : prev
        );
        setVersion((v) =>
          v ? { ...v, isActive: v.id === uploadResult.versionId } : v
        );
        setSummary((s) =>
          s
            ? {
                ...s,
                status: "ACTIVE",
                versionLabel: uploadResult.versionLabel,
              }
            : s
        );
      })
      .catch((err) =>
        setError(err.response?.data?.error || err.message || "Activate failed")
      )
      .finally(() => setActivating(false));
  };

  const handleActivate = (v) => {
    if (!v?.id) return;

    setActivating(true);
    setClickedVersion(v.id);

    activateRegistryVersion(v.id)
      .then(() => {
        setVersions((prev) =>
          prev ? prev.map((pv) => ({ ...pv, isActive: pv.id === v.id })) : prev
        );
        setVersion({ ...v, isActive: true });
      })
      .catch((err) =>
        setError(err.response?.data?.error || err.message || "Activate failed")
      )
      .finally(() => {
        setDropdownOpen(false);
        setActivating(false);
        setClickedVersion(null);
      });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer?.files?.[0]);
  };

  const onBrowse = () => fileInputRef.current?.click();

  const onInputChange = (e) => {
    handleFileSelect(e.target?.files?.[0]);
    e.target.value = "";
  };

  return (
    <div className={`min-h-full ${theme.text}`}>
      <PageHeader
        title="Registry Upload"
        subtitle="Manage the NAFDAC product registry used as the authoritative source for product verification."
        action={summary?.status ? <Badge status={summary.status} /> : null}
      />

      {/* Command bar */}
      <div
        className={`mt-5 flex flex-col gap-4 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${theme.card} ${theme.border}`}
      >
        <div>
          <p className="text-sm font-semibold">Registry verification</p>
          <p className={`mt-1 text-xs ${theme.textMuted}`}>
            Verify collected samples against the currently active registry.
          </p>
        </div>
        <Btn
          variant="primary"
          icon="check"
          onClick={handleVerifySamples}
          disabled={!version || activating}
        >
          Verify samples
        </Btn>
      </div>

      {/* KPI row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Current Registry"
          value={loading ? "…" : (summary?.currentRegistryCount ?? 0).toLocaleString()}
          sub="Active records"
          icon="upload"
        />
        <StatCard
          label="Last Published"
          value={loading ? "…" : formatDate(summary?.lastPublishedDate)}
          sub={summary?.versionLabel ?? "No published version"}
          icon="history"
          color="sky"
        />
        <StatCard
          label="Pending Errors"
          value={loading ? "…" : (summary?.pendingErrors ?? 0).toLocaleString()}
          sub="From latest upload"
          icon="alert"
          color="amber"
        />
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          <Icon d={icons.alert} size={18} className="mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">Registry operation failed</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Upload workspace */}
        <section className="space-y-5 xl:col-span-3">
          <div className={`overflow-hidden rounded-3xl border shadow-sm ${theme.card} ${theme.border}`}>
            <div className={`border-b px-5 py-5 sm:px-6 ${theme.border}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-bold">Publish a new registry</p>
                  <p className={`mt-1 text-xs leading-5 ${theme.textMuted}`}>
                    Upload the latest NAFDAC registry dataset. A successful upload creates a new version ready for activation.
                  </p>
                </div>
                <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 sm:flex">
                  <Icon d={icons.upload} size={20} />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={(e) => {
                  if (e.target.closest("button")) return;
                  onBrowse();
                }}
                className={`group cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition-all sm:p-10 ${
                  dragOver
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                    : `${theme.border} hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10`
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={onInputChange}
                  disabled={uploading}
                />

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-105 dark:bg-emerald-950/30">
                  <Icon d={icons.upload} size={26} />
                </div>

                <p className="mt-4 text-sm font-bold">Drop your registry file here</p>
                <p className={`mx-auto mt-1 max-w-md text-xs leading-5 ${theme.textMuted}`}>
                  CSV, XLSX, or XLS • maximum file size 50MB
                </p>

                <div className="mt-5">
                  <Btn
                    variant="outline"
                    icon="upload"
                    onClick={onBrowse}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading…" : "Choose registry file"}
                  </Btn>
                </div>
              </div>

              <div className={`mt-4 flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${theme.border}`}>
                <div className="flex items-center gap-2">
                  <Icon d={icons.info} size={15} className="text-sky-500" />
                  <span className={`text-xs ${theme.textMuted}`}>
                    The active version is used for verification.
                  </span>
                </div>
                <span className={`text-[11px] font-semibold ${theme.textMuted}`}>
                  Registry control
                </span>
              </div>
            </div>
          </div>

          {/* Upload result */}
          {uploadResult && (
            <div className={`overflow-hidden rounded-3xl border shadow-sm ${theme.card} ${theme.border}`}>
              <div className="flex flex-col gap-3 border-b border-emerald-100 bg-emerald-50/70 px-5 py-4 dark:border-emerald-900/30 dark:bg-emerald-950/20 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Icon d={icons.check} size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Upload processed successfully</p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      Review the import summary before activating it.
                    </p>
                  </div>
                </div>
                <Badge status={uploadResult.errorsCount ? "WARNING" : "ACTIVE"} />
              </div>

              <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="p-4">
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                    Records processed
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {uploadResult.recordsProcessed?.toLocaleString() ?? "—"}
                  </p>
                </div>
                <div className="p-4">
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                    Import errors
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {uploadResult.errorsCount ?? 0}
                  </p>
                </div>
                <div className="p-4">
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                    Version
                  </p>
                  <p className="mt-2 truncate text-sm font-bold">
                    {uploadResult.versionLabel ?? uploadResult.versionId ?? "—"}
                  </p>
                </div>
              </div>

              <div className={`border-t p-4 ${theme.border}`}>
                <Btn
                  variant="primary"
                  icon="refresh"
                  onClick={handleActivateRecentUpload}
                  disabled={activating}
                >
                  {activating ? "Activating…" : "Activate this version"}
                </Btn>
              </div>
            </div>
          )}
        </section>

        {/* Version control */}
        <aside className="xl:col-span-2">
          <div className={`overflow-visible rounded-3xl border shadow-sm ${theme.card} ${theme.border}`}>
            <div className={`border-b px-5 py-5 ${theme.border}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-bold">Registry versions</p>
                  <p className={`mt-1 text-xs ${theme.textMuted}`}>
                    Select the version used by verification.
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/30">
                  <Icon d={icons.history} size={17} />
                </div>
              </div>
            </div>

            <div className="p-5">
              <label className={`mb-2 block text-xs font-semibold ${theme.textMuted}`}>
                Active selection
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((s) => !s)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition hover:border-emerald-400 ${theme.border} ${theme.bg}`}
                >
                  <div className="min-w-0">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Icon d={icons.refresh} size={15} className="animate-spin" />
                        <span className={`text-sm ${theme.textMuted}`}>Loading versions…</span>
                      </div>
                    ) : version ? (
                      <>
                        <p className="truncate text-sm font-bold">{version.versionLabel || "Unnamed version"}</p>
                        <p className={`mt-1 text-[11px] ${theme.textMuted}`}>
                          {formatDate(version.uploadedAt)} • {version.recordCount?.toLocaleString() ?? "—"} records
                        </p>
                      </>
                    ) : (
                      <span className={`text-sm ${theme.textMuted}`}>No registry version available</span>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {version?.isActive && <Badge status="ACTIVE" />}
                    <Icon d={icons.chevronDown} size={16} className={theme.textMuted} />
                  </div>
                </button>

                {dropdownOpen && (
                  <div className={`absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-auto rounded-2xl border p-1 shadow-xl ${theme.card} ${theme.border}`}>
                    {versions?.length ? (
                      versions.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleActivate(v)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition ${theme.hover}`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold">
                                {v.versionLabel || "—"}
                              </span>
                              {v.isActive && <Badge status="ACTIVE" />}
                            </div>
                            <div className={`mt-1 text-[11px] ${theme.textMuted}`}>
                              {formatDate(v.uploadedAt)} • {v.recordCount?.toLocaleString() ?? "—"} records
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {version?.id === v.id && (
                              <Icon d={icons.check} size={16} className="text-emerald-600" />
                            )}
                            {clickedVersion === v.id && <LoaderSpinner />}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className={`px-3 py-6 text-center text-xs ${theme.textMuted}`}>
                        No registry versions found.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-900/30 dark:bg-sky-950/20">
                <div className="flex items-start gap-3">
                  <Icon d={icons.info} size={16} className="mt-0.5 shrink-0 text-sky-600" />
                  <div>
                    <p className="text-xs font-bold text-sky-800 dark:text-sky-300">
                      Active registry
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {version?.versionLabel || "—"}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-sky-700 dark:text-sky-400">
                      Changing this selection changes the registry version used during verification.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`mt-5 border-t pt-4 ${theme.border}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${theme.textMuted}`}>Available versions</span>
                  <span className="text-sm font-bold">{versions?.length ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RegistryUpload;