/**
 * chartDataHelpers.js
 * Aggregation and data transformation functions for dashboard charts
 * Minimal set focused on current dashboard charts
 */

const monthNamesShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
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
  // Use finalStatus if available, fall back to aasStatus, then xrfStatus
  const statuses = sample.heavyMetalReadings.map((r) => {
    // Priority: finalStatus > aasStatus > xrfStatus > PENDING
    return r.finalStatus || r.aasStatus || r.xrfStatus || "PENDING";
  });
  if (statuses.includes("CONTAMINATED")) return "CONTAMINATED";
  if (statuses.includes("MODERATE")) return "MODERATE";
  if (statuses.every((s) => s === "SAFE")) return "SAFE";
  // If any status is PENDING, the overall sample is PENDING
  if (statuses.includes("PENDING")) return "PENDING";
  return "SAFE";
};

// ============================================
// MONTHLY AGGREGATION (Time-series data)
// ============================================

export const aggregateByMonth = (stats) => {
  return stats?.byMonth?.map((m) => ({
    month: m.month,
    detected: m.contaminated,
    safe: m.safe,
    critical: m.moderate,
    capacity:
      m.contaminated + m.safe + m.moderate > 0
        ? Math.round(
            ((m.contaminated + m.moderate) /
              (m.contaminated + m.safe + m.moderate)) *
              100,
          )
        : 0,
  }));
};

// ============================================
// LOCATION DATA (For location analysis chart)
// ============================================

export const deriveLocationData = (stats) => {
  if (!stats)
    return [{ location: "unknown", exposure: 0, capacity: 0, population: 50 }];

  const byLocation = stats?.byState
    ?.map((s) => ({
      location: s?.state,
      exposure: s?.contaminated,
      capacity: s?.count > 0 ? Math.round((s?.count / stats?.total) * 100) : 0,
      population: Math.max(50, s?.contaminated * 10),
    }))
    .sort((a, b) => b.exposure - a.exposure)
    .slice(0, 8);
  return byLocation;
};

// ============================================
// DETECTION METRICS (For radar chart)
// ============================================

export const deriveDetectionMetrics = (stats) => {
  const total = stats?.total || 1;

  // Accuracy: % of samples with lab confirmation (AAS readings)
  const samplesWithAAS =
    stats?.recentSamples?.filter((s) =>
      s.heavyMetalReadings?.some((r) => r.aasReading !== null),
    ).length ?? 0;

  const accuracy = Math.round((samplesWithAAS / total) * 100);

  // Coverage: % of samples with final results (not PENDING)
  const completedTests = stats?.totalSamples - stats?.pendingResults ?? 0;
  const coverage = Math.round((completedTests / total) * 100);

  // Equipment: % of samples with XRF reading recorded
  const samplesWithXRF = stats?.withResults ?? 0;
  const equipment = Math.round((samplesWithXRF / total) * 100);

  // Training: % of samples with quality notes (XRF or AAS notes)
  const samplesWithNotes =
    stats?.recentSamples?.filter((s) =>
      s.heavyMetalReadings?.some((r) => r.xrfNotes || r.aasNotes),
    ).length ?? 0;

  const training = Math.round((samplesWithNotes / total) * 100);

  // Response Time: Average days from creation to lab confirmation (scaled 0-100)
  // Fast (< 7 days) = 95, Slow (> 30 days) = 50

  let responseTime = 50;
  const samplesWithBothDates = stats?.recentSamples?.filter(
    (s) => s.createdAt && s.heavyMetalReadings?.some((r) => r.aasRecordedAt),
  );
  if (samplesWithBothDates?.length > 0) {
    const avgDays =
      samplesWithBothDates.reduce((sum, s) => {
        const maxAASDate = Math.max(
          ...s.heavyMetalReadings
            .filter((r) => r.aasRecordedAt)
            .map((r) => new Date(r.aasRecordedAt).getTime()),
        );
        const createdTime = new Date(s.createdAt).getTime();
        return sum + (maxAASDate - createdTime) / (1000 * 60 * 60 * 24);
      }, 0) / samplesWithBothDates.length ?? 1;

    // Scale: 7 days or less = 95, 30 days or more = 50
    responseTime = Math.max(50, Math.min(95, 95 - (avgDays - 7) * 1.5));
  }

  const metrics = {
    Accuracy: accuracy,
    Coverage: coverage,
    Equipment: equipment,
    Training: training,
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

export const calculateKPIs = (samples) => {
  const total = samples.length;

  const contaminated = samples.filter(
    (s) => getContaminationStatus(s) === "CONTAMINATED",
  ).length;

  const safe = samples.filter(
    (s) => getContaminationStatus(s) === "SAFE",
  ).length;

  const pending = samples.filter(
    (s) => getContaminationStatus(s) === "PENDING",
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
