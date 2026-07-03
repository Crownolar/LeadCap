/**
 * useCollectorManagement.js
 * ──────────────────────────
 * Fetches the list of collectors assigned to the supervisor.
 * Used by CollectorManagement page and CollectorPickerModal.
 */

import { useState, useEffect } from "react";
import api from "../../../utils/api";

export const useCollectorManagement = () => {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCollectors = async () => {
      try {
        setLoading(true);
        const res = await api.get("/supervisor/collectors");

        if (!cancelled && res.data.success) {
          const data = res.data.data || res.data;
          const normalized = Array.isArray(data) ? data : data?.data || [];
          setCollectors(normalized);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching collectors:", err);
          setError(err.response?.data?.message || err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCollectors();
    return () => { cancelled = true; };
  }, []);

  return { collectors, loading, error };
};