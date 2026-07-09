import { useNavigate } from "react-router-dom";
import { MetricCard } from "../../components/MetricCard";
import { WhiteCard } from "../../components/WhiteCard";
import { SectionLabel } from "../../components/SectionLabel";
import { useDashboard } from "./useDashboard";
import DonutChart from "./charts/DonutChart";
import TrendChart from "./charts/TrendChart";
import { useTheme } from "../../../../context/ThemeContext";

const MohDashboard = () => {
  const { theme, darkMode } = useTheme();
  const { metrics, hotspots, trend, loading } = useDashboard();
  const navigate = useNavigate();

  const goToPage = (page) => {
    const routeMap = {
      samples: "/moh/samples",
      contamination: "/moh/contamination",
    };

    if (routeMap[page]) {
      navigate(routeMap[page]);
    }
  };

  const METRICS = [
    {
      label: "Total Samples",
      value: metrics?.totalSamples?.toLocaleString() || "0",
      sub: "Nationwide · last 30 days",
      color: darkMode ? "text-gray-100" : "text-gray-900",
      page: "samples",
    },
    {
      label: "Pending Results",
      value: metrics?.pendingResults?.toLocaleString() || "0",
      sub: "Awaiting lab results",
      color: darkMode ? "text-amber-300" : "text-amber-600",
      page: "samples",
    },
    {
      label: "Samples With Results",
      value: metrics?.withResults?.toLocaleString() || "0",
      sub: "Lab readings available",
      color: darkMode ? "text-blue-300" : "text-blue-600",
      page: "samples",
    },
    {
      label: "Contaminated Samples",
      value: metrics?.contaminated?.toLocaleString() || "0",
      sub: "Detected contamination",
      color: darkMode ? "text-red-300" : "text-red-600",
      page: "contamination",
    },
  ];

  const formattedHotspots = Array.isArray(hotspots)
    ? hotspots.map((h) => {
        const score = Number(h?.riskScore) || 0;

        return {
          name: h?.state || h?.name || "Unknown",
          width: `${Math.min(score * 10, 100)}%`,
          score,
          color:
            score >= 7
              ? darkMode
                ? "text-red-300"
                : "text-red-600"
              : score >= 5
                ? darkMode
                  ? "text-amber-300"
                  : "text-amber-600"
                : darkMode
                  ? "text-green-300"
                  : "text-green-600",
        };
      })
    : [];

  if (loading) {
    return (
      <div className={`p-6 text-sm ${theme.textMuted}`}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className={theme.text}>
      <div className="grid grid-cols-1 gap-3 mb-5 md:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            sub={m.sub}
            color={m.color}
            clickable
            onClick={() => goToPage(m.page)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4 xl:grid-cols-2">
        <WhiteCard>
          <SectionLabel>Sample status breakdown</SectionLabel>
          <DonutChart metrics={metrics} />
        </WhiteCard>

        <WhiteCard>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Top risk hotspots</SectionLabel>
            <button
              onClick={() => goToPage("contamination")}
              className="text-xs font-medium text-green-600 dark:text-green-400"
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
              <div key={h.name} className="flex items-center gap-2 mb-2 text-xs">
                <div className={`w-20 font-medium truncate ${theme.text}`}>
                  {h.name}
                </div>

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
        <SectionLabel>Monthly sample status trend</SectionLabel>
        <TrendChart trend={trend} />
      </WhiteCard>
    </div>
  );
};

export default MohDashboard;