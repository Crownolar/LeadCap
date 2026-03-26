import api from "../utils/api";

export const getMOHSamples = async ({
  page = 1,
  pageSize = 10,
  stateId,
  lgaId,
  marketId,
  fromDate,
  toDate,
}) => {
  const params = {
    page,
    pageSize,
    ...(stateId && { stateId }),
    ...(lgaId && { lgaId }),
    ...(marketId && { marketId }),
    ...(fromDate && { fromDate }),
    ...(toDate && { toDate }),
  };

  const res = await api.get("/moh/samples", { params });
  return res.data;
};