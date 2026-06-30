/**
 * useLabWorkload.js
 * ───────────────────
 * Fetches the logged-in lab analyst's personal workload stats
 * (pending/completed/in-progress counts, accuracy rate, comparison metrics).
 * Used by LabAnalystDashboard for the top KPI strip.
 */

import { useState, useEffect } from "react";
import api from "../../../utils/api";

export const useLabWorkload = () => {
  const [labStats, setLabStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get("/lab/my-workload");
        if (!cancelled) setLabStats(res.data.data || null);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Failed to load workload stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, []);

  return { labStats, loading, error };
};