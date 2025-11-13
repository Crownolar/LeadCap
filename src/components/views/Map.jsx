import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import MapSampleDetailsModal from "../modals/mapSampleDetailsModal";

// L.Icon.Default.mergeOptions({
//   iconUrl: markerIcon,
//   shadownUrl: markerShadow,
// });

const defaultPosition = [6.5244, 3.3792];

const FitBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    // console.log(markers);
    if (markers.length > 0) {
      try {
        const bounds = L.latLngBounds(
          markers.map((m) => {
            return [m.coordinates.lat, m.coordinates.lng];
          })
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (e) {
        console.log(e.message);
      }
    }
  }, []);
};

const getDefaultIcon = (position) => {
  return new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [30, 45],
    iconAnchor: position,
    popupAnchor: [-5, -35],
  });
};

export default function Map({ samples }) {
  const [mapDetails, setMapDetails] = useState({
    isOpen: false,
    samples: [],
  });

  const handleMarkerClick = (samplesArray, LatAndLngArray) => {
    const samplesWithSameCoordinates = samplesArray.filter(
      (s) =>
        s.coordinates.lat == LatAndLngArray[0] &&
        s.coordinates.lng == LatAndLngArray[1]
    );
    setMapDetails({ isOpen: true, samples: samplesWithSameCoordinates });
  };

  return (
    <>
      <div className='border-2 border-red-950 relative '>
        <MapContainer
          center={defaultPosition}
          zoom={13}
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
            if (s.coordinates.lat && s.coordinates.lng) {
              return (
                <Marker
                  key={s.id}
                  position={[s.coordinates.lat, s.coordinates.lng]}
                  icon={getDefaultIcon([s.coordinates.lat, s.coordinates.lng])}
                  eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                    click: (e) => {
                      // Prevent Leaflet default popup toggle
                      e.originalEvent.stopPropagation();
                      handleMarkerClick(samples, [
                        s.coordinates.lat,
                        s.coordinates.lng,
                      ]);
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
                      <h4>Total: 2 samples</h4>
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
