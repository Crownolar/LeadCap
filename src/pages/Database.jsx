import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../redux/slice/samplesSlice";
import DatabaseView from "../components/views/DatabaseView";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";

const Database = () => {
  const dispatch = useDispatch();
  const { samples, loading } = useSelector((state) => state.samples);
  const { currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterProductVariant, setFilterProductVariant] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [states, setStates] = useState([]);
  const [fetchStateError, setFetchStateError] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  useEffect(() => {
    dispatch(fetchSamples({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.get("/management/states", {
          params: { activeOnly: "true" },
        });
        setStates(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch states:", err);
        setFetchStateError(true);
      }
    };
    fetchStates();
  }, []);

  const filteredSamplesArray = samples.filter((sample) => {
    const matchesSearch =
      sample.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState =
      filterState === "all" || sample.state.id === filterState;

    const matchesProduct =
      filterProductVariant === "all" ||
      sample.productVariantId === filterProductVariant;

    const matchesStatus =
      filterStatus === "all" || sample.status === filterStatus;

    const matchCategory =
      filterCategory === "all" ||
      sample.productVariant.categoryId === filterCategory;

    return (
      matchesSearch &&
      matchCategory &&
      matchesState &&
      matchesProduct &&
      matchesStatus
    );
  });

  return (
    <div>
      <DatabaseView
        theme={theme}
        loading={loading}
        samples={samples}
        states={states}
        currentUser={currentUser}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterState={filterState}
        setFilterState={setFilterState}
        filterProductVariant={filterProductVariant}
        setFilterProductVariant={setFilterProductVariant}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filteredSamples={filteredSamplesArray}
        selectedSample={selectedSample}
        setSelectedSample={setSelectedSample}
        fetchStateError={fetchStateError}
      />
    </div>
  );
};

export default Database;
