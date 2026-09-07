import { useState } from "react";
import { Loader2, Save, FlaskConical } from "lucide-react";

import { HEAVY_METALS } from "../constants/supervisor.constants";
import { createBatchXRFReadings } from "../services/supervisor.service";

export default function XRFReadingForm({
  sample,
  onSuccess,
  onCancel,
}) {
  const [readings, setReadings] = useState(() =>
    HEAVY_METALS.map((metal) => ({
      heavyMetal: metal,
      xrfReading: "",
      xrfNotes: "",
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleReadingChange = (metal, value) => {
    setReadings((prev) =>
      prev.map((reading) =>
        reading.heavyMetal === metal
          ? {
              ...reading,
              xrfReading: value,
            }
          : reading
      )
    );
  };

  const handleNotesChange = (metal, value) => {
    setReadings((prev) =>
      prev.map((reading) =>
        reading.heavyMetal === metal
          ? {
              ...reading,
              xrfNotes: value,
            }
          : reading
      )
    );
  };

  const validateReadings = () => {
    for (const reading of readings) {
      if (
        reading.xrfReading === "" ||
        reading.xrfReading === null
      ) {
        return `${reading.heavyMetal} reading is required`;
      }

      if (reading.heavyMetal !== "LEAD") {
        if (Number.isNaN(Number(reading.xrfReading))) {
          return `${reading.heavyMetal} must be a numeric value`;
        }
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

    const formattedReadings = readings.map((reading) => ({
      heavyMetal: reading.heavyMetal,

      xrfReading:
        reading.heavyMetal === "LEAD"
          ? reading.xrfReading
          : Number(reading.xrfReading),

      ...(reading.xrfNotes?.trim()
        ? {
            xrfNotes: reading.xrfNotes.trim(),
          }
        : {}),
    }));

    setIsSubmitting(true);

    try {
      await createBatchXRFReadings({
        sampleId: sample.id,
        readings: formattedReadings,
      });

      onSuccess?.();
    } catch (err) {
      console.error("Failed to submit XRF readings:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to save XRF readings. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Header */}

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <FlaskConical size={19} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            XRF Heavy Metal Analysis
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Record screening readings for all regulated heavy metals.
          </p>
        </div>
      </div>

      {/* Sample info */}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Sample
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
          {sample?.productName || "Unknown Product"}
        </p>

        <p className="mt-1 font-mono text-xs text-slate-500">
          {sample?.code}
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Readings */}

      <div className="space-y-3">
        {readings.map((reading) => {
          const isLead = reading.heavyMetal === "LEAD";

          return (
            <div
              key={reading.heavyMetal}
              className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-700"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Metal */}

                <div className="sm:w-32">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {reading.heavyMetal}
                  </p>

                  {isLead && (
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      PASS or FAIL
                    </p>
                  )}
                </div>

                {/* Reading */}

                <div className="flex-1">
                  {isLead ? (
                    <select
                      value={reading.xrfReading}
                      onChange={(e) =>
                        handleReadingChange(
                          reading.heavyMetal,
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">
                        Select result
                      </option>

                      <option value="PASS">
                        PASS
                      </option>

                      <option value="FAIL">
                        FAIL
                      </option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      step="any"
                      value={reading.xrfReading}
                      onChange={(e) =>
                        handleReadingChange(
                          reading.heavyMetal,
                          e.target.value
                        )
                      }
                      placeholder="Enter reading"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  )}
                </div>
              </div>

              {/* Notes */}

              <input
                type="text"
                value={reading.xrfNotes}
                onChange={(e) =>
                  handleNotesChange(
                    reading.heavyMetal,
                    e.target.value
                  )
                }
                placeholder="Optional notes"
                className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
          );
        })}
      </div>

      {/* Actions */}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2
                size={16}
                className="animate-spin"
              />

              Saving...
            </>
          ) : (
            <>
              <Save size={16} />

              Save XRF Readings
            </>
          )}
        </button>
      </div>
    </form>
  );
}