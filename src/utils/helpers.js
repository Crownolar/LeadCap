import { getContaminationStatus } from './chartDataHelpers';

// Filter samples
export const filterSamples = (
  samples,
  searchTerm,
  filterState,
  filterCategory,
  filterProduct,
  filterStatus
) => {
  return samples.filter((sample) => {
    // Search by sample ID, product name, market, or brand
    const matchesSearch =
      sample.sampleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.market?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.brandName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by state
    const matchesState = filterState === "all" || sample.state?.id === filterState;
    
    // Filter by product category
    const matchesCategory = 
      filterCategory === "all" || sample.productVariant?.categoryId === filterCategory;
    
    // Filter by product variant
    const matchesProduct =
      filterProduct === "all" || sample.productVariant?.id === filterProduct;
    
    // Filter by contamination status (computed from heavy metal readings)
    const matchesStatus =
      filterStatus === "all" || getContaminationStatus(sample).toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesState && matchesCategory && matchesProduct && matchesStatus;
  });
};
