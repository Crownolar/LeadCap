import React from "react";

const badgeMap = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-orange-100 text-orange-700",
  Low: "bg-green-100 text-green-700",
};

const NafdacRiskCategories = ({ theme, categories = [] }) => {
  console.log(categories);
  return (
    <div
      className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}
    >
      <div className='mb-4'>
        <h3 className='text-lg font-semibold'>High-Risk Categories</h3>
        <p className={`text-sm ${theme.textMuted}`}>
          Product categories flagged with fake NAFDAC numbers
        </p>
      </div>

      <div className='space-y-3'>
        {categories.length === 0 ? (
          <p className={`text-sm ${theme.textMuted}`}>
            No category risk data available.
          </p>
        ) : (
          categories.map((item) => (
            <div
              key={item.category}
              className={`border ${theme.border} rounded-xl p-4`}
            >
              <div className='flex items-start justify-between gap-3 mb-2'>
                <div>
                  <h4 className='font-medium'>{item.category}</h4>
                  <p className={`text-sm ${theme.textMuted}`}>
                    {item.fakeRecordsCount} flagged out of{" "}
                    {item.registeredProductCount} records
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeMap[item.riskLevel]}`}
                >
                  {item.riskLevel}
                </span>
              </div>
              <div className='flex items-center justify-between text-sm mb-2'>
                <span className={theme.textMuted}>Flagged Rate</span>
                <span className='font-semibold'>
                  {item?.fakeRecordsRate?.toFixed(1)}%
                </span>
              </div>

              <div className='w-full h-2 rounded-full bg-gray-200 overflow-hidden'>
                <div
                  className={
                    item.riskLevel === "High"
                      ? "h-full rounded-full bg-red-500"
                      : item.riskLevel === "Medium"
                        ? "h-full rounded-full bg-orange-500"
                        : "h-full rounded-full bg-green-500"
                  }
                  style={{ width: `${Math.min(item.fakeRecordsRate, 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NafdacRiskCategories;
