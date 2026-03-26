import api from "../utils/api";

export const getStateSummaryReport = async ({ state, dateFrom, dateTo }) => {
  const response = await api.get("/moh/reports/state-summary", {
    params: {
      state,
      dateFrom,
      dateTo,
    },
    headers: {
      Accept: "application/json",
    },
  });

  console.log("State summary report API response:", response);

  return response.data;
};

export const getContaminationAnalysisReport = async ({
  states,
  productVariantIds,
  dateFrom,
  dateTo,
}) => {
  const response = await api.get("/moh/reports/contamination-analysis", {
    params: {
      states,
      productVariantIds,
      dateFrom,
      dateTo,
    },
    headers: { Accept: "application/json" },
  });

  return response.data;
};

export const getProductTypeReport = async ({ state, dateFrom, dateTo }) => {
  const response = await api.get("/moh/reports/product-type", {
    params: {
      state,
      dateFrom,
      dateTo,
    },
    headers: {
      Accept: "application/json",
    },
  });

  return response.data;
};

export const getRiskAssessmentReport = async ({
  minLeadLevel,
  dateFrom,
  dateTo,
}) => {
  const response = await api.get("/moh/reports/risk-assessment", {
    params: {
      minLeadLevel,
      dateFrom,
      dateTo,
    },
    headers: {
      Accept: "application/json",
    },
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

export const getContaminationSummary = async ({ state, dateFrom, dateTo }) => {
  const response = await api.get("/moh/contamination-summary", {
    params: {
      state,
      dateFrom,
      dateTo,
    },
    headers: {
      Accept: "application/json",
    },
  });

  return response.data;
};