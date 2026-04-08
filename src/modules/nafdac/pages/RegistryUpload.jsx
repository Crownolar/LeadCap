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
  const [loading, setLoading] = useState(false);

  const [activating, setActivating] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [versions, setVersions] = useState(null);
  const [version, setVersion] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // to test click loading state
  const [clickedVersion, setClickedVersion] = useState(null);

  const handleVerifySamples = () => {
    if (!version)
      return alert("No active registry version found for verification");
    api
      .get(`/nafdac/verification/registry/${version.id}/verify-samples`)
      .then((res) => {
        alert(res.data.message);
      })
      .catch((err) => {
        alert(
          err.response?.data?.error || err.message || "Verification failed",
        );
      });
  };

  useEffect(() => {
    if (!version && versions && versions.length > 0) {
      const active = versions.find((v) => v.isActive) || versions[0];
      setVersion(active);
    }
  }, [versions, version]);

  useEffect(() => {
    async function fetch() {
      await getRegistryVersions().then((versions) => {
        setVersions(versions);
      });
    }

    fetch();
  }, []);

  useEffect(() => {
    let cancelled = false;
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
    setError(null);
    setUploadResult(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    const versionLabel = new Date().toISOString().slice(0, 10);
    formData.append("versionLabel", versionLabel);
    uploadRegistryFile(formData)
      .then((data) => setUploadResult(data))
      .catch((err) =>
        setError(err.response?.data?.error || err.message || "Upload failed"),
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
            : prev,
        );
        setVersion((v) =>
          v ? { ...v, isActive: v.id === uploadResult.versionId } : v,
        );
        setSummary((s) =>
          s
            ? {
                ...s,
                status: "ACTIVE",
                versionLabel: uploadResult.versionLabel,
              }
            : s,
        );
      })
      .catch((err) =>
        setError(err.response?.data?.error || err.message || "Activate failed"),
      )
      .finally(() => setActivating(false));
  };

  const handleActivate = (v) => {
    if (!v?.id) return;
    setActivating(true);
    activateRegistryVersion(v.id)
      .then(() => {
        setVersions((prev) =>
          prev ? prev.map((pv) => ({ ...pv, isActive: pv.id === v.id })) : prev,
        );
        setVersion({ ...v, isActive: true });
      })
      .catch((err) =>
        setError(err.response?.data?.error || err.message || "Activate failed"),
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
        title='Registry Upload'
        subtitle='Upload and publish the NAFDAC product registry. Only active version is used for verification.'
        action={summary?.status ? <Badge status={summary.status} /> : null}
      />
      <div className='mt-5 mb-10   text-center md:text-left '>
        <button
          className='px-5 py-2.5  bg-emerald-600 text-white font-medium rounded-lg shadow-md 
hover:bg-emerald-700 active:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 
transition duration-200 ease-in-out'
          onClick={handleVerifySamples}
        >
          Verify
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
        <StatCard
          label='Current Registry'
          value={
            loading
              ? "…"
              : (summary?.currentRegistryCount ?? 0).toLocaleString()
          }
          sub='Active records'
          icon='upload'
        />
        <StatCard
          label='Last Published'
          value={loading ? "…" : formatDate(summary?.lastPublishedDate)}
          sub={summary?.versionLabel ?? "—"}
          icon='history'
          color='sky'
        />
        <StatCard
          label='Pending Errors'
          value={loading ? "…" : (summary?.pendingErrors ?? 0)}
          sub='From last upload'
          icon='alert'
          color='amber'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6 mb-[150px]'>
        <div className='lg:col-span-3 col-span-1 space-y-4'>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 lg:p-10 text-center transition-all cursor-pointer ${dragOver ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"}`}
          >
            <input
              ref={fileInputRef}
              type='file'
              accept='.csv,.xlsx,.xls'
              className='hidden'
              onChange={onInputChange}
              disabled={uploading}
            />
            <div className='w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <Icon d={icons.upload} size={26} className='text-emerald-600' />
            </div>
            <p className='text-slate-700 font-semibold mb-1'>
              Drop registry file here
            </p>
            <p className='text-xs text-slate-400 mb-4'>
              Supports .csv — max 50MB
            </p>
            <Btn
              variant='outline'
              icon='upload'
              onClick={onBrowse}
              disabled={uploading}
            >
              {uploading ? "Uploading…" : "Browse File"}
            </Btn>
          </div>

          {error && (
            <div className='bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-2'>
              <Icon
                d={icons.alert}
                size={18}
                className='text-red-500 flex-shrink-0 mt-0.5'
              />
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          )}

          {uploadResult && (
            <div>
              <h3 className='text-xl font-semibold text-slate-400 uppercase tracking-widest mb-2 mt-5'>
                Recent Upload
              </h3>
              <div className='bg-white border border-slate-100 rounded-2xl p-5 shadow-sm'>
                <p className='font-semibold text-slate-700 mb-4'>
                  Upload complete
                </p>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm py-2 border-b border-slate-50'>
                    <span className='text-slate-500'>Records processed</span>
                    <span className='font-semibold text-slate-700'>
                      {uploadResult.recordsProcessed?.toLocaleString() ?? "—"}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm py-2 border-b border-slate-50'>
                    <span className='text-slate-500'>Errors</span>
                    <span className='font-semibold text-slate-700'>
                      {uploadResult.errorsCount ?? 0}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm py-2 border-b border-slate-50'>
                    <span className='text-slate-500'>Version</span>
                    <span className='font-semibold text-slate-700'>
                      {uploadResult.versionLabel ?? uploadResult.versionId}
                    </span>
                  </div>
                </div>
                <div className='pt-3 flex gap-3'>
                  <Btn
                    variant='primary'
                    icon='refresh'
                    onClick={handleActivateRecentUpload}
                    disabled={activating}
                  >
                    {activating ? "Activating…" : "Activate this version"}
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='lg:col-span-2 col-span-1 space-y-3'>
          <p className='text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2'>
            Registry Versions
          </p>
          <div className='bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm mb-3'>
            <label className='text-xs text-slate-500 font-semibold mb-2 block'>
              Registry Versions
            </label>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setDropdownOpen((s) => !s)}
                className='w-full text-left bg-slate-50 border border-slate-100 rounded-md px-3 py-2 flex items-center justify-between gap-3'
              >
                <div className='flex items-center gap-3'>
                  <div className='text-sm text-slate-700'>
                    {!versions ||
                      (versions.length < 0 && (
                        <span className='text-slate-400'>No versions</span>
                      ))}
                    {loading && (
                      <Icon
                        d={icons.refresh}
                        size={16}
                        className='text-slate-400 animate-spin'
                      />
                    )}
                    {version && !loading && (
                      <>
                        <span className='font-semibold'>
                          {version.versionLabel}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {version?.isActive && <Badge status={"ACTIVE"} />}
                  <Icon
                    d={icons.chevronDown}
                    size={16}
                    className='text-slate-400'
                  />
                </div>
              </button>

              {dropdownOpen && (
                <div className='absolute z-20  left-0 right-0 mt-2 bg-white 0 shadow-lg max-h-36 overflow-auto rounded-lg'>
                  {versions?.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setClickedVersion(v.id);
                        handleActivate(v);
                      }}
                      className='w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between gap-3 border-b border-slate-400'
                    >
                      <div>
                        <div className='text-sm text-slate-700 font-semibold'>
                          {v.versionLabel || "—"}
                        </div>
                        <div className='text-xs text-slate-400'>
                          {formatDate(v.uploadedAt)} •{" "}
                          {v.recordCount?.toLocaleString() ?? "—"} records
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {v.isActive && <Badge status={"ACTIVE"} />}
                        {version?.id === v.id && (
                          <Icon
                            d={icons.check}
                            size={16}
                            className='text-emerald-600'
                          />
                        )}
                        {clickedVersion == v.id && <LoaderSpinner />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className='mt-3'>
              <div className='p-3 rounded-md bg-sky-50 border border-sky-100 text-sm text-sky-700'>
                <span className='font-semibold'>Active version:</span>{" "}
                <span className='font-medium text-slate-700'>
                  {version ? version.versionLabel : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* <div className='mt-4 p-3.5 bg-amber-50 border border-amber-100 rounded-xl'>
            <div className='flex gap-2'>
              <Icon
                d={icons.alert}
                size={15}
                className='text-amber-500 flex-shrink-0 mt-0.5'
              />
              <p className='text-xs text-amber-700'>
                Activating a version makes it the one used for verification. You
                can switch to another version from Registry History.
              </p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default RegistryUpload;
