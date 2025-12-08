import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../../redux/slice/samplesSlice";
import Database from "./Database";

const AllSamples = ({ theme }) => {
  const dispatch = useDispatch();
  const { samples, loading } = useSelector((state) => state.samples);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedSample, setSelectedSample] = useState(null);

  useEffect(() => {
    dispatch(fetchSamples({ page: 1, limit: 100 }));
  }, [dispatch]);

  const filteredSamples = samples.filter((sample) => {
    const matchesSearch =
      sample.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = filterState === "all" || sample.state === filterState;

    const matchesProduct =
      filterProduct === "all" || sample.productType === filterProduct;

    const matchesStatus =
      filterStatus === "all" || sample.status === filterStatus;

    return matchesSearch && matchesState && matchesProduct && matchesStatus;
  });

  return (
    <div>
      {loading && <p className="text-center py-4">Loading samples...</p>}

      <Database
        theme={theme}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterState={filterState}
        setFilterState={setFilterState}
        filterProduct={filterProduct}
        setFilterProduct={setFilterProduct}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filteredSamples={filteredSamples}
        setSelectedSample={setSelectedSample}
      />
    </div>
  );
};

export default AllSamples;
