import { useCallback, useEffect, useState } from "react";
import { getReviewStats } from "../services/review.service";

const INITIAL_STATS = {
  pending: 0,
  approvedForXRF: 0,
  xrfCompleted: 0,
  approvedForAAS: 0,
  completed: 0,
  rejected: 0,
  flagged: 0,
};

export default function useReviewStats() {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getReviewStats();

      setStats({
        pending: data?.pending ?? 0,
        approvedForXRF: data?.approvedForXRF ?? 0,
        xrfCompleted: data?.xrfCompleted ?? 0,
        approvedForAAS: data?.approvedForAAS ?? 0,
        completed: data?.completed ?? 0,
        rejected: data?.rejected ?? 0,
        flagged: data?.flagged ?? 0,
      });
    } catch (err) {
      console.error("Failed to fetch review statistics:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load review statistics"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    refreshStats: fetchStats,
  };
}