import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  GeoJSON,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import nigeriaGeoLocation from "../../assets/ng.json";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import MapSampleDetailsModal from "../modals/MapSampleDetailsModal";

const nigeriaCenter = [9.082, 8.6753];
const nigeriaBounds = L.latLngBounds([3.5, 2.3], [13.9, 14.7]);

const FitBounds = ({ hasMarkers }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Keep the initial view inside Nigeria without calling
    // setMaxBoundsViscosity, which is unavailable in some Leaflet builds.
    map.setMaxBounds(nigeriaBounds);

    if (hasMarkers) {
      map.fitBounds(nigeriaBounds, {
        padding:
          window.innerWidth < 640
            ? [18, 18]
            : [45, 45],
      });
    }

    return () => {
      // Do not manipulate the map after Leaflet has started unmounting.
      // React-Leaflet handles cleanup.
    };
  }, [map, hasMarkers]);

  return null;
};

const createMarkerIcon = (count, status) => {
  const displayCount = count > 99 ? "99+" : count;
  const contaminated = status === "CONTAMINATED";
  const pending = status === "PENDING";

  const color = contaminated
    ? "#dc2626"
    : pending
      ? "#d97706"
      : "#059669";

  // Small visual marker.
  // The actual Marker remains easy to click because Leaflet
  // still uses the full icon box as its interaction area.
  const visualSize =
    typeof window !== "undefined" && window.innerWidth < 640
      ? 22
      : 26;

  const outerSize =
    typeof window !== "undefined" && window.innerWidth < 640
      ? 38
      : 42;

  return L.divIcon({
    className: "leadcap-map-marker",

    html: `
      <div
        style="
          position:relative;
          width:${outerSize}px;
          height:${outerSize}px;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
        "
      >

        <!-- Small visible indicator -->
        <div
          style="
            width:${visualSize}px;
            height:${visualSize}px;
            border-radius:9999px;
            background:${color};
            border:3px solid white;
            box-shadow:
              0 2px 8px rgba(15,23,42,.25),
              0 0 0 1px rgba(15,23,42,.08);
            display:flex;
            align-items:center;
            justify-content:center;
            color:white;
            font-weight:800;
            font-size:9px;
            line-height:1;
            transition:transform .15s ease;
          "
        >
          ${displayCount}
        </div>

      </div>
    `,

    // Larger interaction area than the visible marker.
    iconSize: [outerSize, outerSize],

    iconAnchor: [
      outerSize / 2,
      outerSize / 2,
    ],

    popupAnchor: [
      0,
      -(outerSize / 2),
    ],
  });
};

export default function Map({ samples = [] }) {
  const [mapDetails, setMapDetails] = useState({
    isOpen: false,
    samples: [],
  });

  const locations = useMemo(() => {
    const groupedLocations = new globalThis.Map();

    if (!Array.isArray(samples)) {
      return [];
    }

    samples.forEach((sample) => {
      const lat = Number(sample?.gpsLatitude);
      const lng = Number(sample?.gpsLongitude);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        return;
      }

      const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;

      if (!groupedLocations.has(key)) {
        groupedLocations.set(key, []);
      }

      groupedLocations.get(key).push(sample);
    });

    return Array.from(groupedLocations.values())
      .filter((group) => group.length > 0)
      .map((group) => {
        const contaminated = group.filter(
          (sample) =>
            sample?.status === "CONTAMINATED" ||
            sample?.contaminationStatus === "CONTAMINATED"
        ).length;

        const pending = group.filter(
          (sample) =>
            !sample?.status ||
            sample?.status === "PENDING"
        ).length;

        const status =
          contaminated > 0
            ? "CONTAMINATED"
            : pending > 0
              ? "PENDING"
              : "SAFE";

        return {
          samples: group,
          position: [
            Number(group[0].gpsLatitude),
            Number(group[0].gpsLongitude),
          ],
          contaminated,
          status,
        };
      });
  }, [samples]);

  const handleMarkerClick = (location) => {
    if (!location?.samples?.length) return;

    setMapDetails({
      isOpen: true,
      samples: location.samples,
    });
  };

  return (
    <>
      <div className="relative h-[460px] sm:h-[560px] lg:h-[680px]">
        <MapContainer
          center={nigeriaCenter}
          zoom={6}
          minZoom={5}
          maxZoom={18}
          scrollWheelZoom={true}
          zoomControl={true}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <GeoJSON
            data={nigeriaGeoLocation}
            style={{
              color: "#059669",
              weight: 1.5,
              fillColor: "#10b981",
              fillOpacity: 0.035,
            }}
          />

          {locations.map((location, index) => {
            const firstSample =
              location?.samples?.[0];

            if (!firstSample) {
              return null;
            }

            return (
              <Marker
                key={`${location.position[0]}-${location.position[1]}-${index}`}
                position={location.position}
                icon={createMarkerIcon(
                  location.samples.length,
                  location.status
                )}
                zIndexOffset={500}
                eventHandlers={{
                  click: () =>
                    handleMarkerClick(location),
                }}
              >
                <Popup
                  closeButton={true}
                  offset={[0, -8]}
                >
                  <div className="min-w-[210px] max-w-[280px] p-1">
                    <p className="text-sm font-bold text-slate-900">
                      {firstSample?.state?.name ||
                        "Mapped location"}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {firstSample?.lga?.name ||
                        firstSample?.market?.name ||
                        "Sample collection point"}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 p-2">
                        <p className="text-[10px] text-slate-500">
                          Samples
                        </p>

                        <p className="text-sm font-bold text-slate-900">
                          {location.samples.length}
                        </p>
                      </div>

                      <div className="rounded-lg bg-red-50 p-2">
                        <p className="text-[10px] text-red-500">
                          Contaminated
                        </p>

                        <p className="text-sm font-bold text-red-700">
                          {location.contaminated}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleMarkerClick(location)
                      }
                      className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-emerald-700"
                    >
                      View location samples
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <FitBounds
            hasMarkers={locations.length > 0}
          />
        </MapContainer>
      </div>

      {mapDetails?.isOpen && (
        <MapSampleDetailsModal
          setMapDetails={setMapDetails}
          mapDetails={mapDetails}
        />
      )}
    </>
  );
}