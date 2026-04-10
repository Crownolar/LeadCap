import React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

const CustomTooltip = ({ active, payload, label, theme }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className={`${theme.card} border ${theme.border} rounded-lg p-3 shadow-md`}>
      <p className="font-medium text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
        </p>
      ))}
    </div>
  );
};

const PolicyTrendCard = ({ theme, trendData = [] }) => {
  return (
    <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Contamination Trend</h3>
        <p className={`text-sm ${theme.textMuted}`}>Monthly movement of contamination rate</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={trendData}>
          <defs>
            <linearGradient id="policyTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
          <RechartsTooltip content={<CustomTooltip theme={theme} />} />
          <Area
            type="monotone"
            dataKey="contaminationRate"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#policyTrendFill)"
            name="Contamination Rate %"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PolicyTrendCard;