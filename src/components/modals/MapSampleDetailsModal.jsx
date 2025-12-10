import { useState } from "react";
import { X } from "lucide-react";
import MapSampleDetails from "../other/MapSampleDetails";
import CommentSection from "../other/CommentSection";

export default function MapSampleDetailsModal({ setMapDetails, mapDetails }) {
  const [commentSectionView, setCommentSectionView] = useState({
    isOpen: false,
    sample: null,
  });

  return (
    <>
      {/* Backdrop overlay - covers entire screen including sidebar */}
      <div 
        className="fixed inset-0 bg-black/40 z-[9998]"
        onClick={() => setMapDetails({ isOpen: false, samples: [] })}
      />
      
      {/* Modal - appears above sidebar */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="w-full max-h-[90vh] max-w-4xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col m-4">
            {/* Header - Sticky */}
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 px-6 py-4 rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <span className="text-white font-medium text-lg">Samples from:</span>
                <span className="text-white font-bold text-lg">
                  {mapDetails.samples[0]?.state?.name || "Unknown"}
                </span>
              </div>
              <button
                onClick={() => setMapDetails({ isOpen: false, samples: [] })}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {!commentSectionView.isOpen ? (
                <MapSampleDetails
                  samples={mapDetails.samples}
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
