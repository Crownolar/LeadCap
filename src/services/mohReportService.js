import api from "../utils/api";

const resolveStateParam = (state) => {
  if (!state) return undefined;

  if (typeof state === "object") return state.name;

  return state;
};

export const getStateSummaryReport = async ({ state, dateFrom, dateTo }) => {
  const params = {
    ...(resolveStateParam(state) && { state: resolveStateParam(state) }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  console.log("STATE SUMMARY PARAMS:", params);

  const response = await api.get("/moh/reports/state-summary", {
    params,
    headers: { Accept: "application/json" },
  });

  console.log("STATE SUMMARY RESPONSE:", response.data);

  return response.data;
};

export const getContaminationAnalysisReport = async ({
  states,
  productVariantIds,
  dateFrom,
  dateTo,
}) => {
  const params = {
    ...(states?.length && {
      states: states
        .map((s) => (typeof s === "object" ? s.name : s))
        .join(","),
    }),
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

  return response.data;
};

export const getProductTypeReport = async ({ state, dateFrom, dateTo }) => {
  const params = {
    ...(resolveStateParam(state) && { state: resolveStateParam(state) }),
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
    ...(resolveStateParam(state) && { state: resolveStateParam(state) }),
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
  const response = await api.get("/moh/reports", {
    headers: { Accept: "application/json" },
  });

  return response.data;
};

export const getReportById = async (id) => {
  const response = await api.get(`/moh/reports/${id}`, {
    headers: { Accept: "application/json" },
  });

  return response.data;
};