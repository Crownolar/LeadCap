import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/api";

const CollectorManagement = () => {
  const { theme } = useTheme();
  console.log(theme);
  const navigate = useNavigate();
  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        setLoading(true);
        const res = await api.get("/supervisor/collectors");
        if (res.data.success) {
          const data = res.data.data || res.data;
          setCollectors(Array.isArray(data) ? data : data?.data || []);
        }
      } catch (err) {
        console.error("Error fetching collectors:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCollectors();
  }, []);

  const handleSelectCollector = (collector) => {
    setSelectedCollector(collector);
  };

  if (loading) {
    return (
      <div className={`${theme?.card} rounded-lg p-8 text-center`}>
        <p className={theme?.textMuted}>Loading collectors...</p>
      </div>
    );
  }

  return (
    <div className={`${theme?.text} space-y-6`}>
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
          Error: {error}
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Collectors List */}
        <div
          className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}
        >
          <h3 className='text-lg font-semibold mb-2 inline-flex items-center gap-2'>
            Your Data Collectors
            <span className='inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'>
              {collectors.length}
            </span>
          </h3>
          <p className={`text-sm ${theme?.textMuted} mb-4`}>
            Select a collector below to view their details.
          </p>
          <div className='space-y-2 max-h-96 overflow-y-auto'>
            {collectors.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-10 text-center'>
                <p className={`text-sm font-medium ${theme?.text} mb-1`}>
                  No collectors assigned
                </p>
                <p className={`text-xs ${theme?.textMuted}`}>
                  Collectors in your assigned states will appear here
                </p>
              </div>
            ) : (
              collectors.map((collector) => (
                <button
                  key={collector.id}
                  type='button'
                  onClick={() => handleSelectCollector(collector)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    selectedCollector?.id === collector.id
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : `border ${theme?.border} hover:bg-gray-50 dark:hover:bg-gray-700/50`
                  }`}
                >
                  <div className='min-w-0 flex-1'>
                    <p className={`font-semibold text-sm ${theme?.textMuted}`}>
                      {collector.name}
                    </p>
                    <p className={`text-xs ${theme?.textMuted} truncate`}>
                      {collector.email}
                    </p>
                    <div className='flex gap-2 mt-2 flex-wrap'>
                      <span className='bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-1 rounded'>
                        {collector.totalSamples} samples
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className='flex-shrink-0 w-5 h-5 text-gray-400'
                    aria-hidden
                  />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Collector Details */}
        <div className='lg:col-span-2'>
          {selectedCollector ? (
            <div
              className={`${theme?.card} rounded-lg p-6 border ${theme?.border} space-y-4`}
            >
              <div>
                <h3 className='text-lg font-semibold mb-4'>
                  Collector Details: {selectedCollector.name}
                </h3>
                <button
                  type='button'
                  onClick={() =>
                    navigate(`/sample-review/${selectedCollector.id}`)
                  }
                  className='mb-4 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 focus:outline-none focus:underline'
                >
                  Review their samples →
                </button>

                <div className='space-y-3 text-sm'>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div>
                      <p className={theme?.textMuted}>Name</p>
                      <p className='font-semibold break-words'>
                        {selectedCollector.name}
                      </p>
                    </div>
                    <div>
                      <p className={theme?.textMuted}>Email</p>
                      <p className='font-semibold break-words'>
                        {selectedCollector.email}
                      </p>
                    </div>
                    {selectedCollector.organization && (
                      <div>
                        <p className={theme?.textMuted}>Organization</p>
                        <p className='font-semibold'>
                          {selectedCollector.organization}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className={theme?.textMuted}>Joined</p>
                      <p className='font-semibold'>
                        {new Date(
                          selectedCollector.joinedAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-lg p-6 border ${theme?.border} text-center min-h-[200px] flex flex-col items-center justify-center ${
                collectors.length === 0
                  ? "bg-transparent border-dashed"
                  : theme?.card
              }`}
            >
              <p className={`text-sm ${theme?.textMuted}`}>
                {collectors.length === 0
                  ? "No collectors in your assigned states yet"
                  : "Select a collector to view their details"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      {selectedCollector && (
        <div
          className={`${theme?.card} rounded-lg p-6 border ${theme?.border}`}
        >
          <h3 className='text-lg font-semibold mb-4'>Performance Summary</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>Total Samples</p>
              <p className='text-2xl font-bold text-blue-600'>
                {selectedCollector.totalSamples}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>This Month</p>
              <p className='text-2xl font-bold text-green-600'>
                {selectedCollector.samplesThisMonth}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>States Covered</p>
              <p className='text-2xl font-bold text-purple-600'>
                {Object.keys(selectedCollector.samplesByState || {}).length}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme?.textMuted}`}>Status</p>
              <p
                className={`text-2xl font-bold ${
                  selectedCollector.isActive
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {selectedCollector.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>

          {/* Samples by State */}
          {selectedCollector.samplesByState &&
            Object.keys(selectedCollector.samplesByState).length > 0 && (
              <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
                <h4 className='font-semibold mb-4'>Samples by State</h4>
                <div className='space-y-2'>
                  {Object.entries(selectedCollector.samplesByState).map(
                    ([state, count]) => (
                      <div
                        key={state}
                        className='flex justify-between items-center text-sm'
                      >
                        <span className={theme?.textMuted}>{state}</span>
                        <span className='font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded'>
                          {count} samples
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default CollectorManagement;
