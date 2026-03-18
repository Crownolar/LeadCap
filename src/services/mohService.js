import api from "../utils/api";

export const getMOHSamples = async ({ page, limit, stateId, lgaId, fromDate, toDate }) => {
  const params = {
    page,
    limit,
    ...(stateId && { stateId }),
    ...(lgaId && { lgaId }),
    ...(fromDate && { fromDate }),
    ...(toDate && { toDate }),
  };

  const res = await api.get("/moh/samples", { params });
  return res.data;
};