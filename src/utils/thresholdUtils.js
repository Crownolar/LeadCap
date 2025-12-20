/**
 * Threshold Management Utilities
 * Validation, formatting, and data manipulation helpers
 */

/**
 * Validate threshold limits
 * Ensures: safe < warning (if exists) < danger, all positive
 */
export const validateThresholdLimits = ({ safeLimit, warningLimit, dangerLimit }) => {
  // Check for valid numbers
  if (isNaN(safeLimit) || isNaN(dangerLimit) || (warningLimit && isNaN(warningLimit))) {
    return { valid: false, error: 'All limits must be valid numbers' }
  }

  // Check for negative values
  if (safeLimit < 0 || dangerLimit < 0 || (warningLimit && warningLimit < 0)) {
    return { valid: false, error: 'Limits must be positive numbers' }
  }

  // Validate order: safe < warning (if exists) < danger
  if (safeLimit >= (warningLimit || dangerLimit)) {
    return {
      valid: false,
      error: 'Safe limit must be less than warning limit (if provided) and danger limit'
    }
  }

  if (warningLimit && warningLimit >= dangerLimit) {
    return { valid: false, error: 'Warning limit must be less than danger limit' }
  }

  return { valid: true }
}

/**
 * Format decimal to 3 decimal places
 */
export const formatDecimal = (value) => {
  if (value === null || value === undefined) return '-'
  return parseFloat(value).toFixed(3)
}

/**
 * Get category display name by ID from categories array
 */
export const getCategoryName = (categoryId, categories) => {
  return categories.find(c => c.id === categoryId)?.displayName || 'Unknown'
}

/**
 * Format threshold data for API request
 */
export const formatThresholdPayload = (thresholdData) => {
  return {
    safeLimit: parseFloat(thresholdData.safeLimit),
    warningLimit: thresholdData.warningLimit ? parseFloat(thresholdData.warningLimit) : null,
    dangerLimit: parseFloat(thresholdData.dangerLimit)
  }
}

/**
 * Group thresholds by heavy metal
 */
export const groupByHeavyMetal = (thresholds) => {
  return thresholds.reduce((acc, threshold) => {
    const metal = threshold.heavyMetal
    if (!acc[metal]) acc[metal] = []
    acc[metal].push(threshold)
    return acc
  }, {})
}

/**
 * Group thresholds by category
 */
export const groupByCategory = (thresholds) => {
  return thresholds.reduce((acc, threshold) => {
    const categoryId = threshold.productCategoryId
    if (!acc[categoryId]) acc[categoryId] = []
    acc[categoryId].push(threshold)
    return acc
  }, {})
}
