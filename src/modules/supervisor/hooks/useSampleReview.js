import { useCallback, useEffect, useState } from "react";

import {
  getReviewStats,
  getReviews,
  getReviewDetail,
  submitReviewAction,
  getSampleHeavyMetalReadings,
  createBatchXRFReadings,
  createXRFReading,
} from "../services/supervisor.service";

import { DEFAULT_PAGE_SIZE } from "../constants/supervisor.constants";

export function useSampleReview(collectorId = null) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [reviewDetail, setReviewDetail] = useState(null);
  const [heavyMetalReadings, setHeavyMetalReadings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    take: DEFAULT_PAGE_SIZE,
    total: 0,
    skip: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  /* ------------------------------------------------------------------------ */
  /* FETCH REVIEW STATS                                                      */
  /* ------------------------------------------------------------------------ */

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);

    try {
      const params = {};

      if (collectorId) {
        params.collectorId = collectorId;
      }

      console.log("Fetching review stats with params:", params);

      const response = await getReviewStats(params);

      console.log("Review stats response:", response);

      setStats(response?.data || response);
    } catch (err) {
      console.error("Failed to fetch review stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [collectorId]);

  /* ------------------------------------------------------------------------ */
  /* FETCH REVIEWS                                                           */
  /* ------------------------------------------------------------------------ */

  const fetchReviews = useCallback(
    async ({
      status,
      page = 1,
      skip,
      take = DEFAULT_PAGE_SIZE,
      search,
      collectorId: requestedCollectorId,
      append = false,
    } = {}) => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page,
          pageSize: take,
        };

        if (status) {
          params.status = status;
        }

        if (search) {
          params.search = search;
        }

        const activeCollectorId =
          requestedCollectorId !== undefined
            ? requestedCollectorId
            : collectorId;

        if (activeCollectorId) {
          params.collectorId = activeCollectorId;
        }

        console.log("Fetching reviews with params:", params);

        console.log("========== REVIEW REQUEST ==========");
        console.log("Selected collector ID:", activeCollectorId);
        console.log("Request params:", params);

        const response = await getReviews(params);

        console.log("========== REVIEW RESPONSE ==========");
        console.log("Response:", response);
        console.log(
          "Creators returned:",
          response?.data?.data?.map((item) => item.creator?.fullName),
        );

        console.log("ACTIVE COLLECTOR:", activeCollectorId);
        console.log("FETCHING REVIEWS:", params);

        console.log("Reviews API response:", response);

        const payload = response;

        const reviewList = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        console.log("Normalized review list:", reviewList);

        setReviews(reviewList);

        const apiPagination = payload?.pagination || {};

        const apiSkip = apiPagination.skip ?? 0;
        const apiTake =
          apiPagination.pageSize ??
          apiPagination.take ??
          apiPagination.limit ??
          take;

        const apiTotal =
          apiPagination.totalCount ?? payload?.total ?? reviewList.length;

        setPagination({
          page: apiPagination.page ?? page,
          skip: apiSkip,
          take: apiTake,
          total: apiTotal,
          totalPages:
            apiPagination.totalPages ??
            Math.max(1, Math.ceil(apiTotal / apiTake)),
          hasNextPage:
            apiPagination.hasNextPage ?? apiSkip + apiTake < apiTotal,
          hasPrevPage: apiPagination.hasPrevPage ?? apiSkip > 0,
        });

        return reviewList;
      } catch (err) {
        console.error("Failed to fetch reviews:", err);

        console.error("========== REVIEW ERROR ==========");
        console.error("Status:", err?.response?.status);
        console.error("Response data:", err?.response?.data);
        console.error("Response message:", err?.response?.data?.message);

        setError(
          err?.response?.data?.message || "Failed to load sample reviews",
        );

        setReviews([]);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [collectorId],
  );

  /* ------------------------------------------------------------------------ */
  /* FETCH REVIEW DETAIL                                                     */
  /* ------------------------------------------------------------------------ */

  const fetchReviewDetail = useCallback(async (sampleId) => {
    if (!sampleId) return null;

    setDetailLoading(true);

    try {
      const response = await getReviewDetail(sampleId);

      const detail = response?.data || response;

      setReviewDetail(detail);

      return detail;
    } catch (err) {
      console.error("Failed to fetch review detail:", err);

      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* FETCH HEAVY METAL READINGS                                              */
  /* ------------------------------------------------------------------------ */

  const fetchHeavyMetalReadings = useCallback(async (sampleId) => {
    if (!sampleId) return [];

    try {
      const response = await getSampleHeavyMetalReadings(sampleId);

      const readings = response?.data || response || [];

      const normalizedReadings = Array.isArray(readings) ? readings : [];

      setHeavyMetalReadings(normalizedReadings);

      return normalizedReadings;
    } catch (err) {
      console.error("Failed to fetch heavy metal readings:", err);

      setHeavyMetalReadings([]);

      return [];
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* SELECT SAMPLE                                                           */
  /* ------------------------------------------------------------------------ */

  const selectSample = useCallback(
    async (sample) => {
      if (!sample?.id) return;

      setSelectedSample(sample);

      try {
        await Promise.all([
          fetchReviewDetail(sample.id),
          fetchHeavyMetalReadings(sample.id),
        ]);
      } catch (err) {
        console.error("Failed to load sample details:", err);
      }
    },
    [fetchReviewDetail, fetchHeavyMetalReadings],
  );

  /* ------------------------------------------------------------------------ */
  /* REVIEW ACTION                                                           */
  /* ------------------------------------------------------------------------ */

  const performReviewAction = useCallback(
    async ({
      sampleId,
      action,
      comments = "",
      issues = [],
      requestedChanges = "",
      currentStatus,
    }) => {
      if (!sampleId || !action) {
        throw new Error("Sample ID and review action are required.");
      }

      setActionLoading(true);

      try {
        const response = await submitReviewAction(sampleId, {
          action,
          comments,
          issues,
          requestedChanges,
        });

        await Promise.all([
          fetchStats(),

          fetchReviewDetail(sampleId),

          fetchReviews({
            status: currentStatus,
            page: pagination.page,
            take: pagination.take,
            collectorId,
          }),
        ]);

        return response;
      } catch (err) {
        console.error("Failed to perform review action:", err);

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [
      fetchStats,
      fetchReviewDetail,
      fetchReviews,
      pagination.page,
      pagination.take,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* BATCH XRF READINGS                                                      */
  /* ------------------------------------------------------------------------ */

  const submitBatchXrfReadings = useCallback(
    async ({ sampleId, readings }) => {
      if (!sampleId) {
        throw new Error("Sample ID is required.");
      }

      if (!Array.isArray(readings) || readings.length === 0) {
        throw new Error("At least one XRF reading is required.");
      }

      setActionLoading(true);

      try {
        const response = await createBatchXRFReadings({
          sampleId,
          readings,
        });

        await Promise.all([
          fetchHeavyMetalReadings(sampleId),
          fetchReviewDetail(sampleId),
          fetchStats(),
        ]);

        return response;
      } catch (err) {
        console.error("Failed to submit XRF readings:", err);

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchHeavyMetalReadings, fetchReviewDetail, fetchStats],
  );

  /* ------------------------------------------------------------------------ */
  /* SINGLE XRF READING                                                      */
  /* ------------------------------------------------------------------------ */

  const submitSingleXrfReading = useCallback(
    async (payload) => {
      if (!payload?.sampleId) {
        throw new Error("Sample ID is required.");
      }

      setActionLoading(true);

      try {
        const response = await createXRFReading(payload);

        await Promise.all([
          fetchHeavyMetalReadings(payload.sampleId),
          fetchReviewDetail(payload.sampleId),
          fetchStats(),
        ]);

        return response;
      } catch (err) {
        console.error("Failed to submit XRF reading:", err);

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchHeavyMetalReadings, fetchReviewDetail, fetchStats],
  );

  /* ------------------------------------------------------------------------ */
  /* REFRESH                                                                 */
  /* ------------------------------------------------------------------------ */

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchStats(),

      fetchReviews({
        page: pagination.page,
        take: pagination.take,
        collectorId,
      }),
    ]);
  }, [fetchStats, fetchReviews, pagination.page, pagination.take]);

  /* ------------------------------------------------------------------------ */
  /* INITIAL LOAD                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const loadMore = useCallback(
    async ({ status, search, collectorId: requestedCollectorId } = {}) => {
      if (reviews.length >= pagination.total) return;

      const activeCollectorId =
        requestedCollectorId !== undefined ? requestedCollectorId : collectorId;
      const nextPage = pagination.page + 1;

      setLoading(true);
      setError(null);

      try {
        const params = {
          page: nextPage,
          pageSize: pagination.take,
        };

        if (status) params.status = status;
        if (search) params.search = search;
        if (activeCollectorId) params.collectorId = activeCollectorId;

        const response = await getReviews(params);
        const payload = response;
        const newReviews = Array.isArray(payload?.data) ? payload.data : [];
        const apiPagination = payload?.pagination || {};

        setReviews((prev) => {
          const seen = new Set(prev.map((item) => item.id));
          return [...prev, ...newReviews.filter((item) => !seen.has(item.id))];
        });

        const apiSkip = apiPagination.skip ?? reviews.length;
        const apiTake =
          apiPagination.pageSize ??
          apiPagination.take ??
          apiPagination.limit ??
          pagination.take;
        const apiTotal =
          apiPagination.totalCount ?? payload?.total ?? pagination.total;

        setPagination((prev) => ({
          ...prev,
          page: apiPagination.page ?? Math.floor(apiSkip / apiTake) + 1,
          skip: apiSkip,
          take: apiTake,
          total: apiTotal,
          totalPages:
            apiPagination.totalPages ??
            Math.max(1, Math.ceil(apiTotal / apiTake)),
          hasNextPage:
            apiPagination.hasNextPage ?? apiSkip + apiTake < apiTotal,
          hasPrevPage: apiPagination.hasPrevPage ?? apiSkip > 0,
        }));
      } catch (err) {
        console.error("Failed to load more reviews:", err);
        setError(err?.response?.data?.message || "Failed to load more samples");
      } finally {
        setLoading(false);
      }
    },
    [pagination.take, pagination.total, reviews.length, collectorId],
  );

  return {
    /* Data */
    reviews,
    stats,
    selectedSample,
    reviewDetail,
    heavyMetalReadings,
    pagination,

    /* States */
    loading,
    statsLoading,
    detailLoading,
    actionLoading,
    error,

    /* Actions */
    fetchStats,
    fetchReviews,
    fetchReviewDetail,
    fetchHeavyMetalReadings,

    selectSample,
    setSelectedSample,

    performReviewAction,
    submitBatchXrfReadings,
    submitSingleXrfReading,
    refresh,

    loadMore,
  };
}

export default useSampleReview;
