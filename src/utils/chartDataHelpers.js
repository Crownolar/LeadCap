/**
 * chartDataHelpers.js
 * Aggregation and data transformation functions for dashboard charts
 * Minimal set focused on current dashboard charts
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
      critical: 0,
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
    else if (status === "MODERATE") monthObj.critical += 1;

    monthObj.count += 1;
  });

  return months.map((m) => ({
    month: m.label,
    detected: m.detected,
    safe: m.safe,
    critical: m.critical,
    capacity: m.count > 0 
      ? Math.round(((m.detected + m.critical) / m.count) * 100)
      : 0,
  }));
};

// ============================================
// LOCATION DATA (For location analysis chart)
// ============================================

/**
 * Derive location data for geographic visualization
 * @param {Array} samples - Filtered samples
 * @returns {Array} Location data with contamination metrics
 */
export const deriveLocationData = (samples) => {
  const byLocation = samples.reduce((acc, s) => {
    const loc = safeGet(s, "state.name") ?? "Unknown";
    acc[loc] = acc[loc] || { 
      exposure: 0, 
      samples: 0
    };
    
    const status = getContaminationStatus(s);
    if (status === "CONTAMINATED") {
      acc[loc].exposure += 1;
    }
    acc[loc].samples += 1;
    return acc;
  }, {});

  return Object.entries(byLocation)
    .map(([location, v]) => ({
      location,
      exposure: v.exposure,
      capacity: v.samples > 0 ? Math.round((v.samples / v.samples) * 100) : 0,
      population: Math.max(50, v.exposure * 10),
    }))
    .sort((a, b) => b.exposure - a.exposure)
    .slice(0, 8);
};

// ============================================
// DETECTION METRICS (For radar chart)
// ============================================

/**
 * Calculate detection and lab metrics based on actual sample data
 * @param {Array} samples - Filtered samples
 * @returns {Array} Metric data for radar chart
 */
export const deriveDetectionMetrics = (samples) => {
  const total = samples.length || 1;

  // Accuracy: % of samples with lab confirmation (AAS readings)
  const samplesWithAAS = samples.filter(
    (s) => s.heavyMetalReadings?.some((r) => r.aasReading !== null)
  ).length;
  const accuracy = Math.round((samplesWithAAS / total) * 100);

  // Coverage: % of samples with final results (not PENDING)
  const completedTests = samples.filter(
    (s) => {
      const status = getContaminationStatus(s);
      return status !== "PENDING";
    }
  ).length;
  const coverage = Math.round((completedTests / total) * 100);

  // Equipment: % of samples with XRF reading recorded
  const samplesWithXRF = samples.filter(
    (s) => s.heavyMetalReadings?.some((r) => r.xrfReading !== null)
  ).length;
  const equipment = Math.round((samplesWithXRF / total) * 100);

  // Training: % of samples with quality notes (XRF or AAS notes)
  const samplesWithNotes = samples.filter(
    (s) => s.heavyMetalReadings?.some((r) => r.xrfNotes || r.aasNotes)
  ).length;
  const training = Math.round((samplesWithNotes / total) * 100);

  // Response Time: Average days from creation to lab confirmation (scaled 0-100)
  // Fast (< 7 days) = 95, Slow (> 30 days) = 50
  let responseTime = 50;
  const samplesWithBothDates = samples.filter(
    (s) => s.createdAt && s.heavyMetalReadings?.some((r) => r.aasRecordedAt)
  );
  if (samplesWithBothDates.length > 0) {
    const avgDays = samplesWithBothDates.reduce((sum, s) => {
      const maxAASDate = Math.max(
        ...s.heavyMetalReadings
          .filter((r) => r.aasRecordedAt)
          .map((r) => new Date(r.aasRecordedAt).getTime())
      );
      const createdTime = new Date(s.createdAt).getTime();
      return sum + (maxAASDate - createdTime) / (1000 * 60 * 60 * 24);
    }, 0) / samplesWithBothDates.length;

    // Scale: 7 days or less = 95, 30 days or more = 50
    responseTime = Math.max(50, Math.min(95, 95 - (avgDays - 7) * 1.5));
  }

  const metrics = {
    "Accuracy": accuracy,
    "Coverage": coverage,
    "Equipment": equipment,
    "Training": training,
    "Response Time": Math.round(responseTime),
  };

  return Object.entries(metrics).map(([metric, value]) => ({
    metric,
    value: Math.round(value || 0),
  }));
};

// ============================================
// KPI CALCULATIONS
// ============================================

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

  return {
    total,
    contaminated,
    safe,
    pending,
    contaminationRate: total ? ((contaminated / total) * 100).toFixed(1) : 0,
    safeRate: total ? ((safe / total) * 100).toFixed(1) : 0,
  };
};
