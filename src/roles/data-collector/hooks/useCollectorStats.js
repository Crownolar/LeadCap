import { useState, useEffect } from "react";
import api from "../../../utils/api";

export const useCollectorStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get("/samples/stats");
        if (!cancelled) setStats(res.data.data ?? null);
      } catch {
        if (!cancelled) setError("Failed to load stats.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
};
