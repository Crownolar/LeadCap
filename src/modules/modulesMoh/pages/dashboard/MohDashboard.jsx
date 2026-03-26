import { MetricCard } from "../../components/MetricCard";
import { WhiteCard } from "../../components/WhiteCard";
import { SectionLabel } from "../../components/SectionLabel";
import { useDashboard } from "./useDashboard";
import DonutChart from "./charts/DonutChart";
import TrendChart from "./charts/TrendChart";
import { useTheme } from "../../../../context/ThemeContext";

const MohDashboard = ({ onNavigate }) => {
  const { theme, darkMode } = useTheme();
  const { metrics, hotspots, trend, loading } = useDashboard();

  const METRICS = [
    {
      label: "Total Samples",
      value: metrics?.totalSamples?.toLocaleString() || "—",
      sub: "Nationwide · last 30 days",
      color: darkMode ? "text-gray-100" : "text-gray-900",
      page: "samples",
    },
    {
      label: "Verified Products",
      value: metrics?.verified?.toLocaleString() || "—",
      sub: "Verified",
      color: darkMode ? "text-green-300" : "text-green-700",
      page: "verification",
    },
    {
      label: "Failed Verifications",
      value: metrics?.failed?.toLocaleString() || "—",
      sub: "Failed",
      color: darkMode ? "text-red-300" : "text-red-600",
      page: "verification",
    },
    {
      label: "Pending",
      value: metrics?.pending?.toLocaleString() || "—",
      sub: "Pending",
      color: darkMode ? "text-amber-300" : "text-amber-600",
      page: "verification",
    },
  ];

  const formattedHotspots = Array.isArray(hotspots)
    ? hotspots.map((h) => ({
        name: h.state || h.name,
        width: `${Math.min((h.riskScore || 0) * 10, 100)}%`,
        score: h.riskScore || 0,
        color:
          h.riskScore >= 7
            ? darkMode
              ? "text-red-300"
              : "text-red-600"
            : h.riskScore >= 5
              ? darkMode
                ? "text-amber-300"
                : "text-amber-600"
              : darkMode
                ? "text-green-300"
                : "text-green-600",
      }))
    : [];

  if (loading) {
    return (
      <div className={`p-6 text-sm ${theme.textMuted}`}>Loading dashboard...</div>
    );
  }

  return (
    <div className={`${theme.text}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {METRICS.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            sub={m.sub}
            color={m.color}
            clickable
            onClick={() => onNavigate(m.page)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <WhiteCard>
          <SectionLabel>Verification status breakdown</SectionLabel>
          <DonutChart metrics={metrics} />
        </WhiteCard>

        <WhiteCard>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Top risk hotspots</SectionLabel>
            <button
              onClick={() => onNavigate("contamination")}
              className="text-xs text-green-600 dark:text-green-400 font-medium"
            >
              View all →
            </button>
          </div>

          {formattedHotspots.length === 0 ? (
            <div className={`text-xs ${theme.textMuted}`}>
              No hotspot data available
            </div>
          ) : (
            formattedHotspots.map((h) => (
              <div
                key={h.name}
                className="flex items-center gap-2 mb-2 text-xs"
              >
                <div className={`w-20 font-medium ${theme.text}`}>{h.name}</div>

                <div
                  className={`flex-1 h-2 rounded ${
                    darkMode ? "bg-gray-700" : "bg-green-50"
                  }`}
                >
                  <div
                    className={`h-2 rounded ${
                      h.score >= 7
                        ? "bg-red-500"
                        : h.score >= 5
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: h.width }}
                  />
                </div>

                <div className={`w-8 text-right font-medium ${h.color}`}>
                  {h.score}
                </div>
              </div>
            ))
          )}
        </WhiteCard>
      </div>

      <WhiteCard>
        <SectionLabel>Monthly verification trend — 2025</SectionLabel>
        <TrendChart trend={trend} />
      </WhiteCard>
    </div>
  );
};

export default MohDashboard;