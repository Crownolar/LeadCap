// import { useEffect, useState } from "react";
// import {
//   getRiskHotspots,
//   getSampleStats,
//   getVerificationSummary,
// } from "../../../../services/mohDashboardService";

// export const useDashboard = () => {
//   const [metrics, setMetrics] = useState(null);
//   const [hotspots, setHotspots] = useState([]);
//   const [trend, setTrend] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadDashboard = async () => {
//       try {
//         setLoading(true);

//         const from = new Date();
//         from.setDate(from.getDate() - 30);
//         const to = new Date();

//         const verificationParams = {
//           from: from.toISOString(),
//           to: to.toISOString(),
//         };

//         const statsParams = {
//           dateFrom: from.toISOString(),
//           dateTo: to.toISOString(),
//         };

//         const [summaryRes, hotspotsRes, statsRes] = await Promise.all([
//           getVerificationSummary(verificationParams),
//           getRiskHotspots(verificationParams),
//           getSampleStats(statsParams),
//         ]);

//         const stats = statsRes?.data || {};
//         console.log("sample stats payload:", stats);

//         setMetrics({
//           totalSamples: stats?.totalSamples || stats?.total || 0,
//           safe: stats?.safe || 0,
//           moderate: stats?.moderate || 0,
//           contaminated: stats?.contaminated || 0,
//           pendingResults: stats?.pendingResults || stats?.pending || 0,
//           withResults: stats?.withResults || 0,
//           totalHeavyMetalReadings: stats?.totalHeavyMetalReadings || 0,

//           totalVerifications: summaryRes?.totalVerifications || 0,
//           verified: summaryRes?.verified || 0,
//           failed: summaryRes?.failed || 0,
//           pendingVerification: summaryRes?.pending || 0,
//         });

//         setHotspots(hotspotsRes?.regions || []);
//         setTrend(stats?.byMonth || []);
//       } catch (e) {
//         console.error("Dashboard load failed", e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, []);

//   return { metrics, hotspots, trend, loading };
// };


import { useEffect, useState } from "react";
import {
  getRiskHotspots,
  getSampleStats,
  getVerificationSummary,
} from "../../../../services/mohDashboardService";

export const useDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const from = new Date();
        from.setDate(from.getDate() - 30);
        const to = new Date();

        const verificationParams = {
          from: from.toISOString(),
          to: to.toISOString(),
        };

        const statsParams = {
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
        };

        const [summaryRes, hotspotsRes, statsRes] = await Promise.all([
          getVerificationSummary(verificationParams),
          getRiskHotspots(verificationParams),
          getSampleStats(statsParams),
        ]);

        const stats = statsRes?.data || {};
        const hotspotRegions = hotspotsRes?.regions || [];

        setMetrics({
          totalSamples: stats?.totalSamples || stats?.total || 0,
          safe: stats?.safe || 0,
          moderate: stats?.moderate || 0,
          contaminated: stats?.contaminated || 0,
          pendingResults: stats?.pendingResults || stats?.pending || 0,
          withResults: stats?.withResults || 0,
          totalHeavyMetalReadings: stats?.totalHeavyMetalReadings || 0,

          totalVerifications: summaryRes?.totalVerifications || 0,
          verified: summaryRes?.verified || 0,
          failed: summaryRes?.failed || 0,
          pendingVerification: summaryRes?.pending || 0,
        });

        setTrend(stats?.byMonth || []);

        if (Array.isArray(hotspotRegions) && hotspotRegions.length > 0) {
          setHotspots(hotspotRegions);
        } else {
          const fallbackHotspots = Array.isArray(stats?.byState)
            ? [...stats.byState]
                .map((item) => {
                  const contaminated = Number(item?.contaminated) || 0;
                  const moderate = Number(item?.moderate) || 0;
                  const safe = Number(item?.safe) || 0;
                  const pending = Number(item?.pending) || 0;
                  const total =
                    Number(item?.totalSamples) ||
                    Number(item?.total) ||
                    contaminated + moderate + safe + pending;

                  const riskScore =
                    total > 0
                      ? Number(
                          (
                            ((contaminated * 1) + (moderate * 0.5)) /
                            total *
                            10
                          ).toFixed(1)
                        )
                      : 0;

                  return {
                    name: item?.state || item?.name || "Unknown",
                    state: item?.state || item?.name || "Unknown",
                    riskScore,
                    total,
                    contaminated,
                    moderate,
                    safe,
                    pending,
                  };
                })
                .sort((a, b) => b.riskScore - a.riskScore)
                .slice(0, 5)
            : [];

          setHotspots(fallbackHotspots);
        }
      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return { metrics, hotspots, trend, loading };
};