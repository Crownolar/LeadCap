export const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`${
          theme?.card || "bg-white"
        } p-2 sm:p-3 md:p-4 rounded-lg shadow-lg border ${
          theme?.border || "border-gray-200"
        }`}
      >
        <p
          className={`font-semibold text-xs sm:text-sm ${
            theme?.text || "text-gray-800"
          } mb-1 sm:mb-2`}
        >
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className='text-xs sm:text-sm'
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


export const calculateAnalytics = (filterState, stats) => {
    let total;
    let contaminated;
    let safe;
    let pending;
    if (filterState == "all") {
      total = stats?.totalSamples;
      contaminated = stats?.contaminated;
      safe = stats?.safe;
      pending = stats?.pending;
    } else {
      const stateStats = stats?.byState?.filter((s) => s.state == filterState);
      if (stateStats.length > 0) {
        total = stateStats[0]?.count;
        contaminated = stateStats[0]?.contaminated;
        safe = stateStats[0]?.safe;
        pending = stateStats[0]?.pending;
      } else {
        total = 0;
        contaminated = 0;
        safe = 0;
        pending = 0;
      }
    }

    const byState = stats?.byState?.map((s) => ({
      name: s?.state,
      value: s?.count,
    }));

    const productTypeStats =
      stats?.byProductVariant?.reduce((acc, s) => {
        const type = s?.productCategoryName || "Unknown";
        acc[type] = (acc[type] || 0) + (s?.count || 0);
        return acc;
      }, {}) || {};

    const byProductType = Object.entries(productTypeStats).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    const byProduct = stats?.byProductVariant?.map((s) => ({
      name: s?.productVariantName || "Unknown",
      value: s?.count,
    }));

    const registeredVsUnregistered = [
      {
        name: "Registered",
        total: stats?.total,
        contaminated: stats?.contaminated,
      },
      {
        name: "Unregistered",
        total: 0,
        contaminated: 0,
      },
    ];

    return {
      total,
      contaminated,
      safe,
      pending,
      byState,
      byProductType,
      byProduct,
      registeredVsUnregistered,
    };
  };