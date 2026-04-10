import React from "react";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PolicyRecommendationCard = ({ theme, recommendations = [] }) => {
  const navigate = useNavigate();

  return (
    <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
          <ShieldCheck size={18} />
        </div>

        <div>
          <h3 className="text-lg font-semibold">Recommended Actions</h3>
          <p className={`text-sm mt-1 ${theme.textMuted}`}>
            Suggested next steps based on current contamination patterns.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {recommendations.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className={`flex items-start gap-3 border ${theme.border} rounded-lg p-3`}
          >
            <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-semibold">
              {index + 1}
            </span>
            <p className="text-sm leading-6">{item}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/map")}
        className="mt-5 w-full px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium"
      >
        Open Geographical View
      </button>
    </div>
  );
};

export default PolicyRecommendationCard;