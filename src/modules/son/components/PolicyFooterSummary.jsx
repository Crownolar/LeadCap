import React from "react";

const PolicyFooterSummary = ({ theme, summary }) => {
  return (
    <div className={`${theme.card} border ${theme.border} rounded-xl p-5 shadow-sm`}>
      <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
      <p className={`text-sm leading-7 ${theme.textMuted}`}>{summary}</p>
    </div>
  );
};

export default PolicyFooterSummary;