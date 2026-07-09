import React from "react";
import { AlertTriangle, CheckCircle, Clock, MapPinned } from "lucide-react";
import StatCard from "../../../components/common/StatCard";

const PolicyHeroStats = ({
  theme,
  total,
  contaminationRateText,
  highRiskStates,
  pending,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={CheckCircle}
        label="Samples Reviewed"
        value={total}
        color="bg-blue-600"
        subtext="Across selected filters"
        theme={theme}
      />

      <StatCard
        icon={AlertTriangle}
        label="Contamination Rate"
        value={contaminationRateText}
        color="bg-red-600"
        subtext="Requires close attention"
        theme={theme}
      />

      <StatCard
        icon={MapPinned}
        label="High-Risk States"
        value={highRiskStates}
        color="bg-orange-500"
        subtext="Above intervention threshold"
        theme={theme}
      />

      <StatCard
        icon={Clock}
        label="Action Needed"
        value={pending}
        color="bg-yellow-500"
        subtext="Pending review or verification"
        theme={theme}
      />
    </div>
  );
};

export default PolicyHeroStats;