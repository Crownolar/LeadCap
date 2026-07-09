import React from "react";

const PolicyFilterBar = ({
  theme,
  states = [],
  filterState,
  setFilterState,
  filterStatus,
  setFilterStatus,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onReset,
}) => {
  return (
    <div className={`${theme.card} border ${theme.border} rounded-xl p-4 shadow-sm`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
        >
          <option value="all">All States</option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
        >
          <option value="all">All Status</option>
          <option value="safe">Safe</option>
          <option value="moderate">Moderate</option>
          <option value="contaminated">Contaminated</option>
          <option value="pending">Pending</option>
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg ${theme.input} focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
        />

        <button
          onClick={onReset}
          className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium text-sm"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default PolicyFilterBar;