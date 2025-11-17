import { useState } from "react";
import MapSampleDetails from "../other/MapSampleDetails";
import CommentSection from "../other/CommentSection";

export default function MapSampleDetailsModal({ setMapDetails, mapDetails }) {
  const [commentSectionView, setCommentSectionView] = useState({
    isOpen: false,
    sample: null,
  });

  return (
    <>
      <div className='bg-gray-900 absolute left-0 top-0 w-full h-full z-[1000]'>
        <div className='flex w-full items-center justify-between  p-3 '>
          <div className='w-3/4 gap-4 flex '>
            <span className='text-gray-300 font-medium'>Samples from:</span>
            <span className='text-gray-300 font-semibold'>
              {mapDetails.samples[0].state && mapDetails.samples[0].state}
            </span>
          </div>
          <span
            className='text-gray-300 font-medium cursor-pointer'
            onClick={() => setMapDetails({ isOpen: false, samples: [] })}
          >
            X
          </span>
        </div>
        <div>
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
    </>
  );
}
