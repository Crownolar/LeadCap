/**
 * useSamplesRequiringConfirmation.js
 * ────────────────────────────────────
 * Owns the data-fetching logic for the "Samples Requiring Lab Confirmation"
 * panel on LabAnalystDashboard:
 *   • debounced search (500 ms)
 *   • initial load + "load more" pagination
 *
 * Returns a stable API object; the page never calls api.get directly.
 */

import { useState, useEffect, useCallback } from "react";
import api from "../../../utils/api";
import { DEFAULT_PAGE_SIZE } from "../constants/labAnalyst.constants";

export const useSamplesRequiringConfirmation = () => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [skip, setSkip] = useState(0);
  const take = DEFAULT_PAGE_SIZE;
  const [totalItems, setTotalItems] = useState(0);

  // ── Debounce search ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  // ── Fetch (reset on query change) ────────────────────────────────────────
  const fetchSamples = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        setError("Access token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const res = debouncedQuery
        ? await api.get("/lab/samples/search", { params: { take, skip: 0, q: debouncedQuery } })
        : await api.get("/lab/samples-requiring-confirmation", { params: { take, skip: 0 } });

      setSamples(res.data.data || []);
      setTotalItems(res.data.pagination?.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch lab data:", err);
      setError(err.response?.data?.message || "Failed to load lab data");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, take]);

  useEffect(() => {
    setSkip(0);
    fetchSamples();
  }, [fetchSamples]);

  // ── Load more ─────────────────────────────────────────────────────────────
  const canLoadMore = skip + take < totalItems;

  const loadMore = async () => {
    if (isLoadingMore || !canLoadMore) return;
    const newSkip = skip + take;

    try {
      setIsLoadingMore(true);
      setError(null);

      const res = debouncedQuery
        ? await api.get("lab/samples/search", { params: { take, skip: newSkip, q: debouncedQuery } })
        : await api.get("/lab/samples-requiring-confirmation", { params: { take, skip: newSkip } });

      if (res.data?.data?.length) {
        setSamples((prev) => [...prev, ...res.data.data]);
      }
      setSkip(newSkip);
      setTotalItems(res.data.pagination?.total ?? totalItems);
    } catch (err) {
      console.error("Failed to load more samples:", err);
      setError(err.response?.data?.message || "Failed to load more samples");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    samples,
    loading,
    isLoadingMore,
    error,
    query,
    setQuery,
    canLoadMore,
    loadMore,
    totalItems,
  };
};