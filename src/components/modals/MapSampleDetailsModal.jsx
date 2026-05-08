import { useState } from "react";
import { X } from "lucide-react";
import MapSampleDetails from "../other/MapSampleDetails";
import CommentSection from "../other/CommentSection";
import { useTheme } from "../../context/ThemeContext";

export default function MapSampleDetailsModal({ setMapDetails, mapDetails }) {
  const { theme } = useTheme();
  const [commentSectionView, setCommentSectionView] = useState({
    isOpen: false,
    sample: null,
  });

  const samples = mapDetails.samples || [];
  const contaminated = samples.filter((s) => s.status === "CONTAMINATED").length;
  const safe = samples.filter((s) => s.status === "SAFE").length;
  const pending = samples.filter((s) => s.status === "PENDING").length;

  console.log(samples)

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/60"
        onClick={() => setMapDetails({ isOpen: false, samples: [] })}
      />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className={`w-full max-h-[90vh] max-w-4xl flex flex-col rounded-xl overflow-hidden shadow-2xl border ${theme.border}`}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0 bg-gradient-to-r from-emerald-700 to-emerald-500 border-b-2 border-emerald-400">
            <div className="flex items-center gap-3">
              <div>
                <span className="block text-[10px] tracking-widest uppercase font-mono text-emerald-200">
                  sample report
                </span>
                <span className="text-[15px] font-semibold text-white">
                  {samples[0]?.state?.name || "Unknown"}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-1 rounded bg-emerald-800/50 text-emerald-100 border border-emerald-400/40">
                {samples.length} sample{samples.length !== 1 ? "s" : ""}
              </span>
            </div>

            <button
              onClick={() => setMapDetails({ isOpen: false, samples: [] })}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-800/40 border border-emerald-400/40 text-emerald-100 hover:bg-emerald-800/70 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Summary bar */}
          {!commentSectionView.isOpen && (
            <div className={`flex flex-shrink-0 px-5 ${theme.card} border-b ${theme.border}`}>
              {[
                { label: "total", value: samples.length, color: theme.text },
                { label: "contaminated", value: contaminated, color: "text-red-500" },
                { label: "safe", value: safe, color: "text-emerald-500" },
                { label: "pending", value: pending, color: "text-amber-500" },
              ].map((stat, i, arr) => (
                <div
                  key={stat.label}
                  className={`py-2.5 pr-4 mr-4 ${i !== arr.length - 1 ? `border-r ${theme.border}` : ""}`}
                >
                  <span className={`block text-[18px] font-semibold font-mono leading-none ${stat.color}`}>
                    {stat.value}
                  </span>
                  <span className={`text-[10px] uppercase tracking-widest font-mono ${theme.textMuted}`}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${theme.bg}`}>
            {!commentSectionView.isOpen ? (
              <MapSampleDetails
                samples={samples}
                setCommentSectionView={setCommentSectionView}
              />
            ) : (
              <CommentSection
                commentSectionView={commentSectionView}
                setCommentSectionView={setCommentSectionView}
              />
            )}
          </div>

        </div>
      </div>
    </>
  );
}