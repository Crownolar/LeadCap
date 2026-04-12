import React from "react";
import { CheckCircle, Clock, Package, ShieldAlert } from "lucide-react";
import StatCard from "../../../components/common/StatCard";

const NafdacHeroStats = ({
  theme,
  registeredProducts,
  verifiedMatches,
  flaggedRecords,
  pendingReviews,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={Package}
        label="Registered Products"
        value={registeredProducts}
        color="bg-blue-600"
        subtext="Registry-linked records"
        theme={theme}
      />

      <StatCard
        icon={CheckCircle}
        label="Verified Matches"
        value={verifiedMatches}
        color="bg-green-600"
        subtext="Products matching registry records"
        theme={theme}
      />

      <StatCard
        icon={ShieldAlert}
        label="Flagged Records"
        value={flaggedRecords}
        color="bg-red-600"
        subtext="Require closer regulatory review"
        theme={theme}
      />

      <StatCard
        icon={Clock}
        label="Pending Reviews"
        value={pendingReviews}
        color="bg-yellow-500"
        subtext="Awaiting verification action"
        theme={theme}
      />
    </div>
  );
};

export default NafdacHeroStats;