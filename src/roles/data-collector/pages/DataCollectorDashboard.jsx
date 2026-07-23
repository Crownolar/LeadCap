/**
 * DataCollectorDashboard.jsx
 * ───────────────────────────
 * Thin orchestrator for the Data Collector role page.
 *
 * Responsibilities:
 *   • Wires the three data hooks together
 *   • Derives filtered samples and unique variant list (useMemo)
 *   • Manages modal open/close state (detail, edit, heavy-metal)
 *   • Renders layout shell and delegates to focused sub-components
 *
 * NO data-fetching logic or API calls live here.
 * NO rendering logic beyond layout composition.
 */

import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../../context/ThemeContext";

import { useCollectorSamples } from "../hooks/useCollectorSamples";
import { useCollectorStats } from "../hooks/useCollectorStats";
import { useSupervisor } from "../hooks/useSupervisor";

import CollectorHeader from "../components/CollectorHeader";
import CollectorStats from "../components/CollectorStats";
import CollectorFilterBar from "../components/CollectorFilterBar";
import SampleList from "../components/SampleList";

import HeavyMetalFormModalNew from "../../../components/modals/lab-result_modal/HeavyMetalFormModalNew";
import SampleDetailModal from "../../../components/modals/SampleDetailModal";
import SampleFormModal from "../../../components/modals/SampleFormModal";

// ── Redux actions ─────────────────────────────────────────────────────────────
import { getSampleReadings } from "../../../redux/slice/heavyMetalSlice";
import { fetchSamples } from "../../../redux/slice/samplesSlice";
import api from "../../../utils/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const hasReadings = (sample) => (sample?.heavyMetalReadings ?? []).length > 0;

// ── Component ─────────────────────────────────────────────────────────────────

const DataCollectorDashboard = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  // ── Data hooks ──────────────────────────────────────────────────────────
  const {
    allSamples,
    loading: samplesLoading,
    error: samplesError,
    searchQuery,
    setSearchQuery,
    canLoadMore,
    loadMore,
  } = useCollectorSamples();

  const { stats } = useCollectorStats();
  const { supervisor, loading: loadingSupervisor } = useSupervisor();

  // ── Filter state ─────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("all");
  const [variantFilter, setVariantFilter] = useState("all");

  const hasActiveFilters =
    filterStatus !== "all" || variantFilter !== "all" || searchQuery.trim();

  const clearFilters = () => {
    setFilterStatus("all");
    setVariantFilter("all");
    setSearchQuery("");
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const uniqueVariants = useMemo(() => {
    const names = allSamples.map(
      (s) => s.productVariant?.displayName || s.productVariant?.name,
    );
    return [...new Set(names.filter(Boolean))];
  }, [allSamples]);

  const filteredSamples = useMemo(() => {
    return allSamples.filter((sample) => {
      if (filterStatus === "pending" && hasReadings(sample)) return false;
      if (filterStatus === "completed" && !hasReadings(sample)) return false;
      if (variantFilter !== "all") {
        const name =
          sample.productVariant?.displayName || sample.productVariant?.name;
        if (name !== variantFilter) return false;
      }
      return true;
    });
  }, [allSamples, filterStatus, variantFilter]);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [detailSample, setDetailSample] = useState(null);
  const [editSample, setEditSample] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [showHeavyMetalModal, setShowHeavyMetalModal] = useState(false);

  // ── Modal handlers ────────────────────────────────────────────────────────
  const handleAddResults = (sample) => {
    setSelectedSample(sample);
    setShowHeavyMetalModal(true);
  };

  const handleModalClose = () => {
    setShowHeavyMetalModal(false);
    if (selectedSample) dispatch(getSampleReadings(selectedSample.id));
    setSelectedSample(null);
  };

  const handleEditRequest = (sample) => {
    setDetailSample(null);
    setEditSample(sample);
  };

  const handleEditSubmit = async (payload) => {
    if (!editSample?.id) return;
    await api.put(`/samples/${editSample.id}`, payload);
    dispatch(fetchSamples());
    setEditSample(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${theme?.bg}`}>
      <div className='w-full max-w-6xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8'>
        <CollectorHeader
          currentUser={currentUser}
          supervisor={supervisor}
          loadingSupervisor={loadingSupervisor}
          theme={theme}
        />

        <CollectorStats
          stats={stats}
          allSamples={allSamples}
          samplesLoading={samplesLoading}
          hasReadings={hasReadings}
          theme={theme}
        />

        <CollectorFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          variantFilter={variantFilter}
          setVariantFilter={setVariantFilter}
          uniqueVariants={uniqueVariants}
          filteredCount={filteredSamples.length}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          theme={theme}
        />

        <SampleList
          filteredSamples={filteredSamples}
          allSamples={allSamples}
          loading={samplesLoading}
          error={samplesError}
          hasActiveFilters={hasActiveFilters}
          canLoadMore={canLoadMore}
          onLoadMore={loadMore}
          onView={setDetailSample}
          onAddResults={handleAddResults}
          clearFilters={clearFilters}
          filterStatus={filterStatus}
          theme={theme}
        />
      </div>

      {/* ── Modals ── */}
      {detailSample && (
        <SampleDetailModal
          theme={theme}
          sample={detailSample}
          onClose={() => setDetailSample(null)}
          onEditRequest={handleEditRequest}
        />
      )}

      {editSample && (
        <SampleFormModal
          onClose={() => setEditSample(null)}
          onSubmit={handleEditSubmit}
          mode='edit'
          initialSample={editSample}
        />
      )}

      {showHeavyMetalModal && selectedSample && (
        <HeavyMetalFormModalNew
          onClose={handleModalClose}
          sampleId={selectedSample.id}
          sampleData={selectedSample}
          existingReadings={
            allSamples.find((s) => s.id === selectedSample.id)
              ?.heavyMetalReadings ?? []
          }
        />
      )}
    </div>
  );
};

export default DataCollectorDashboard;
