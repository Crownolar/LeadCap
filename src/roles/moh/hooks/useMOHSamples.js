import { useCallback, useEffect, useState } from "react";
import { getMOHSamples } from "../services/mohSampleService";

export const useMOHSamples = (initialFilters = {}) => {
  const [samples, setSamples] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    stateId: "",
    lgaId: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    ...initialFilters,
  });

  const fetchSamples = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMOHSamples(filters);
      const items = data?.items || data?.data || [];
      const total = data?.total || 0;
      const page = data?.page || filters.page || 1;
      const pageSize = data?.pageSize || filters.pageSize || 10;

      setSamples(items);
      setMeta({
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    } catch (err) {
      console.error("Failed to fetch MOH samples:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to fetch samples"
      );
      setSamples([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  return {
    samples,
    meta,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchSamples,
  };
};