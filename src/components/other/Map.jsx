import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import MapSampleDetailsModal from "../modals/mapSampleDetailsModal";

// coordinates for LAGOS
const defaultPosition = [6.5244, 3.3792];

const FitBounds = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      try {
        const bounds = L.latLngBounds(
          markers.map((m) => {
            return [m.coordinates.lat, m.coordinates.lng];
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

export default function Map({ samples }) {
  const [mapDetails, setMapDetails] = useState({
    isOpen: false,
    samples: [],
  });

  const sameLngAndLat = (samplesArray, LatAndLngArray) => {
    return samplesArray.filter(
      (s) =>
        s.coordinates.lat == LatAndLngArray[0] &&
        s.coordinates.lng == LatAndLngArray[1]
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

  return (
    <>
      <div className='border-2 border-red-950 relative h-[700px]  '>
        <MapContainer
          center={defaultPosition}
          zoom={13}
          style={{
            height: "700px",
            width: "100%",
          }}
        >
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          ></TileLayer>
          {samples.map((s) => {
            if (s.coordinates.lat && s.coordinates.lng) {
              const coord = [s.coordinates.lat, s.coordinates.lng];
              return (
                <Marker
                  style={{ position: "relative" }}
                  key={s.id}
                  position={[s.coordinates.lat, s.coordinates.lng]}
                  icon={getDefaultIcon(samples, [
                    s.coordinates.lat,
                    s.coordinates.lng,
                  ])}
                  eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    click: (e) => {
                      // Prevent Leaflet default popup toggle
                      e.originalEvent.stopPropagation();
                      handleMarkerClick(samples, coord);
                    },
                    mouseout: (e) => e.target.closePopup(),
                  }}
                >
                  <Popup
                    closeOnClick={false}
                    autoClose={false}
                    closeButton={false}
                  >
                    <div>
                      <h3>{s.state}</h3>
                      <h4>
                        Total: {sameLngAndLat(samples, coord).length}{" "}
                        {sameLngAndLat(samples, coord).length > 1
                          ? "samples"
                          : "sample"}
                      </h4>
                      <p>👍</p>
                    </div>
                  </Popup>
                </Marker>
              );
            }
          })}
          {/* fit bounds makes all the markers show at once after rendering */}
          <FitBounds markers={samples} />
        </MapContainer>
        {/* Overlay */}
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
