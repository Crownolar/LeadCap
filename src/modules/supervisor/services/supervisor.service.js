import api from "../../../utils/api";

/* -------------------------------------------------------------------------- */
/*                            REVIEW SERVICES                                 */
/* -------------------------------------------------------------------------- */

/**
 * Get review dashboard statistics
 */
export const getReviewStats = async (params = {}) => {
  const response = await api.get("/reviews/stats", {
    params,
  });

  return response.data;
};

/**
 * Get all reviews
 * Supports optional query params for pagination/filtering
 */
export const getReviews = async (params = {}) => {
  const response = await api.get("/reviews", {
    params,
  });

  return response.data;
};

/**
 * Get full review detail for a sample
 */
export const getReviewDetail = async (sampleId) => {
  const response = await api.get(`/reviews/${sampleId}`);

  return response.data;
};

/**
 * Submit a review action
 *
 * Actions:
 * APPROVED_FOR_XRF
 * APPROVED_FOR_AAS
 * FLAGGED
 * REJECTED
 * COMPLETED
 */
export const submitReviewAction = async (sampleId, payload) => {
  const response = await api.post(`/reviews/${sampleId}`, payload);

  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                        HEAVY METAL SERVICES                                */
/* -------------------------------------------------------------------------- */

/**
 * Create a single XRF reading
 */
export const createXRFReading = async (payload) => {
  const response = await api.post("/heavy-metals", payload);

  return response.data;
};

/**
 * Create batch XRF readings for all heavy metals
 */
export const createBatchXRFReadings = async (payload) => {
  const response = await api.post("/heavy-metals/batch/xrf", payload);

  return response.data;
};

/**
 * Get all heavy metal readings for a sample
 */
export const getSampleHeavyMetalReadings = async (sampleId) => {
  const response = await api.get(`/heavy-metals/sample/${sampleId}`);

  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                            DEFAULT EXPORT                                  */
/* -------------------------------------------------------------------------- */

const SupervisorService = {
  getReviewStats,
  getReviews,
  getReviewDetail,
  submitReviewAction,
  createXRFReading,
  createBatchXRFReadings,
  getSampleHeavyMetalReadings,
};

export default SupervisorService;
