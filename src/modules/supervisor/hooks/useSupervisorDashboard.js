/**
 * useSupervisorDashboard.js
 * ──────────────────────────
 * Fetches the two data sets needed by SupervisorDashboard in parallel:
 *   • /supervisor/stats   → KPI numbers + review breakdown
 *   • /supervisor/collectors → assigned collector list
 *
 * Returns a stable API object; the page never calls api.get directly.
 */

import { useState, useEffect } from "react";
import api from "../../../utils/api";

export const useSupervisorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, collectorsRes] = await Promise.all([
        api.get("/supervisor/stats"),
        api.get("/supervisor/collectors"),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (collectorsRes.data.success) {
        const data = collectorsRes.data.data || collectorsRes.data;
        setCollectors(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (err) {
      console.error("Error fetching supervisor dashboard data:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { stats, collectors, loading, error };
};