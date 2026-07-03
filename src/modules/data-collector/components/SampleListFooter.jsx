/**
 * SampleListFooter.jsx
 * ─────────────────────
 * The load-more button row rendered at the bottom of the sample panel.
 * Extracted so it can be tested in isolation and reused by other
 * role modules that have the same paginated-list pattern.
 *
 * Props
 *   loading      – boolean  (shows "Loading…" and disables the button)
 *   canLoadMore  – boolean  (false = "All samples loaded", button disabled)
 *   onLoadMore   – () => void
 *   theme        – from ThemeContext
 */

import React from "react";

const SampleListFooter = ({ loading, canLoadMore, onLoadMore, theme }) => (
  <div
    className={`flex justify-center px-4 sm:px-5 py-3 sm:py-4 border-t ${theme?.border}`}
  >
    <button
      onClick={onLoadMore}
      disabled={loading || !canLoadMore}
      className={`h-9 px-5 rounded-xl border text-xs sm:text-sm font-medium transition ${
        loading || !canLoadMore
          ? `${theme?.border} ${theme?.textMuted} opacity-50 cursor-not-allowed`
          : `${theme?.border} ${theme?.text} hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10`
      }`}
    >
      {loading ? "Loading…" : canLoadMore ? "Load more" : "All samples loaded"}
    </button>
  </div>
);

export default SampleListFooter;