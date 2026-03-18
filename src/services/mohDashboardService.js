import api from "../utils/api";

const buildQuery = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.append(key, value);
    }
  });

  return query.toString();
};

export const getVerificationSummary = async (params = {}) => {
  const query = buildQuery(params);
  const res = await api.get(`/moh/verification-summary?${query}`);
  console.log("API RESPONSE FOR VERIFICATION SUMMARY:", res);
  return res.data;
};

export const getRiskHotspots = async (params = {}) => {
  const query = buildQuery(params);
  const res = await api.get(`/moh/risk-hotspots?${query}`);
  console.log("API RESPONSE FOR RISK HOTSPOTS:", res);
  return res.data;
};

export const getVerificationLogs = async (params = {}) => {
  const query = buildQuery(params);
  const res = await api.get(`/moh/verification-logs?${query}`);
  console.log("API RESPONSE FOR VERIFICATION LOGS:", res);
  return res.data;
};

export const getSampleOverview = async (params = {}) => {
  const query = buildQuery(params);
  const res = await api.get(`/moh/samples?${query}`);
  return res.data;
};