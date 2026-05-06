import api from "../utils/api";

// const resolveStateParam = (state) => {
//   if (!state) return undefined;

//   if (typeof state === "object") return state.name;

//   return state;
// };

export const getStateSummaryReport = async ({ stateId, dateFrom, dateTo }) => {
  if (!stateId) {
    throw new Error("stateId is required");
  }

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
      d.getDate(),
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const params = {
    stateId,
    ...(dateFrom && { dateFrom: formatDate(dateFrom) }),
    ...(dateTo && { dateTo: formatDate(dateTo) }),
  };

  console.log("STATE SUMMARY PARAMS:", params);

  const response = await api.get("/moh/reports/state-summary", {
    params,
    headers: { Accept: "application/json" },
  });

  return response.data;
};

export const getContaminationAnalysisReport = async ({
  stateIds,
  stateName,
  productVariantIds,
  dateFrom,
  dateTo,
}) => {
  const params = {
    ...(stateIds?.length && { stateIds: stateIds.join(",") }),
    ...(stateName && { state: stateName }),
    ...(productVariantIds?.length && {
      productVariantIds: productVariantIds.join(","),
    }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  console.log("CONTAMINATION ANALYSIS PARAMS:", params);

  const response = await api.get("/moh/reports/contamination-analysis", {
    params,
    headers: { Accept: "application/json" },
  });

  console.log("REQUEST PARAMS:", params);

  return response.data;
};

export const getProductTypeReport = async ({ stateId, dateFrom, dateTo }) => {
  const params = {
    ...(stateId && { stateId }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  console.log("PRODUCT TYPE PARAMS:", params);

  const response = await api.get("/moh/reports/product-type", {
    params,
    headers: { Accept: "application/json" },
  });

  return response.data;
};

export const getRiskAssessmentReport = async ({
  minLeadLevel,
  dateFrom,
  dateTo,
}) => {
  const params = {
    ...(minLeadLevel && { minLeadLevel }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  console.log("RISK ASSESSMENT PARAMS:", params);

  const response = await api.get("/moh/reports/risk-assessment", {
    params,
    headers: { Accept: "application/json" },
  });

  return response.data;
};

export const getContaminationSummary = async ({
  state,
  dateFrom,
  dateTo,
}) => {
  const params = {
    ...(state && { state }), // ✅ correct key
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  console.log("CONTAMINATION SUMMARY PARAMS:", params);

  const response = await api.get("/moh/contamination-summary", {
    params,
    headers: { Accept: "application/json" },
  });

  return response.data;
};

export const getSavedReports = async () => {
  const response = await api.get("/moh/reports");
  return response.data;
};

export const getReportById = async (id) => {
  const response = await api.get(`/moh/reports/${id}`, {
    headers: { Accept: "application/json" },
  });

  return response.data;
};
