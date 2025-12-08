import { useState, useMemo } from "react";
import { filterSamples } from "../utils/helpers";

export const useSamples = (currentUser) => {
  const [samples, setSamples] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSample, setSelectedSample] = useState(null);

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

  const addSample = (formData) => {
  };

  const importSamples = (importedSamples) => {
    setSamples((prev) => [...prev, ...importedSamples]);
  };

  return {
    samples,
    setSamples,
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
  };
};
