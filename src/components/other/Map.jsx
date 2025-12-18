import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
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
