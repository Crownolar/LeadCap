import React, { useEffect } from "react";
import { MapPin, MapPinned } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../../redux/slice/samplesSlice";
import { useTheme } from "../../hooks/useTheme";

// Helper to get max heavy metal reading for display
const getMaxReading = (heavyMetalReadings) => {
  if (!heavyMetalReadings || heavyMetalReadings.length === 0) return null;
  
  let maxReading = 0;
  heavyMetalReadings.forEach(reading => {
    const xrf = reading.xrfReading ? parseFloat(reading.xrfReading) : 0;
    const aas = reading.aasReading ? parseFloat(reading.aasReading) : 0;
    maxReading = Math.max(maxReading, xrf, aas);
  });
  return maxReading > 0 ? maxReading : null;
};

const MapView = ({ theme: propTheme, samples: propSamples }) => {
  const dispatch = useDispatch();
  const { theme: hookTheme } = useTheme();
  const { samples: reduxSamples } = useSelector((state) => state.samples);

  // Use props if provided, otherwise fall back to Redux
  const theme = propTheme || hookTheme;
  const samples = propSamples || reduxSamples || [];

  // Fetch samples on mount if not provided via props
  useEffect(() => {
    if (!propSamples) {
      dispatch(fetchSamples());
    }
  }, [dispatch, propSamples]);

  // Filter samples that have GPS coordinates
  const samplesWithCoords = samples?.filter(
    (s) => s.gpsLatitude && s.gpsLongitude
  );

  return (
    <div
      className={`${theme?.card} ${theme?.text} rounded-lg shadow-md p-6 border ${theme?.border}`}
    >
      <h2 className="text-xl font-semibold mb-4">Geographic Distribution</h2>
      <div className="space-y-4">
        {samplesWithCoords?.map((sample) => {
          const maxReading = getMaxReading(sample?.heavyMetalReadings);
          const isContaminated = sample?.status === "contaminated";
          
          return (
            <div
              key={sample?.id}
              className={`p-4 border ${theme?.border} rounded-lg flex items-start gap-4`}
            >
              <MapPinned
                className={`w-6 h-6 mt-1 ${
                  isContaminated ? "text-red-500" : "text-green-500"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{sample?.productName}</h3>
                    <p className={`text-sm ${theme?.textMuted}`}>
                      {sample?.market?.name || "N/A"}, {sample?.lga?.name || "N/A"}, {sample?.state?.name || "N/A"}
                    </p>
                    <p className={`text-xs ${theme?.textMuted} mt-1`}>
                      Coordinates: {sample?.gpsLatitude}, {sample?.gpsLongitude}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      isContaminated
                        ? "bg-red-100 text-red-800"
                        : sample?.status === "safe"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {maxReading ? `${maxReading} ppm` : sample?.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {samplesWithCoords?.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className={theme?.textMuted}>
              No samples with GPS coordinates yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
