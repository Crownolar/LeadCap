import React from "react";
import { MapPin, ExternalLink, Layers3 } from "lucide-react";
import { useNavigate } from "react-router";
const PolicyMapPreview = ({ theme, hotspotCount = 0, totalStates = 0 }) => {
  const navigate = useNavigate();
  return (
    <section
      className={`${theme.card} ${theme.border} border rounded-2xl p-5 shadow-sm`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-bold">Geographical risk overview</p>
          <p className={`mt-1 text-xs ${theme.textMuted}`}>
            Distribution of contamination across states
          </p>
        </div>
        <Layers3 className="h-4 w-4 text-emerald-600" />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className={`${theme.bg} ${theme.border} border rounded-xl p-3`}>
          <p className={`text-[10px] uppercase font-bold ${theme.textMuted}`}>
            High-risk states
          </p>
          <p className="mt-1 text-xl font-black">{hotspotCount}</p>
        </div>
        <div className={`${theme.bg} ${theme.border} border rounded-xl p-3`}>
          <p className={`text-[10px] uppercase font-bold ${theme.textMuted}`}>
            States covered
          </p>
          <p className="mt-1 text-xl font-black">{totalStates}</p>
        </div>
      </div>
      <div
        className={`relative mt-4 h-48 rounded-2xl border ${theme.border} overflow-hidden ${theme.bg}`}
      >
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,.5),transparent_25%),radial-gradient(circle_at_70%_65%,rgba(59,130,246,.4),transparent_25%)]" />
        <div className="relative h-full flex flex-col items-center justify-center">
          <div className="h-11 w-11 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-xs font-semibold">Geospatial layer</p>
          <p className={`text-[11px] ${theme.textMuted}`}>
            Open the full map for state-level detail
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate("/map")}
        className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 inline-flex items-center justify-center gap-2"
      >
        <ExternalLink className="h-4 w-4" /> View full map
      </button>
    </section>
  );
};
export default PolicyMapPreview;
