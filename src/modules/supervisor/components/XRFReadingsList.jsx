import { CheckCircle2, AlertTriangle } from "lucide-react";

const STATUS_STYLE = {
  SAFE: {
    icon: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  MODERATE: {
    icon: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },

  CONTAMINATED: {
    icon: "text-red-600",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function XRFReadingsList({
  readings = [],
}) {
  if (!readings.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
        <p className="text-sm font-medium text-slate-600">
          No XRF readings recorded
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Heavy metal readings will appear here after screening.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {readings.map((reading) => {
        const style =
          STATUS_STYLE[reading.status] ||
          STATUS_STYLE.MODERATE;

        return (
          <div
            key={reading.id || reading.heavyMetal}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              {reading.status === "CONTAMINATED" ? (
                <AlertTriangle
                  size={17}
                  className={style.icon}
                />
              ) : (
                <CheckCircle2
                  size={17}
                  className={style.icon}
                />
              )}

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {reading.heavyMetal}
                </p>

                {reading.xrfNotes && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {reading.xrfNotes}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {reading.xrfReading ??
                  (reading.xrfPassed === true
                    ? "PASS"
                    : reading.xrfPassed === false
                      ? "FAIL"
                      : "—")}
              </p>

              {reading.status && (
                <span
                  className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${
                    style.badge
                  }`}
                >
                  {reading.status}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}