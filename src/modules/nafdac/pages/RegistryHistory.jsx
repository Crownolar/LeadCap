import { useState, useEffect } from "react";
import Badge from "../components/Badge";
import Btn from "../components/Btn";
import PageHeader from "../components/PageHeader";
import { icons } from "../utils/icons";
import Icon from "../components/icons/Icon";
import {
  getRegistryVersions,
  getRegistryVersion,
  exportRegistryVersion,
  activateRegistryVersion,
} from "../api/nafdacService";
import { useTheme } from "../../../context/ThemeContext";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const RegistryHistory = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [versionDetail, setVersionDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activatingId, setActivatingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const { theme } = useTheme()

  const fetchVersions = () => {
    setLoading(true);
    getRegistryVersions()
      .then(setVersions)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleViewVersion = (id) => {
    if (selected === id && versionDetail?.id === id) {
      setSelected(null);
      setVersionDetail(null);
      return;
    }
    setSelected(id);
    setLoadingDetail(true);
    setVersionDetail(null);
    getRegistryVersion(id)
      .then(setVersionDetail)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoadingDetail(false));
  };

  const handleDownloadCsv = (id, versionLabel) => {
    setExportingId(id);
    exportRegistryVersion(id)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nafdac_registry_${versionLabel || id}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setExportingId(null));
  };

  const handleActivate = (id) => {
    setActivatingId(id);
    activateRegistryVersion(id)
      .then(() => fetchVersions())
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setActivatingId(null));
  };

  return (
    <div>
      <PageHeader
        title='Registry Versions'
        subtitle='Full audit trail of all uploaded registries. Activate any version to make it live for verification.'
      />
      {error && (
        <div className={`mb-4 p-4 ${theme.bg} border ${theme.border} rounded-xl flex items-center gap-2`}>
          <Icon
            d={icons.alert}
            size={18}
            className='text-red-500 flex-shrink-0'
          />
          <p className='text-sm text-red-700'>{error}</p>
        </div>
      )}
      <div className={`${theme.bg} border ${theme.border} rounded-2xl shadow-sm overflow-hidden`}>
        <div className='p-5 border-b ${theme.border}'>
          <p className={`font-semibold ${theme.text} text-sm`}>
            Version History
          </p>
        </div>
        {loading ? (
          <div className={`p-8 text-center ${theme.textMuted} text-sm`}>Loading…</div>
        ) : (
          <div className='divide-y divide-slate-50'>
            {versions.map((v) => (
              <div key={v.id} className='p-5 transition-colors'>
                <div
                  className='flex items-center justify-between cursor-pointer'
                  onClick={() => handleViewVersion(v.id)}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-2 h-2 rounded-full ${v.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                    />
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className={`font-semibold ${theme.textMuted} text-sm`}>
                          {v.versionLabel || v.id}
                        </span>
                        {v.isActive && <Badge status='ACTIVE' />}
                      </div>
                      <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                        Uploaded {formatDate(v.uploadedAt)} by{" "}
                        {v.uploadedBy?.fullName ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='text-right'>
                      <p className={`text-sm font-bold ${theme.textMuted}`}>
                        {(v.recordCount ?? 0).toLocaleString()}
                      </p>
                      <p className={`text-xs ${theme.textMuted}`}>records</p>
                    </div>
                    <Icon
                      d={icons.chevronDown}
                      size={16}
                      className={`${theme.textMuted} transition-transform ${selected === v.id ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {selected === v.id && (
                  <div className='mt-4 pt-4 border-t border-slate-100'>
                    {loadingDetail ? (
                      <p className={`text-sm ${theme.textMuted}`}>Loading details…</p>
                    ) : versionDetail?.id === v.id ? (
                      <div className='mb-4'>
                        <p className={`text-xs font-semibold ${theme.textMuted} uppercase tracking-widest mb-2`}>
                          Sample products (
                          {versionDetail.sampleProducts?.length ?? 0} shown)
                        </p>
                        {versionDetail.sampleProducts?.length > 0 && (
                          <div className={`${theme.bg} rounded-xl p-3 text-xs space-y-1 max-h-40 overflow-y-auto`}>
                            {versionDetail.sampleProducts.map((p, i) => (
                              <div
                                key={i}
                                className='flex justify-between gap-2'
                              >
                                <code className='text-emerald-700'>
                                  {p.nafdacNumber}
                                </code>
                                <span className='text-slate-600 truncate'>
                                  {p.productName}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                    <div className='flex items-center gap-3 flex-wrap'>
                      <Btn
                        variant='outline'
                        icon='download'
                        small
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadCsv(v.id, v.versionLabel);
                        }}
                        disabled={exportingId === v.id}
                      >
                        {exportingId === v.id ? "Downloading…" : "Download CSV"}
                      </Btn>
                      {!v.isActive && (
                        <Btn
                          variant='outline'
                          icon='refresh'
                          small
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivate(v.id);
                          }}
                          disabled={activatingId === v.id}
                        >
                          {activatingId === v.id
                            ? "Activating…"
                            : "Activate this version"}
                        </Btn>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {!loading && versions.length === 0 && (
          <div className={`p-8 text-center ${theme.textMuted} text-sm`}>
            No registry versions yet. Upload one from Registry Upload.
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistryHistory;
