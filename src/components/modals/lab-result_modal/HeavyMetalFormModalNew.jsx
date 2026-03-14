import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Beaker,
  X,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Info,
  ChevronDown,
  Activity,
} from "lucide-react";
import api from "../../../utils/api";
import {
  batchAddXRFReadings,
  getSampleReadings,
  clearHeavyMetalState,
} from "../../../redux/slice/heavyMetalSlice";
import { useTheme } from "../../../context/ThemeContext";
import { useEnums } from "../../../context/EnumsContext";

const AUTHORITIES = {
  NAFDAC: {
    label: "NAFDAC",
    full: "Nat'l Agency for Food & Drug Admin. and Control",
  },
  SON: {
    label: "SON",
    full: "Standards Organisation of Nigeria",
  },
  WHO: {
    label: "WHO",
    full: "World Health Organization",
  },
};

const STATUS_CONFIG = {
  SAFE: {
    label: "Safe",
    icon: ShieldCheck,
    row: "bg-emerald-50 dark:bg-emerald-900/10",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  MODERATE: {
    label: "Moderate",
    icon: ShieldAlert,
    row: "bg-amber-50 dark:bg-amber-900/10",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    dot: "bg-amber-400",
  },
  CONTAMINATED: {
    label: "Contaminated",
    icon: ShieldX,
    row: "bg-red-50 dark:bg-red-900/10",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    dot: "bg-red-500",
  },
  UNKNOWN: {
    label: "Pending",
    icon: Activity,
    row: "",
    badge: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    dot: "bg-gray-400",
  },
};

const HeavyMetalFormModalNew = ({
  onClose,
  sampleId,
  existingReadings = [],
  sampleData = null,
}) => {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector(
    (state) => state.heavyMetal
  );

  const [sample, setSample] = useState(null);
  const [thresholds, setThresholds] = useState([]);
  const [loadingSample, setLoadingSample] = useState(true);
  const [sampleError, setSampleError] = useState(null);
  const [activeAuthority, setActiveAuthority] = useState("NAFDAC");

  const { theme } = useTheme();
  const { heavyMetals: enumsHeavyMetals, heavyMetalLabels } = useEnums();

  const heavyMetals = enumsHeavyMetals?.length
    ? enumsHeavyMetals
    : ["LEAD", "MERCURY", "CADMIUM", "ARSENIC", "CHROMIUM", "NICKEL"];

  const metalLabels =
    Object.keys(heavyMetalLabels || {}).length
      ? heavyMetalLabels
      : {
          LEAD: "Lead (Pb)",
          MERCURY: "Mercury (Hg)",
          CADMIUM: "Cadmium (Cd)",
          ARSENIC: "Arsenic (As)",
          CHROMIUM: "Chromium (Cr)",
          NICKEL: "Nickel (Ni)",
        };

  const [readings, setReadings] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoadingSample(true);
        setSampleError(null);
        if (sampleData) {
          setSample(sampleData);
        } else {
          const r = await api.get(`/samples/${sampleId}`);
          if (r.data.success) setSample(r.data.data);
        }
        const tr = await api.get("/thresholds");
        if (tr.data.success) setThresholds(tr.data.data || []);
        if (existingReadings?.length) {
          setReadings(
            existingReadings.map((r) => ({
              heavyMetal: r.heavyMetal,
              xrfReading: r.xrfReading || "",
              xrfNotes: r.xrfNotes || "",
            }))
          );
        }
      } catch (err) {
        setSampleError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load sample information"
        );
      } finally {
        setLoadingSample(false);
      }
    };
    init();
  }, [sampleId]);

  useEffect(
    () => () => {
      dispatch(clearHeavyMetalState());
    },
    [dispatch]
  );

  const getUnit = () =>
    sample?.sampleType === "LIQUID" ? "mg/L" : "mg/kg";

  const getThreshold = (metal) => {
    if (!sample) return null;
    return thresholds.find(
      (t) =>
        t.heavyMetal === metal &&
        t.productCategoryId === sample.productVariant?.categoryId
    );
  };

  const getStatus = (reading, metal) => {
    const threshold = getThreshold(metal);
    if (!threshold || !reading) return "UNKNOWN";
    const v = parseFloat(reading);
    if (v < threshold.safeLimit) return "SAFE";
    if (threshold.warningLimit && v < threshold.warningLimit) return "MODERATE";
    if (v < threshold.dangerLimit) return "MODERATE";
    return "CONTAMINATED";
  };

  const getWorstLevel = () => {
    if (!readings.length) return "unknown";
    const s = readings.map((r) => getStatus(r.xrfReading, r.heavyMetal));
    if (s.includes("CONTAMINATED")) return "dangerous";
    if (s.includes("MODERATE")) return "elevated";
    return "safe";
  };

  const addReading = () => {
    const used = readings.map((r) => r.heavyMetal);
    const next = heavyMetals.find((m) => !used.includes(m));
    if (next)
      setReadings([...readings, { heavyMetal: next, xrfReading: "", xrfNotes: "" }]);
  };

  const removeReading = (i) =>
    setReadings(readings.filter((_, idx) => idx !== i));

  const updateReading = (i, field, value) => {
    const upd = [...readings];
    upd[i] = { ...upd[i], [field]: value };
    setReadings(upd);
  };

  const changeMetal = (i, metal) => {
    const conflict = readings.some((r, idx) => idx !== i && r.heavyMetal === metal);
    if (conflict) { alert("This metal is already selected"); return; }
    updateReading(i, "heavyMetal", metal);
  };

  const handleSubmit = async () => {
    if (!readings.length) { alert("Please add at least one reading"); return; }
    if (!readings.every((r) => r.heavyMetal && r.xrfReading)) {
      alert("Please fill in all required fields"); return;
    }
    try {
      await dispatch(
        batchAddXRFReadings({
          sampleId,
          readings: readings.map((r) => ({
            heavyMetal: r.heavyMetal,
            xrfReading: r.xrfReading,
            xrfNotes: r.xrfNotes || "",
          })),
        })
      ).unwrap();
      await dispatch(getSampleReadings(sampleId));
      onClose();
    } catch (err) {
      alert("Failed to save readings: " + (err?.message || "Unknown error"));
    }
  };

  const counts = readings.reduce(
    (acc, r) => {
      const s = getStatus(r.xrfReading, r.heavyMetal);
      if (s === "SAFE") acc.safe++;
      else if (s === "MODERATE") acc.moderate++;
      else if (s === "CONTAMINATED") acc.danger++;
      else acc.pending++;
      return acc;
    },
    { safe: 0, moderate: 0, danger: 0, pending: 0 }
  );

  const authority = AUTHORITIES[activeAuthority];
  const worst = getWorstLevel();

  const inputCls = `w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border ${theme?.border} ${theme?.card} ${theme?.text} text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition`;

  if (loadingSample) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[5000] p-4">
        <div className={`${theme?.card} rounded-2xl shadow-2xl p-8 text-center w-full max-w-xs`}>
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className={`text-sm ${theme?.textMuted}`}>Loading sample information…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[5000] sm:p-4">
      <div
        className={`
          ${theme?.card} border ${theme?.border} shadow-2xl
          flex flex-col w-full overflow-hidden
          rounded-t-2xl sm:rounded-2xl
          h-[96vh] sm:h-auto sm:max-h-[92vh]
          sm:max-w-5xl
        `}
      >
        <div
          className={`${theme?.card} border-b ${theme?.border} px-4 sm:px-5 py-3 flex-shrink-0 flex items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Beaker className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-xs sm:text-sm font-semibold ${theme?.text} leading-none`}>
                Heavy Metal Analysis
              </h2>
              <p className={`text-xs ${theme?.textMuted} mt-0.5 hidden sm:block truncate`}>
                XRF Screening · {authority.full}
              </p>
              <p className={`text-xs ${theme?.textMuted} mt-0.5 sm:hidden`}>
                XRF · {activeAuthority}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div
              className={`flex items-center p-0.5 sm:p-1 rounded-lg border ${theme?.border} bg-gray-50 dark:bg-gray-800/60 gap-0.5 sm:gap-1`}
            >
              {Object.keys(AUTHORITIES).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveAuthority(key)}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    activeAuthority === key
                      ? "bg-emerald-600 text-white shadow-sm"
                      : `${theme?.textMuted} hover:text-gray-900 dark:hover:text-gray-100`
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${theme?.textMuted} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">

          {(sampleError || error || successMessage) && (
            <div className="px-4 sm:px-5 pt-4 space-y-2">
              {(sampleError || error) && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2.5 rounded-lg text-xs sm:text-sm">
                  {sampleError || error}
                </div>
              )}
              {successMessage && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 px-3 py-2.5 rounded-lg text-xs sm:text-sm">
                  {successMessage}
                </div>
              )}
            </div>
          )}

          <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">

            {sample && (
              <div className={`rounded-xl border ${theme?.border} overflow-hidden`}>
                <div
                  className={`px-3 sm:px-4 py-2 ${theme.bg} border-b ${theme?.border} flex items-center gap-2`}
                >
                  <Info className={`w-3 h-3 ${theme?.textMuted} flex-shrink-0`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${theme?.textMuted}`}>
                    Sample Details
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 dark:divide-gray-700/60">
                  {[
                    { label: "Sample ID", value: sample.sampleId, mono: true },
                    { label: "Product", value: sample.productName },
                    { label: "Type", value: sample.sampleType },
                    { label: "Unit", value: getUnit(), highlight: true },
                  ].map(({ label, value, mono, highlight }) => (
                    <div key={label} className="px-3 sm:px-4 py-2.5">
                      <p className={`text-xs font-medium uppercase tracking-wide ${theme?.textMuted}`}>
                        {label}
                      </p>
                      <p
                        className={`mt-0.5 text-xs sm:text-sm font-semibold truncate ${
                          highlight
                            ? "text-emerald-600 dark:text-emerald-400"
                            : theme?.text
                        } ${mono ? "font-mono" : ""}`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {readings.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { label: "Safe", count: counts.safe, cfg: STATUS_CONFIG.SAFE },
                  { label: "Moderate", count: counts.moderate, cfg: STATUS_CONFIG.MODERATE },
                  { label: "Contaminated", count: counts.danger, cfg: STATUS_CONFIG.CONTAMINATED },
                  { label: "Pending", count: counts.pending, cfg: STATUS_CONFIG.UNKNOWN },
                ].map(({ label, count, cfg }) =>
                  count > 0 ? (
                    <span
                      key={label}
                      className={`inline-flex items-center gap-1.5 ${cfg.badge} text-xs font-semibold px-2.5 py-1 rounded-full`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                      {count} {label}
                    </span>
                  ) : null
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme?.textMuted}`}>
                  XRF Readings
                  {readings.length > 0 && (
                    <span className={`ml-1.5 font-bold text-sm ${theme?.text}`}>
                      ({readings.length})
                    </span>
                  )}
                </h3>
                <button
                  onClick={addReading}
                  disabled={readings.length >= heavyMetals.length}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition shadow-sm hover:shadow-md"
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Add Metal
                </button>
              </div>

              {readings.length === 0 ? (
                <div className={`rounded-xl border-2 border-dashed ${theme?.border} py-10 sm:py-12 text-center`}>
                  <div className="w-11 h-11 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Beaker className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className={`${theme?.text} font-semibold text-sm`}>No readings added yet</p>
                  <p className={`${theme?.textMuted} text-xs mt-1`}>
                    Tap "Add Metal" to start recording XRF data
                  </p>
                </div>
              ) : (
                <div className={`rounded-xl border ${theme?.border} overflow-hidden`}>

                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className={`border-b ${theme?.border} ${theme.bg}`}>
                          {[
                            "Heavy Metal",
                            `XRF Reading (${getUnit()})`,
                            `${activeAuthority} Threshold`,
                            "Status",
                            "Notes",
                            "",
                          ].map((col) => (
                            <th
                              key={col}
                              className={`px-3 lg:px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider ${theme?.textMuted} whitespace-nowrap`}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                        {readings.map((reading, index) => {
                          const threshold = getThreshold(reading.heavyMetal);
                          const status = getStatus(reading.xrfReading, reading.heavyMetal);
                          const cfg = STATUS_CONFIG[status];

                          return (
                            <tr key={index} className={`transition-colors ${cfg.row}`}>
                              <td className="px-3 lg:px-4 py-2.5 w-40 lg:w-44">
                                <div className="relative">
                                  <select
                                    value={reading.heavyMetal}
                                    onChange={(e) => changeMetal(index, e.target.value)}
                                    className={`appearance-none w-full pl-2.5 pr-6 py-1.5 rounded-lg border ${theme?.border} ${theme?.card} ${theme?.text} text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition`}
                                  >
                                    <option value="">Select…</option>
                                    {heavyMetals.map((m) => {
                                      const used = readings.some(
                                        (r, i) => i !== index && r.heavyMetal === m
                                      );
                                      return (
                                        <option key={m} value={m} disabled={used}>
                                          {metalLabels[m]}{used ? " ✓" : ""}
                                        </option>
                                      );
                                    })}
                                  </select>
                                  <ChevronDown className={`pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 ${theme?.textMuted}`} />
                                </div>
                              </td>

                              <td className="px-3 lg:px-4 py-2.5 w-36 lg:w-44">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={reading.xrfReading}
                                  onChange={(e) =>
                                    updateReading(index, "xrfReading", e.target.value)
                                  }
                                  placeholder="0.000"
                                  className={`w-full px-2.5 py-1.5 rounded-lg border ${theme?.border} ${theme?.card} ${theme?.text} text-xs lg:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400 transition`}
                                />
                              </td>

                              <td className="px-3 lg:px-4 py-2.5">
                                {threshold ? (
                                  <div className={`text-xs ${theme?.textMuted} space-y-0.5`}>
                                    <p>Safe <span className={`font-semibold ${theme?.text}`}>&lt;{threshold.safeLimit}</span></p>
                                    {threshold.warningLimit && (
                                      <p>Warn <span className={`font-semibold ${theme?.text}`}>{threshold.warningLimit}</span></p>
                                    )}
                                    <p>Danger <span className={`font-semibold ${theme?.text}`}>&gt;{threshold.dangerLimit}</span></p>
                                  </div>
                                ) : (
                                  <span className={`text-xs ${theme?.textMuted} italic`}>Not set</span>
                                )}
                              </td>

                              <td className="px-3 lg:px-4 py-2.5 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 ${cfg.badge} px-2 py-1 rounded-full text-xs font-semibold`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                                  {reading.xrfReading ? cfg.label : "Pending"}
                                </span>
                              </td>

                              <td className="px-3 lg:px-4 py-2.5">
                                <input
                                  type="text"
                                  value={reading.xrfNotes}
                                  onChange={(e) =>
                                    updateReading(index, "xrfNotes", e.target.value)
                                  }
                                  placeholder="Optional…"
                                  className={`w-full px-2.5 py-1.5 rounded-lg border ${theme?.border} ${theme?.card} ${theme?.text} text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-400 transition`}
                                />
                              </td>

                              <td className="px-2 lg:px-3 py-2.5">
                                <button
                                  onClick={() => removeReading(index)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700/60">
                    {readings.map((reading, index) => {
                      const threshold = getThreshold(reading.heavyMetal);
                      const status = getStatus(reading.xrfReading, reading.heavyMetal);
                      const cfg = STATUS_CONFIG[status];

                      return (
                        <div key={index} className={`p-3.5 space-y-3 ${cfg.row}`}>
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1.5 ${cfg.badge} px-2.5 py-1 rounded-full text-xs font-semibold`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {reading.xrfReading ? cfg.label : "Pending"}
                            </span>
                            <button
                              onClick={() => removeReading(index)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <label className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted} block mb-1.5`}>
                              Heavy Metal
                            </label>
                            <div className="relative">
                              <select
                                value={reading.heavyMetal}
                                onChange={(e) => changeMetal(index, e.target.value)}
                                className={`appearance-none w-full pl-3 pr-8 py-2 rounded-lg border ${theme?.border} ${theme?.card} ${theme?.text} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition`}
                              >
                                {heavyMetals.map((m) => {
                                  const used = readings.some(
                                    (r, i) => i !== index && r.heavyMetal === m
                                  );
                                  return (
                                    <option key={m} value={m} disabled={used}>
                                      {metalLabels[m]}{used ? " ✓" : ""}
                                    </option>
                                  );
                                })}
                              </select>
                              <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${theme?.textMuted}`} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted} block mb-1.5`}>
                                XRF ({getUnit()})
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={reading.xrfReading}
                                onChange={(e) =>
                                  updateReading(index, "xrfReading", e.target.value)
                                }
                                placeholder="0.000"
                                className={`${inputCls} font-mono`}
                              />
                            </div>
                            {threshold ? (
                              <div>
                                <label className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted} block mb-1.5`}>
                                  {activeAuthority} Limits
                                </label>
                                <div className={`text-xs ${theme?.textMuted} space-y-0.5 mt-2`}>
                                  <p>Safe <span className={`font-semibold ${theme?.text}`}>&lt;{threshold.safeLimit}</span></p>
                                  <p>Danger <span className={`font-semibold ${theme?.text}`}>&gt;{threshold.dangerLimit}</span></p>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <label className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted} block mb-1.5`}>
                                  {activeAuthority} Limits
                                </label>
                                <span className={`text-xs ${theme?.textMuted} italic`}>Not set</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className={`text-xs font-semibold uppercase tracking-wide ${theme?.textMuted} block mb-1.5`}>
                              Notes (optional)
                            </label>
                            <input
                              type="text"
                              value={reading.xrfNotes}
                              onChange={(e) =>
                                updateReading(index, "xrfNotes", e.target.value)
                              }
                              placeholder="Add observations…"
                              className={inputCls}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={`px-3 sm:px-4 py-2.5 border-t ${theme?.border} ${theme.bg} flex items-center justify-between`}
                  >
                    <p className={`text-xs ${theme?.textMuted}`}>
                      <span className="font-semibold">{readings.length}</span>{" "}
                      reading{readings.length !== 1 ? "s" : ""} recorded
                    </p>
                    <p className={`text-xs ${theme?.textMuted}`}>
                      Standard:{" "}
                      <span className={`font-semibold ${theme?.text}`}>{activeAuthority}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {worst !== "safe" && worst !== "unknown" && readings.length > 0 && (
              <div
                className={`rounded-xl border-l-4 px-4 py-3.5 flex items-start gap-3 ${
                  worst === "dangerous"
                    ? "bg-red-50 dark:bg-red-900/10 border-red-500"
                    : "bg-amber-50 dark:bg-amber-900/10 border-amber-400"
                }`}
              >
                <AlertTriangle
                  className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${
                    worst === "dangerous" ? "text-red-500" : "text-amber-500"
                  }`}
                />
                <div className="min-w-0">
                  <p
                    className={`font-semibold text-xs sm:text-sm ${
                      worst === "dangerous"
                        ? "text-red-800 dark:text-red-200"
                        : "text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    {worst === "dangerous"
                      ? "Critical Contamination Detected"
                      : "Elevated Levels Detected"}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      worst === "dangerous"
                        ? "text-red-700 dark:text-red-300"
                        : "text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    One or more readings exceed {activeAuthority} safe limits.
                    Please review all values before submitting. This report will
                    be flagged for supervisor review.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`px-4 sm:px-5 py-3.5 border-t ${theme?.border} bg-gray-50 dark:bg-gray-900/40 flex-shrink-0`}
        >
          <div className="flex gap-2.5 sm:gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2.5 rounded-xl border ${theme?.border} ${theme?.card} ${theme?.text} font-semibold text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
            >
              Cancel
            </button>
            <button
              disabled={loading || readings.length === 0}
              onClick={handleSubmit}
              className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 ${
                loading || readings.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : worst === "dangerous"
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : worst === "elevated"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  : "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>
                    Save {readings.length || ""} Reading{readings.length !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeavyMetalFormModalNew;