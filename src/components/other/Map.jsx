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
// Nigeria: 9.0820° N, 8.6753° E (center)
// Borders: West - Benin (773 km), East - Cameroon (1,690 km), North - Niger (1,497 km), South - Gulf of Guinea
const nigeriaCenter = [9.0820, 8.6753]; // Nigeria's precise center
const defaultPosition = nigeriaCenter;
const nigeriaBounds = L.latLngBounds(
  [3.5, 2.3],   // Southwest corner (Gulf of Guinea coastal area)
  [13.9, 14.7]  // Northeast corner (Niger/Chad border area)
);

// Major state boundary lines for demarcation (simplified major state borders)
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
        map.fitBounds(nigeriaBounds, { padding: [50, 50] });
      } catch (e) {
        console.error(e.message);
      }
    }
    // Restrict panning/zooming to Nigeria bounds
    map.setMaxBounds(nigeriaBounds);
    map.on('drag', function() {
      map.panInsideBounds(nigeriaBounds, { animate: false });
    });
  }, [map]);
};

const iconObject = (samplesLength) => {
  return new L.divIcon({
    className: "",
    html: ` <div class='relative '>
                <img
                src=${markerIcon}
                alt='marker'
                class='h-[50px]'
                />
                ${
                  samplesLength > 0
                    ? `<span class='absolute rounded-full grid place-items-center -top-2 -left-2 w-6 h-6 bg-red-800 text-white  '>
                ${samplesLength}
                </span>`
                    : ""
                }    
            </div>`,

    shadowUrl: markerShadow,
    iconSize: null,
    iconAnchor: [-5, 65],
    popupAnchor: [0, -35],
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
      <div className='relative h-[700px]  '>
        <MapContainer
          center={defaultPosition}
          zoom={6}
          minZoom={6}
          maxZoom={18}
          scrollWheelZoom={false}
          style={{
            height: "600px",
            width: "100%",
          }}
        >
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          ></TileLayer>
          
          {/* State Boundary Lines */}
          {nigeriaStateBoundaries.map((boundary, idx) => (
            <Polyline
              key={idx}
              positions={boundary.coordinates}
              pathOptions={{
                color: idx < 4 ? "#d32f2f" : "#1976d2", // Red for international borders, blue for internal borders
                weight: idx < 4 ? 3 : 2, // Thicker international borders
                opacity: 0.7,
                dashArray: idx < 4 ? "5,5" : "3,3", // Dashed pattern
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
                    <div className='min-w-[300px] z-[5000]'>
                      <div className='flex  justify-between '>
                        <div className='  '>
                          <h3 className='font-bold text-gray-900 text-base'>
                            {s.state?.name}
                          </h3>
                        </div>

                        <div className='flex  flex-col '>
                          <div className='flex items-center justify-between '>
                            <span className='text-xs text-gray-600 font-semibold'>
                              📌 Samples:
                            </span>
                            <span className='text-sm font-bold text-blue-600'>
                              {sameLngAndLat(samples, coord).length}
                            </span>
                          </div>
                          {contaminationCount > 0 && (
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-gray-600 font-semibold'>
                                ⚠️ Contaminated:
                              </span>
                              <span className='text-sm font-bold text-red-600'>
                                {contaminationCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className=''>
                        <div className='mt-1 border-t'>
                          <p className='text-xs text-gray-600 font-semibold mb-[2px]'>
                            Recent Product:
                          </p>
                          <div className=''>
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
