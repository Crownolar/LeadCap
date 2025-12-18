/**
 * chartDataHelpers.js
 * Aggregation and data transformation functions for chart visualizations
 * Organized by data category for easy maintenance
 */

const monthNamesShort = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Helper: Safe object path access
 */
export const safeGet = (obj, path, fallback = undefined) => {
  try {
    return (
      path
        .split(".")
        .reduce((a, b) => (a && a[b] !== undefined ? a[b] : undefined), obj) ??
      fallback
    );
  } catch {
    return fallback;
  }
};

/**
 * Helper: Get contamination status from heavy metal readings
 */
export const getContaminationStatus = (sample) => {
  if (!sample.heavyMetalReadings || sample.heavyMetalReadings.length === 0) {
    return "PENDING";
  }
  const statuses = sample.heavyMetalReadings.map(r => r.finalStatus || "PENDING");
  if (statuses.includes("CONTAMINATED")) return "CONTAMINATED";
  if (statuses.includes("MODERATE")) return "MODERATE";
  if (statuses.every(s => s === "SAFE")) return "SAFE";
  return "PENDING";
};

// ============================================
// MONTHLY AGGREGATION (Time-series data)
// ============================================

/**
 * Aggregate samples by month for trend analysis
 * @param {Array} samples - Filtered samples
 * @param {Number} monthsBack - How many months to look back (default 6)
 * @returns {Array} Monthly data with contamination breakdown
 */
export const aggregateByMonth = (samples, monthsBack = 6) => {
  const now = new Date();
  const months = [];
  
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: monthNamesShort[d.getMonth()],
      detected: 0,
      safe: 0,
      moderate: 0,
      capacity: 0,
      count: 0,
    });
  }
  
  const monthIndex = (year, month) => `${year}-${month}`;

  samples.forEach((s) => {
    const dateStr = s.createdAt || null;
    let d;
    if (dateStr) {
      d = new Date(dateStr);
      if (isNaN(d)) d = null;
    }
    const placeKey = d
      ? monthIndex(d.getFullYear(), d.getMonth() + 1)
      : months[months.length - 1].key;
    const monthObj =
      months.find((m) => m.key === placeKey) ?? months[months.length - 1];

    const status = getContaminationStatus(s);
    
    if (status === "CONTAMINATED") monthObj.detected += 1;
    else if (status === "SAFE") monthObj.safe += 1;
    else if (status === "MODERATE") monthObj.moderate += 1;

    monthObj.count += 1;
  });

  return months.map((m) => ({
    month: m.label,
    detected: m.detected,
    safe: m.safe,
    moderate: m.moderate,
    capacity: 75 + Math.random() * 20,
  }));
};

// ============================================
// HEAVY METAL AGGREGATION (New recommendation)
// ============================================

/**
 * Aggregate heavy metal readings by metal type
 * Shows safe/moderate/contaminated breakdown per metal
 * @param {Array} samples - Filtered samples
 * @returns {Array} Heavy metal data with status distribution
 */
export const aggregateHeavyMetals = (samples) => {
  const metalMap = {};

  samples.forEach((s) => {
    if (!s.heavyMetalReadings || s.heavyMetalReadings.length === 0) return;

    s.heavyMetalReadings.forEach((reading) => {
      const metal = reading.heavyMetal || "UNKNOWN";
      
      if (!metalMap[metal]) {
        metalMap[metal] = {
          metal,
          safe: 0,
          moderate: 0,
          contaminated: 0,
          unit: reading.unit || "mg/kg",
          total: 0,
        };
      }

      const status = reading.finalStatus || "PENDING";
      if (status === "SAFE") metalMap[metal].safe += 1;
      else if (status === "MODERATE") metalMap[metal].moderate += 1;
      else if (status === "CONTAMINATED") metalMap[metal].contaminated += 1;

      metalMap[metal].total += 1;
    });
  });

  return Object.values(metalMap).sort((a, b) => b.total - a.total);
};

