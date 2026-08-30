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
import { TrendingUp } from "lucide-react";
const Tip = ({ active, payload, label, theme }) =>
  active && payload?.length ? (
    <div
      className={`${theme.card} ${theme.border} border rounded-xl p-3 shadow-lg`}
    >
      <p className="text-xs font-bold">{label}</p>
      <p className="mt-1 text-xs text-red-600">
        Contamination: {Number(payload[0]?.value || 0).toFixed(1)}%
      </p>
    </div>
  ) : null;
const PolicyTrendCard = ({ theme, trendData = [] }) => (
  <section
    className={`${theme.card} ${theme.border} border rounded-2xl p-5 shadow-sm`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-bold">Contamination trend</p>
        <p className={`mt-1 text-xs ${theme.textMuted}`}>
          Monthly movement of contamination rate
        </p>
      </div>
      <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <TrendingUp className="h-4 w-4 text-red-500" />
      </div>
    </div>
    <div className="mt-4 h-[290px]">
      {trendData.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trendData}
            margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="sonTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
            <RechartsTooltip content={<Tip theme={theme} />} />
            <Area
              type="monotone"
              dataKey="contaminationRate"
              stroke="#ef4444"
              strokeWidth={2.5}
              fill="url(#sonTrendFill)"
              name="Contamination Rate"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div
          className={`h-full flex items-center justify-center text-sm ${theme.textMuted}`}
        >
          No trend data available.
        </div>
      )}
    </div>
  </section>
);
export default PolicyTrendCard;
