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
  const hasContaminated = sample.heavyMetalReadings.some(r => r.status === 'CONTAMINATED')
  if (hasContaminated) return 'CONTAMINATED'

  // Check for moderate status
  const hasModerate = sample.heavyMetalReadings.some(r => r.status === 'MODERATE')
  if (hasModerate) return 'MODERATE'

  // Check for safe status
  const hasSafe = sample.heavyMetalReadings.some(r => r.status === 'SAFE')
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
  return samples.filter(s => {
    const sampleDate = new Date(s.createdAt)
    if (dateFrom && sampleDate < new Date(dateFrom)) return false
    if (dateTo && sampleDate > new Date(dateTo)) return false
    return true
  })
}

/**
 * Filter samples by state
 */
export const filterByState = (samples, stateId) => {
  if (!stateId) return samples
  return samples.filter(s => s.stateId === stateId)
}

/**
 * Filter samples by product variant
 */
export const filterByProductVariant = (samples, variantIds) => {
  if (!variantIds || variantIds.length === 0) return samples
  return samples.filter(s => variantIds.includes(s.productVariantId))
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
  if (!minLevel) return samples
  return samples.filter(s => getLeadLevel(s) >= minLevel)
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
    const response = await api.post('/reports/generate', {
      type: reportType,
      data: data,
      filename: filename
    }, {
      responseType: 'blob'
    })

    // Create blob URL and download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${filename}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.parentElement.removeChild(link)

    return true
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    throw error
  }
}
