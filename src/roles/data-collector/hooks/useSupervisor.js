/**
 * useSupervisor.js
 * ─────────────────
 * Fetches the supervisor assigned to the currently logged-in data collector.
 *
 * The hook fails closed:
 *   • supervisor exists → hasSupervisor === true
 *   • no supervisor      → hasSupervisor === false
 *   • request failed     → hasSupervisor === false + error
 *
 * This state is used by the UI to prevent a Data Collector from starting
 * a new sample before a Supervisor assignment exists.
 *
 * IMPORTANT:
 * This is a frontend workflow guard only. The backend must independently
 * enforce the same business rule on POST /samples.
 */

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import api from "../../../utils/api";

const DATA_COLLECTOR_ROLES = new Set([
  "datacollector",
]);

const normalizeRole = (role = "") =>
  String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s_.-]/g, "");

export const useSupervisor = () => {
  const { currentUser } = useSelector((state) => state.auth);

  const role = normalizeRole(currentUser?.role);
  const isDataCollector = DATA_COLLECTOR_ROLES.has(role);

  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assignmentChecked, setAssignmentChecked] = useState(!isDataCollector);

  useEffect(() => {
    if (!isDataCollector || !currentUser?.id) {
      setSupervisor(null);
      setError(null);
      setLoading(false);
      setAssignmentChecked(true);
      return undefined;
    }

    let cancelled = false;

    const fetchSupervisor = async () => {
      setLoading(true);
      setError(null);
      setAssignmentChecked(false);

      try {
        const res = await api.get("/data-collectors/me/supervisor");

        if (cancelled) return;

        const payload = res.data?.success
          ? res.data?.data
          : null;

        const assignedSupervisor =
          payload?.supervisor ??
          payload?.assignedSupervisor ??
          (payload?.id ? payload : null);

        setSupervisor(assignedSupervisor);
      } catch (err) {
        if (cancelled) return;

        console.error("Supervisor fetch failed:", err);

        setSupervisor(null);
        setError(
          err?.response?.data?.message ||
            "We could not verify your supervisor assignment.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setAssignmentChecked(true);
        }
      }
    };

    fetchSupervisor();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, isDataCollector]);

  return {
    supervisor,
    loading,
    error,
    assignmentChecked,
    hasSupervisor: Boolean(supervisor),
    isDataCollector,
  };
};
