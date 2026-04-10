export const getContaminationStatus = (sample) => {
  if (!sample) return "pending";

  if (sample.contaminationStatus) {
    return String(sample.contaminationStatus).toLowerCase();
  }

  if (sample.labStatus && String(sample.labStatus).toLowerCase() !== "completed") {
    return "pending";
  }

  if (typeof sample.leadLevel === "number") {
    if (sample.leadLevel > 90) return "contaminated";
    if (sample.leadLevel > 0) return "moderate";
    return "safe";
  }

  if (Array.isArray(sample.heavyMetalReadings) && sample.heavyMetalReadings.length > 0) {
    const maxValue = Math.max(
      ...sample.heavyMetalReadings
        .map((item) => Number(item?.value ?? item?.reading ?? 0))
        .filter((v) => !Number.isNaN(v))
    );

    if (maxValue > 90) return "contaminated";
    if (maxValue > 0) return "moderate";
    return "safe";
  }

  return "pending";
};

export const formatPercentage = (value) => `${Number(value || 0).toFixed(1)}%`;

export const aggregateMonthlyPolicyTrend = (samples = [], months = 6) => {
  const now = new Date();
  const monthMap = new Map();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthMap.set(key, {
      month: d.toLocaleString("default", { month: "short" }),
      total: 0,
      contaminated: 0,
      safe: 0,
      pending: 0,
      contaminationRate: 0,
    });
  }

  samples.forEach((sample) => {
    const dateValue = sample?.createdAt || sample?.updatedAt;
    if (!dateValue) return;

    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return;

    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!monthMap.has(key)) return;

    const record = monthMap.get(key);
    const status = getContaminationStatus(sample);

    record.total += 1;
    if (status === "contaminated") record.contaminated += 1;
    if (status === "safe") record.safe += 1;
    if (status === "pending") record.pending += 1;
  });

  return Array.from(monthMap.values()).map((item) => ({
    ...item,
    contaminationRate: item.total ? (item.contaminated / item.total) * 100 : 0,
  }));
};

export const deriveHotspotStates = (samples = []) => {
  const grouped = samples.reduce((acc, sample) => {
    const stateName = sample?.state?.name || "Unknown";
    const status = getContaminationStatus(sample);

    if (!acc[stateName]) {
      acc[stateName] = {
        state: stateName,
        total: 0,
        contaminated: 0,
        pending: 0,
      };
    }

    acc[stateName].total += 1;
    if (status === "contaminated") acc[stateName].contaminated += 1;
    if (status === "pending") acc[stateName].pending += 1;

    return acc;
  }, {});

  return Object.values(grouped)
    .map((item) => ({
      ...item,
      contaminationRate: item.total ? (item.contaminated / item.total) * 100 : 0,
      riskLevel:
        item.total && item.contaminationRate >= 35
          ? "High"
          : item.total && item.contaminationRate >= 15
          ? "Medium"
          : "Low",
    }))
    .sort((a, b) => b.contaminationRate - a.contaminationRate)
    .slice(0, 5);
};

export const deriveProductRiskRows = (samples = []) => {
  const grouped = samples.reduce((acc, sample) => {
    const productName =
      sample?.productVariant?.category?.name ||
      sample?.productVariant?.displayName ||
      sample?.productVariant?.name ||
      "Unknown";

    const status = getContaminationStatus(sample);

    if (!acc[productName]) {
      acc[productName] = {
        productType: productName,
        samples: 0,
        contaminated: 0,
      };
    }

    acc[productName].samples += 1;
    if (status === "contaminated") acc[productName].contaminated += 1;

    return acc;
  }, {});

  return Object.values(grouped)
    .map((item) => {
      const rate = item.samples ? (item.contaminated / item.samples) * 100 : 0;

      let riskLevel = "Low";
      let recommendation = "Routine monitoring";

      if (rate >= 35) {
        riskLevel = "High";
        recommendation = "Immediate market review";
      } else if (rate >= 15) {
        riskLevel = "Medium";
        recommendation = "Increase surveillance";
      }

      return {
        ...item,
        contaminationRate: rate,
        riskLevel,
        recommendation,
      };
    })
    .sort((a, b) => b.contaminationRate - a.contaminationRate)
    .slice(0, 8);
};

export const deriveAlerts = ({
  total = 0,
  contaminated = 0,
  pending = 0,
  hotspots = [],
  trend = [],
}) => {
  const alerts = [];

  if (hotspots.length > 0) {
    const top = hotspots[0];
    alerts.push({
      severity: "high",
      title: `${top.state} has the highest contamination burden`,
      message: `${top.state} recorded ${top.contaminationRate.toFixed(
        1
      )}% contamination across reviewed samples.`,
    });
  }

  if (trend.length >= 2) {
    const prev = trend[trend.length - 2];
    const current = trend[trend.length - 1];
    const delta = current.contaminationRate - prev.contaminationRate;

    if (delta > 0) {
      alerts.push({
        severity: "medium",
        title: "Contamination trend is increasing",
        message: `Contamination rate rose by ${delta.toFixed(
          1
        )} percentage points compared to the previous month.`,
      });
    } else {
      alerts.push({
        severity: "info",
        title: "Contamination trend is stable or improving",
        message: `Recent contamination movement shows no major upward spike.`,
      });
    }
  }

  if (pending > 0) {
    alerts.push({
      severity: "medium",
      title: "Pending cases may delay interventions",
      message: `${pending} samples still require verification or review.`,
    });
  }

  if (total > 0 && contaminated > 0) {
    alerts.push({
      severity: "info",
      title: "National contamination overview updated",
      message: `${contaminated} out of ${total} reviewed samples are contaminated.`,
    });
  }

  return alerts.slice(0, 4);
};

export const deriveRecommendations = ({ hotspots = [], productRows = [], pending = 0 }) => {
  const recommendations = [];

  if (hotspots.length > 0) {
    recommendations.push(`Prioritize inspection and intervention in ${hotspots[0].state}.`);
  }

  if (productRows.length > 0) {
    recommendations.push(
      `Increase surveillance for ${productRows[0].productType} due to elevated contamination risk.`
    );
  }

  if (pending > 0) {
    recommendations.push("Accelerate verification of pending samples to support timely action.");
  }

  recommendations.push("Use the geographical view to target high-risk states and markets.");

  return recommendations.slice(0, 4);
};

export const deriveExecutiveSummary = ({
  total = 0,
  contaminated = 0,
  hotspots = [],
  productRows = [],
  pending = 0,
}) => {
  const topState = hotspots[0]?.state || "key states";
  const topProduct = productRows[0]?.productType || "priority product groups";

  return `A total of ${total} samples were reviewed in the selected period. ${contaminated} samples were flagged as contaminated. Risk remains concentrated in ${topState} and around ${topProduct}. ${
    pending > 0
      ? `There are ${pending} pending cases that may affect timely intervention.`
      : "Pending verification is currently under control."
  }`;
};