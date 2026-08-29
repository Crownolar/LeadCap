import React from "react";
import { Sparkles } from "lucide-react";
const PolicyFooterSummary = ({ theme, summary }) => (
  <section
    className={`${theme.card} ${theme.border} border rounded-2xl p-5 shadow-sm`}
  >
    <div className="flex gap-3">
      <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-emerald-600" />
      </div>
      <div>
        <p className="text-sm font-bold">Executive summary</p>
        <p className={`mt-1 text-sm leading-6 ${theme.textMuted}`}>
          {summary ||
            "No executive summary is available for the selected filters."}
        </p>
      </div>
    </div>
  </section>
);
export default PolicyFooterSummary;
