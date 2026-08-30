/**
 * useSupervisorScope.js
 * ─────────────────────
 * Provides the frontend's view of the currently authenticated supervisor's
 * collector scope.
 *
 * IMPORTANT: this is a UX/defence-in-depth boundary. The backend must remain
 * authoritative for collector/sample authorization.
 */

import { useCallback, useEffect, useState } from "react";
import api from "../../../utils/api";

const normalizeCollectors = (response) => {
  const payload = response?.data?.data ?? response?.data;
  const list =
    payload?.collectors ||
    payload?.items ||
    payload?.results ||
    payload?.data ||
    (Array.isArray(payload) ? payload : []);

  return Array.isArray(list) ? list : [];
};

export const useSupervisorScope = () => {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScope = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/supervisor/collectors");
      setCollectors(normalizeCollectors(response));
    } catch (err) {
      console.error("Error fetching supervisor collector scope:", err);
      setCollectors([]);
      setError(err.response?.data?.message || err.message || "Unable to verify supervisor scope.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/supervisor/collectors");
        if (!cancelled) setCollectors(normalizeCollectors(response));
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching supervisor collector scope:", err);
          setCollectors([]);
          setError(err.response?.data?.message || err.message || "Unable to verify supervisor scope.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const hasCollector = useCallback((collectorId) => {
    if (collectorId === undefined || collectorId === null || collectorId === "") return false;
    const target = String(collectorId);
    return collectors.some((collector) => String(collector.id) === target);
  }, [collectors]);

  return { collectors, loading, error, fetchScope, hasCollector };
};
