/**
 * Report Generation Utilities
 * Helpers for creating reports with pdfkit backend integration
 */

/**
 * Get contamination status from heavy metal readings
 * Returns: SAFE, MODERATE, CONTAMINATED, or PENDING
 */
export const getContaminationStatus = (sample) => {
  if (!sample.heavyMetalReadings || sample.heavyMetalReadings.length === 0) {
    return 'PENDING'
  }

  // Check for contaminated status
  const hasContaminated = sample.heavyMetalReadings.some(r => r.finalStatus === 'CONTAMINATED')
  if (hasContaminated) return 'CONTAMINATED'

  // Check for moderate status
  const hasModerate = sample.heavyMetalReadings.some(r => r.finalStatus === 'MODERATE')
  if (hasModerate) return 'MODERATE'

  // Check for safe status
  const hasSafe = sample.heavyMetalReadings.some(r => r.finalStatus === 'SAFE')
  if (hasSafe) return 'SAFE'

  return 'PENDING'
}

/**
 * Get lead level from heavy metal readings
 */
export const getLeadLevel = (sample) => {
  if (!sample.heavyMetalReadings || sample.heavyMetalReadings.length === 0) {
    return 0
  }

  const leadReading = sample.heavyMetalReadings.find(r => r.heavyMetal === 'LEAD')
  if (!leadReading) return 0

  const reading = leadReading.xrfReading || leadReading.aasReading || 0
  return parseFloat(reading)
}

/**
 * Get product name from sample
 * Returns productVariant displayName or name
 */
export const getProductName = (sample) => {
  if (!sample.productVariant) return 'Unknown'
  return sample.productVariant.displayName || sample.productVariant.name || 'Unknown'
}

/**
 * Get product category name
 */
export const getCategoryName = (sample) => {
  if (!sample.productVariant?.category) return 'Unknown'
  return sample.productVariant.category.displayName || sample.productVariant.category.name || 'Unknown'
}

/**
 * Filter samples by date range
 */
export const filterByDateRange = (samples, dateFrom, dateTo) => {
  console.log(`  [filterByDateRange] Filtering from ${dateFrom} to ${dateTo}`);
  const filtered = samples.filter(s => {
    const sampleDate = new Date(s.createdAt);
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0); // Start of day
      console.log(`  [filterByDateRange] Comparing sample ${s.sampleId} date ${sampleDate.toISOString()} >= ${fromDate.toISOString()}`);
      if (sampleDate < fromDate) return false;
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      console.log(`  [filterByDateRange] Comparing sample ${s.sampleId} date ${sampleDate.toISOString()} <= ${toDate.toISOString()}`);
      if (sampleDate > toDate) return false;
    }
    
    return true;
  });
  console.log(`  [filterByDateRange] Result: ${filtered.length} samples matched`);
  return filtered;
}

/**
 * Filter samples by state
 */
export const filterByState = (samples, stateName) => {
  console.log(`  [filterByState] Filtering for state name: "${stateName}"`);
  if (!stateName) return samples;
  const filtered = samples.filter(s => {
    console.log(`  [filterByState] Comparing: "${s.state?.name}" === "${stateName}"`);
    return s.state?.name === stateName;
  });
  console.log(`  [filterByState] Result: ${filtered.length} samples matched`);
  return filtered;
}

/**
 * Filter samples by product variant
 */
export const filterByProductVariant = (samples, variantIds) => {
  console.log(`  [filterByProductVariant] Filtering by variant IDs:`, variantIds);
  if (!variantIds || variantIds.length === 0) return samples;
  const filtered = samples.filter(s => {
    const match = variantIds.includes(s.productVariant?.id);
    if (match) console.log(`  [filterByProductVariant] Matched variant: ${s.productVariant?.id}`);
    return match;
  });
  console.log(`  [filterByProductVariant] Result: ${filtered.length} samples matched`);
  return filtered;
}

/**
 * Filter samples by contamination status
 */
export const filterByContaminationStatus = (samples, status) => {
  if (!status) return samples
  return samples.filter(s => getContaminationStatus(s) === status)
}

/**
 * Filter samples with lead level above threshold
 */
export const filterByLeadLevel = (samples, minLevel) => {
  console.log(`  [filterByLeadLevel] Filtering for lead level >= ${minLevel}`);
  if (!minLevel) return samples;
  const filtered = samples.filter(s => {
    const level = getLeadLevel(s);
    return level >= minLevel;
  });
  console.log(`  [filterByLeadLevel] Result: ${filtered.length} samples matched`);
  return filtered;
}

/**
 * Format sample data for report
 */
