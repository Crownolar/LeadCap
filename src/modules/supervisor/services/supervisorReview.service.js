import api from "../../../utils/api";

const supervisorReviewService = {
  /**
   * Get review statistics
   */
  getStats: async () => {
    const response = await api.get("/reviews/stats");
    return response.data;
  },

  /**
   * Get all reviews
   * Supports backend pagination/filtering
   */
  getReviews: async (params = {}) => {
    const response = await api.get("/reviews", {
      params,
    });

    return response.data;
  },

  /**
   * Get full review details for one sample
   */
  getReviewDetails: async (sampleId) => {
    const response = await api.get(`/reviews/${sampleId}`);
    return response.data;
  },

  /**
   * Submit review action
   */
  submitReview: async ({
    sampleId,
    action,
    comments = "",
    issues = [],
    requestedChanges = "",
  }) => {
    const response = await api.post(`/reviews/${sampleId}`, {
      action,
      comments,
      issues,
      requestedChanges,
    });

    return response.data;
  },

  /**
   * Create single XRF reading
   */
  createXRFReading: async ({
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
  },

  /**
   * Batch create XRF readings
   */
  createBatchXRFReadings: async ({
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
  },

  /**
   * Get all heavy metal readings for sample
   */
  getSampleReadings: async (sampleId) => {
    const response = await api.get(
      `/heavy-metals/sample/${sampleId}`
    );

    return response.data;
  },
};

export default supervisorReviewService;