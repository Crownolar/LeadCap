import React from "react";
import { AlertTriangle, Bell, Info } from "lucide-react";

const severityStyles = {
  high: {
    icon: AlertTriangle,
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
  medium: {
    icon: Bell,
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
  },
  info: {
    icon: Info,
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
};

const PolicyAlertPanel = ({ theme, alerts = [] }) => {
  return (
    <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm xl:col-span-2`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Priority Alerts</h3>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${theme.border} ${theme.textMuted}`}>
          {alerts.length} items
        </span>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className={`text-sm ${theme.textMuted}`}>No major alerts for the selected filters.</div>
        ) : (
          alerts.map((alert, index) => {
            const style = severityStyles[alert.severity] || severityStyles.info;
            const Icon = style.icon;

            return (
              <div
                key={`${alert.title}-${index}`}
                className={`border ${theme.border} rounded-xl p-4 flex items-start gap-3`}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-2 ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.badge}`}>
                      <Icon size={12} />
                      {alert.severity}
                    </span>
                    <h4 className="font-medium">{alert.title}</h4>
                  </div>
                  <p className={`text-sm ${theme.textMuted}`}>{alert.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PolicyAlertPanel;