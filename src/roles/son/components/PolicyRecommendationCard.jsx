import React from "react";
import { ShieldCheck, MapPinned, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
const PolicyRecommendationCard = ({ theme, recommendations = [] }) => {
  const navigate = useNavigate();
  return (
    <section
      className={`${theme.card} ${theme.border} border rounded-2xl p-5 shadow-sm xl:col-span-2`}
    >
      <div className="flex gap-3">
        <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold">Recommended actions</p>
          <p className={`mt-1 text-xs ${theme.textMuted}`}>
            Suggested responses based on current patterns
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {recommendations.length ? (
          recommendations.map((item, i) => (
            <div
              key={`${item}-${i}`}
              className={`flex gap-3 rounded-xl ${theme.bg} ${theme.border} border p-3`}
            >
              <span className="h-6 w-6 shrink-0 rounded-lg bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-xs sm:text-sm leading-5">{item}</p>
            </div>
          ))
        ) : (
          <p className={`text-sm ${theme.textMuted}`}>
            No recommendations available.
          </p>
        )}
      </div>
      <button
        onClick={() => navigate("/map")}
        className="mt-4 w-full inline-flex justify-center items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
      >
        <MapPinned className="h-4 w-4" /> Open geographical view
      </button>
    </section>
  );
};
export default PolicyRecommendationCard;
