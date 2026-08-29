import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Btn from "../components/Btn";
import Badge from "../components/Badge";
import Icon from "../components/icons/Icon";
import { icons } from "../utils/icons";
import { getRegistryVersions, activateRegistryVersion } from "../api/nafdacService";
import { useTheme } from "../../../context/ThemeContext";

const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

const getRecordCount = (version) =>
  Number(
    version?.recordCount ??
      version?.recordsCount ??
      version?.totalRecords ??
      version?.count ??
      0
  );

const RegistryHistory = () => {
  const { theme } = useTheme();

  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activatingId, setActivatingId] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);

  const loadVersions = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");

      const data = await getRegistryVersions();
      const list = Array.isArray(data)
        ? data
        : data?.versions || data?.data || [];

      setVersions(Array.isArray(list) ? list : []);

      if (!selectedId && list?.length) {
        const active = list.find((item) => item?.isActive);
        setSelectedId((active || list[0])?.id ?? null);
      }
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Unable to load registry history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const activeVersion = useMemo(
    () => versions.find((item) => item?.isActive) || null,
    [versions]
  );

  const totalRecordsAcrossVersions = useMemo(
    () => versions.reduce((sum, item) => sum + getRecordCount(item), 0),
    [versions]
  );

  const filteredVersions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return versions.filter((version) => {
      const active = Boolean(version?.isActive);
      const statusOk =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "ARCHIVED" && !active);

      if (!statusOk) return false;
      if (!normalized) return true;

      const haystack = [
        version?.versionLabel,
        version?.version,
        version?.name,
        version?.id,
        version?.uploadedBy?.fullName,
        version?.uploadedBy?.name,
        version?.createdBy?.fullName,
        version?.createdBy?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [versions, query, statusFilter]);

  const selectedVersion =
    versions.find((item) => item?.id === selectedId) || activeVersion;

  const handleActivate = async (version) => {
    if (!version?.id || version?.isActive) return;

    try {
      setActivatingId(version.id);
      setError("");

      await activateRegistryVersion(version.id);

      setVersions((current) =>
        current.map((item) => ({
          ...item,
          isActive: item.id === version.id,
        }))
      );
      setSelectedId(version.id);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Unable to activate this registry version."
      );
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <div className={`min-h-full ${theme.text}`}>
      <PageHeader
        title="Registry History"
        subtitle="Track published NAFDAC registry versions, their status, and the dataset currently used for verification."
        action={
          activeVersion ? <Badge status="ACTIVE" /> : null
        }
      />

      {/* Overview strip */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registry Versions"
          value={loading ? "…" : versions.length.toLocaleString()}
          sub="Published datasets"
          icon="history"
        />
        <StatCard
          label="Active Version"
          value={
            loading
              ? "…"
              : activeVersion?.versionLabel ||
                activeVersion?.version ||
                "None"
          }
          sub={
            activeVersion
              ? `Published ${formatDate(
                  activeVersion.uploadedAt ||
                    activeVersion.createdAt ||
                    activeVersion.publishedAt
                )}`
              : "No active registry"
          }
          icon="check"
          color="sky"
        />
        <StatCard
          label="Active Records"
          value={
            loading ? "…" : getRecordCount(activeVersion).toLocaleString()
          }
          sub="Records available for verification"
          icon="database"
          color="emerald"
        />
        <StatCard
          label="Archived Versions"
          value={
            loading
              ? "…"
              : Math.max(versions.length - (activeVersion ? 1 : 0), 0)
          }
          sub="Previous registry snapshots"
          icon="archive"
          color="amber"
        />
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          <Icon d={icons.alert} size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Registry history error</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Version timeline / table */}
        <section
          className={`overflow-hidden rounded-3xl border shadow-sm xl:col-span-2 ${theme.card} ${theme.border}`}
        >
          <div className={`border-b p-5 sm:p-6 ${theme.border}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                    <Icon d={icons.history} size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">Published versions</h2>
                    <p className={`mt-0.5 text-xs ${theme.textMuted}`}>
                      Full registry publication history
                    </p>
                  </div>
                </div>
              </div>

              <Btn
                variant="outline"
                icon="refresh"
                onClick={() => loadVersions(true)}
                disabled={refreshing}
              >
                {refreshing ? "Refreshing…" : "Refresh"}
              </Btn>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <Icon
                  d={icons.search}
                  size={16}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search version, ID, or publisher…"
                  className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${theme.input || theme.card} ${theme.border}`}
                />
              </div>

              <div className={`flex rounded-xl border p-1 ${theme.border}`}>
                {["ALL", "ACTIVE", "ARCHIVED"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                      statusFilter === status
                        ? "bg-emerald-600 text-white"
                        : `${theme.textMuted} hover:bg-emerald-50 dark:hover:bg-emerald-950/20`
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left">
              <thead>
                <tr className={`border-b text-[11px] uppercase tracking-wider ${theme.border} ${theme.textMuted}`}>
                  <th className="px-5 py-3 font-semibold">Version</th>
                  <th className="px-5 py-3 font-semibold">Published</th>
                  <th className="px-5 py-3 font-semibold">Records</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className={`px-5 py-16 text-center text-sm ${theme.textMuted}`}>
                      Loading registry history…
                    </td>
                  </tr>
                ) : filteredVersions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-5 py-16 text-center ${theme.textMuted}`}>
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                        <Icon d={icons.history} size={18} />
                      </div>
                      <p className="mt-3 text-sm font-semibold">No matching versions</p>
                      <p className="mt-1 text-xs">
                        Try another search or status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredVersions.map((version) => {
                    const isSelected = selectedId === version.id;
                    const publishedAt =
                      version.uploadedAt ||
                      version.publishedAt ||
                      version.createdAt;

                    return (
                      <tr
                        key={version.id}
                        onClick={() => setSelectedId(version.id)}
                        className={`cursor-pointer border-b last:border-b-0 transition ${theme.border} ${
                          isSelected
                            ? "bg-emerald-50/70 dark:bg-emerald-950/10"
                            : "hover:bg-gray-50 dark:hover:bg-gray-900/30"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                                version.isActive
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                              }`}
                            >
                              <Icon
                                d={version.isActive ? icons.check : icons.history}
                                size={15}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">
                                {version.versionLabel ||
                                  version.version ||
                                  "Unnamed version"}
                              </p>
                              <p className={`mt-1 truncate text-[11px] ${theme.textMuted}`}>
                                ID: {version.id || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium">
                            {formatDate(publishedAt)}
                          </p>
                          <p className={`mt-1 text-[11px] ${theme.textMuted}`}>
                            {formatDate(publishedAt, true)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold">
                            {getRecordCount(version).toLocaleString()}
                          </p>
                          <p className={`mt-1 text-[11px] ${theme.textMuted}`}>
                            registry records
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <Badge status={version.isActive ? "ACTIVE" : "ARCHIVED"} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          {!version.isActive ? (
                            <Btn
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivate(version);
                              }}
                              disabled={Boolean(activatingId)}
                            >
                              {activatingId === version.id
                                ? "Activating…"
                                : "Activate"}
                            </Btn>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              Current
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className={`flex flex-col gap-2 border-t px-5 py-4 text-xs sm:flex-row sm:items-center sm:justify-between ${theme.border} ${theme.textMuted}`}>
            <span>
              Showing {filteredVersions.length} of {versions.length} versions
            </span>
            <span>
              {totalRecordsAcrossVersions.toLocaleString()} records across all snapshots
            </span>
          </div>
        </section>

        {/* Detail panel */}
        <aside
          className={`overflow-hidden rounded-3xl border shadow-sm ${theme.card} ${theme.border}`}
        >
          <div className={`border-b p-5 ${theme.border}`}>
            <p className="text-base font-bold">Version details</p>
            <p className={`mt-1 text-xs ${theme.textMuted}`}>
              Registry snapshot selected from the history.
            </p>
          </div>

          {selectedVersion ? (
            <div className="p-5">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
                      Registry version
                    </p>
                    <h3 className="mt-2 break-words text-xl font-bold">
                      {selectedVersion.versionLabel ||
                        selectedVersion.version ||
                        "Unnamed version"}
                    </h3>
                  </div>
                  <Icon d={icons.database} size={22} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-100">
                      Records
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {getRecordCount(selectedVersion).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-100">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      {selectedVersion.isActive ? "Active" : "Archived"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <div className={`flex items-center justify-between gap-4 border-b py-3 ${theme.border}`}>
                  <span className={`text-xs ${theme.textMuted}`}>Version ID</span>
                  <span className="max-w-[60%] break-all text-right text-xs font-semibold">
                    {selectedVersion.id || "—"}
                  </span>
                </div>

                <div className={`flex items-center justify-between gap-4 border-b py-3 ${theme.border}`}>
                  <span className={`text-xs ${theme.textMuted}`}>Uploaded</span>
                  <span className="text-right text-xs font-semibold">
                    {formatDate(
                      selectedVersion.uploadedAt ||
                        selectedVersion.createdAt ||
                        selectedVersion.publishedAt,
                      true
                    )}
                  </span>
                </div>

                <div className={`flex items-center justify-between gap-4 border-b py-3 ${theme.border}`}>
                  <span className={`text-xs ${theme.textMuted}`}>Publisher</span>
                  <span className="max-w-[60%] truncate text-right text-xs font-semibold">
                    {selectedVersion.uploadedBy?.fullName ||
                      selectedVersion.uploadedBy?.name ||
                      selectedVersion.createdBy?.fullName ||
                      selectedVersion.createdBy?.name ||
                      "NAFDAC"}
                  </span>
                </div>

                <div className={`flex items-center justify-between gap-4 py-3`}>
                  <span className={`text-xs ${theme.textMuted}`}>Registry state</span>
                  <Badge
                    status={selectedVersion.isActive ? "ACTIVE" : "ARCHIVED"}
                  />
                </div>
              </div>

              {!selectedVersion.isActive && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                  <div className="flex items-start gap-3">
                    <Icon
                      d={icons.alert}
                      size={16}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                        Archived snapshot
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-amber-700 dark:text-amber-400">
                        Activating this version will make it the registry used
                        for subsequent verification.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5">
                {!selectedVersion.isActive ? (
                  <Btn
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => handleActivate(selectedVersion)}
                    disabled={Boolean(activatingId)}
                  >
                    {activatingId === selectedVersion.id
                      ? "Activating version…"
                      : "Make active version"}
                  </Btn>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
                    <Icon d={icons.check} size={15} />
                    This is the active registry
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`flex min-h-[320px] items-center justify-center p-8 text-center ${theme.textMuted}`}>
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                  <Icon d={icons.history} size={19} />
                </div>
                <p className="mt-3 text-sm font-semibold">No version selected</p>
                <p className="mt-1 text-xs">
                  Select a registry version from the history table.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default RegistryHistory;