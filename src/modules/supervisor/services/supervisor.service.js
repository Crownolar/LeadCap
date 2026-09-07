import api from "../../../utils/api";

const SupervisorService = () => {

// ── Heavy Metal Readings ──────────────────────────────────────────────────────

export const createXRFReading = async (payload) => {
  const response = await api.post("/heavy-metals", payload);
  return response.data;
};


export const createBatchXRFReadings = async (payload) => {
  const response = await api.post("/heavy-metals/batch/xrf", payload);
  return response.data;
};


export const getSampleHeavyMetalReadings = async (sampleId) => {
  const response = await api.get(`/heavy-metals/sample/${sampleId}`);
  return response.data;
},
};

export default SupervisorService