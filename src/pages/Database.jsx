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
  const [pagination, setPagination] = useState({
    totalPages: 0,
    hasNextPage: false,
    skip: 0,
    take: 20,
  });

  const [filterState, setFilterState] = useState("all");
  const [filterProductVariant, setFilterProductVariant] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [states, setStates] = useState([]);
  const [fetchStateError, setFetchStateError] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  //
  const [loadingMore, setLoadingMore] = useState(null);
  const [loadingMoreError, setLoadingMoreError] = useState(null);

  // search
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // initital load
  useEffect(() => {
    const fetchSamplesData = async () => {
      setSamples([]);
      setLoading(true);
      setFetchSampleError(false);
      try {
        const params = {
          take: 20,
          skip: pagination.skip + pagination.take - 20,
          q: searchQuery ? searchQuery : undefined,
        };
        let response;
        if (!debouncedQuery) {
          response = await api.get("/samples", { params });
        } else {
          response = await api.get("/samples/search", { params });
        }

        if (response.data?.data) {
          setSamples(response.data.data);
          setPagination({
            totalPages: response.data.pagination?.totalCount || 0,
            hasNextPage: response.data.pagination?.hasNextPage || null,
            skip: response.data.pagination?.skip,
            take: response.data.pagination?.take,
          });
        }
      } catch (err) {
        setFetchSampleError(err.message || "Failed to fetch samples");
      } finally {
        setLoading(false);
      }
    };

    fetchSamplesData();
  }, [debouncedQuery]);

  const handleFetchMore = async () => {
    if (loading) return;
    if (!pagination.hasNextPage) return;
    setLoadingMore(true);
    setLoadingMoreError(false);

    try {
      const params = {
        take: 20,
        skip: pagination.skip + 20,
        q: searchQuery ? searchQuery : undefined,
      };
      const response = await api.get("/samples", { params });
      if (response.data.success) {
        setSamples((prev) => [...prev, ...response.data.data]);
        setPagination({
          totalPages: response.data.pagination?.totalCount || 0,
          hasNextPage: response.data.pagination?.hasNextPage || null,
          skip: response.data.pagination?.skip,
          take: response.data.pagination?.take,
        });
      }
    } catch (err) {
      setLoadingMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      console.log("search is true");
      setDebouncedQuery(searchQuery.trim());
      setPagination((prev) => ({ ...prev, skip: 0 }));
    }
  }, [searchQuery]);

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

  // console.log(samples);
  const filteredSamplesArray = samples.filter((sample) => {
    const matchesState =
      filterState === "all" || sample.state.id === filterState;

    const matchesProduct =
      filterProductVariant === "all" ||
      sample.productVariantId === filterProductVariant;

    const matchesStatus =
      filterStatus === "all" ||
      sample.contaminationStatus?.toLowerCase() === filterStatus;

    const matchCategory =
      filterCategory === "all" ||
      sample.productVariant.categoryId === filterCategory;

    return matchCategory && matchesState && matchesProduct && matchesStatus;
  });

  return (
    <div>
      <DatabaseView
        theme={theme}
        loading={loading}
        fetchSampleError={fetchSampleError}
        samples={samples}
        states={states}
        currentUser={currentUser}
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
        // pagination
        pagination={pagination}
        setPagination={setPagination}
        // search query
        searchTerm={searchQuery}
        setSearchTerm={setSearchQuery}
        // load-more props
        handleFetchMore={handleFetchMore}
        loadingMore={loadingMore}
        loadingMoreError={loadingMoreError}
        skip={pagination.skip}
        take={pagination.take}
        totalItems={pagination.totalItems || 0}
      />
    </div>
  );
};

export default Database;
