import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const NafdacTrendCard = ({ theme, trendData = [] }) => {
  return (
    <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Registry Activity Trend</h3>
        <p className={`text-sm ${theme.textMuted}`}>
          Monthly movement of registry-linked and reviewed records
        </p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={trendData}>
          <defs>
            <linearGradient id="registeredFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.08} />
            </linearGradient>
            <linearGradient id="flaggedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.08} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
          <RechartsTooltip content={<CustomTooltip theme={theme} />} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />

          <Area
            type="monotone"
            dataKey="registered"
            stroke="#3b82f6"
            fill="url(#registeredFill)"
            name="Registered"
          />
          <Area
            type="monotone"
            dataKey="flagged"
            stroke="#ef4444"
            fill="url(#flaggedFill)"
            name="Flagged"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NafdacTrendCard;