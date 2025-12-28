import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import MapSampleDetailsModal from "../modals/MapSampleDetailsModal";

// Nigeria's precise center and bounds
const nigeriaCenter = [9.0820, 8.6753];
const defaultPosition = nigeriaCenter;
const nigeriaBounds = L.latLngBounds(
  [3.5, 2.3],   // Southwest corner
  [13.9, 14.7]  // Northeast corner
);

// Major state boundary lines
const nigeriaStateBoundaries = [
  // Northern boundary (international border with Niger)
  {
    coordinates: [[13.5, 2.5], [13.8, 14.6]],
    name: "Northern Border",
  },
  // Southern boundary (Gulf of Guinea coast)
  {
    coordinates: [[3.5, 2.3], [3.5, 14.7]],
    name: "Southern Border",
  },
  // Western boundary (Benin)
  {
    coordinates: [[3.5, 2.3], [13.5, 2.5]],
    name: "Western Border",
  },
  // Eastern boundary (Cameroon)
  {
    coordinates: [[3.5, 14.7], [13.8, 14.6]],
    name: "Eastern Border",
  },
  // Major internal state demarcation lines (North-South)
  {
    coordinates: [[3.6, 5.5], [13.7, 5.6]],
    name: "State Line 1",
  },
  {
    coordinates: [[3.6, 7.0], [13.7, 7.2]],
    name: "State Line 2",
  },
  {
    coordinates: [[3.6, 8.8], [13.7, 9.0]],
    name: "State Line 3",
  },
  {
    coordinates: [[3.6, 10.5], [13.7, 10.7]],
    name: "State Line 4",
  },
  // Major internal state demarcation lines (East-West)
  {
    coordinates: [[4.5, 2.3], [4.5, 14.7]],
    name: "State Line 5",
  },
  {
    coordinates: [[6.5, 2.3], [6.5, 14.7]],
    name: "State Line 6",
  },
  {
    coordinates: [[8.5, 2.3], [8.5, 14.7]],
    name: "State Line 7",
  },
  {
    coordinates: [[10.5, 2.3], [10.5, 14.7]],
    name: "State Line 8",
  },
  {
    coordinates: [[12.0, 2.3], [12.0, 14.7]],
    name: "State Line 9",
  },
];

const FitBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      try {
        // Responsive padding based on screen size
        const padding = window.innerWidth < 640 ? [20, 20] : [50, 50];
        map.fitBounds(nigeriaBounds, { padding });
      } catch (e) {
        console.error(e.message);
      }
    }
    // Restrict panning/zooming to Nigeria bounds
    map.setMaxBounds(nigeriaBounds);
    map.on('drag', function() {
      map.panInsideBounds(nigeriaBounds, { animate: false });
    });
  }, [map, markers.length]);

  return null;
};

const iconObject = (samplesLength) => {
  // Responsive marker size
  const isSmallScreen = window.innerWidth < 640;
  const markerHeight = isSmallScreen ? 35 : 50;
  const badgeSize = isSmallScreen ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm';
  const badgePosition = isSmallScreen ? '-top-1 -left-1' : '-top-2 -left-2';

  return new L.divIcon({
    className: "",
    html: `<div class='relative'>
             <img
               src=${markerIcon}
               alt='marker'
               class='h-[${markerHeight}px]'
             />
             ${
               samplesLength > 0
                 ? `<span class='absolute rounded-full grid place-items-center ${badgePosition} ${badgeSize} bg-red-800 text-white font-bold'>
               ${samplesLength}
             </span>`
                 : ""
             }    
           </div>`,
    shadowUrl: markerShadow,
    iconSize: null,
    iconAnchor: isSmallScreen ? [-5, 45] : [-5, 65],
    popupAnchor: isSmallScreen ? [0, -25] : [0, -35],
  });
};

