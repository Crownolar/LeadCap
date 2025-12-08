
// Filter samples
export const filterSamples = (
  samples,
  searchTerm,
  filterState,
  filterProduct,
  filterStatus
) => {
  return samples.filter((sample) => {
    const matchesSearch =
      sample.sampleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.market?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterState === "all" || sample.state?.id === filterState;
    const matchesProduct =
      filterProduct === "all" || sample.productType === filterProduct;
    const matchesStatus =
      filterStatus === "all" || sample.status === filterStatus;

    return matchesSearch && matchesState && matchesProduct && matchesStatus;
  });
};
