import { useMemo } from "react";
import {
  aggregateRegistryTrend,
  deriveFlaggedProducts,
  deriveRiskCategories,
  deriveVerificationSummary,
  isFlaggedRecord,
  isPendingReview,
  isRegisteredProduct,
  isVerifiedMatch,
} from "../utils/nafdacHelpers";

const useNafdacDashboardData = ({ samples = [] }) => {
  return useMemo(() => {
    const totalRecords = samples.length;
    const registeredProducts = samples.filter(isRegisteredProduct).length;
    const verifiedMatches = samples.filter(isVerifiedMatch).length;
    const flaggedRecords = samples.filter(isFlaggedRecord).length;
    const pendingReviews = samples.filter(isPendingReview).length;

    const verificationSummary = deriveVerificationSummary(samples);
    const trendData = aggregateRegistryTrend(samples, 6);
    // const riskCategories = deriveRiskCategories(samples);
    const flaggedProducts = deriveFlaggedProducts(samples);

    return {
      totalRecords,
      registeredProducts,
      verifiedMatches,
      flaggedRecords,
      pendingReviews,
      verificationSummary,
      trendData,
      // riskCategories,
      flaggedProducts,
    };
  }, [samples]);
};

export default useNafdacDashboardData;
