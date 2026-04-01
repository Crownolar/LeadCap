import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../redux/slice/samplesSlice";
import DatabaseView from "../components/views/DatabaseView";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";

const Database = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchSampleError, setFetchSampleError] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filterState, setFilterState] = useState("all");
  const [filterProductVariant, setFilterProductVariant] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [states, setStates] = useState([]);
  const [fetchStateError, setFetchStateError] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  useEffect(() => {
    let params = { page: pagination.page, limit: 100 };
    const fetchSamplesData = async () => {
      setLoading(true);
      setFetchSampleError(false);
      try {
        const response = await api.get("/samples", { params });
        if (response.data.success) {
          setSamples((prev) => [...prev, ...response.data.data]);
          if (pagination.page === 1) {
            setPagination(
              response.data.pagination || { page: 1, totalPages: 1 },
            );
          }
        }
      } catch (err) {
        setFetchSampleError(err.message || "Failed to fetch samples");
      } finally {
        setLoading(false);
      }
    };

    fetchSamplesData();
  }, [pagination.page]);

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
        pagination={pagination}
        setPagination={setPagination}
        fetchSampleError={fetchSampleError}
      />
    </div>
  );
};

export default Database;
