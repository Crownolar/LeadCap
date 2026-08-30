import React from "react";
import { CalendarDays, Filter, RotateCcw } from "lucide-react";
const Field = ({ theme, label, children }) => (
  <label className="min-w-0">
    <span
      className={`mb-1.5 block text-[10px] font-bold uppercase tracking-wider ${theme.textMuted}`}
    >
      {label}
    </span>
    {children}
  </label>
);
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
  const cls = `w-full rounded-xl border ${theme.border} ${theme.input} px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500`;
  return (
    <section
      className={`${theme.card} ${theme.border} border rounded-2xl p-4 shadow-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Filter className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold">Intelligence filters</p>
            <p className={`text-xs ${theme.textMuted}`}>
              Narrow the evidence set
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${theme.textMuted} hover:${theme.text}`}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Field theme={theme} label="State">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className={cls}
          >
            <option value="all">All States</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field theme={theme} label="Status">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={cls}
          >
            <option value="all">All Statuses</option>
            <option value="safe">Safe</option>
            <option value="moderate">Moderate</option>
            <option value="contaminated">Contaminated</option>
            <option value="pending">Pending</option>
          </select>
        </Field>
        <Field theme={theme} label="From date">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={`${cls} pl-9`}
            />
          </div>
        </Field>
        <Field theme={theme} label="To date">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={`${cls} pl-9`}
            />
          </div>
        </Field>
        <div className="flex items-end">
          <button
            onClick={() => {}}
            className="hidden lg:block w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            Apply view
          </button>
        </div>
      </div>
    </section>
  );
};
export default PolicyFilterBar;
