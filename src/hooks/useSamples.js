import { useState, useMemo, useEffect, useCallback } from "react";
import { filterSamples } from "../utils/helpers";
import api from "../utils/api";

export const useSamples = (currentUser) => {
  const [samples, setSamples] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSample, setSelectedSample] = useState(null);

  // Fetch samples from API
  const fetchSamples = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/samples");
      // Backend returns { success: true, data: [...] }
      setSamples(response.data.data || response.data || []);
    } catch (err) {
      console.error("Failed to fetch samples:", err);
      setError(err.response?.data?.message || "Failed to fetch samples");
      setSamples([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch states from API
  const fetchStates = useCallback(async () => {
    try {
      const response = await api.get("/management/states", { params: { activeOnly: "true" } });
      setStates(response.data.data || response.data || []);
    } catch (err) {
      console.error("Failed to fetch states:", err);
      setStates([]);
    }
  }, []);

  // Fetch samples and states on mount when user is authenticated
  useEffect(() => {
    if (currentUser) {
      fetchSamples();
      fetchStates();
    }
  }, [currentUser, fetchSamples, fetchStates]);

  const filteredSamples = useMemo(
    () =>
      filterSamples(
        samples,
        searchTerm,
        filterState,
        filterProduct,
        filterStatus
      ),
    [samples, searchTerm, filterState, filterProduct, filterStatus]
  );

  const addSample = async (formData) => {
    try {
      const response = await api.post("/samples", formData);
      // Refresh samples after adding
      await fetchSamples();
      return response.data;
    } catch (err) {
      console.error("Failed to add sample:", err);
      throw err;
    }
  };

  const importSamples = (importedSamples) => {
    setSamples((prev) => [...prev, ...importedSamples]);
  };

  return {
    samples,
    setSamples,
    states,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterState,
    setFilterState,
    filterProduct,
    setFilterProduct,
    filterStatus,
    setFilterStatus,
    selectedSample,
    setSelectedSample,
    filteredSamples,
    addSample,
    importSamples,
    fetchSamples,
  };
};
