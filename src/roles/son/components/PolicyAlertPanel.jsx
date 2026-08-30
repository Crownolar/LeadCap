import React from "react";
import { AlertTriangle, Bell, Info, ArrowUpRight } from "lucide-react";
const map = {
  high: {
    Icon: AlertTriangle,
    wrap: "border-red-200 dark:border-red-900/40",
    badge: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    dot: "bg-red-500",
  },
  medium: {
    Icon: Bell,
    wrap: "border-amber-200 dark:border-amber-900/40",
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  info: {
    Icon: Info,
    wrap: "border-blue-200 dark:border-blue-900/40",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    dot: "bg-blue-500",
  },
};
const PolicyAlertPanel = ({ theme, alerts = [] }) => (
  <section
    className={`${theme.card} ${theme.border} border rounded-2xl p-5 shadow-sm xl:col-span-3`}
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm font-bold">Priority alerts</p>
        <p className={`text-xs ${theme.textMuted}`}>
          Signals that may require regulatory attention
        </p>
      </div>
      <span
        className={`rounded-full ${theme.bg} ${theme.border} border px-2.5 py-1 text-xs font-bold`}
      >
        {alerts.length}
      </span>
    </div>
    <div className="space-y-2.5">
      {alerts.length === 0 ? (
        <p className={`py-5 text-sm ${theme.textMuted}`}>
          No major alerts for the selected filters.
        </p>
      ) : (
        alerts.map((a, i) => {
          const s = map[a.severity] || map.info;
          const Icon = s.Icon;
          return (
            <div
              key={`${a.title}-${i}`}
              className={`rounded-xl border ${s.wrap} p-3.5 flex gap-3`}
            >
              <span className={`mt-2 h-2 w-2 rounded-full shrink-0 ${s.dot}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${s.badge}`}
                  >
                    <Icon className="h-3 w-3" />
                    {a.severity}
                  </span>
                  <h4 className="text-sm font-semibold">{a.title}</h4>
                </div>
                <p
                  className={`mt-1.5 text-xs sm:text-sm leading-5 ${theme.textMuted}`}
                >
                  {a.message}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 shrink-0" />
            </div>
          );
        })
      )}
    </div>
  </section>
);
export default PolicyAlertPanel;
