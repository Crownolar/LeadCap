/**
 * useSupervisor.js
 * ─────────────────
 * Fetches the supervisor assigned to the currently logged-in data collector.
 * Isolated so the supervisor card can be used standalone in other contexts.
 */

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../utils/api";

export const useSupervisor = () => {
  const { currentUser } = useSelector((state) => state.auth);

  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get("/data-collectors/me/supervisor");
        if (!cancelled && res.data?.success) setSupervisor(res.data.data);
      } catch (err) {
        if (!cancelled) setError("Could not load supervisor.");
        console.error("Supervisor fetch failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  return { supervisor, loading, error };
};