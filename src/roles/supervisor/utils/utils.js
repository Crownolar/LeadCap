export const getVerificationBadgeType = (status) => {
  if (status === "VERIFIED_ORIGINAL") return "safe";
  if (status === "VERIFIED_FAKE") return "danger";
  return "neutral";
};

export const getReadingStatusType = (status) => {
  if (status === "SAFE") return "safe";
  if (status === "CONTAMINATED" || status === "FAILED") return "danger";
  if (status === "MODERATE") return "moderate";
  return "neutral";
};

export const getTabCardClass = (status, isActive, theme) => {
  if (isActive) {
    const activeMap = {
      PENDING: "bg-amber-500 text-white border-amber-500 shadow-sm",

      "APPROVED FOR XRF": "bg-sky-500 text-white border-sky-500 shadow-sm",
      "XRF COMPLETED": "bg-sky-700 text-white border-sky-700 shadow-sm",

      "APPROVED FOR AAS":
        "bg-indigo-500 text-white border-indigo-500 shadow-sm",
      "AAS COMPLETED": "bg-indigo-700 text-white border-indigo-700 shadow-sm",

      COMPLETED: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
      REJECTED: "bg-red-600 text-white border-red-600 shadow-sm",

      FLAGGED: "bg-violet-600 text-white border-violet-600 shadow-sm",
    };

    return activeMap[status] || "bg-gray-600 text-white shadow-sm";
  }

  return `${theme.card} ${theme.border} hover:shadow-md hover:-translate-y-[1px]`;
};
