import api from "../../../utils/api";

/**
 * Supervisor Sample Review API
 * All review workflow endpoints live here.
 */

// ─── Reviews ────────────────────────────────────────────────────────────────

export const getReviewStats = async () => {
  const response = await api.get("/reviews/stats");
  return response.data;
};

export const getReviews = async (params = {}) => {
  const response = await api.get("/reviews", {
    params,
  });

  return response.data;
};

export const getReviewDetail = async (sampleId) => {
  const response = await api.get(`/reviews/${sampleId}`);
  return response.data;
};

export const submitReviewAction = async (
  sampleId,
  {
    action,
    comments = "",
    issues = [],
    requestedChanges = "",
  }
) => {
  const response = await api.post(`/reviews/${sampleId}`, {
    action,
    comments,
    issues,
    requestedChanges,
  });

  return response.data;
};


// ─── Heavy Metals / XRF ─────────────────────────────────────────────────────

export const getSampleHeavyMetalReadings = async (sampleId) => {
  const response = await api.get(
    `/heavy-metals/sample/${sampleId}`
  );

  return response.data;
};

export const createSingleXrfReading = async ({
  sampleId,
  heavyMetal,
  xrfReading,
  xrfNotes = "",
}) => {
  const response = await api.post("/heavy-metals", {
    sampleId,
    heavyMetal,
    xrfReading,
    xrfNotes,
  });

  return response.data;
};

export const createBatchXrfReadings = async ({
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