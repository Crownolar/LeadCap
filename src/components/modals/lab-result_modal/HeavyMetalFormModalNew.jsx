import React, { useEffect, useState } from "react";
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
import { useNavigate } from "react-router";

const STATUS_CONFIG = {
  SAFE: {
    label: "Safe",
    icon: ShieldCheck,
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    row: "bg-emerald-50/30 dark:bg-emerald-950/10",
  },

  MODERATE: {
    label: "Moderate",
    icon: ShieldAlert,
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    row: "bg-amber-50/30 dark:bg-amber-950/10",
  },

  CONTAMINATED: {
    label: "Contaminated",
    icon: ShieldX,
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
    row: "bg-red-50/30 dark:bg-red-950/10",
  },

  UNKNOWN: {
    label: "Pending",
    icon: Activity,
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    row: "",
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
    (state) => state.heavyMetal,
  );

  const navigate = useNavigate();
  const { theme } = useTheme();

  const { heavyMetals: enumsHeavyMetals, heavyMetalLabels } = useEnums();

  const [sample, setSample] = useState(null);

  const [thresholds, setThresholds] = useState([]);

  const [loadingSample, setLoadingSample] = useState(true);

  const [sampleError, setSampleError] = useState(null);

  const [readings, setReadings] = useState([]);

  const heavyMetals = enumsHeavyMetals?.length
    ? enumsHeavyMetals
    : ["LEAD", "MERCURY", "CADMIUM", "ARSENIC", "CHROMIUM", "NICKEL"];

  const metalLabels = Object.keys(heavyMetalLabels || {}).length
    ? heavyMetalLabels
    : {
        LEAD: "Lead (Pb)",
        MERCURY: "Mercury (Hg)",
        CADMIUM: "Cadmium (Cd)",
        ARSENIC: "Arsenic (As)",
        CHROMIUM: "Chromium (Cr)",
        NICKEL: "Nickel (Ni)",
      };

  /* ---------------------------------------------------------------------- */
  /* Load sample + thresholds                                               */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const init = async () => {
      try {
        setLoadingSample(true);
        setSampleError(null);

        if (sampleData) {
          setSample(sampleData);
        } else {
          const response = await api.get(`/samples/${sampleId}`);

          if (response.data.success) {
            setSample(response.data.data);
          }
        }

        const thresholdResponse = await api.get("/thresholds");

        if (thresholdResponse.data.success) {
          setThresholds(thresholdResponse.data.data || []);
        }

        if (existingReadings?.length) {
          setReadings(
            existingReadings.map((reading) => ({
              heavyMetal: reading.heavyMetal,
              xrfReading: reading.xrfReading || "",
              xrfNotes: reading.xrfNotes || "",
            })),
          );
        }
      } catch (err) {
        setSampleError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load sample information",
        );
      } finally {
        setLoadingSample(false);
      }
    };

    init();
  }, [sampleId, sampleData]);

  /* ---------------------------------------------------------------------- */
  /* Cleanup                                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      dispatch(clearHeavyMetalState());
    };
  }, [dispatch]);

  /* ---------------------------------------------------------------------- */
  /* Threshold helpers                                                      */
  /* ---------------------------------------------------------------------- */

  const getUnit = () => "ppm";

  const getThreshold = (metal) => {
    if (!sample) return null;

    return thresholds.find(
      (threshold) =>
        threshold.heavyMetal === metal &&
        threshold.productCategoryId === sample.productVariant?.categoryId,
    );
  };

  const getStatus = (reading, metal) => {
    const threshold = getThreshold(metal);

    if (
      !threshold ||
      reading === "" ||
      reading === null ||
      reading === undefined
    ) {
      return "UNKNOWN";
    }

    const value = parseFloat(reading);

    if (!Number.isFinite(value)) {
      return "UNKNOWN";
    }

    if (value < threshold.safeLimit) {
      return "SAFE";
    }

    if (threshold.warningLimit && value < threshold.warningLimit) {
      return "MODERATE";
    }

    if (value < threshold.dangerLimit) {
      return "MODERATE";
    }

    return "CONTAMINATED";
  };

  const getWorstLevel = () => {
    if (!readings.length) {
      return "unknown";
    }

    const statuses = readings.map((reading) =>
      getStatus(reading.xrfReading, reading.heavyMetal),
    );

    if (statuses.includes("CONTAMINATED")) {
      return "dangerous";
    }

    if (statuses.includes("MODERATE")) {
      return "elevated";
    }

    return "safe";
  };

  /* ---------------------------------------------------------------------- */
  /* Reading manipulation                                                   */
  /* ---------------------------------------------------------------------- */

  const addReading = () => {
    const usedMetals = readings.map((reading) => reading.heavyMetal);

    const nextMetal = heavyMetals.find((metal) => !usedMetals.includes(metal));

    if (nextMetal) {
      setReadings([
        ...readings,
        {
          heavyMetal: nextMetal,
          xrfReading: "",
          xrfNotes: "",
        },
      ]);
    }
  };

  const removeReading = (index) => {
    setReadings(readings.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateReading = (index, field, value) => {
    const updated = [...readings];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setReadings(updated);
  };

  const changeMetal = (index, metal) => {
    const alreadySelected = readings.some(
      (reading, currentIndex) =>
        currentIndex !== index && reading.heavyMetal === metal,
    );

    if (alreadySelected) {
      alert("This metal is already selected");
      return;
    }

    updateReading(index, "heavyMetal", metal);
  };

  /* ---------------------------------------------------------------------- */
  /* Submit                                                                  */
  /* ---------------------------------------------------------------------- */

  const handleSubmit = async () => {
    if (!readings.length) {
      alert("Please add at least one reading");
      return;
    }

    if (
      !readings.every(
        (reading) => reading.heavyMetal && reading.xrfReading !== "",
      )
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await dispatch(
        batchAddXRFReadings({
          sampleId,
          readings: readings.map((reading) => ({
            heavyMetal: reading.heavyMetal,
            xrfReading: reading.xrfReading,
            xrfNotes: reading.xrfNotes || "",
          })),
        }),
      ).unwrap();

      await dispatch(getSampleReadings(sampleId));

      setTimeout(() => {
        navigate(0);
      }, 1000);

      onClose();
    } catch (err) {
      alert("Failed to save readings: " + (err?.message || "Unknown error"));
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Counts                                                                  */
  /* ---------------------------------------------------------------------- */

  const counts = readings.reduce(
    (accumulator, reading) => {
      const status = getStatus(reading.xrfReading, reading.heavyMetal);

      if (status === "SAFE") {
        accumulator.safe++;
      } else if (status === "MODERATE") {
        accumulator.moderate++;
      } else if (status === "CONTAMINATED") {
        accumulator.danger++;
      } else {
        accumulator.pending++;
      }

      return accumulator;
    },
    {
      safe: 0,
      moderate: 0,
      danger: 0,
      pending: 0,
    },
  );

  const worst = getWorstLevel();

  /* ---------------------------------------------------------------------- */
  /* Shared classes                                                          */
  /* ---------------------------------------------------------------------- */

  const inputClass = `
    w-full
    rounded-xl
    border
    px-3
    py-2.5
    text-xs
    sm:text-sm
    outline-none
    transition
    ${theme?.border}
    ${theme?.card}
    ${theme?.text}
    focus:ring-2
    focus:ring-emerald-500/30
    placeholder:text-slate-400
    dark:placeholder:text-slate-500
  `;

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                 */
  /* ---------------------------------------------------------------------- */

  if (loadingSample) {
    return (
      <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
        <div
          className={`
            w-full
            max-w-xs
            rounded-2xl
            border
            p-7
            text-center
            shadow-2xl
            ${theme?.border}
            ${theme?.card}
          `}
        >
          <div
            className="
              mx-auto
              flex h-11 w-11
              items-center justify-center
              rounded-xl
              bg-emerald-50
              dark:bg-emerald-950/30
            "
          >
            <Beaker
              className="
                h-5 w-5
                animate-pulse
                text-emerald-600
                dark:text-emerald-400
              "
            />
          </div>

          <p
            className={`
              mt-4
              text-sm
              font-semibold
              ${theme?.text}
            `}
          >
            Loading sample
          </p>

          <p
            className={`
              mt-1
              text-[10px]
              ${theme?.textMuted}
            `}
          >
            Preparing XRF analysis...
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Modal                                                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className="
        fixed
        inset-0
        z-[5000]
        flex
        items-end
        justify-center
        bg-slate-950/60
        backdrop-blur-sm
        sm:items-center
        sm:p-4
      "
    >
      <div
        className={`
          flex
          h-[96vh]
          w-full
          flex-col
          overflow-hidden
          rounded-t-2xl
          border
          shadow-2xl
          sm:h-auto
          sm:max-h-[92vh]
          sm:max-w-5xl
          sm:rounded-2xl
          ${theme?.card}
          ${theme?.border}
        `}
      >
        {/* ================================================================ */}
        {/* Header                                                           */}
        {/* ================================================================ */}

        <header
          className={`
            flex
            shrink-0
            items-center
            justify-between
            gap-3
            border-b
            px-4
            py-3.5
            sm:px-5
            ${theme?.border}
          `}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex
                h-9 w-9
                shrink-0
                items-center justify-center
                rounded-xl
                bg-emerald-600
              "
            >
              <Beaker className="h-4 w-4 text-white" />
            </div>

            <div className="min-w-0">
              <h2
                className={`
                  truncate
                  text-sm
                  font-bold
                  ${theme?.text}
                `}
              >
                Heavy Metal Analysis
              </h2>

              <p
                className={`
                  mt-0.5
                  truncate
                  text-[10px]
                  ${theme?.textMuted}
                `}
              >
                Record XRF screening results for this sample
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`
              flex h-8 w-8
              shrink-0
              items-center justify-center
              rounded-lg
              ${theme?.textMuted}
              ${theme?.hover}
            `}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* ================================================================ */}
        {/* Scrollable body                                                   */}
        {/* ================================================================ */}

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Alerts */}

          {(sampleError || error || successMessage) && (
            <div className="space-y-2 px-4 pt-4 sm:px-5">
              {(sampleError || error) && (
                <div
                  className="
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-3.5
                    py-3
                    text-xs
                    leading-5
                    text-red-700
                    dark:border-red-900/50
                    dark:bg-red-950/20
                    dark:text-red-300
                  "
                >
                  {sampleError || error}
                </div>
              )}

              {successMessage && (
                <div
                  className="
                    rounded-xl
                    border
                    border-emerald-200
                    bg-emerald-50
                    px-3.5
                    py-3
                    text-xs
                    leading-5
                    text-emerald-700
                    dark:border-emerald-900/50
                    dark:bg-emerald-950/20
                    dark:text-emerald-300
                  "
                >
                  {successMessage}
                </div>
              )}
            </div>
          )}

          <div className="space-y-5 p-4 sm:p-5 lg:p-6">
            {/* ============================================================ */}
            {/* Sample information                                            */}
            {/* ============================================================ */}

            {sample && (
              <section
                className={`
                  overflow-hidden
                  rounded-2xl
                  border
                  ${theme?.border}
                `}
              >
                <div
                  className={`
                    flex
                    items-center
                    gap-2
                    border-b
                    px-4
                    py-3
                    ${theme?.border}
                    ${theme?.bg}
                  `}
                >
                  <Info
                    className={`
                      h-3.5 w-3.5
                      ${theme?.emeraldText}
                    `}
                  />

                  <div>
                    <h3
                      className={`
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        ${theme?.text}
                      `}
                    >
                      Sample information
                    </h3>

                    <p
                      className={`
                        mt-0.5
                        text-[9px]
                        ${theme?.textMuted}
                      `}
                    >
                      Sample currently under laboratory analysis
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 dark:divide-slate-800 sm:grid-cols-4 sm:divide-y-0">
                  <SampleInfo
                    label="Sample ID"
                    value={sample?.code || "—"}
                    mono
                    theme={theme}
                  />

                  <SampleInfo
                    label="Product"
                    value={sample?.productName || "—"}
                    theme={theme}
                  />

                  <SampleInfo
                    label="Category"
                    value={sample?.productVariant?.category?.displayName || "—"}
                    theme={theme}
                  />

                  <SampleInfo
                    label="Unit"
                    value={getUnit()}
                    highlight
                    theme={theme}
                  />
                </div>
              </section>
            )}

            {/* ============================================================ */}
            {/* Status summary                                                 */}
            {/* ============================================================ */}

            {readings.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <StatusSummary
                  label="Safe"
                  count={counts.safe}
                  config={STATUS_CONFIG.SAFE}
                />

                <StatusSummary
                  label="Moderate"
                  count={counts.moderate}
                  config={STATUS_CONFIG.MODERATE}
                />

                <StatusSummary
                  label="Contaminated"
                  count={counts.danger}
                  config={STATUS_CONFIG.CONTAMINATED}
                />

                <StatusSummary
                  label="Pending"
                  count={counts.pending}
                  config={STATUS_CONFIG.UNKNOWN}
                />
              </div>
            )}

            {/* ============================================================ */}
            {/* Readings                                                       */}
            {/* ============================================================ */}

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3
                    className={`
                      text-xs
                      font-bold
                      ${theme?.text}
                    `}
                  >
                    XRF readings
                    {readings.length > 0 && (
                      <span
                        className={`
                          ml-1.5
                          text-[10px]
                          ${theme?.textMuted}
                        `}
                      >
                        {readings.length}
                      </span>
                    )}
                  </h3>

                  <p
                    className={`
                      mt-0.5
                      text-[9px]
                      ${theme?.textMuted}
                    `}
                  >
                    Enter measured heavy metal concentrations in ppm.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addReading}
                  disabled={readings.length >= heavyMetals.length}
                  className="
                    inline-flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-xl
                    bg-emerald-600
                    px-3
                    py-2
                    text-[10px]
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-emerald-700
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add metal
                </button>
              </div>

              {/* Empty state */}

              {readings.length === 0 ? (
                <div
                  className={`
                    rounded-2xl
                    border
                    border-dashed
                    px-5
                    py-12
                    text-center
                    ${theme?.border}
                  `}
                >
                  <div
                    className="
                      mx-auto
                      flex h-11 w-11
                      items-center justify-center
                      rounded-xl
                      bg-slate-100
                      text-slate-500
                      dark:bg-slate-800
                      dark:text-slate-400
                    "
                  >
                    <Beaker className="h-5 w-5" />
                  </div>

                  <p
                    className={`
                      mt-3
                      text-xs
                      font-bold
                      ${theme?.text}
                    `}
                  >
                    No readings yet
                  </p>

                  <p
                    className={`
                      mx-auto
                      mt-1
                      max-w-xs
                      text-[10px]
                      leading-5
                      ${theme?.textMuted}
                    `}
                  >
                    Add a heavy metal to begin recording laboratory results.
                  </p>

                  <button
                    type="button"
                    onClick={addReading}
                    className="
                      mt-4
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-xl
                      bg-emerald-600
                      px-3.5
                      py-2
                      text-[10px]
                      font-bold
                      text-white
                      hover:bg-emerald-700
                    "
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add first metal
                  </button>
                </div>
              ) : (
                <div
                  className={`
                    overflow-hidden
                    rounded-2xl
                    border
                    ${theme?.border}
                  `}
                >
                  {/* ====================================================== */}
                  {/* Desktop/tablet                                          */}
                  {/* ====================================================== */}

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[760px]">
                      <thead>
                        <tr
                          className={`
                            border-b
                            ${theme?.border}
                            ${theme?.bg}
                          `}
                        >
                          <TableHeading>Heavy metal</TableHeading>

                          <TableHeading>XRF reading</TableHeading>

                          <TableHeading>Threshold</TableHeading>

                          <TableHeading>Status</TableHeading>

                          <TableHeading>Notes</TableHeading>

                          <TableHeading />
                        </tr>
                      </thead>

                      <tbody>
                        {readings.map((reading, index) => {
                          const threshold = getThreshold(reading.heavyMetal);

                          const status = getStatus(
                            reading.xrfReading,
                            reading.heavyMetal,
                          );

                          const config = STATUS_CONFIG[status];

                          return (
                            <tr
                              key={index}
                              className={`
                                  border-b
                                  last:border-b-0
                                  ${theme?.border}
                                  ${config.row}
                                `}
                            >
                              {/* Metal */}

                              <td className="px-4 py-3">
                                <div className="relative w-40">
                                  <select
                                    value={reading.heavyMetal}
                                    onChange={(event) =>
                                      changeMetal(index, event.target.value)
                                    }
                                    className={`
                                        w-full
                                        appearance-none
                                        rounded-xl
                                        border
                                        px-3
                                        py-2
                                        pr-8
                                        text-xs
                                        font-semibold
                                        ${theme?.border}
                                        ${theme?.card}
                                        ${theme?.text}
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-emerald-500/30
                                      `}
                                  >
                                    <option value="">Select metal</option>

                                    {heavyMetals.map((metal) => {
                                      const used = readings.some(
                                        (item, currentIndex) =>
                                          currentIndex !== index &&
                                          item.heavyMetal === metal,
                                      );

                                      return (
                                        <option
                                          key={metal}
                                          value={metal}
                                          disabled={used}
                                        >
                                          {metalLabels[metal] || metal}
                                        </option>
                                      );
                                    })}
                                  </select>

                                  <ChevronDown
                                    className={`
                                        pointer-events-none
                                        absolute
                                        right-2.5
                                        top-1/2
                                        h-3.5
                                        w-3.5
                                        -translate-y-1/2
                                        ${theme?.textMuted}
                                      `}
                                  />
                                </div>
                              </td>

                              {/* Reading */}

                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={reading.xrfReading}
                                  onChange={(event) =>
                                    updateReading(
                                      index,
                                      "xrfReading",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="0.000"
                                  className={`
                                      w-32
                                      rounded-xl
                                      border
                                      px-3
                                      py-2
                                      font-mono
                                      text-xs
                                      ${theme?.border}
                                      ${theme?.card}
                                      ${theme?.text}
                                      focus:outline-none
                                      focus:ring-2
                                      focus:ring-emerald-500/30
                                    `}
                                />
                              </td>

                              {/* Threshold */}

                              <td className="px-4 py-3">
                                {threshold ? (
                                  <ThresholdDisplay
                                    threshold={threshold}
                                    theme={theme}
                                  />
                                ) : (
                                  <span
                                    className={`
                                        text-[10px]
                                        italic
                                        ${theme?.textMuted}
                                      `}
                                  >
                                    Not configured
                                  </span>
                                )}
                              </td>

                              {/* Status */}

                              <td className="px-4 py-3">
                                <StatusBadge status={status} />
                              </td>

                              {/* Notes */}

                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={reading.xrfNotes}
                                  onChange={(event) =>
                                    updateReading(
                                      index,
                                      "xrfNotes",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="Optional note"
                                  className={`
                                      w-36
                                      rounded-xl
                                      border
                                      px-3
                                      py-2
                                      text-xs
                                      ${theme?.border}
                                      ${theme?.card}
                                      ${theme?.text}
                                      focus:outline-none
                                      focus:ring-2
                                      focus:ring-emerald-500/30
                                    `}
                                />
                              </td>

                              {/* Delete */}

                              <td className="px-3 py-3">
                                <button
                                  type="button"
                                  onClick={() => removeReading(index)}
                                  className="
                                      flex h-8 w-8
                                      items-center justify-center
                                      rounded-lg
                                      text-slate-400
                                      transition
                                      hover:bg-red-50
                                      hover:text-red-600
                                      dark:hover:bg-red-950/30
                                      dark:hover:text-red-400
                                    "
                                  title="Remove reading"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* ====================================================== */}
                  {/* Mobile                                                    */}
                  {/* ====================================================== */}

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
                    {readings.map((reading, index) => {
                      const threshold = getThreshold(reading.heavyMetal);

                      const status = getStatus(
                        reading.xrfReading,
                        reading.heavyMetal,
                      );

                      const config = STATUS_CONFIG[status];

                      return (
                        <div
                          key={index}
                          className={`
                              space-y-4
                              p-4
                              ${config.row}
                            `}
                        >
                          {/* Card top */}

                          <div className="flex items-center justify-between gap-3">
                            <StatusBadge status={status} />

                            <button
                              type="button"
                              onClick={() => removeReading(index)}
                              className="
                                  flex h-8 w-8
                                  items-center justify-center
                                  rounded-lg
                                  text-slate-400
                                  hover:bg-red-50
                                  hover:text-red-600
                                  dark:hover:bg-red-950/30
                                  dark:hover:text-red-400
                                "
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Metal */}

                          <div>
                            <FieldLabel theme={theme}>Heavy metal</FieldLabel>

                            <div className="relative">
                              <select
                                value={reading.heavyMetal}
                                onChange={(event) =>
                                  changeMetal(index, event.target.value)
                                }
                                className={`
                                    w-full
                                    appearance-none
                                    rounded-xl
                                    border
                                    px-3
                                    py-2.5
                                    pr-9
                                    text-sm
                                    font-semibold
                                    ${theme?.border}
                                    ${theme?.card}
                                    ${theme?.text}
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-emerald-500/30
                                  `}
                              >
                                {heavyMetals.map((metal) => {
                                  const used = readings.some(
                                    (item, currentIndex) =>
                                      currentIndex !== index &&
                                      item.heavyMetal === metal,
                                  );

                                  return (
                                    <option
                                      key={metal}
                                      value={metal}
                                      disabled={used}
                                    >
                                      {metalLabels[metal] || metal}
                                    </option>
                                  );
                                })}
                              </select>

                              <ChevronDown
                                className={`
                                    pointer-events-none
                                    absolute
                                    right-3
                                    top-1/2
                                    h-4
                                    w-4
                                    -translate-y-1/2
                                    ${theme?.textMuted}
                                  `}
                              />
                            </div>
                          </div>

                          {/* Reading + threshold */}

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <FieldLabel theme={theme}>XRF reading</FieldLabel>

                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={reading.xrfReading}
                                  onChange={(event) =>
                                    updateReading(
                                      index,
                                      "xrfReading",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="0.000"
                                  className={`
                                      w-full
                                      rounded-xl
                                      border
                                      px-3
                                      py-2.5
                                      pr-11
                                      font-mono
                                      text-sm
                                      ${theme?.border}
                                      ${theme?.card}
                                      ${theme?.text}
                                      focus:outline-none
                                      focus:ring-2
                                      focus:ring-emerald-500/30
                                    `}
                                />

                                <span
                                  className={`
                                      pointer-events-none
                                      absolute
                                      right-3
                                      top-1/2
                                      -translate-y-1/2
                                      text-[9px]
                                      font-bold
                                      ${theme?.textMuted}
                                    `}
                                >
                                  ppm
                                </span>
                              </div>
                            </div>

                            <div>
                              <FieldLabel theme={theme}>Threshold</FieldLabel>

                              {threshold ? (
                                <ThresholdDisplay
                                  threshold={threshold}
                                  theme={theme}
                                  compact
                                />
                              ) : (
                                <div
                                  className={`
                                      flex
                                      min-h-[42px]
                                      items-center
                                      rounded-xl
                                      border
                                      px-3
                                      text-[10px]
                                      italic
                                      ${theme?.border}
                                      ${theme?.textMuted}
                                    `}
                                >
                                  Not configured
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Notes */}

                          <div>
                            <FieldLabel theme={theme}>Notes</FieldLabel>

                            <input
                              type="text"
                              value={reading.xrfNotes}
                              onChange={(event) =>
                                updateReading(
                                  index,
                                  "xrfNotes",
                                  event.target.value,
                                )
                              }
                              placeholder="Add an observation (optional)"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}

                  <div
                    className={`
                      flex
                      items-center
                      justify-between
                      gap-3
                      border-t
                      px-4
                      py-3
                      ${theme?.border}
                      ${theme?.bg}
                    `}
                  >
                    <p
                      className={`
                        text-[9px]
                        ${theme?.textMuted}
                      `}
                    >
                      <span
                        className={`
                          font-bold
                          ${theme?.text}
                        `}
                      >
                        {readings.length}
                      </span>{" "}
                      reading
                      {readings.length !== 1 ? "s" : ""}
                    </p>

                    <p
                      className={`
                        text-[9px]
                        ${theme?.textMuted}
                      `}
                    >
                      Measurement unit:{" "}
                      <span
                        className={`
                          font-bold
                          ${theme?.text}
                        `}
                      >
                        ppm
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* ============================================================ */}
            {/* Warning                                                        */}
            {/* ============================================================ */}

            {worst !== "safe" && worst !== "unknown" && readings.length > 0 && (
              <AnalysisWarning worst={worst} theme={theme} />
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* Footer actions                                                    */}
        {/* ================================================================ */}

        <footer
          className={`
            shrink-0
            border-t
            px-4
            py-3.5
            sm:px-5
            ${theme?.border}
            ${theme?.bg}
          `}
        >
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`
                flex-1
                rounded-xl
                border
                px-4
                py-2.5
                text-xs
                font-semibold
                ${theme?.border}
                ${theme?.card}
                ${theme?.text}
                ${theme?.hover}
              `}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading || readings.length === 0}
              onClick={handleSubmit}
              className={`
                flex
                flex-[1.4]
                items-center
                justify-center
                gap-2
                rounded-xl
                px-4
                py-2.5
                text-xs
                font-bold
                text-white
                shadow-sm
                transition
                ${
                  loading || readings.length === 0
                    ? "cursor-not-allowed bg-slate-400"
                    : worst === "dangerous"
                      ? "bg-red-600 hover:bg-red-700"
                      : worst === "elevated"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                }
              `}
            >
              {loading ? (
                <>
                  <span
                    className="
                      h-3.5 w-3.5
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Save {readings.length || ""} reading
                  {readings.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

/* ========================================================================== */
/* Sample info                                                               */
/* ========================================================================== */

const SampleInfo = ({ label, value, mono, highlight, theme }) => (
  <div className="min-w-0 px-3 py-3 sm:px-4">
    <p
      className={`
        text-[8px]
        font-bold
        uppercase
        tracking-wider
        ${theme?.textMuted}
      `}
    >
      {label}
    </p>

    <p
      className={`
        mt-1
        truncate
        text-xs
        font-semibold
        ${highlight ? "text-emerald-600 dark:text-emerald-400" : theme?.text}
        ${mono ? "font-mono" : ""}
      `}
    >
      {value}
    </p>
  </div>
);

/* ========================================================================== */
/* Table heading                                                             */
/* ========================================================================== */

const TableHeading = ({ children }) => (
  <th
    className="
      px-4
      py-3
      text-left
      text-[8px]
      font-bold
      uppercase
      tracking-wider
      text-slate-500
      dark:text-slate-400
    "
  >
    {children}
  </th>
);

/* ========================================================================== */
/* Field label                                                               */
/* ========================================================================== */

const FieldLabel = ({ children, theme }) => (
  <label
    className={`
      mb-1.5
      block
      text-[9px]
      font-bold
      uppercase
      tracking-wider
      ${theme?.textMuted}
    `}
  >
    {children}
  </label>
);

/* ========================================================================== */
/* Status summary                                                            */
/* ========================================================================== */

const StatusSummary = ({ label, count, config }) => {
  if (!count) return null;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1.5
        text-[9px]
        font-bold
        ${config.badge}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${config.dot}
        `}
      />
      {count} {label}
    </span>
  );
};

/* ========================================================================== */
/* Status badge                                                              */
/* ========================================================================== */

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNKNOWN;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        whitespace-nowrap
        rounded-full
        px-2.5
        py-1.5
        text-[9px]
        font-bold
        ${config.badge}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${config.dot}
        `}
      />

      {config.label}
    </span>
  );
};

/* ========================================================================== */
/* Threshold display                                                         */
/* ========================================================================== */

const ThresholdDisplay = ({ threshold, theme, compact = false }) => (
  <div
    className={`
      rounded-xl
      border
      px-2.5
      py-2
      ${theme?.border}
      ${theme?.bg}
    `}
  >
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
        Safe
      </span>

      <span
        className={`
          font-mono
          text-[10px]
          font-bold
          ${theme?.text}
        `}
      >
        {threshold.safeLimit}
      </span>
    </div>

    {!compact &&
      threshold.warningLimit !== null &&
      threshold.warningLimit !== undefined && (
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
            Warn
          </span>

          <span
            className={`
              font-mono
              text-[10px]
              font-bold
              ${theme?.text}
            `}
          >
            {threshold.warningLimit}
          </span>
        </div>
      )}

    <div className="mt-0.5 flex items-center gap-2">
      <span className="text-[9px] font-semibold text-red-600 dark:text-red-400">
        Danger
      </span>

      <span
        className={`
          font-mono
          text-[10px]
          font-bold
          ${theme?.text}
        `}
      >
        {threshold.dangerLimit}
      </span>
    </div>
  </div>
);

/* ========================================================================== */
/* Analysis warning                                                          */
/* ========================================================================== */

const AnalysisWarning = ({ worst, theme }) => {
  const dangerous = worst === "dangerous";

  return (
    <div
      className={`
        flex
        items-start
        gap-3
        rounded-2xl
        border-l-4
        px-4
        py-3.5
        ${
          dangerous
            ? "border-red-500 bg-red-50 dark:bg-red-950/20"
            : "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
        }
      `}
    >
      <div
        className={`
          flex h-8 w-8
          shrink-0
          items-center justify-center
          rounded-lg
          ${
            dangerous
              ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
              : "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          }
        `}
      >
        <AlertTriangle className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p
          className={`
            text-xs
            font-bold
            ${
              dangerous
                ? "text-red-800 dark:text-red-200"
                : "text-amber-800 dark:text-amber-200"
            }
          `}
        >
          {dangerous ? "Contamination detected" : "Elevated levels detected"}
        </p>

        <p
          className={`
            mt-1
            text-[10px]
            leading-5
            ${
              dangerous
                ? "text-red-700 dark:text-red-300"
                : "text-amber-700 dark:text-amber-300"
            }
          `}
        >
          {dangerous
            ? "One or more readings exceed the configured danger threshold. Review the results before submitting."
            : "One or more readings are above the safe range. Review the measurements before submitting."}
        </p>
      </div>
    </div>
  );
};

export default HeavyMetalFormModalNew;
