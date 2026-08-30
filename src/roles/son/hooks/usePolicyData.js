import { useMemo } from "react";
import {
  aggregateMonthlyPolicyTrend,
  deriveAlerts,
  deriveExecutiveSummary,
  deriveHotspotStates,
  deriveProductRiskRows,
  deriveRecommendations,
  formatPercentage,
  getContaminationStatus,
} from "../utils/policyHelpers";

const usePolicyData = ({
  samples = [],
  filterState = "all",
  filterStatus = "all",
  fromDate = "",
  toDate = "",
}) => {
  const filteredSamples = useMemo(() => {
    return samples.filter((sample) => {
      if (filterState !== "all" && sample?.state?.id !== filterState) return false;

      const status = getContaminationStatus(sample);
      if (filterStatus !== "all" && status !== filterStatus) return false;

      const createdAt = sample?.createdAt ? new Date(sample.createdAt) : null;

      if (fromDate && createdAt && createdAt < new Date(fromDate)) return false;

      if (toDate && createdAt) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (createdAt > end) return false;
      }

      return true;
    });
  }, [samples, filterState, filterStatus, fromDate, toDate]);

  const metrics = useMemo(() => {
    const total = filteredSamples.length;
    const contaminated = filteredSamples.filter(
      (sample) => getContaminationStatus(sample) === "contaminated"
    ).length;
    const safe = filteredSamples.filter(
      (sample) => getContaminationStatus(sample) === "safe"
    ).length;
    const pending = filteredSamples.filter(
      (sample) => getContaminationStatus(sample) === "pending"
    ).length;

    const contaminationRate = total ? (contaminated / total) * 100 : 0;

    const hotspotStates = deriveHotspotStates(filteredSamples);
    const highRiskStates = hotspotStates.filter((item) => item.riskLevel === "High").length;
    const trendData = aggregateMonthlyPolicyTrend(filteredSamples, 6);
    const productRiskRows = deriveProductRiskRows(filteredSamples);
    const alerts = deriveAlerts({
      total,
      contaminated,
      pending,
      hotspots: hotspotStates,
      trend: trendData,
    });
    const recommendations = deriveRecommendations({
      hotspots: hotspotStates,
      productRows: productRiskRows,
      pending,
    });
    const executiveSummary = deriveExecutiveSummary({
      total,
      contaminated,
      hotspots: hotspotStates,
      productRows: productRiskRows,
      pending,
    });

    return {
      total,
      contaminated,
      safe,
      pending,
      contaminationRate,
      contaminationRateText: formatPercentage(contaminationRate),
      highRiskStates,
      hotspotStates,
      trendData,
      productRiskRows,
      alerts,
      recommendations,
      executiveSummary,
    };
  }, [filteredSamples]);

  return {
    filteredSamples,
    ...metrics,
  };
};

export default usePolicyData;