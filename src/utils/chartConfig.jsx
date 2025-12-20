/**
 * chartConfig.js
 * Chart configuration, themes, and rendering utilities
 */

export const CONTAMINATION_COLORS = {
  safe: "#10b981",      // Green
  moderate: "#f59e0b",  // Amber
  contaminated: "#ef4444", // Red
  pending: "#6b7280",   // Gray
};

export const CHART_THEMES = {
  light: {
    background: "#ffffff",
    text: "#1f2937",
    grid: "#e5e7eb",
    axis: "#6b7280",
  },
  dark: {
    background: "#1f2937",
    text: "#f3f4f6",
    grid: "#374151",
    axis: "#9ca3af",
  },
};

/**
 * Custom tooltip component for all charts
 */
export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Format percentage with safety
 */
export const formatPercent = (value, decimals = 1) => {
  if (isNaN(value) || value === null) return "0%";
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Format large numbers with K/M notation
 */
export const formatNumber = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

/**
 * Get risk level color based on contamination rate
 */
export const getRiskColor = (rate) => {
  const percentage = parseFloat(rate);
  if (percentage <= 20) return "#10b981"; // Green - Low risk
  if (percentage <= 40) return "#f59e0b"; // Amber - Medium risk
  if (percentage <= 60) return "#f97316"; // Orange - High risk
  return "#ef4444"; // Red - Critical
};

/**
 * Status badge styling
 */
export const getStatusBadgeColor = (status) => {
  const statusMap = {
    "SAFE": { bg: "bg-green-100", text: "text-green-800", color: "#10b981" },
    "MODERATE": { bg: "bg-amber-100", text: "text-amber-800", color: "#f59e0b" },
    "CONTAMINATED": { bg: "bg-red-100", text: "text-red-800", color: "#ef4444" },
    "PENDING": { bg: "bg-gray-100", text: "text-gray-800", color: "#6b7280" },
  };
  return statusMap[status] || statusMap["PENDING"];
};

/**
 * Chart height based on screen width
 */
export const getChartHeight = (screenWidth, baseHeight = 300) => {
  if (screenWidth < 640) return baseHeight * 0.8;
  if (screenWidth < 1024) return baseHeight * 0.9;
  return baseHeight;
};

/**
 * Label renderer for pie/donut charts
 */
export const renderPieLabel = (entry) => {
  const percent = ((entry.value / entry.payload.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0);
  return `${percent}%`;
};
