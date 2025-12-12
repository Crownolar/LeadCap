import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../../redux/slice/samplesSlice";
import MapSampleDetailsModal from "../modals/MapSampleDetailsModal";
import { MapPin } from "lucide-react";

// coordinates for LAGOS
const defaultPosition = [6.5244, 3.3792];

const FitBounds = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      try {
        const bounds = L.latLngBounds(
          markers.map((m) => {
            return [parseFloat(m.gpsLatitude), parseFloat(m.gpsLongitude)];
          })
        );

        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (e) {
        console.error(e.message);
      }
    }
  }, []);
};

const iconObject = (samplesLength, position) => {
  return new L.divIcon({
    className: "",
    html: ` <div class='relative '>
                <img
                src=${markerIcon}
                alt='marker'
                class='h-[50px]'
                />
                ${
                  samplesLength > 1
                    ? `<span class='absolute rounded-full grid place-items-center -top-2 -left-2 w-6 h-6 bg-red-800 text-white  '>
                ${samplesLength}
                </span>`
                    : ""
                }    
            </div>`,

    shadowUrl: markerShadow,
    iconSize: null,
    iconAnchor: position,
    popupAnchor: [-5, -35],
  });
};

const MapView = ({ theme: propTheme, samples: propSamples }) => {
  const dispatch = useDispatch();
  const { samples: reduxSamples } = useSelector((state) => state.samples);
  const samples = propSamples || reduxSamples || [];

  const [mapDetails, setMapDetails] = useState({
    isOpen: false,
    samples: null,
  });

  // Fetch samples on mount if not provided via props
  useEffect(() => {
    if (!propSamples) {
      dispatch(fetchSamples());
    }
  }, [dispatch, propSamples]);

  const sameLngAndLat = (samplesArray, LatAndLngArray) => {
    return samplesArray.filter(
      (s) =>
        parseFloat(s.gpsLatitude) === parseFloat(LatAndLngArray[0]) &&
        parseFloat(s.gpsLongitude) === parseFloat(LatAndLngArray[1])
    );
  };

  const getDefaultIcon = (samples, position) => {
    const samplesLength = sameLngAndLat(samples, position).length;
    return iconObject(samplesLength, position);
  };

  const handleMarkerClick = (samplesArray, LatAndLngArray) => {
    const samplesWithSameCoordinates = sameLngAndLat(
      samplesArray,
      LatAndLngArray
    );
    setMapDetails({ isOpen: true, samples: samplesWithSameCoordinates });
  };

  // Filter samples with GPS coordinates
  const samplesWithCoords = samples?.filter(
    (s) => s.gpsLatitude && s.gpsLongitude
  ) || [];

  if (samplesWithCoords.length === 0) {
    return (
      <div className={`${propTheme?.card} rounded-lg shadow-md p-6 border ${propTheme?.border} text-center py-12`}>
        <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className={propTheme?.textMuted}>
          No samples with GPS coordinates yet
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border-0 rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
        {/* Map Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-700 dark:via-blue-600 dark:to-cyan-600 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 003 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6.447 3.268A1 1 0 0021 19.382V8.618a1 1 0 00-1.553-.894L15 10m0 13V7m0 0L9.553 3.732A1 1 0 008 4.618v10.764" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Geographic Distribution</h2>
            <p className="text-blue-100 text-sm">Interactive map of sample locations</p>
          </div>
          {samplesWithCoords.length > 0 && (
            <div className="ml-auto bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white font-semibold text-sm">{samplesWithCoords.length} samples</p>
            </div>
          )}
        </div>

        {/* Map Container */}
        <MapContainer
          center={defaultPosition}
          zoom={13}
          style={{
            height: "600px",
            width: "100%",
          }}
          className="relative"
        >
          {/* Map Tiles */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          ></TileLayer>

          {/* Markers */}
          {samplesWithCoords.map((s) => {
            if (s.gpsLatitude && s.gpsLongitude) {
              const coord = [parseFloat(s.gpsLatitude), parseFloat(s.gpsLongitude)];
              const contaminationCount = sameLngAndLat(samplesWithCoords, coord).filter(
                (sample) => sample.status === "contaminated"
              ).length;

              return (
                <Marker
                  style={{ position: "relative" }}
                  key={s.id}
                  position={[parseFloat(s.gpsLatitude), parseFloat(s.gpsLongitude)]}
                  icon={getDefaultIcon(samplesWithCoords, [
                    parseFloat(s.gpsLatitude),
                    parseFloat(s.gpsLongitude),
                  ])}
                  eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    click: (e) => {
                      e.originalEvent.stopPropagation();
                      handleMarkerClick(samplesWithCoords, coord);
                    },
                    mouseout: (e) => e.target.closePopup(),
                  }}
                >
                  <Popup
                    closeOnClick={false}
                    autoClose={false}
                    closeButton={false}
                    className="custom-popup"
                  >
                    <div className="p-3 min-w-[250px]">
                      <div className="border-b pb-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-base">{s.state?.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{s.lga?.name}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 font-semibold">📌 Samples:</span>
                          <span className="text-sm font-bold text-blue-600">{sameLngAndLat(samplesWithCoords, coord).length}</span>
                        </div>
                        {contaminationCount > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 font-semibold">⚠️ Contaminated:</span>
                            <span className="text-sm font-bold text-red-600">{contaminationCount}</span>
                          </div>
                        )}
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Recent Products:</p>
                          <div className="space-y-1">
                            {sameLngAndLat(samplesWithCoords, coord).slice(0, 2).map((sample, idx) => (
                              <p key={idx} className="text-xs text-gray-700 truncate">
                                • {sample.productName || "Unknown"}
                              </p>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">Click to view all samples</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
          })}

          {/* Fit Bounds */}
          {samplesWithCoords.length > 0 && <FitBounds markers={samplesWithCoords} />}
        </MapContainer>

        {/* Map Legend */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-6 items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-600"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Contaminated Samples</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-blue-600"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Safe/Pending Samples</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-800 text-white text-xs flex items-center justify-center rounded-full font-bold">2</div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Multiple at Location</span>
            </div>
          </div>
        </div>
      </div>
      {mapDetails.isOpen && (
        <MapSampleDetailsModal
          setMapDetails={setMapDetails}
          mapDetails={mapDetails}
        />
      )}
    </>
  );
};

export default MapView;
