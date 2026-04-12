import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

const NafdacVerificationSummary = ({ theme, data = [] }) => {
  return (
    <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Verification Summary</h3>
        <p className={`text-sm ${theme.textMuted}`}>
          Overview of matched, flagged, and pending records
        </p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={95}
            label={(entry) => entry.name}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NafdacVerificationSummary;