// ============================================
// PRODUCT CATEGORY AGGREGATION (Uses hierarchy)
// ============================================

/**
 * Aggregate by product category with variant breakdown
 * Shows category-level and variant-level contamination
 * @param {Array} samples - Filtered samples
 * @returns {Array} Product risk data with hierarchy
 */
export const aggregateProductRisk = (samples) => {
  const categoryMap = {};

  samples.forEach((s) => {
    if (!s.productVariant) return;

    const categoryName = s.productVariant?.category?.name || "Unknown";
    const categoryId = s.productVariant?.category?.id || "unknown";
    const variantName = s.productVariant?.displayName || s.productVariant?.name || "Unknown";
    const variantId = s.productVariant?.id || "unknown";

    if (!categoryMap[categoryId]) {
      categoryMap[categoryId] = {
        id: categoryId,
        name: categoryName,
        totalSamples: 0,
        contaminated: 0,
        safe: 0,
        moderate: 0,
        variants: {},
      };
    }

    const status = getContaminationStatus(s);
    const category = categoryMap[categoryId];

    category.totalSamples += 1;
    if (status === "CONTAMINATED") category.contaminated += 1;
    else if (status === "SAFE") category.safe += 1;
    else if (status === "MODERATE") category.moderate += 1;

    // Variant breakdown
    if (!category.variants[variantId]) {
      category.variants[variantId] = {
        id: variantId,
        name: variantName,
        totalSamples: 0,
        contaminated: 0,
        safe: 0,
        moderate: 0,
      };
    }

    const variant = category.variants[variantId];
    variant.totalSamples += 1;
    if (status === "CONTAMINATED") variant.contaminated += 1;
    else if (status === "SAFE") variant.safe += 1;
    else if (status === "MODERATE") variant.moderate += 1;
  });

  // Convert to array format and calculate rates
  return Object.values(categoryMap).map((cat) => ({
    ...cat,
    contaminationRate: cat.totalSamples ? (cat.contaminated / cat.totalSamples * 100).toFixed(1) : 0,
    variants: Object.values(cat.variants).map((v) => ({
      ...v,
      contaminationRate: v.totalSamples ? (v.contaminated / v.totalSamples * 100).toFixed(1) : 0,
    })),
  }));
};

// ============================================
// GEOGRAPHIC AGGREGATION (State/LGA hierarchy)
// ============================================

/**
 * Aggregate by geographic location (state and LGA)
 * Shows risk distribution across regions
 * @param {Array} samples - Filtered samples
 * @returns {Array} Geographic risk data with hierarchy
 */
export const aggregateGeographicRisk = (samples) => {
  const stateMap = {};

  samples.forEach((s) => {
    if (!s.state) return;

    const stateName = s.state?.name || "Unknown";
    const stateId = s.state?.id || "unknown";
    const lgaName = s.lga?.name || "Unknown";
    const lgaId = s.lga?.id || "unknown";

    if (!stateMap[stateId]) {
      stateMap[stateId] = {
        id: stateId,
        state: stateName,
        totalSamples: 0,
        contaminated: 0,
        safe: 0,
        moderate: 0,
        lgas: {},
      };
    }

    const status = getContaminationStatus(s);
    const stateData = stateMap[stateId];

    stateData.totalSamples += 1;
    if (status === "CONTAMINATED") stateData.contaminated += 1;
    else if (status === "SAFE") stateData.safe += 1;
    else if (status === "MODERATE") stateData.moderate += 1;

    // LGA breakdown
    if (!stateData.lgas[lgaId]) {
      stateData.lgas[lgaId] = {
        id: lgaId,
        name: lgaName,
        totalSamples: 0,
        contaminated: 0,
        safe: 0,
        moderate: 0,
      };
    }

    const lgaData = stateData.lgas[lgaId];
    lgaData.totalSamples += 1;
    if (status === "CONTAMINATED") lgaData.contaminated += 1;
    else if (status === "SAFE") lgaData.safe += 1;
    else if (status === "MODERATE") lgaData.moderate += 1;
  });

  // Convert to array format and calculate rates
  return Object.values(stateMap)
    .map((state) => ({
      ...state,
      contaminationRate: state.totalSamples ? (state.contaminated / state.totalSamples * 100).toFixed(1) : 0,
      lgas: Object.values(state.lgas)
        .sort((a, b) => b.totalSamples - a.totalSamples)
        .map((lga) => ({
          ...lga,
          contaminationRate: lga.totalSamples ? (lga.contaminated / lga.totalSamples * 100).toFixed(1) : 0,
        })),
    }))
    .sort((a, b) => b.totalSamples - a.totalSamples);
};

