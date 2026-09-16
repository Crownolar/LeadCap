import { useState } from "react";
import { Loader2, Save, FlaskConical, Info } from "lucide-react";

import { HEAVY_METALS } from "../constants/supervisor.constants";
import { createBatchXRFReadings } from "../services/supervisor.service";

const LEAD_RESULTS = ["PASS", "FAIL", "INCONCLUSIVE"];

export default function XRFReadingForm({ sample, onSuccess, onCancel }) {
  const [readings, setReadings] = useState(() =>
    HEAVY_METALS.map((metal) => ({
      heavyMetal: metal,
      xrfReading: "",
      xrfResult: metal === "LEAD" ? "" : undefined,
      xrfNotes: "",
    })),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateReading = (metal, patch) => {
    setReadings((prev) =>
      prev.map((item) =>
        item.heavyMetal === metal ? { ...item, ...patch } : item,
      ),
    );
  };

  const validateReadings = () => {
    for (const reading of readings) {
      if (
        reading.xrfReading === "" ||
        reading.xrfReading === null ||
        reading.xrfReading === undefined
      ) {
        return `${reading.heavyMetal} XRF reading is required.`;
      }

      if (reading.heavyMetal === "LEAD") {
        if (!LEAD_RESULTS.includes(reading.xrfResult)) {
          return "Lead requires an XRF result of PASS, FAIL, or INCONCLUSIVE.";
        }

        // The API accepts either a screening result (PASS/FAIL/INCONCLUSIVE)
        // or a numeric Lead measurement as xrfReading.
        const value = String(reading.xrfReading).trim();
        const numeric = Number(value);
        if (
          !["PASS", "FAIL", "INCONCLUSIVE"].includes(value) &&
          (value === "" || Number.isNaN(numeric))
        ) {
          return "Lead XRF reading must be PASS, FAIL, INCONCLUSIVE, or a numeric value.";
        }
      } else if (Number.isNaN(Number(reading.xrfReading))) {
        return `${reading.heavyMetal} must be a numeric value.`;
      }
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateReadings();
    if (validationError) {
      setError(validationError);
      return;
    }

    const formattedReadings = readings.map((reading) => {
      const base = {
        heavyMetal: reading.heavyMetal,
        xrfReading:
          reading.heavyMetal === "LEAD" &&
          ["PASS", "FAIL", "INCONCLUSIVE"].includes(
            String(reading.xrfReading).trim(),
          )
            ? String(reading.xrfReading).trim()
            : Number(reading.xrfReading),
      };

      if (reading.heavyMetal === "LEAD") {
        base.xrfResult = reading.xrfResult;
      }

      if (reading.xrfNotes?.trim()) {
        base.xrfNotes = reading.xrfNotes.trim();
      }

      return base;
    });

    setIsSubmitting(true);

    try {
      console.log("========== XRF SUBMISSION ==========");
      console.log("Sample ID:", sample.id);
      console.log("XRF readings being submitted:", formattedReadings);
      console.log(
        "XRF payload:",
        JSON.stringify(
          {
            sampleId: sample.id,
            readings: formattedReadings,
          },
          null,
          2,
        ),
      );
      console.log("====================================");

      await createBatchXRFReadings({
        sampleId: sample.id,
        readings: formattedReadings,
      });

      onSuccess?.();
    } catch (err) {
      console.error("Failed to submit XRF readings:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save XRF readings. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <FlaskConical
              size={19}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-slate-500">
              Laboratory workflow
            </p>
            <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              XRF Heavy Metal Analysis
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Record the screening result for every regulated metal.
            </p>
          </div>
        </div>

        <div className="hidden rounded-xl bg-slate-100 p-2 text-slate-500 dark:bg-slate-800 sm:block">
          <Info size={16} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SampleMeta label="Product" value={sample?.productName} />
        <SampleMeta label="Sample Code" value={sample?.code} />
        <SampleMeta
          label="Location"
          value={[sample?.state?.name, sample?.lga?.name]
            .filter(Boolean)
            .join(" / ")}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-relaxed text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {readings.map((reading) => {
          const isLead = reading.heavyMetal === "LEAD";

          return (
            <div
              key={reading.heavyMetal}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {reading.heavyMetal}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {isLead
                      ? "Screening result + reading"
                      : "Numeric XRF concentration"}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {isLead ? "REQUIRED RESULT" : "NUMERIC"}
                </span>
              </div>

              {isLead ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Field label="XRF Result *">
                    <select
                      value={reading.xrfResult}
                      onChange={(e) =>
                        updateReading(reading.heavyMetal, {
                          xrfResult: e.target.value,
                          // Keep xrfReading populated because the API requires it.
                          xrfReading:
                            reading.xrfReading ||
                            (e.target.value ? e.target.value : ""),
                        })
                      }
                      className={inputClass}
                    >
                      <option value="">Select result</option>
                      {LEAD_RESULTS.map((result) => (
                        <option key={result} value={result}>
                          {result}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="XRF Reading *">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={reading.xrfReading}
                      onChange={(e) =>
                        updateReading(reading.heavyMetal, {
                          xrfReading: e.target.value,
                        })
                      }
                      placeholder="PASS / FAIL / numeric"
                      className={inputClass}
                    />
                  </Field>
                </div>
              ) : (
                <Field label="XRF Reading *" className="mt-4">
                  <input
                    type="number"
                    step="any"
                    value={reading.xrfReading}
                    onChange={(e) =>
                      updateReading(reading.heavyMetal, {
                        xrfReading: e.target.value,
                      })
                    }
                    placeholder="Enter numeric reading"
                    className={inputClass}
                  />
                </Field>
              )}

              <Field label="Notes" className="mt-3">
                <input
                  type="text"
                  value={reading.xrfNotes}
                  onChange={(e) =>
                    updateReading(reading.heavyMetal, {
                      xrfNotes: e.target.value,
                    })
                  }
                  placeholder="Optional notes"
                  className={inputClass}
                />
              </Field>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Saving XRF...
            </>
          ) : (
            <>
              <Save size={15} />
              Save XRF Readings
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-white";

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function SampleMeta({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/40">
      <p className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
        {value || "N/A"}
      </p>
    </div>
  );
}
