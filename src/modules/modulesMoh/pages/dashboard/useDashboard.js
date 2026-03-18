import { useEffect, useState } from "react";
import {
  getRiskHotspots,
  getSampleOverview,
  getVerificationLogs,
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

        const params = {
          from: from.toISOString(),
          to: to.toISOString(),
        };

        const [summaryRes, hotspotsRes, logsRes, samplesRes] = await Promise.all([
          getVerificationSummary(params),
          getRiskHotspots(params),
          getVerificationLogs({
            ...params,
            page: 1,
            pageSize: 1000,
          }),
          getSampleOverview({
              page: 1,
              limit: 1,
            }),
        ]);

        setMetrics({
          totalSamples: samplesRes?.pagination?.totalCount || 0,
          totalVerifications: summaryRes?.totalVerifications || 0,
          verified: summaryRes?.verified || 0,
          failed: summaryRes?.failed || 0,
          pending: summaryRes?.pending || 0,
        });
        setHotspots(hotspotsRes?.regions || []);
        setTrend(logsRes?.items || []);
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