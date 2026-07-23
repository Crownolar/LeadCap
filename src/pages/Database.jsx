import DatabaseView from "../components/views/DatabaseView";
import { useDatabase } from "../hooks/useDatabase";

const Database = () => {
  const {
    currentUser,
    theme,
    samples,
    loading,
    fetchSampleError,
    states,
    fetchStateError,
    pagination,
    setPagination,
    filterState,
    setFilterState,
    filterProductVariant,
    setFilterProductVariant,
    filterCategory,
    setFilterCategory,
    filterStatus,
    setFilterStatus,
    selectedSample,
    setSelectedSample,
    loadingMore,
    loadingMoreError,
    searchQuery,
    setSearchQuery,
    handleFetchMore,
    filteredSamplesArray,
  } = useDatabase();

  return (
    <div>
      <DatabaseView
        currentUser={currentUser}
        theme={theme}
        loading={loading}
        fetchSampleError={fetchSampleError}
        samples={samples}
        states={states}
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
        totalItems={pagination.totalCount || 0}
      />
    </div>
  );
};

export default Database;
