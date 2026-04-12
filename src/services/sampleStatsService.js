import api from "../utils/api";

export const getSampleStats = async (params = {}) => {
  const response = await api.get("/samples/stats", { params });
  return response.data;
};