export default function Map({ samples }) {
  const [mapDetails, setMapDetails] = useState({
    isOpen: false,
    samples: null,
  });

  const sameLngAndLat = (samplesArray, LatAndLngArray) => {
    return samplesArray.filter(
      (s) =>
        parseInt(s.gpsLatitude) == parseInt(LatAndLngArray[0]) &&
        parseInt(s.gpsLongitude) == parseInt(LatAndLngArray[1])
    );
  };

  const getDefaultIcon = (samples, position) => {
    const samplesLength = sameLngAndLat(samples, position).length;
    return iconObject(samplesLength);
  };

  const handleMarkerClick = (samplesArray, LatAndLngArray) => {
    const samplesWithSameCoordinates = sameLngAndLat(
      samplesArray,
      LatAndLngArray
    );

    setMapDetails({ isOpen: true, samples: samplesWithSameCoordinates });
  };

  return (
    <>
      <div className='relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]'>
        <MapContainer
          center={defaultPosition}
          zoom={6}
          minZoom={5}
          maxZoom={18}
          scrollWheelZoom={false}
          style={{
            height: "100%",
            width: "100%",
          }}
          className="rounded-lg sm:rounded-xl"
        >
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* State Boundary Lines */}
          {nigeriaStateBoundaries.map((boundary, idx) => (
            <Polyline
              key={idx}
              positions={boundary.coordinates}
              pathOptions={{
                color: idx < 4 ? "#d32f2f" : "#1976d2",
                weight: idx < 4 ? 3 : 2,
                opacity: 0.7,
                dashArray: idx < 4 ? "5,5" : "3,3",
                lineCap: "round",
              }}
            />
          ))}
          
          {/* Sample Markers */}
          {samples.map((s) => {
            if (s.gpsLatitude && s.gpsLongitude) {
              const coord = [Number(s.gpsLatitude), Number(s.gpsLongitude)];
              const contaminationCount = sameLngAndLat(samples, coord).filter(
                (sample) => sample.status === "CONTAMINATED"
              ).length;
              return (
                <Marker
                  style={{ position: "relative" }}
                  key={s.id}
                  position={[parseInt(s.gpsLatitude), parseInt(s.gpsLongitude)]}
                  icon={getDefaultIcon(samples, [
                    parseInt(s.gpsLatitude),
                    parseInt(s.gpsLongitude),
                  ])}
                  eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    click: (e) => {
                      e.originalEvent.stopPropagation();
                      handleMarkerClick(samples, coord);
                    },
                    mouseout: (e) => e.target.closePopup(),
                  }}
                >
                  <Popup
                    closeOnClick={false}
                    autoPan={false}
                    autoClose={false}
                    closeButton={false}
                    className='custom-popup'
                  >
                    <div className='min-w-[200px] sm:min-w-[250px] md:min-w-[300px] max-w-[280px] sm:max-w-[320px] z-[5000]'>
                      <div className='flex flex-col sm:flex-row justify-between gap-2 sm:gap-3'>
                        <div className='flex-shrink-0'>
                          <h3 className='font-bold text-gray-900 text-sm sm:text-base truncate'>
                            {s.state?.name}
                          </h3>
                        </div>

                        <div className='flex flex-col gap-1'>
                          <div className='flex items-center justify-between gap-2'>
                            <span className='text-xs text-gray-600 font-semibold whitespace-nowrap'>
                              📌 Samples:
                            </span>
                            <span className='text-xs sm:text-sm font-bold text-blue-600'>
                              {sameLngAndLat(samples, coord).length}
                            </span>
                          </div>
                          {contaminationCount > 0 && (
                            <div className='flex items-center justify-between gap-2'>
                              <span className='text-xs text-gray-600 font-semibold whitespace-nowrap'>
                                ⚠️ Contaminated:
                              </span>
                              <span className='text-xs sm:text-sm font-bold text-red-600'>
                                {contaminationCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='mt-2'>
                        <div className='border-t pt-2'>
                          <p className='text-xs text-gray-600 font-semibold mb-1'>
                            Recent Product:
                          </p>
                          <div>
                            {sameLngAndLat(samples, coord)
                              .slice(0, 1)
                              .map((sample, idx) => (
                                <p
                                  key={idx}
                                  className='text-xs text-gray-700 truncate'
                                >
                                  • {sample.productName || "Unknown"}
                                </p>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
          {samples && <FitBounds markers={samples} />}
        </MapContainer>

        {mapDetails.isOpen && (
          <MapSampleDetailsModal
            setMapDetails={setMapDetails}
            mapDetails={mapDetails}
          />
        )}
      </div>
    </>
  );
}