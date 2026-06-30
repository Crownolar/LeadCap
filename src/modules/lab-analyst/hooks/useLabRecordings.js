/**
 * useLabRecordings.js
 * ─────────────────────
 * Owns all data logic for the LabWorkloadAnalytics page:
 *   • fetch + normalize "my recordings"
 *   • load-more pagination
 *   • inline AAS edit (open/close/update)
 *   • CSV export
 *
 * Returns a stable API object; the page never calls api.get/post directly.
 */

import { useState, useEffect, useCallback } from "react";
import api from "../../../utils/api";
import { DEFAULT_PAGE_SIZE, EXPORT_FORMAT } from "../constants/labAnalyst.constants";

const normalizeRecording = (recording) => ({
  id: recording.readingId,
  sampleName: recording.sampleCode,
  unit: recording.unit,
  xrfReading: recording.xrf?.reading || "-",
  aasReading: recording.aas?.reading || "-",
  recordedAt: recording.aas?.recordedAt || recording.createdAt,
  status: recording.finalStatus,
});

export const useLabRecordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [skip, setSkip] = useState(0);
  const [take] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);

  // ── Edit modal state ──────────────────────────────────────────────────────
  const [editingRecording, setEditingRecording] = useState(null);
  const [aasValue, setAasValue] = useState("");
  const [aasNotes, setAasNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // ── Initial fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          setError("Access token not found. Please log in again.");
          setLoading(false);
          return;
        }

        setLoading(true);
        const res = await api.get("/lab/my-recordings", { params: { take, skip: 0 } });
        const normalized = (res.data.data || []).map(normalizeRecording);

        setRecordings(normalized);
        setTotalItems(res.data.pagination?.total || 0);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch recordings:", err);
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, [take]);

  // ── Load more ─────────────────────────────────────────────────────────────
  const canLoadMore = skip + take < (totalItems || 1);

  const loadMore = async () => {
    if (isLoadingMore || !canLoadMore) return;
    const newSkip = skip + take;

    try {
      setIsLoadingMore(true);
      setSkip(newSkip);

      const res = await api.get("/lab/my-recordings", { params: { take, skip: newSkip } });
      const more = (res.data.data || []).map(normalizeRecording);
      if (more.length > 0) setRecordings((prev) => [...prev, ...more]);
    } catch (err) {
      console.error("Failed to load more recordings:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // ── Edit AAS ──────────────────────────────────────────────────────────────
  const openEdit = (recording) => {
    setEditingRecording(recording);
    setAasValue(recording.aasReading);
    setAasNotes(recording.aasNotes || "");
  };

  const closeEdit = () => {
    setEditingRecording(null);
    setAasValue("");
    setAasNotes("");
  };

  const submitEdit = async () => {
    if (!editingRecording) return;

    try {
      setUpdating(true);
      await api.patch(`/lab/aas-reading/${editingRecording.id}`, {
        aasReadingValue: Number(aasValue),
        aasNotes: aasNotes || editingRecording.aasNotes || "",
      });

      setRecordings((prev) =>
        prev.map((rec) =>
          rec.id === editingRecording.id
            ? { ...rec, aasReading: Number(aasValue), aasNotes }
            : rec,
        ),
      );
      closeEdit();
    } catch (err) {
      console.error("Failed to update AAS:", err);
      setError(err.response?.data?.message || "Failed to update AAS reading");
    } finally {
      setUpdating(false);
    }
  };

  // ── CSV export ────────────────────────────────────────────────────────────
  const exportCsv = useCallback(async () => {
    try {
      const response = await api.get("/lab/export-results", {
        params: { format: EXPORT_FORMAT },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `lab-results-${new Date().toISOString().split("T")[0]}.${EXPORT_FORMAT}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export results:", err);
      alert("Failed to export results");
    }
  }, []);

  return {
    recordings,
    loading,
    isLoadingMore,
    error,
    canLoadMore,
    loadMore,
    editingRecording,
    aasValue,
    setAasValue,
    aasNotes,
    setAasNotes,
    updating,
    openEdit,
    closeEdit,
    submitEdit,
    exportCsv,
  };
};