export const formatSampleForReport = (sample) => {
  return {
    sampleId: sample.sampleId || 'N/A',
    productName: getProductName(sample),
    categoryName: getCategoryName(sample),
    state: sample.state?.name || 'Unknown',
    lga: sample.lga?.name || 'Unknown',
    market: sample.market?.name || 'Unknown',
    leadLevel: getLeadLevel(sample),
    status: getContaminationStatus(sample),
    createdAt: new Date(sample.createdAt).toLocaleDateString(),
    createdAtTime: new Date(sample.createdAt).toLocaleTimeString()
  }
}

/**
 * Generate table data for state summary report
 */
export const generateStateSummaryData = (samples) => {
  return samples.map(s => ({
    sampleId: s.sampleId || 'N/A',
    product: getProductName(s),
    leadLevel: `${getLeadLevel(s).toFixed(2)} ppm`,
    status: getContaminationStatus(s),
    date: new Date(s.createdAt).toLocaleDateString()
  }))
}

/**
 * Generate table data for product analysis report
 */
export const generateProductAnalysisData = (samples) => {
  const grouped = {}

  samples.forEach(s => {
    const product = getProductName(s)
    if (!grouped[product]) {
      grouped[product] = []
    }
    grouped[product].push(s)
  })

  return Object.entries(grouped).map(([product, items]) => ({
    product,
    totalSamples: items.length,
    contaminated: items.filter(s => getContaminationStatus(s) === 'CONTAMINATED').length,
    moderate: items.filter(s => getContaminationStatus(s) === 'MODERATE').length,
    safe: items.filter(s => getContaminationStatus(s) === 'SAFE').length,
    avgLeadLevel: `${(items.reduce((sum, s) => sum + getLeadLevel(s), 0) / items.length).toFixed(2)} ppm`
  }))
}

/**
 * Generate table data for contamination analysis
 */
export const generateContaminationAnalysisData = (samples) => {
  return samples.map(s => ({
    sampleId: s.sampleId || 'N/A',
    state: s.state?.name || 'Unknown',
    product: getProductName(s),
    leadLevel: `${getLeadLevel(s).toFixed(2)} ppm`,
    status: getContaminationStatus(s)
  }))
}

/**
 * Generate table data for risk assessment report
 */
export const generateRiskAssessmentData = (samples, minLeadLevel) => {
  const risky = samples.filter(s => getLeadLevel(s) >= minLeadLevel)

  return risky.map(s => ({
    sampleId: s.sampleId || 'N/A',
    product: getProductName(s),
    state: s.state?.name || 'Unknown',
    market: s.market?.name || 'Unknown',
    leadLevel: `${getLeadLevel(s).toFixed(2)} ppm`,
    risk: getLeadLevel(s) >= minLeadLevel * 2 ? 'HIGH' : 'MEDIUM',
    status: getContaminationStatus(s)
  }))
}

/**
 * Call backend PDF generation endpoint
 */
export const generateReportPDF = async (api, reportType, data, filename) => {
  try {
    // DEBUG: Log the exact endpoint being called
    console.log('🔴 [generateReportPDF] Starting PDF generation');
    console.log('   Report Type:', reportType);
    console.log('   Filename:', filename);
    console.log('   Data structure:', {
      isArray: Array.isArray(data),
      type: typeof data,
      hasDataProperty: data?.data ? true : false,
      dataLength: Array.isArray(data) ? data.length : (data?.data?.length || 0)
    });
    
    // Data can be either an array directly or an object with data property
    const dataArray = Array.isArray(data) ? data : (data?.data || []);
    console.log('   Data samples count:', dataArray.length);
    console.log('   Full data object keys:', Object.keys(data || {}));
    
    // The endpoint should be specific like /reports/generate/state-summary
    const endpoint = `/reports/generate/${reportType}`;
    console.log('   Endpoint:', endpoint);
    console.log('   Full URL will be:', `${api.defaults.baseURL}${endpoint}`);
    
    console.log('🟡 [generateReportPDF] Sending POST request...');
    console.log('   Request payload:', {
      type: reportType,
      data: data,
      payloadSize: JSON.stringify({ type: reportType, data }).length
    });
    
    const response = await api.post(endpoint, {
      type: reportType,
      data: data,
      filename: filename
    }, {
      responseType: 'blob'
    })

    console.log('🟢 [generateReportPDF] Success! Response received:', response.status);
    
    // Create blob URL and download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${filename}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.parentElement.removeChild(link)

    console.log('✅ [generateReportPDF] PDF downloaded successfully');
    return true
  } catch (error) {
    console.error('❌ [generateReportPDF] Failed to generate PDF');
    console.error('   Error Message:', error.message);
    console.error('   Error Code:', error.code);
    console.error('   Status:', error.response?.status);
    console.error('   Status Text:', error.response?.statusText);
    console.error('   URL:', error.config?.url);
    console.error('   Method:', error.config?.method);
    console.error('   Full Error:', error);
    throw error
  }
}