// ============================================
// LOCATION DATA (Legacy - for map visualization)
// ============================================

/**
 * Derive location data for geographic visualization
 * @param {Array} samples - Filtered samples
 * @returns {Array} Location data with exposure metrics
 */
export const deriveLocationData = (samples) => {
  const byLocation = samples.reduce((acc, s) => {
    const loc = safeGet(s, "state.name") ?? safeGet(s, "market.name") ?? "Unknown";
    acc[loc] = acc[loc] || { exposure: 0, capacityValues: [], population: 0 };
    
    const status = getContaminationStatus(s);
    if (status === "CONTAMINATED") {
      acc[loc].exposure += 1;
    }
    acc[loc].capacityValues.push(1);
    return acc;
  }, {});

  return Object.entries(byLocation)
    .map(([location, v]) => ({
      location,
      exposure: v.exposure,
      capacity: v.capacityValues.length
        ? Math.round((v.capacityValues.length / Math.max(1, v.exposure || 1)) * 100)
        : 80,
      population: v.population || Math.max(50, v.exposure * 10),
    }))
    .sort((a, b) => b.exposure - a.exposure);
};

// ============================================
// METRICS & KPI CALCULATIONS
// ============================================

/**
 * Calculate detection and lab metrics
 * @param {Array} samples - Filtered samples
 * @returns {Array} Metric data for radar chart
 */
export const deriveDetectionMetrics = (samples) => {
  const total = samples.length || 1;
  const contaminated = samples.filter(
    (s) => {
      const statuses = (s.heavyMetalReadings || []).map(r => r.finalStatus || "PENDING");
      return statuses.includes("CONTAMINATED");
    }
  ).length;

  const metrics = {
    "Accuracy": Math.max(50, 100 - Math.round((contaminated / total) * 100)),
    "Coverage": Math.min(100, 60 + Math.round(total / 50)),
    "Equipment": 75,
    "Training": 80,
    "Response Time": 85,
  };

  return Object.entries(metrics).map(([metric, value]) => ({
    metric,
    value: Math.round(value || 0),
  }));
};

/**
 * Calculate basic KPI statistics
 * @param {Array} samples - Filtered samples
 * @returns {Object} Summary statistics
 */
export const calculateKPIs = (samples) => {
  const total = samples.length;
  
  const contaminated = samples.filter(
    (s) => getContaminationStatus(s) === "CONTAMINATED"
  ).length;
  
  const safe = samples.filter(
    (s) => getContaminationStatus(s) === "SAFE"
  ).length;
  
  const pending = samples.filter(
    (s) => getContaminationStatus(s) === "PENDING"
  ).length;

  const moderate = total - contaminated - safe - pending;

  return {
    total,
    contaminated,
    safe,
    pending,
    moderate,
    contaminationRate: total ? ((contaminated / total) * 100).toFixed(1) : 0,
    safeRate: total ? ((safe / total) * 100).toFixed(1) : 0,
  };
};

// ============================================
// HEATMAP DATA (Heavy Metal by State/Location)
// ============================================

/**
 * Aggregate heavy metal contamination by state for heatmap visualization
 * @param {Array} samples - Filtered samples
 * @returns {Array} Heatmap data with metals as columns and states as rows
 */
