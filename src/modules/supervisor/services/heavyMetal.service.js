import api from "../../../utils/api";

/**
 * Get all heavy metal readings for a sample.
 */
export const getSampleHeavyMetalReadings = async (sampleId) => {
  const response = await api.get(
    `/heavy-metals/sample/${sampleId}`
  );

  return response.data;
};


/**
 * Record a single XRF reading.
 */
export const createHeavyMetalReading = async ({
  sampleId,
  heavyMetal,
  xrfReading,
  xrfNotes,
}) => {
  const response = await api.post("/heavy-metals", {
    sampleId,
    heavyMetal,
    xrfReading,
    xrfNotes,
  });

  return response.data;
};


/**
 * Record multiple XRF readings.
 */
export const createBatchXRFReadings = async ({
  sampleId,
  readings,
}) => {
  const response = await api.post(
    "/heavy-metals/batch/xrf",
    {
      sampleId,
      readings,
    }
  );

  return response.data;
};