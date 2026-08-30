/**
 * CollectorFilterBar.jsx
 * ───────────────────────
 * Unified filter surface:
 *   • Search input with debounced clear button
 *   • Mobile filter toggle (SlidersHorizontal icon)
 *   • Status and variant <select> elements (inline on md+, collapsible on mobile)
 *   • "Clear all" button when any filter is active
 *   • Active filter chips row with per-chip remove buttons
 *
 * Props
 *   searchQuery, setSearchQuery
 *   filterStatus, setFilterStatus
 *   variantFilter, setVariantFilter
 *   uniqueVariants     – string[] derived from current sample list
 *   filteredCount      – number of samples after filtering
 *   hasActiveFilters   – boolean
 *   clearFilters       – () => void
 *   theme              – from ThemeContext
 */

import React, { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import {
  STATUS_FILTER_OPTIONS,
  buildSelectCls,
} from "../constants/collector.constants";

const CollectorFilterBar = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  variantFilter,
  setVariantFilter,
  uniqueVariants,
  filteredCount,
  hasActiveFilters,
  clearFilters,
  theme,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const selectCls = buildSelectCls(theme);

  // Reusable components
  const Chip = ({ label, onRemove }) => (
    <span className='inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full'>
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`}>
        <X className='w-2.5 h-2.5' />
      </button>
    </span>
  );
  // ── Reusable filter selects ──────────────────────────────────────────────
  const StatusSelect = () => (
    <div className='relative'>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className={selectCls}
        style={{ minWidth: 148 }}
      >
        {STATUS_FILTER_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${theme?.textMuted}`}
      />
    </div>
  );

  const VariantSelect = () => (
    <div className='relative'>
      <select
        value={variantFilter}
        onChange={(e) => setVariantFilter(e.target.value)}
        className={selectCls}
        style={{ minWidth: 136 }}
      >
        <option value='all'>All variants</option>
        {uniqueVariants.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${theme?.textMuted}`}
      />
    </div>
  );

  const ClearButton = ({ fullWidth = false }) => (
    <button
      onClick={clearFilters}
      className={`h-10 ${fullWidth ? "w-full" : "px-3"} rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-1.5 whitespace-nowrap`}
    >
      <X className='w-3 h-3' />
      {fullWidth ? "Clear all filters" : "Clear"}
    </button>
  );

  return (
    <div
      className={`${theme?.card} border ${theme?.border} rounded-2xl p-3 sm:p-4 mb-4 sm:mb-5`}
    >
      {/* ── Search row ── */}
      <div className='flex gap-2'>
        {/* Search input */}
        <div className='relative flex-1'>
          <Search
            className={`absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${theme?.textMuted}`}
          />
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search samples…'
            className={`w-full h-10 pl-8 sm:pl-9 pr-8 rounded-xl border ${theme?.border} ${theme?.card} ${theme?.text} text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${theme?.textMuted} hover:text-red-500 transition`}
            >
              <X className='w-3.5 h-3.5' />
            </button>
          )}
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`md:hidden flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition ${
            showFilters || hasActiveFilters
              ? "border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/10"
              : `${theme?.border} ${theme?.text}`
          }`}
          aria-label='Toggle filters'
        >
          <SlidersHorizontal className='w-4 h-4' />
        </button>

        {/* Desktop inline filters */}
        <div className='hidden md:flex items-center gap-2'>
          <StatusSelect />
          <VariantSelect />
          {hasActiveFilters && <ClearButton />}
        </div>
      </div>

      {/* ── Mobile collapsible filters ── */}
      {showFilters && (
        <div className='md:hidden mt-2.5 flex flex-col gap-2'>
          <StatusSelect />
          <VariantSelect />
          {hasActiveFilters && <ClearButton fullWidth />}
        </div>
      )}

      {/* ── Active filter chips ── */}
      {hasActiveFilters && (
        <div className='flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60'>
          {searchQuery && (
            <Chip
              label={`"${searchQuery}"`}
              onRemove={() => setSearchQuery("")}
            />
          )}
          {filterStatus !== "all" && (
            <Chip
              label={filterStatus === "pending" ? "Pending" : "With results"}
              onRemove={() => setFilterStatus("all")}
            />
          )}
          {variantFilter !== "all" && (
            <Chip
              label={variantFilter}
              onRemove={() => setVariantFilter("all")}
            />
          )}
          <span className={`text-[10px] sm:text-xs ${theme?.textMuted}`}>
            {filteredCount} result{filteredCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
};

export default CollectorFilterBar;
