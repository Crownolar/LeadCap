import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../../redux/slice/samplesSlice";
import MapSampleDetailsModal from "../modals/MapSampleDetailsModal";
import { AlertTriangle, MapPin } from "lucide-react";
import Map from "../other/Map";
import api from "../../utils/api";

const MapView = ({ theme: propTheme, samples: propSamples }) => {
  const [mapDetails, setMapDetails] = useState({
    isOpen: false,
    samples: null,
  });
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch samples on mount if not provided via props
  useEffect(() => {
    setLoading(true);
    setError(false);
    api
      .get("/samples/geographic")
      .then((res) => {
        if (res.data.data?.length > 0) {
          setSamples(res.data.data);
          setLoading(false);
        } else {
          setSamples([]);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Filter samples with GPS coordinates
  const samplesWithCoords =
    samples?.filter((s) => s.gpsLatitude && s.gpsLongitude) || [];

  if (loading) {
    return (
      <p
        className={`text-center mt-6 sm:mt-10 text-base sm:text-lg animate-pulse  px-4 pt-[30px] pb-[30px] ${propTheme.text}`}
      >
        Loading Map...
      </p>
    );
  }
  if (error) {
    return (
      <div
        className={`border-l-4 border-red-600 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 sm:p-4 rounded shadow max-w-xl w-full`}
      >
        <h2 className='font-semibold text-base sm:text-lg flex items-center gap-2'>
          <>
            <AlertTriangle size={18} className='sm:w-5 sm:h-5' />
            Error ocurred. Try refreshing.
          </>
        </h2>
      </div>
    );
  }
  if (!error && !loading && !samplesWithCoords.length > 0) {
    return (
      <div className='bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex-shrink-0 self-end sm:self-auto'>
        <p className='text-white font-semibold text-xs sm:text-sm whitespace-nowrap'>
          {samplesWithCoords.length}{" "}
          {samplesWithCoords.length === 1 ? "sample" : "samples"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='border-0 rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-2xl bg-white dark:bg-gray-800'>
        {/* Map Header */}
        <div className='bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 dark:from-emerald-700 dark:via-emerald-600 dark:to-cyan-600 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3'>
          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0'>
            <svg
              className='w-5 h-5 sm:w-6 sm:h-6 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6.447 3.268A1 1 0 0021 19.382V8.618a1 1 0 00-1.553-.894L15 10m0 13V7m0 0L9.553 3.732A1 1 0 008 4.618v10.764'
              />
            </svg>
          </div>
          <div className='flex-1 min-w-0'>
            <h2 className='text-base sm:text-lg md:text-xl font-bold text-white truncate'>
              Geographic Distribution
            </h2>
            <p className='text-emerald-100 text-xs sm:text-sm truncate'>
              Interactive map of sample locations
            </p>
          </div>
        </div>
        <Map samples={samplesWithCoords} />
      </div>
    </>
  );
};

export default MapView;