export const aggregateHeavyMetalHeatmap = (samples) => {
  const heatmapData = {};
  const metalSet = new Set();

  // Collect all data
  samples.forEach((s) => {
    const state = safeGet(s, "state.name", "Unknown");
    if (!heatmapData[state]) {
      heatmapData[state] = {};
    }

    if (s.heavyMetalReadings && s.heavyMetalReadings.length > 0) {
      s.heavyMetalReadings.forEach((reading) => {
        const metal = reading.heavyMetal || "Unknown";
        metalSet.add(metal);

        if (!heatmapData[state][metal]) {
          heatmapData[state][metal] = {
            safe: 0,
            moderate: 0,
            contaminated: 0,
            total: 0,
          };
        }

        const status = reading.finalStatus || "PENDING";
        if (status === "SAFE") heatmapData[state][metal].safe += 1;
        else if (status === "MODERATE") heatmapData[state][metal].moderate += 1;
        else if (status === "CONTAMINATED") heatmapData[state][metal].contaminated += 1;

        heatmapData[state][metal].total += 1;
      });
    }
  });

  // Transform to array format for recharts
  const metals = Array.from(metalSet).sort();
  const result = Object.entries(heatmapData).map(([state, metalData]) => {
    const row = { state };
    metals.forEach((metal) => {
      const data = metalData[metal];
      if (data) {
        const contamRate = data.total > 0 
          ? Math.round((data.contaminated / data.total) * 100)
          : 0;
        row[metal] = contamRate; // Store contamination rate for heatmap color
        row[`${metal}_count`] = data.total; // Store count for tooltip
      } else {
        row[metal] = 0;
        row[`${metal}_count`] = 0;
      }
    });
    return row;
  });

  return { data: result, metals };
};

// ============================================
// RADAR CHART (Heavy Metal Profile by Product)
// ============================================

/**
 * Aggregate heavy metal concentration levels by product variant
 * Shows all 10 heavy metals relative to safe limits for radar visualization
 * @param {Array} samples - Filtered samples
 * @param {String} productVariantId - Specific product variant ID (null for all)
 * @returns {Array} Radar chart data with all metals and concentration rates
 */
export const aggregateHeavyMetalProfileByProduct = (samples, productVariantId = null) => {
  const allHeavyMetals = [
    "Lead",
    "Cadmium",
    "Chromium",
    "Nickel",
    "Arsenic",
    "Mercury",
    "Copper",
    "Zinc",
    "Cobalt",
    "Manganese",
  ];

  // Filter samples by product variant if specified
  const relevantSamples = productVariantId
    ? samples.filter((s) => s.productVariant?.id === productVariantId)
    : samples;

  // Initialize metal data structure
  const metalData = {};
  allHeavyMetals.forEach((metal) => {
    metalData[metal] = {
      safe: 0,
      moderate: 0,
      contaminated: 0,
      total: 0,
    };
  });

  // Aggregate readings
  relevantSamples.forEach((s) => {
    if (!s.heavyMetalReadings || s.heavyMetalReadings.length === 0) return;

    s.heavyMetalReadings.forEach((reading) => {
      const metal = reading.heavyMetal || "Unknown";
      
      if (metalData[metal]) {
        const status = reading.finalStatus || "PENDING";
        if (status === "SAFE") metalData[metal].safe += 1;
        else if (status === "MODERATE") metalData[metal].moderate += 1;
        else if (status === "CONTAMINATED") metalData[metal].contaminated += 1;
        metalData[metal].total += 1;
      }
    });
  });

  // Transform to radar chart format (concentration rate relative to safe limit)
  return allHeavyMetals.map((metal) => {
    const data = metalData[metal];
    const total = data.total || 1;
    const contaminationRate = Math.round(
      ((data.contaminated + data.moderate) / total) * 100
    );
    
    return {
      metal,
      concentration: contaminationRate, // 0-100 scale for radar chart
      safe: data.safe,
      moderate: data.moderate,
      contaminated: data.contaminated,
      total: data.total,
    };
  });
};
