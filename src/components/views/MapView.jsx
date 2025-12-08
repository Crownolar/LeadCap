import { MapPin, MapPinned } from "lucide-react";
import Map from "../other/Map";
import { api } from "../../redux/slice/samplesSlice";
import { useEffect, useState } from "react";

const MapView = ({ theme }) => {
  const [mapData, setMapData] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const getMapData = async () => {
        const result = await api.get("/samples/map/geo-data");
        if (result.data.success) {
          setMapData(result.data.data);
        }
      };
      getMapData();
    } catch (e) {
      setError(e);
    }
  }, []);
  return (
    <div
      className={`${theme?.card} ${theme?.text} rounded-lg shadow-md p-6 border ${theme?.border}`}
    >
      <h2 className='text-xl font-semibold mb-4'>Geographic Distribution</h2>
      <div className='space-y-4'>
        {mapData?.filter((s) => s?.gpsLatitude && s?.gpsLongitude).length ===
        0 ? (
          <div className='text-center py-12'>
            <MapPin className='w-16 h-16 mx-auto mb-4 text-gray-400' />
            <p className={theme?.textMuted}>
              No samples with GPS coordinates yet
            </p>
          </div>
        ) : (
          <Map samples={mapData} />
        )}
      </div>
    </div>
  );
};

export default MapView;
