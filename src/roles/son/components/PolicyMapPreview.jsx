import React from "react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router";

const PolicyMapPreview = ({ theme, hotspotCount = 0, totalStates = 0 }) => {
  const navigate = useNavigate()
  return (
    <div
      className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${theme.text}`}>
          Geographical Risk Overview
        </h3>
        <p className={`text-sm ${theme.textMuted}`}>
          Distribution of contamination across states
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col">
          <span className={`text-xs ${theme.textMuted}`}>
            High Risk States
          </span>
          <span className={`text-xl font-semibold ${theme.text}`}>
            {hotspotCount}
          </span>
        </div>

        <div className="flex flex-col">
          <span className={`text-xs ${theme.textMuted}`}>
            States Covered
          </span>
          <span className={`text-xl font-semibold ${theme.text}`}>
            {totalStates}
          </span>
        </div>
      </div>

      {/* Map Placeholder */}
      <div
        className={`h-40 rounded-lg border ${theme.border} flex items-center justify-center mb-4`}
      >
        <div className="flex flex-col items-center gap-2">
          <MapPin className="w-6 h-6 text-emerald-500" />
          <span className={`text-sm ${theme.textMuted}`}>
            Map visualization coming soon
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        className="w-full py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
        onClick={() => {
          navigate("/map")
        }}
      >
        View Full Map
      </button>
    </div>
  );
};

export default PolicyMapPreview;