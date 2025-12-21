import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useSelector } from "react-redux";
import { Lock } from "lucide-react";
import api from "../../utils/api";

const Agents = () => {
  const { theme } = useTheme();
  const { currentUser } = useSelector((state) => state.auth);
  const [dataCollectors, setDataCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Role-based access control
  const normalizedRole = currentUser?.role?.toLowerCase().replace(/[\s_]/g, "");
  const allowedRoles = ["superadmin", "headresearcher"];

  if (!allowedRoles.includes(normalizedRole)) {
    return (
      <div
        className={`${theme?.bg} min-h-screen flex items-center justify-center p-4`}
      >
        <div
          className={`${theme?.card} rounded-lg border ${theme?.border} shadow-md p-8 text-center max-w-md`}
        >
          <Lock className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <h2 className={`${theme?.text} text-2xl font-bold mb-2`}>
            Access Restricted
          </h2>
          <p className={theme?.textMuted}>
            You do not have permission to view field agents. Only Super Admin
            and Head Researcher can access this section.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchDataCollectors = async () => {
      try {
        setLoading(true);
        const response = await api.get("/data-collectors");

        if (response.data.success) {
          setDataCollectors(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching data collectors:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataCollectors();
  }, []);

  return (
    <div
      className={`${theme?.card} ${theme?.text} rounded-lg shadow-md p-6 border ${theme?.border}`}
    >
      <h2 className="text-xl font-semibold mb-4">Data Collectors</h2>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <p className={theme?.textMuted}>Loading data collectors...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && dataCollectors.length === 0 && (
        <div className="text-center py-8">
          <p className={theme?.textMuted}>No data collectors found</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataCollectors.map((collector) => (
          <div
            key={collector.id}
            className={`p-4 border ${theme?.border} rounded-lg hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                {collector.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{collector.name}</h3>
                <p className={`text-xs ${theme?.textMuted} truncate`}>
                  {collector.email}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={theme?.textMuted}>Samples:</span>
                <span className="font-semibold">{collector.totalSamples}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme?.textMuted}>States:</span>
                <span className="font-semibold">
                  {Object.keys(collector.samplesByState).length}
                </span>
              </div>
              {Object.keys(collector.samplesByState).length > 0 && (
                <div className="mt-2 pt-2 border-t border-opacity-20">
                  <p className={`text-xs ${theme?.textMuted} mb-1`}>
                    Active in:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(collector.samplesByState)
                      .slice(0, 3)
                      .map((state) => (
                        <span
                          key={state}
                          className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded"
                        >
                          {state}
                        </span>
                      ))}
                    {Object.keys(collector.samplesByState).length > 3 && (
                      <span className={`text-xs ${theme?.textMuted}`}>
                        +{Object.keys(collector.samplesByState).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-opacity-20">
                <span className={theme?.textMuted}>Status:</span>
                <span
                  className={`font-semibold ${
                    collector.isActive ? "text-green-500" : "text-gray-500"
                  }`}
                >
                  {collector.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Agents;
