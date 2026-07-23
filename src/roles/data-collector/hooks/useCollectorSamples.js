import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../../../utils/api";
import { DEFAULT_PAGE_SIZE } from "../constants/collector.constants";

export const useCollectorSamples = () => {
  const { currentUser } = useSelector((state) => state.auth);
  console.log(currentUser);

  const [allSamples, setAllSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [skip, setSkip] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Fetch (reset list on query change) ──────────────────────────────────
  const fetchSamples = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      setError(null);
      setAllSamples([]);
      setSkip(0);

      const params = {
        q: debouncedQuery || undefined,
        createdBy: currentUser.id,
        skip: 0,
        take: DEFAULT_PAGE_SIZE,
      };

      const endpoint = debouncedQuery ? "/samples/search" : "/samples";
      const res = await api.get(endpoint, { params });

      setAllSamples(res.data.data ?? []);
      setTotalItems(res.data.pagination?.totalCount ?? 0);
    } catch {
      setError("Failed to load samples. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, debouncedQuery]);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  const canLoadMore = skip + DEFAULT_PAGE_SIZE < totalItems;

  const loadMore = async () => {
    if (loading || !canLoadMore) return;

    const newSkip = skip + DEFAULT_PAGE_SIZE;

    try {
      setLoading(true);
      setError(null);

      const params = {
        take: DEFAULT_PAGE_SIZE,
        skip: newSkip,
        collectorId: currentUser.id,
        q: searchQuery || undefined,
      };

      const endpoint = debouncedQuery ? "/samples/search" : "/samples";
      const res = await api.get(endpoint, { params });

      if (res.data?.data) {
        setAllSamples((prev) => [...prev, ...res.data.data]);
        setTotalItems(res.data.pagination?.totalCount ?? totalItems);
        setSkip(newSkip);
      }
    } catch {
      setError("Failed to load more samples.");
    } finally {
      setLoading(false);
    }
  };

  return {
    allSamples,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    canLoadMore,
    loadMore,
  };
};
